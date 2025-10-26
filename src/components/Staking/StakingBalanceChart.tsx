import React from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import type { StakingDailyRecord } from '@site/src/hooks/useStakingMetrics';

interface StakingBalanceChartProps {
  data: StakingDailyRecord[];
  maxSupply?: number;
}

export default function StakingBalanceChart({
  data,
  maxSupply,
}: StakingBalanceChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const template = getPlotlyTemplate(colorMode === 'dark');

  const sorted = [...(data || [])].sort((a, b) => a.date.localeCompare(b.date));
  const x = sorted.map((point) => point.date);
  const staked = sorted.map((point) => point.staked);
  const unstaked = sorted.map((point) => point.unstaked);

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
      <h3 style={{ marginTop: 0 }}>Treasury TUNA Allocation</h3>
      {maxSupply != null && (
        <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
          Maximum TUNA supply: {maxSupply.toLocaleString()}
        </p>
      )}
      {sorted.length === 0 ? (
        <div style={{ padding: '24px', color: 'var(--ifm-color-emphasis-600)' }}>
          No TUNA activity recorded for the selected period.
        </div>
      ) : (
        <Plot
          data={[
            {
              x,
              y: staked,
              type: 'scatter',
              mode: 'lines',
              name: 'Staked TUNA',
              stackgroup: 'one',
              line: { color: 'var(--onum-accent)' },
              fillcolor: 'var(--onum-accent-transparent)',
              hovertemplate: '%{x}<br><b>%{y:.2f}</b> staked<extra></extra>',
            },
            {
              x,
              y: unstaked,
              type: 'scatter',
              mode: 'lines',
              name: 'Unstaked TUNA',
              stackgroup: 'one',
              line: { color: 'var(--ifm-color-primary)' },
              fillcolor: 'rgba(0, 163, 180, 0.25)',
              hovertemplate: '%{x}<br><b>%{y:.2f}</b> unstaked<extra></extra>',
            },
          ]}
          layout={{
            template,
            autosize: true,
            height: 420,
            margin: { l: 64, r: 24, t: 16, b: 48 },
            hovermode: 'x unified',
            xaxis: {
              title: 'Date (UTC)',
              type: 'date',
            },
            yaxis: {
              title: 'TUNA tokens',
              rangemode: 'tozero',
            },
            legend: {
              orientation: 'h',
              y: -0.15,
            },
          }}
          config={defaultPlotlyConfig}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}

