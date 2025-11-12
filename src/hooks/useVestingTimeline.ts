import { useState, useEffect } from 'react';

export interface VestingSchedule {
  signature: string;
  start_time: string;
  locked_tuna: number;
  cliff_hours: number;
  unlock_period_hours: number;
  unlock_rate_tuna: number;
  num_unlocks: number;
  first_unlock: string | null;
  last_unlock: string | null;
}

export interface VestingTimeline {
  schedules: VestingSchedule[];
  daily_timeline: Record<string, number>;
}

export function useVestingTimeline() {
  const [data, setData] = useState<VestingTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/vesting_timeline.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load vesting timeline:', err);
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
