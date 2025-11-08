import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import { useChartTracking } from '@site/src/hooks/useChartTracking';
import type { UsageDailyRecord } from '@site/src/hooks/useUsageMetrics';

interface UsageTimeSeriesChartProps {
  data: UsageDailyRecord[];
  title: string;
  yAxisLabel?: string;
  description?: React.ReactNode;
  cumulative?: boolean;
}

export default function UsageTimeSeriesChart({
  data,
  title,
  yAxisLabel = 'Users',
  description,
  cumulative = false,
}: UsageTimeSeriesChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const template = getPlotlyTemplate(colorMode === 'dark');

  const plotRef = useRef<HTMLDivElement>(null);
  useChartTracking(plotRef, {
    chartName: 'Usage Time Series',
    trackClick: true,
    trackZoom: true,
  });

  const sorted = [...(data || [])].sort((a, b) => a.date.localeCompare(b.date));
  const x = sorted.map((entry) => entry.date);

  let y: number[];
  if (cumulative) {
    // Calculate cumulative sum
    let runningTotal = 0;
    y = sorted.map((entry) => {
      runningTotal += entry.count;
      return runningTotal;
    });
  } else {
    y = sorted.map((entry) => entry.count);
  }

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
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {description && <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>{description}</p>}
      {sorted.length === 0 ? (
        <div style={{ padding: '24px', color: 'var(--ifm-color-emphasis-600)' }}>
          No data available for the selected range.
        </div>
      ) : (
        <Plot
          data={[
            {
              x,
              y,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'var(--onum-accent)' },
              line: { color: 'var(--onum-accent)' },
              hovertemplate: '%{x}<br><b>%{y}</b> users<extra></extra>',
            },
          ]}
          layout={{
            template,
            autosize: true,
            height: 420,
            margin: { l: 56, r: 24, t: 16, b: 48 },
            xaxis: {
              title: 'Date (UTC)',
              type: 'date',
            },
            yaxis: {
              title: yAxisLabel,
              rangemode: 'tozero',
            },
            hovermode: 'x unified',
          }}
          config={defaultPlotlyConfig}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}

