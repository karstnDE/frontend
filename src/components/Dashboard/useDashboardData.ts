import { useState, useEffect } from 'react';
import type { DashboardData, SummaryData, DailyDataPoint, TopTransactionsData } from './types';

const BASE_PATH = '/analytics/data';

/**
 * Custom hook to load all dashboard data from JSON files
 */
export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    dailyStacked: [],
    dailyByToken: [],
    dailyByType: [],
    dailyByPool: [],
    topTransactionsToken: {},
    topTransactionsType: {},
    topTransactionsPool: {},
    poolTypeSummary: null,
    dailyByPoolType: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Load all data files in parallel
        const [
          summary,
          dailyStacked,
          dailyByToken,
          dailyByType,
          dailyByPool,
          topTransactionsToken,
          topTransactionsType,
          topTransactionsPool,
          poolTypeSummary,
          dailyByPoolType,
        ] = await Promise.all([
          fetch(`${BASE_PATH}/summary.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/daily_stacked.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/daily_by_token.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/daily_by_type.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/daily_by_pool.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/top_transactions_token.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/top_transactions_type.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/top_transactions_pool.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/pool_type_summary.json`).then(r => r.json()),
          fetch(`${BASE_PATH}/daily_by_pool_type.json`).then(r => r.json()),
        ]);

        setData({
          summary: summary as SummaryData,
          dailyStacked: dailyStacked as DailyDataPoint[],
          dailyByToken: dailyByToken as DailyDataPoint[],
          dailyByType: dailyByType as DailyDataPoint[],
          dailyByPool: dailyByPool as DailyDataPoint[],
          topTransactionsToken: topTransactionsToken as TopTransactionsData,
          topTransactionsType: topTransactionsType as TopTransactionsData,
          topTransactionsPool: topTransactionsPool as TopTransactionsData,
          poolTypeSummary,
          dailyByPoolType: dailyByPoolType as DailyDataPoint[],
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load data',
        }));
      }
    }

    loadData();
  }, []);

  return data;
}
