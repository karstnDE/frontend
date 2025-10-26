import React from 'react';
import type { LoyaltySummary } from '@site/src/hooks/useStakerLoyalty';

interface LoyaltyStatsProps {
  summary: LoyaltySummary;
}

export default function LoyaltyStats({ summary }: LoyaltyStatsProps): React.ReactElement {
  const StatCard = ({
    label,
    value,
    subtitle,
    isPrimary = false
  }: {
    label: string;
    value: string;
    subtitle: string;
    isPrimary?: boolean;
  }) => (
    <div
      style={{
        padding: '24px',
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          color: 'var(--ifm-color-secondary)',
          marginBottom: '8px',
          fontWeight: '500',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: '700',
          color: isPrimary ? 'var(--accent)' : 'inherit',
          marginBottom: '4px',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'var(--ifm-color-emphasis-700)',
        }}
      >
        {subtitle}
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}
    >
      <StatCard
        label="Loyalty Score"
        value={`${summary.loyalty_score.toFixed(1)}%`}
        subtitle="Compound-only users"
        isPrimary={true}
      />
      <StatCard
        label="Reinvestment Rate"
        value={`${summary.compound_rate.toFixed(1)}%`}
        subtitle="Rewards compounded"
      />
      <StatCard
        label="True Believers"
        value={summary.compound_only_users.toLocaleString()}
        subtitle="Never claimed rewards"
      />
    </div>
  );
}
