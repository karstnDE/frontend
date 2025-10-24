import React from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import type { SummaryData, GroupMode } from './types';

interface BreakdownChartProps {
  summary: SummaryData;
  groupMode: GroupMode;
  onBarClick?: (selectedId: string, selectedLabel: string) => void;
}

export default function BreakdownChart({ summary, groupMode, onBarClick }: BreakdownChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const template = getPlotlyTemplate(isDark);

  // Helper function to format pool labels as two-line (pair name on top, protocol below)
  const formatPoolLabel = (label: string): string => {
    // Pattern 1: "Orca (SOL-USDC)" -> "SOL-USDC<br>Orca"
    const parenMatch = label.match(/^(.+?)\s+\((.+?)\)$/);
    if (parenMatch) {
      const protocol = parenMatch[1];
      const pair = parenMatch[2];
      return `${pair}<br>${protocol}`;
    }

    // Pattern 2: "Fusion SOL-USDC" -> "SOL-USDC<br>Fusion"
    const spaceMatch = label.match(/^(Fusion|Orca)\s+(.+)$/);
    if (spaceMatch) {
      const protocol = spaceMatch[1];
      const pair = spaceMatch[2];
      return `${pair}<br>${protocol}`;
    }

    // Fallback: return as-is if no pattern matches
    return label;
  };

  // Select data based on group mode
  let labels: string[] = [];
  let values: number[] = [];
  let ids: string[] = []; // Identifiers for filtering (mint/type/pool_id)
  let title = '';

  switch (groupMode) {
    case 'token':
      labels = summary.top_tokens_by_value.map(t => t.name);
      values = summary.top_tokens_by_value.map(t => t.total_sol);
      ids = summary.top_tokens_by_value.map(t => t.mint); // Use mint for filtering
      title = 'Revenue Breakdown by Token';
      break;
    case 'type':
      labels = summary.top_types_by_value.map(t => t.label || t.type);
      values = summary.top_types_by_value.map(t => t.total_sol);
      ids = summary.top_types_by_value.map(t => t.type); // Use type for filtering
      title = 'Revenue Breakdown by Transaction Type';
      break;
    case 'pool':
      labels = summary.top_pools_by_value.map(p => formatPoolLabel(p.pool_label));
      values = summary.top_pools_by_value.map(p => p.total_sol);
      ids = summary.top_pools_by_value.map(p => p.pool_id); // Use pool_id for filtering
      title = 'Revenue Breakdown by Pool';
      break;
  }

  // Create hover text that includes both label and ID
  const hoverTexts = labels.map((label, idx) => {
    const id = ids[idx];
    // For token mode, show the mint address; for others just show the label
    if (groupMode === 'token') {
      return `<b>${label}</b><br>${values[idx].toFixed(2)} SOL<br><i>${id}</i>`;
    }
    return `<b>${label}</b><br>${values[idx].toFixed(2)} SOL`;
  });

  const trace: any = {
    x: labels,
    y: values,
    type: 'bar',
    marker: {
      color: 'var(--accent)',
      opacity: 0.8,
    },
    hovertemplate: '%{hovertext}<extra></extra>',
    hovertext: hoverTexts,
    customdata: ids, // Store IDs for filtering, not labels
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
            tickangle: 0,
            tickfont: { size: 11 },
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
        onClick={(event: any) => {
          if (event.points && event.points.length > 0 && onBarClick) {
            const point = event.points[0];
            const clickedId = point.customdata; // mint/type/pool_id
            const clickedLabel = point.x; // human-readable name
            onBarClick(clickedId, clickedLabel);
          }
        }}
      />
    </div>
  );
}
