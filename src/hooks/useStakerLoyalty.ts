import { useState, useEffect } from 'react';

export interface LoyaltySummary {
  total_users: number;
  compound_only_users: number;
  claim_only_users: number;
  mixed_users: number;
  total_rewards_sol: number;
  total_compounded_sol: number;
  total_claimed_sol: number;
  compound_rate: number;
  loyalty_score: number;
}

export interface BehaviorSegment {
  count: number;
  percentage: number;
}

export interface RewardSizeSegment {
  label: string;
  user_count: number;
  avg_compound_rate: number;
  total_rewards: number;
}

export interface StakeSizeSegment {
  label: string;
  user_count: number;
  avg_compound_rate: number;
  total_staked_tuna: number;
  compound_only_users: number;
  claim_only_users: number;
  mixed_users: number;
}

export interface UserSegments {
  by_behavior: {
    compound_only: BehaviorSegment;
    claim_only: BehaviorSegment;
    mixed: BehaviorSegment;
  };
  by_reward_size: {
    whales: RewardSizeSegment;
    large: RewardSizeSegment;
    medium: RewardSizeSegment;
    small: RewardSizeSegment;
  };
  by_stake_size?: {
    mega: StakeSizeSegment;
    large: StakeSizeSegment;
    medium: StakeSizeSegment;
    small: StakeSizeSegment;
  };
}

export interface WeeklyTrend {
  week: string;
  claim_amount: number;
  compound_amount: number;
  total_amount: number;
  compound_rate: number;
}

export interface StakeDistributionBucket {
  min: number;
  max: number | null;
  label: string;
  count: number;
  total_tuna: number;
}

export interface CompoundVsStakePoint {
  stake_tuna: number;
  compound_rate: number;
  total_rewards_sol: number;
  behavior: 'compound_only' | 'claim_only' | 'mixed';
  address_short: string;
}

export interface Visualizations {
  stake_distribution: StakeDistributionBucket[];
  compound_vs_stake: CompoundVsStakePoint[];
}

export interface StakerLoyaltyData {
  generated_at: string;
  date_range: {
    start: string;
    end: string;
  };
  summary: LoyaltySummary;
  user_segments: UserSegments;
  weekly_trends: WeeklyTrend[];
  visualizations?: Visualizations;
}

export interface UseStakerLoyaltyResult {
  data: StakerLoyaltyData | null;
  loading: boolean;
  error: string | null;
}

export function useStakerLoyalty(): UseStakerLoyaltyResult {
  const [data, setData] = useState<StakerLoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/staker_loyalty.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading staker loyalty data:', err);
        setError(err.message || 'Failed to load staker loyalty data');
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
