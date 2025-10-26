import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';

interface PoolTypeData {
  pool_id: string;
  pool_label: string;
  total_sol: number;
  share_of_total: number;
  types: Array<{
    type: string;
    sol_equivalent: number;
    share_of_pool: number;
    share_of_total: number;
  }>;
}

interface PoolTypeMatrixChartProps {
  onSegmentClick?: (poolId: string, poolLabel: string) => void;
}

export default function PoolTypeMatrixChart({ onSegmentClick }: PoolTypeMatrixChartProps): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const template = getPlotlyTemplate(isDark);

  const [data, setData] = useState<PoolTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to format pool labels (prefer swapping pair/protocol for pools)
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

    // Fallback: return as-is
    return label;
  };

  useEffect(() => {
    fetch('/analytics/data/pool_type_summary.json')
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading pool-type matrix data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Loading chart...</div>;
  }

  if (!data || data.length === 0) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>No data available</div>;
  }

  // Build Marimekko chart data
  // Each pool gets a position on x-axis with width proportional to its share
  // Each type within a pool is a stacked segment

  const traces: any[] = [];
  const colorPalette = [
    '#00A3B4', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195',
  ];

  // Get all unique types across all pools for consistent coloring
  const allTypes = new Set<string>();
  data.forEach(pool => {
    pool.types.forEach(t => allTypes.add(t.type));
  });
  const typesList = Array.from(allTypes);
  const typeColorMap: Record<string, string> = {};
  typesList.forEach((type, idx) => {
    typeColorMap[type] = colorPalette[idx % colorPalette.length];
  });

  // Calculate cumulative x positions for pools
  let cumulativeX = 0;
  const poolPositions: Array<{ pool: string; xStart: number; xEnd: number; width: number }> = [];

  data.forEach(pool => {
    const width = pool.share_of_total;
    poolPositions.push({
      pool: formatPoolLabel(pool.pool_label),  // Apply label formatting
      xStart: cumulativeX,
      xEnd: cumulativeX + width,
      width: width,
    });
    cumulativeX += width;
  });

  // Create traces for each type (so they stack properly across pools)
  typesList.forEach(typeName => {
    const xValues: number[] = [];
    const yValues: number[] = [];
    const widths: number[] = [];
    const hoverTexts: string[] = [];
    const textLabels: string[] = [];
    const customData: Array<[string, string, string]> = [];  // [pool_id, pool_label, type]

    poolPositions.forEach((poolPos, poolIdx) => {
      const pool = data[poolIdx];
      const typeData = pool.types.find(t => t.type === typeName);

      if (typeData) {
        // Position bar at center of pool's x range
        const xCenter = poolPos.xStart + poolPos.width / 2;
        xValues.push(xCenter);
        // Use percentage of pool (0-100) instead of absolute SOL for normalized height
        yValues.push(typeData.share_of_pool * 100);
        widths.push(poolPos.width * 0.95); // Slight gap between pools
        hoverTexts.push(
          `<b>${pool.pool_label}</b><br>` +
          `Type: ${typeName}<br>` +
          `${typeData.sol_equivalent.toFixed(2)} SOL<br>` +
          `${(typeData.share_of_pool * 100).toFixed(1)}% of pool<br>` +
          `${(typeData.share_of_total * 100).toFixed(2)}% of total revenue`
        );
        // Only show text label if segment is large enough (>8% of pool height)
        textLabels.push(typeData.share_of_pool * 100 > 8 ? typeName : '');
        customData.push([pool.pool_id, pool.pool_label, typeName]);
      }
    });

    if (xValues.length > 0) {
      traces.push({
        type: 'bar',
        x: xValues,
        y: yValues,
        width: widths,
        name: typeName,
        text: textLabels,
        textposition: 'inside',
        textfont: {
          size: 9,
          color: '#ffffff',
        },
        marker: {
          color: typeColorMap[typeName],
          line: {
            color: isDark ? '#1a1a1a' : '#ffffff',
            width: 1,
          },
        },
        hovertemplate: '%{hovertext}<extra></extra>',
        hovertext: hoverTexts,
        customdata: customData,
      });
    }
  });

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
            text: 'Revenue Distribution: Pools × Transaction Types',
            font: { size: 18, weight: 600 },
          },
          xaxis: {
            ...template.layout.xaxis,
            title: 'Liquidity Pools (width = share of total revenue)',
            tickmode: 'array',
            tickvals: poolPositions.map(p => p.xStart + p.width / 2),
            ticktext: poolPositions.map(p => p.pool),
            tickangle: 0,
            tickfont: { size: 11 },
            range: [-0.05, 1.05],
          },
          yaxis: {
            ...template.layout.yaxis,
            title: 'Share of Pool Revenue (%)',
            range: [0, 105],
            ticksuffix: '%',
          },
          barmode: 'stack',
          showlegend: false,
          hovermode: 'closest',
          margin: {
            l: 60,
            r: 40,
            t: 60,
            b: 120,
          },
        }}
        config={defaultPlotlyConfig}
        style={{ width: '100%', height: '600px' }}
        useResizeHandler={true}
        onClick={(event: any) => {
          if (event.points && event.points.length > 0 && onSegmentClick) {
            const point = event.points[0];
            const [poolId, poolLabel, typeName] = point.customdata;
            onSegmentClick(poolId, poolLabel);
          }
        }}
      />
    </div>
  );
}
