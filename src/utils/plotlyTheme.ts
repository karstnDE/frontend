/**
 * Plotly Theme System for karstenalytics
 * Provides consistent theming that responds to light/dark mode changes
 */

const ACCENT = '#00A3B4';

interface PlotlyColors {
  text: string;
  grid: string;
  bg: string;
  paper: string;
}

function getColors(isDark: boolean): PlotlyColors {
  return {
    text: isDark ? '#E6E9EE' : '#111111',
    grid: isDark ? '#1F2A35' : '#E1E7EE',
    bg: isDark ? '#0B0F14' : '#FFFFFF',
    paper: isDark ? '#0F141B' : '#FFFFFF',
  };
}

export function getPlotlyTemplate(isDark: boolean) {
  const colors = getColors(isDark);

  return {
    layout: {
      font: { family: 'Inter, Helvetica, Arial, sans-serif', size: 14, color: colors.text },
      colorway: [
        ACCENT,
        '#285F7E',
        '#1ABC9C',
        '#8E44AD',
        '#2C3E50',
        '#F05A28',
        '#C0392B',
        '#27AE60',
        '#16A085',
        '#2980B9',
      ],
      paper_bgcolor: colors.paper,
      plot_bgcolor: colors.bg,
      margin: { l: 60, r: 24, t: 32, b: 48 },
      xaxis: {
        gridcolor: colors.grid,
        zeroline: false,
        linecolor: colors.grid,
        ticks: '',
        showspikes: true,
        spikemode: 'across',
        spikecolor: ACCENT,
        spikethickness: 1,
      },
      yaxis: {
        gridcolor: colors.grid,
        zeroline: false,
        linecolor: colors.grid,
        ticks: '',
        showspikes: true,
        spikemode: 'across',
        spikecolor: ACCENT,
        spikethickness: 1,
      },
      legend: {
        orientation: 'h',
        y: 1.02,
        yanchor: 'bottom',
        x: 0,
        title: { text: '' },
      },
      hovermode: 'x unified',
    },
    data: {
      scatter: [{ mode: 'lines', line: { width: 2 } }],
      bar: [{ marker: { line: { width: 0 } } }],
      heatmap: [{ colorbar: { outlinewidth: 0 } }],
    },
  };
}

/**
 * Default Plotly configuration options
 */
export const defaultPlotlyConfig = {
  displayModeBar: 'hover',
  displaylogo: false,
  modeBarButtonsToRemove: ['zoom2d', 'autoscale', 'select2d', 'lasso2d'],
  responsive: true,
} as const;
