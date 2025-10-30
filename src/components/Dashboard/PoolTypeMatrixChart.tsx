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
  
  // Color palette - same as DailyStackedBarChart
  const nonRedPalette = [
    'rgba(0, 163, 180, 0.8)',    // teal (accent)
    'rgba(40, 95, 126, 0.8)',    // dark blue
    'rgba(26, 188, 156, 0.8)',   // turquoise
    'rgba(142, 68, 173, 0.8)',   // purple
    'rgba(44, 62, 80, 0.8)',     // dark gray
    'rgba(39, 174, 96, 0.8)',    // green
    'rgba(22, 160, 133, 0.8)',   // dark turquoise
    'rgba(41, 128, 185, 0.8)',   // blue
  ];

  const redPalette = [
    'rgba(239, 68, 68, 0.8)',   // red-500
    'rgba(220, 38, 38, 0.8)',   // red-600
    'rgba(185, 28, 28, 0.8)',   // red-700
  ];
  
  const getColor = (typeName: string, index: number): string => {
    // Only types that START with "Liquidate" get red
    if (typeName.startsWith('Liquidate')) {
      return redPalette[index % redPalette.length];
    }
    // Non-red colors from design palette
    return nonRedPalette[index % nonRedPalette.length];
  };

  // Get all unique types across all pools for consistent coloring
  const allTypes = new Set<string>();
  data.forEach(pool => {
    pool.types.forEach(t => allTypes.add(t.type));
  });
  const typesList = Array.from(allTypes);
  const typeColorMap: Record<string, string> = {};
  typesList.forEach((type, idx) => {
    typeColorMap[type] = getColor(type, idx);
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
        widths.push(poolPos.width); // Full width - borders will create gaps
        hoverTexts.push(
          `<b>${pool.pool_label}</b><br>` +
          `Type: ${typeName}<br>` +
          `${typeData.sol_equivalent.toFixed(2)} SOL<br>` +
          `${(typeData.share_of_pool * 100).toFixed(1)}% of pool<br>` +
          `${(typeData.share_of_total * 100).toFixed(2)}% of total revenue`
        );
        // No text labels
        textLabels.push('');
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
        marker: {
          color: typeColorMap[typeName],
          line: {
            color: isDark ? '#1a1a1a' : '#ffffff',
            width: 1,  // Same thin border for both vertical and horizontal
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
