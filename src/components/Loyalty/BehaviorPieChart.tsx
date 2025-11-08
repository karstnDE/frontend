import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import { useChartTracking } from '@site/src/hooks/useChartTracking';
import type { UserSegments } from '@site/src/hooks/useStakerLoyalty';

interface BehaviorPieChartProps {
  userSegments: UserSegments;
  totalUsers: number;
  currentActiveStakers?: number;
}

export default function BehaviorPieChart({
  userSegments,
  totalUsers,
  currentActiveStakers,
}: BehaviorPieChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const template = getPlotlyTemplate(colorMode === 'dark');

  const plotRef = useRef<HTMLDivElement>(null);
  useChartTracking(plotRef, {
    chartName: 'Behavior Distribution',
    trackClick: true,
    trackZoom: true,
  });

  const { by_behavior } = userSegments;

  // Calculate non-active stakers if currentActiveStakers is provided
  const nonActiveCount = currentActiveStakers ? currentActiveStakers - totalUsers : 0;
  const baseTotal = currentActiveStakers || totalUsers;
  const nonActivePercentage = currentActiveStakers ? (nonActiveCount / currentActiveStakers) * 100 : 0;

  const labels = currentActiveStakers
    ? ['No Reward Activity', 'Compound-only', 'Mixed Behavior', 'Claim-only']
    : ['Compound-only', 'Mixed Behavior', 'Claim-only'];

  const values = currentActiveStakers
    ? [
        nonActiveCount,
        by_behavior.compound_only.count,
        by_behavior.mixed.count,
        by_behavior.claim_only.count,
      ]
    : [
        by_behavior.compound_only.count,
        by_behavior.mixed.count,
        by_behavior.claim_only.count,
      ];

  // Color scheme: gray for no activity, green for compound, yellow for mixed, red for claim
  const colors = currentActiveStakers
    ? ['#9CA3AF', '#22C55E', '#F59E0B', '#EF4444']
    : ['#22C55E', '#F59E0B', '#EF4444'];

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
      <h3 style={{ marginTop: 0 }}>How Stakers Manage Their Rewards</h3>

      <Plot
        data={[
          {
            type: 'pie',
            labels,
            values,
            marker: {
              colors,
            },
            textinfo: 'label+percent',
            textposition: 'auto',
            hovertemplate: '<b>%{label}</b><br>' +
              '%{value} users (%{percent})<br>' +
              '<extra></extra>',
          },
        ]}
        layout={{
          ...template.layout,
          showlegend: true,
          legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: -0.2,
            xanchor: 'center',
            x: 0.5,
          },
          margin: { l: 20, r: 20, t: 20, b: 80 },
          height: 400,
        }}
        config={defaultPlotlyConfig}
        style={{ width: '100%' }}
      />

      <p style={{ color: 'var(--ifm-color-emphasis-700)', marginTop: '16px', marginBottom: 0 }}>
        {currentActiveStakers ? (
          <>
            Based on <strong>{currentActiveStakers.toLocaleString()}</strong> current active stakers
            {' '}({totalUsers.toLocaleString()} actively managed rewards)
          </>
        ) : (
          <>Based on <strong>{totalUsers.toLocaleString()}</strong> unique stakers</>
        )}
      </p>
    </div>
  );
}
