import React from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import type { SummaryData, GroupMode } from './types';

interface BreakdownChartProps {
  summary: SummaryData;
  groupMode: GroupMode;
}

export default function BreakdownChart({ summary, groupMode }: BreakdownChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const template = getPlotlyTemplate(isDark);

  // Select data based on group mode
  let labels: string[] = [];
  let values: number[] = [];
  let title = '';

  switch (groupMode) {
    case 'token':
      labels = summary.top_tokens_by_value.map(t => t.name);
      values = summary.top_tokens_by_value.map(t => t.total_sol);
      title = 'Revenue Breakdown by Token';
      break;
    case 'type':
      labels = summary.top_types_by_value.map(t => t.type);
      values = summary.top_types_by_value.map(t => t.total_sol);
      title = 'Revenue Breakdown by Transaction Type';
      break;
    case 'pool':
      labels = summary.top_pools_by_value.map(p => p.pool_label);
      values = summary.top_pools_by_value.map(p => p.total_sol);
      title = 'Revenue Breakdown by Pool';
      break;
  }

  const trace: any = {
    x: labels,
    y: values,
    type: 'bar',
    marker: {
      color: 'var(--accent)',
      opacity: 0.8,
    },
    hovertemplate: '<b>%{x}</b><br>%{y:.2f} SOL<extra></extra>',
  };

  return (
    <div style={{
      background: 'var(--ifm-background-surface-color)',
      border: '1px solid var(--ifm-toc-border-color)',
      borderRadius: 'var(--ifm-global-radius)',
      padding: '16px',
      marginBottom: '24px',
    }}>
      <Plot
        data={[trace]}
        layout={{
          ...template.layout,
          title: {
            text: title,
            font: { size: 18, weight: 600 },
          },
          xaxis: {
            ...template.layout.xaxis,
            title: '',
            tickangle: -45,
          },
          yaxis: {
            ...template.layout.yaxis,
            title: 'Total SOL',
          },
          showlegend: false,
          hovermode: 'closest',
        }}
        config={defaultPlotlyConfig}
        style={{ width: '100%', height: '450px' }}
        useResizeHandler={true}
      />
    </div>
  );
}
