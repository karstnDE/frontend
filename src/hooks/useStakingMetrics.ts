import { useState, useEffect } from 'react';

export interface StakingDailyRecord {
  date: string;
  staked: number;
  unstaked: number;
  total: number;
  staked_delta: number;
  total_delta: number;
}

export interface StakingTopEntry {
  address: string;
  amount: number;
}

export interface StakingMetrics {
  generated_at: string;
  date_range: {
    start: string;
    end: string;
  };
  supply: {
    max: number;
  };
  daily: StakingDailyRecord[];
  top_stakers_7d: StakingTopEntry[];
  top_withdrawers_7d: StakingTopEntry[];
}

export function useStakingMetrics() {
  const [data, setData] = useState<StakingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/staking_tuna.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load staking metrics:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}

