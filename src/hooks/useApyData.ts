import { useState, useEffect } from 'react';

export interface DailyAprRecord {
  date: string;
  rolling_revenue_sol: number;
  rolling_revenue_usd: number;
  rolling_days: number;
  annualized_revenue_usd: number;
  revenue_per_tuna_usd: number;
  tuna_price_usd: number;
  reference_apr_percent: number;
  your_apr_percent: number;
}

export interface AprSummary {
  thirty_day_average_reference_apr: number;
  thirty_day_average_your_apr: number;
  historical_average_reference_apr: number;
  historical_average_your_apr: number;
}

export interface ApyData {
  generated_at: string;
  summary: AprSummary;
  daily_apr: DailyAprRecord[];
}

// Module-level cache to prevent re-fetching on component remounts
let cachedData: ApyData | null = null;
let cachedError: string | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export function useApyData() {
  const [data, setData] = useState<ApyData | null>(cachedData);
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
        const response = await fetch('/data/apr_data.json');
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
        console.error('Failed to load APY data:', err);
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
