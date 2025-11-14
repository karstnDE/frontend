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

// Module-level cache to prevent re-fetching on component remounts
let cachedData: VestingTimeline | null = null;
let cachedError: string | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export function useVestingTimeline() {
  const [data, setData] = useState<VestingTimeline | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData && !cachedError);
  const [error, setError] = useState<string | null>(cachedError);

  useEffect(() => {
    // If we already have cached data or error, use it immediately
    if (cachedData || cachedError) {
      setData(cachedData);
      setError(cachedError);
      setLoading(false);
      return;
    }

    // If data is currently being loaded by another component instance, wait for it
    if (isLoading && loadPromise) {
      loadPromise.then(() => {
        setData(cachedData);
        setError(cachedError);
        setLoading(false);
      });
      return;
    }

    // Start loading data
    let cancelled = false;
    const load = async () => {
      try {
        isLoading = true;
        setLoading(true);
        const response = await fetch('/data/vesting_timeline.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        if (!cancelled) {
          cachedData = payload;
          cachedError = null;
          setData(payload);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load vesting timeline:', err);
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          cachedError = errorMessage;
          setError(errorMessage);
        }
      } finally {
        isLoading = false;
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPromise = load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
