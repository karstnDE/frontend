import { useState, useEffect } from 'react';

export interface DashboardData {
  summary: any;
  dailyStacked: any[];
  dailyByToken: any[];
  dailyByType: any[];
  dailyByPool: any[];
  dailyByPoolType: any[];
  poolTypeSummary: any[];
  topTokenByMint: Record<string, any[]>;
  topPoolById: Record<string, any[]>;
  topTypeByLabel: Record<string, any[]>;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [
          summary,
          dailyStacked,
          dailyByToken,
          dailyByType,
          dailyByPool,
          dailyByPoolType,
          poolTypeSummary,
          topTokenByMint,
          topPoolById,
          topTypeByLabel,
        ] = await Promise.all([
          fetch('/data/summary.json').then((r) => (r.ok ? r.json() : {})),
          fetch('/data/daily_stacked.json').then((r) => (r.ok ? r.json() : [])),
          fetch('/data/daily_by_token.json').then((r) => (r.ok ? r.json() : [])),
          fetch('/data/daily_by_type.json').then((r) => (r.ok ? r.json() : [])),
          fetch('/data/daily_by_pool.json').then((r) => (r.ok ? r.json() : [])),
          fetch('/data/daily_by_pool_type.json').then((r) => (r.ok ? r.json() : [])),
          fetch('/data/pool_type_summary.json').then((r) => (r.ok ? r.json() : [])),
          fetch('/data/top_transactions_token.json').then((r) => (r.ok ? r.json() : {})),
          fetch('/data/top_transactions_pool.json').then((r) => (r.ok ? r.json() : {})),
          fetch('/data/top_transactions_type.json').then((r) => (r.ok ? r.json() : {})),
        ]);

        setData({
          summary,
          dailyStacked,
          dailyByToken,
          dailyByType,
          dailyByPool,
          dailyByPoolType,
          poolTypeSummary,
          topTokenByMint,
          topPoolById,
          topTypeByLabel,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}
