import { useState, useEffect } from 'react';
import pako from 'pako';

export interface TimelinePoint {
  date: string;
  staked: number;
  unstaked: number;
  realized_rewards: number;
}

export interface Operation {
  date: string;
  type: string;
  type_label: string;
  amount: number;
  signature: string;
  solscan_url: string;
}

export interface WalletSummary {
  total_operations: number;
  current_staked: number;
  current_unstaked: number;
  realized_rewards: number;
  first_stake_date: string;
  last_activity_date: string;
  days_active: number;
}

export interface WalletTimelineData {
  wallet: string;
  found: boolean;
  date_range?: [string, string];
  timeline?: TimelinePoint[];
  operations?: Operation[];
  summary?: WalletSummary;
  error?: string;
}

// Event type mapping (must match build_staker_cache.py EVENT_TYPE_CODES)
const EVENT_TYPES: Record<number, [string, string]> = {
  0: ['initialize', 'Initialize Position'],
  1: ['stake', 'Stake'],
  2: ['unstake', 'Unstake'],
  3: ['withdraw', 'Withdraw'],
  4: ['compound', 'Compound'],
  5: ['claim', 'Claim Rewards'],
};

/**
 * Build timeline from wallet events
 */
function buildBalanceTimeline(events: any[]): [TimelinePoint[], Operation[]] {
  const timeline: TimelinePoint[] = [];
  const operations: Operation[] = [];

  let staked = 0.0;
  let unstaked = 0.0; // This is "pending" in the cache
  let realized_rewards = 0.0; // Cumulative claimed + compounded (in SOL)

  for (const event of events) {
    if (event.length < 11) continue;

    // Event structure: [signature, timestamp, slot, type_id, address, d_stake, d_pending, d_withdrawn, d_compounded, fee_payer, reward_sol, ...]
    const signature = event[0];
    const timestamp = event[1];
    const slot = event[2];
    const op_type = event[3];
    const address = event[4];
    const d_stake = event[5] || 0; // Change in staked amount (TUNA)
    const d_pending = event[6] || 0; // Change in pending/unstaked amount (TUNA)
    const d_withdrawn = event[7] || 0; // Change in withdrawn amount (TUNA)
    const d_compounded = event[8] || 0; // Amount compounded (TUNA)
    const fee_payer = event[9] || null;
    const reward_sol = event[10] || 0; // Reward in SOL (already in SOL, not lamports)

    const [type_id, type_label] = EVENT_TYPES[op_type] || ['unknown', 'Unknown'];

    // Apply balance deltas
    staked += d_stake;
    unstaked += d_pending;

    // Track rewards and operation amounts
    let amount = 0.0;
    if (op_type === 0) { // Initialize position (includes initial stake)
      amount = Math.abs(d_stake);
    } else if (op_type === 1) { // Stake
      amount = Math.abs(d_stake);
    } else if (op_type === 2) { // Unstake
      amount = Math.abs(d_stake); // Show amount unstaked (positive value)
    } else if (op_type === 3) { // Withdraw
      amount = Math.abs(d_pending); // Show amount withdrawn (positive value)
    } else if (op_type === 4) { // Compound
      amount = reward_sol; // Show SOL rewards compounded
      realized_rewards += reward_sol;
    } else if (op_type === 5) { // Claim
      amount = reward_sol; // Show SOL rewards claimed
      realized_rewards += reward_sol;
    }

    timeline.push({
      date: timestamp,
      staked: Math.round(staked * 1000000) / 1000000,
      unstaked: Math.round(unstaked * 1000000) / 1000000,
      realized_rewards: Math.round(realized_rewards * 1000000) / 1000000,
    });

    operations.push({
      date: timestamp,
      type: type_id,
      type_label: type_label,
      amount: Math.round(amount * 1000000) / 1000000,
      signature: signature,
      solscan_url: `https://solscan.io/tx/${signature}`,
    });
  }

  return [timeline, operations];
}

/**
 * Parse wallet timeline from staker cache
 */
