import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import { useChartTracking } from '@site/src/hooks/useChartTracking';
import type { UserSegments } from '@site/src/hooks/useStakerLoyalty';

interface InverseWhaleChartProps {
  userSegments: UserSegments;
}

export default function InverseWhaleChart({
  userSegments,
}: InverseWhaleChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const template = getPlotlyTemplate(colorMode === 'dark');

  const plotRef = useRef<HTMLDivElement>(null);
  useChartTracking(plotRef, {
    chartName: 'Staker Loyalty Distribution',
    trackClick: true,
    trackZoom: true,
  });

  const { by_stake_size } = userSegments;

  // If by_stake_size is not available, return null or show error
  if (!by_stake_size) {
    return null;
  }

  // Order: Small, Medium, Large, Mega (bottom to top)
  const segments = [
    { key: 'small', data: by_stake_size.small },
    { key: 'medium', data: by_stake_size.medium },
    { key: 'large', data: by_stake_size.large },
    { key: 'mega', data: by_stake_size.mega },
  ];

  const labels = segments.map((s) => s.data.label);
  const rates = segments.map((s) => s.data.avg_compound_rate); // Already in percentage form
  const userCounts = segments.map((s) => s.data.user_count);

  // Highlight medium tier with accent color, others with secondary colors
  const colors = segments.map((s) =>
    s.key === 'medium' ? '#00A3B4' : '#6B7280'
  );

  return (
    <div
      ref={plotRef}
      style={{
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: 'var(--ifm-global-radius)',
        padding: '24px',
        marginBottom: '32px',
      }}
    >
      <h3 style={{ marginTop: 0 }}>Compound Rate by Stake Size (TUNA)</h3>

      <p style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '24px' }}>
        <strong>Compound Rate</strong>: Percentage of total rewards that were reinvested (compounded) rather than claimed.
      </p>

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
