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

  // Sort tiers from tier8 (top) to tier1 (bottom)
  const sortedEntries = Object.entries(by_stake_size).sort((a, b) => {
    // Extract tier numbers (tier8 -> 8, tier1 -> 1)
    const tierA = parseInt(a[0].replace('tier', '')) || 0;
    const tierB = parseInt(b[0].replace('tier', '')) || 0;
    return tierB - tierA; // Descending order
  });

  const labels = sortedEntries.map(([_, data]) => data.label);
  const totalRewards = sortedEntries.map(([_, data]) => data.total_rewards || 0);

  // Calculate percentages for each behavior type
  const compoundOnlyPct = sortedEntries.map(([_, data]) =>
    data.user_count > 0 ? (data.compound_only_users / data.user_count) * 100 : 0
  );
  const mixedPct = sortedEntries.map(([_, data]) =>
    data.user_count > 0 ? (data.mixed_users / data.user_count) * 100 : 0
  );
  const claimOnlyPct = sortedEntries.map(([_, data]) =>
    data.user_count > 0 ? (data.claim_only_users / data.user_count) * 100 : 0
  );

  // Behavior counts for hover info
  const compoundOnlyCounts = sortedEntries.map(([_, data]) => data.compound_only_users);
  const mixedCounts = sortedEntries.map(([_, data]) => data.mixed_users);
  const claimOnlyCounts = sortedEntries.map(([_, data]) => data.claim_only_users);
  const totalUsers = sortedEntries.map(([_, data]) => data.user_count);

  // Colors: green for compound, yellow for mixed, red for claim
  const compoundColor = '#22C55E';
  const mixedColor = '#F59E0B';
  const claimColor = '#EF4444';

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
        Distribution of user behavior (compound-only, mixed, claim-only) across stake size tiers.
        Each bar shows the percentage breakdown totaling 100%.
      </p>

      <Plot
        data={[
          {
            type: 'bar',
            name: 'Compound-only',
            x: compoundOnlyPct,
            y: labels,
            orientation: 'h',
            marker: {
              color: compoundColor,
            },
            text: compoundOnlyPct.map(pct => pct > 5 ? `${pct.toFixed(0)}%` : ''),
            textposition: 'inside',
            insidetextanchor: 'middle',
            hovertemplate: '<b>Compound-only</b><br>' +
              '%{customdata.count} users (%{x:.1f}%)<br>' +
              '<extra></extra>',
            customdata: compoundOnlyPct.map((_, idx) => ({
              count: compoundOnlyCounts[idx],
            })),
          },
          {
            type: 'bar',
            name: 'Mixed Behavior',
            x: mixedPct,
            y: labels,
            orientation: 'h',
            marker: {
              color: mixedColor,
            },
            text: mixedPct.map(pct => pct > 5 ? `${pct.toFixed(0)}%` : ''),
            textposition: 'inside',
            insidetextanchor: 'middle',
            hovertemplate: '<b>Mixed</b><br>' +
              '%{customdata.count} users (%{x:.1f}%)<br>' +
              '<extra></extra>',
            customdata: mixedPct.map((_, idx) => ({
              count: mixedCounts[idx],
            })),
          },
          {
            type: 'bar',
            name: 'Claim-only',
            x: claimOnlyPct,
            y: labels,
            orientation: 'h',
            marker: {
              color: claimColor,
            },
            text: claimOnlyPct.map(pct => pct > 5 ? `${pct.toFixed(0)}%` : ''),
            textposition: 'inside',
            insidetextanchor: 'middle',
            hovertemplate: '<b>Claim-only</b><br>' +
              '%{customdata.count} users (%{x:.1f}%)<br>' +
              '<extra></extra>',
            customdata: claimOnlyPct.map((_, idx) => ({
              count: claimOnlyCounts[idx],
            })),
          },
        ]}
        layout={{
          ...template.layout,
          barmode: 'stack',
          xaxis: {
            title: 'User Distribution (%)',
            range: [0, 100],
            ticksuffix: '%',
          },
          yaxis: {
            title: '',
            automargin: true,
          },
          showlegend: true,
          legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: -0.3,
            xanchor: 'center',
            x: 0.5,
          },
          margin: { l: 150, r: 150, t: 20, b: 100 },
          height: Math.max(400, labels.length * 60),
          annotations: totalRewards.map((reward, idx) => ({
            x: 101,
            y: labels[idx],
            xref: 'x',
            yref: 'y',
            text: `${reward.toFixed(1)} SOL<br>(${totalUsers[idx]} users)`,
            showarrow: false,
            xanchor: 'left',
            font: {
              size: 11,
              color: 'var(--ifm-color-emphasis-700)',
            },
          })),
        }}
        config={defaultPlotlyConfig}
        style={{ width: '100%' }}
      />
    </div>
  );
}
