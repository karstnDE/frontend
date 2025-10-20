import React from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import type { DailyDataPoint } from './types';

interface DailyStackedChartProps {
  data: DailyDataPoint[];
}

export default function DailyStackedChart({ data }: DailyStackedChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const template = getPlotlyTemplate(isDark);

  if (data.length === 0) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        color: 'var(--ifm-color-secondary)',
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
      }}>
        No daily data available
      </div>
    );
  }

  const dates = data.map(d => d.date);
  const orcaSol = data.map(d => d.orca_sol || 0);
  const fusionSol = data.map(d => d.fusion_sol || 0);
  const otherSol = data.map(d => d.other_sol || 0);

  const traces: any[] = [
    {
      x: dates,
      y: orcaSol,
      name: 'Orca SOL',
      type: 'scatter',
      mode: 'lines',
      stackgroup: 'one',
      fillcolor: 'rgba(20, 188, 205, 0.5)',
      line: { width: 0.5, color: 'rgba(20, 188, 205, 1)' },
      hovertemplate: '<b>Orca SOL</b><br>%{y:.2f} SOL<br>%{x}<extra></extra>',
    },
    {
      x: dates,
      y: fusionSol,
      name: 'Fusion SOL',
      type: 'scatter',
      mode: 'lines',
      stackgroup: 'one',
      fillcolor: 'rgba(0, 163, 180, 0.5)',
      line: { width: 0.5, color: 'rgba(0, 163, 180, 1)' },
      hovertemplate: '<b>Fusion SOL</b><br>%{y:.2f} SOL<br>%{x}<extra></extra>',
    },
    {
      x: dates,
      y: otherSol,
      name: 'Other SOL',
      type: 'scatter',
      mode: 'lines',
      stackgroup: 'one',
      fillcolor: 'rgba(151, 163, 180, 0.5)',
      line: { width: 0.5, color: 'rgba(151, 163, 180, 1)' },
      hovertemplate: '<b>Other SOL</b><br>%{y:.2f} SOL<br>%{x}<extra></extra>',
    },
  ];

  return (
    <div style={{
      background: 'var(--ifm-background-surface-color)',
      border: '1px solid var(--ifm-toc-border-color)',
      borderRadius: 'var(--ifm-global-radius)',
      padding: '16px',
      marginBottom: '24px',
    }}>
      <Plot
        data={traces}
        layout={{
          ...template.layout,
          title: {
            text: 'Daily Revenue (Stacked)',
            font: { size: 18, weight: 600 },
          },
          xaxis: {
            ...template.layout.xaxis,
            title: 'Date',
            type: 'date',
          },
          yaxis: {
            ...template.layout.yaxis,
            title: 'SOL',
          },
          showlegend: true,
          legend: {
            orientation: 'h',
            y: -0.15,
            yanchor: 'top',
            x: 0.5,
            xanchor: 'center',
          },
          hovermode: 'x unified',
        }}
        config={defaultPlotlyConfig}
        style={{ width: '100%', height: '400px' }}
        useResizeHandler={true}
      />
    </div>
  );
}