function parseWalletTimeline(walletAddress: string, cache: any): WalletTimelineData {
  const addresses = cache.addresses || {};
  const events = cache.events || [];
  const meta = cache.meta || {};

  // Look up wallet
  if (!addresses[walletAddress]) {
    return {
      wallet: walletAddress,
      found: false,
      error: `Wallet not found in cache. Total wallets: ${Object.keys(addresses).length.toLocaleString()}`,
    };
  }

  const addrData = addresses[walletAddress];
  const firstEventIdx = addrData.first_event;
  const lastEventIdx = addrData.last_event;

  if (firstEventIdx === undefined || lastEventIdx === undefined) {
    return {
      wallet: walletAddress,
      found: false,
      error: 'Wallet has no event data',
    };
  }

  // Extract events for this wallet by filtering the entire events array
  // Note: first_event/last_event are indices of first/last occurrence,
  // but events are NOT contiguous - they're interleaved chronologically
  const walletEvents = events.filter((e: any) => e.length > 4 && e[4] === walletAddress);

  if (walletEvents.length === 0) {
    return {
      wallet: walletAddress,
      found: false,
      error: 'No events found for wallet',
    };
  }

  // Build timeline
  const [timeline, operations] = buildBalanceTimeline(walletEvents);

  if (timeline.length === 0) {
    return {
      wallet: walletAddress,
      found: false,
      error: 'Failed to build timeline',
    };
  }

  // Extend timeline to cache end date if needed
  const cacheEndDate = meta.end;
  if (cacheEndDate && timeline.length > 0) {
    const lastTimelineDate = timeline[timeline.length - 1].date;
    // Convert cache end date (YYYY-MM-DD) to ISO timestamp
    const cacheEndTimestamp = `${cacheEndDate}T23:59:59Z`;

    // Only add if cache end is after last transaction
    if (cacheEndTimestamp > lastTimelineDate) {
      // Add a final point with same balances as last transaction
      const lastPoint = timeline[timeline.length - 1];
      timeline.push({
        date: cacheEndTimestamp,
        staked: lastPoint.staked,
        unstaked: lastPoint.unstaked,
        realized_rewards: lastPoint.realized_rewards,
      });
    }
  }

  // Calculate summary
  const firstDate = timeline[0].date;
  const lastDate = timeline[timeline.length - 1].date;

  let daysActive = timeline.length;
  try {
    const firstDt = new Date(firstDate);
    const lastDt = new Date(lastDate);
    daysActive = Math.floor((lastDt.getTime() - firstDt.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } catch (e) {
    // Keep default
  }

  const current = addrData.current || [0, 0, 0, 0, 0];
  const currentStaked = current[0] !== undefined ? current[0] : timeline[timeline.length - 1].staked;
  const currentUnstaked = current[1] !== undefined ? current[1] : timeline[timeline.length - 1].unstaked;

  const summary: WalletSummary = {
    total_operations: operations.length,
    current_staked: Math.round(currentStaked * 1000000) / 1000000,
    current_unstaked: Math.round(currentUnstaked * 1000000) / 1000000,
    realized_rewards: timeline[timeline.length - 1].realized_rewards,
    first_stake_date: firstDate,
    last_activity_date: lastDate,
    days_active: daysActive,
  };

  return {
    wallet: walletAddress,
    found: true,
    date_range: [firstDate, lastDate],
    timeline,
    operations,
    summary,
  };
}

/**
 * Hook to load and parse wallet timeline from staker cache
 */
export function useWalletTimeline(walletAddress: string | null) {
  const [data, setData] = useState<WalletTimelineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress || walletAddress.trim().length === 0) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const loadTimeline = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load compressed staker cache
        const response = await fetch('/data/staker_cache.json.gz');
        if (!response.ok) {
          throw new Error(`Failed to load staker cache: ${response.statusText}`);
        }

        const compressed = await response.arrayBuffer();
        const decompressed = pako.ungzip(new Uint8Array(compressed), { to: 'string' });
        const cache = JSON.parse(decompressed);

        // Parse timeline for this wallet
        const result = parseWalletTimeline(walletAddress.trim(), cache);
        setData(result);

        if (!result.found) {
          setError(result.error || 'Wallet not found');
        }
      } catch (err) {
        console.error('Error loading wallet timeline:', err);
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [walletAddress]);

  return { data, loading, error };
}
