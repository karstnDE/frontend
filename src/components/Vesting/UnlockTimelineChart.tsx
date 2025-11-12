import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import { useChartTracking } from '@site/src/hooks/useChartTracking';

interface UnlockTimelineChartProps {
  timeline: Record<string, number>;
  totalSchedules: number;
}

export default function UnlockTimelineChart({
  timeline,
  totalSchedules,
}: UnlockTimelineChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const template = getPlotlyTemplate(colorMode === 'dark');
  const isDark = colorMode === 'dark';

  // Plotly doesn't support CSS variables, use actual hex values
  const accentColor = isDark ? '#14BCCD' : '#00A3B4';
  const accentTransparent = isDark ? 'rgba(20, 188, 205, 0.2)' : 'rgba(0, 163, 180, 0.2)';
  // Very subtle spike (crosshair) color
  const spikeColor = isDark ? '#1a2832' : '#cbd5e0';

  const plotRef = useRef<HTMLDivElement>(null);
  useChartTracking(plotRef, {
    chartName: 'Vesting Unlock Timeline',
    trackClick: true,
    trackZoom: true,
  });

  // Convert timeline to arrays
  const sorted = Object.entries(timeline).sort(([a], [b]) => a.localeCompare(b));
  const dates = sorted.map(([date]) => date);
  const locked = sorted.map(([, amount]) => amount);

  const hasData = sorted.length > 0;

  // Get current locked amount for today's date
  const today = new Date().toISOString().split('T')[0];
  const currentLocked = timeline[today] ?? 0;

  const peakLocked = hasData ? Math.max(...locked) : 0;

  // Subtle vertical line for "Today" marker
  const todayLineColor = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';

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
      <h3 style={{ marginTop: 0 }}>Vesting Unlock Timeline</h3>
      <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
        Total vesting schedules: {totalSchedules}
      </p>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div className="badge badge--primary" style={{ padding: '12px 16px', fontSize: '14px' }}>
          <strong>{currentLocked.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> TUNA currently locked
        </div>
        <div className="badge badge--info" style={{ padding: '12px 16px', fontSize: '14px' }}>
          <strong>{peakLocked.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> TUNA peak locked
        </div>
      </div>

      {!hasData ? (
        <div style={{ padding: '24px', color: 'var(--ifm-color-emphasis-600)' }}>
          No vesting schedules found.
        </div>
      ) : (
        <Plot
          data={[
            {
              x: dates,
              y: locked,
              type: 'scatter',
              mode: 'lines',
              name: 'Locked TUNA',
              line: { color: accentColor, width: 2 },
              fill: 'tozeroy',
              fillcolor: accentTransparent,
              hovertemplate: '%{x}<br><b>%{y:,.0f}</b> TUNA locked<extra></extra>',
            },
          ]}
          layout={{
            ...template.layout,
            xaxis: {
              ...template.layout.xaxis,
              title: 'Date',
              type: 'date',
              spikecolor: spikeColor,
              spikedash: 'dot',
              spikethickness: 1,
            },
            yaxis: {
              ...template.layout.yaxis,
              title: 'Locked TUNA',
              spikecolor: spikeColor,
              spikedash: 'dot',
              spikethickness: 1,
            },
            shapes: [
              {
                type: 'line',
                x0: today,
                x1: today,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                  color: todayLineColor,
                  width: 2,
                  dash: 'dash',
                },
              },
            ],
            annotations: [
              {
                x: today,
                y: 1,
                yref: 'paper',
                text: 'Today',
                showarrow: false,
                xanchor: 'left',
                yanchor: 'bottom',
                xshift: 5,
                font: {
                  size: 12,
                  color: '#333',
                },
                bgcolor: 'white',
                borderpad: 4,
              },
            ],
            showlegend: false,
            margin: { l: 80, r: 40, t: 20, b: 60 },
          }}
          config={defaultPlotlyConfig}
          style={{ width: '100%', height: '450px' }}
        />
      )}
    </div>
  );
}
