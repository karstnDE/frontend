import React from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import type { UserSegments } from '@site/src/hooks/useStakerLoyalty';

interface InverseWhaleChartProps {
  userSegments: UserSegments;
}

export default function InverseWhaleChart({
  userSegments,
}: InverseWhaleChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const template = getPlotlyTemplate(colorMode === 'dark');

  const { by_reward_size } = userSegments;

  // Order: Small, Medium, Large, Whales (bottom to top)
  const segments = [
    { key: 'small', data: by_reward_size.small },
    { key: 'medium', data: by_reward_size.medium },
    { key: 'large', data: by_reward_size.large },
    { key: 'whales', data: by_reward_size.whales },
  ];

  const labels = segments.map((s) => s.data.label);
  const rates = segments.map((s) => s.data.avg_compound_rate * 100);
  const userCounts = segments.map((s) => s.data.user_count);

  // Highlight medium tier with accent color, others with secondary colors
  const colors = segments.map((s) =>
    s.key === 'medium' ? '#00A3B4' : '#6B7280'
  );

  return (
    <div
      style={{
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: 'var(--ifm-global-radius)',
        padding: '24px',
        marginBottom: '32px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Compound Rate by Stake Size - The Loyalty Paradox</h3>

      <div
        style={{
          background: 'rgba(0, 163, 180, 0.1)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--ifm-global-radius)',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🔍</span>
          <div>
            <strong style={{ color: 'var(--accent)' }}>Key Finding</strong>
            <p style={{ margin: '8px 0 0 0', color: 'var(--ifm-color-emphasis-800)' }}>
              Medium-tier stakers (0.1-1 SOL rewards) show the highest conviction at{' '}
              <strong>{(by_reward_size.medium.avg_compound_rate * 100).toFixed(1)}%</strong> compound
              rate, while whales compound only{' '}
              <strong>{(by_reward_size.whales.avg_compound_rate * 100).toFixed(1)}%</strong> of their
              rewards.
            </p>
          </div>
        </div>
      </div>

      <Plot
        data={[
          {
            type: 'bar',
            x: rates,
            y: labels,
            orientation: 'h',
            marker: {
              color: colors,
            },
            text: rates.map(
              (rate, idx) =>
                `${rate.toFixed(1)}% (${userCounts[idx].toLocaleString()} users)`
            ),
            textposition: 'outside',
            hovertemplate: '<b>%{y}</b><br>' +
              'Compound Rate: %{x:.1f}%<br>' +
              'Users: %{customdata}<br>' +
              '<extra></extra>',
            customdata: userCounts,
          },
        ]}
        layout={{
          ...template.layout,
          xaxis: {
            title: 'Average Compound Rate (%)',
            range: [0, Math.max(...rates) * 1.2],
          },
          yaxis: {
            title: '',
            automargin: true,
          },
          margin: { l: 150, r: 80, t: 20, b: 60 },
          height: 350,
        }}
        config={defaultPlotlyConfig}
        style={{ width: '100%' }}
      />
    </div>
  );
}
