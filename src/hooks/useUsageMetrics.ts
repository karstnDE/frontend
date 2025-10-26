import { useState, useEffect } from 'react';

export interface UsageDailyRecord {
  date: string;
  count: number;
}

export interface UsageTopWallet {
  address: string;
  tx_count: number;
  days_active: number;
  first_seen: string | null;
  last_seen: string | null;
  active_weeks?: number;
  active_months?: number;
}

export interface UsageMetrics {
  generated_at: string;
  date_range: {
    start: string;
    end: string;
  };
  summary: {
    transactions_scanned: number;
    staker_unique_addresses: number;
    daily_active_unique_addresses: number;
  };
  stakers: {
    daily_counts: UsageDailyRecord[];
    top_wallets: UsageTopWallet[];
  };
  daily_users: {
    daily_counts: UsageDailyRecord[];
    top_wallets: UsageTopWallet[];
  };
  weekly_users: {
    rolling_counts: UsageDailyRecord[];
    top_wallets: UsageTopWallet[];
  };
}

export function useUsageMetrics() {
  const [data, setData] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/usage_metrics.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load usage metrics:', err);
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
