import React, { useEffect, useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import LoadingSpinner from '../common/LoadingSpinner';
import { useChartTracking } from '@site/src/hooks/useChartTracking';
import { trackCustomEvent } from '@site/src/utils/analytics';

interface ApyDataPoint {
  date: string;
  apy_percent: number;
  rolling_days: number;
  rolling_revenue_sol: number;
  annualized_revenue_sol: number;
  tuna_price_sol: number;
  revenue_per_tuna_sol: number;
  daily_revenue_sol: number;
  // USD fields (optional)
  wsol_usdc_price?: number;
  rolling_revenue_usdc?: number;
  daily_revenue_usdc?: number;
  annualized_revenue_usdc?: number;
  revenue_per_tuna_usdc?: number;
}

interface ApySummary {
  current_apy: number;
  average_apy: number;
  max_apy: number;
  min_apy: number;
}

interface ApyData {
  date_range: {
    start: string;
    end: string;
  };
  daily_apy: ApyDataPoint[];
  summary: ApySummary;
}

export default function ApyChart(): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const template = getPlotlyTemplate(isDark);

  const [data, setData] = useState<ApyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entryPriceInput, setEntryPriceInput] = useState<string>('0.05');

  // Chart tracking
  const plotRef = useRef<HTMLDivElement>(null);
  useChartTracking(plotRef, {
    chartName: 'APY Chart',
    trackClick: true,
    trackZoom: true,
  });

  // Load user entry price from localStorage on mount, default to 0.05 (public pre-sale price)
  useEffect(() => {
    const saved = localStorage.getItem('tunaEntryPrice');
    if (saved && saved.trim() !== '') {
      const normalised = saved.replace(',', '.');
      setEntryPriceInput(normalised);
      localStorage.setItem('tunaEntryPrice', normalised);
    } else {
      setEntryPriceInput('0.05');
      localStorage.setItem('tunaEntryPrice', '0.05');
    }
  }, []);

  useEffect(() => {
    fetch('/data/apy_data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load APY data: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData: ApyData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading APY data:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        color: 'var(--ifm-color-danger)',
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
      }}>
        Error loading APY data: {error}
      </div>
    );
  }

  if (!data || data.daily_apy.length === 0) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        color: 'var(--ifm-color-secondary)',
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
      }}>
        No APY data available
      </div>
    );
  }

  // Extract data for chart
  const dates = data.daily_apy.map(d => d.date);
  const apyValues = data.daily_apy.map(d => d.apy_percent);

  const parsedEntryPrice = (() => {
    const trimmed = entryPriceInput.trim();
    if (trimmed === '') {
      return null;
    }
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  })();

  // Calculate personalized APY if user has entered a price
  const personalizedApyValues = parsedEntryPrice !== null && parsedEntryPrice > 0 ? data.daily_apy.map(d => {
    if (d.revenue_per_tuna_usdc) {
      return (d.revenue_per_tuna_usdc / parsedEntryPrice) * 100;
    }
    return null;
  }) : null;

  // Create hover template with detailed information
  const hoverTemplate = data.daily_apy.map((d, i) => {
    let template = `<b>Date:</b> ${d.date}<br>` +
      `<b>Market APY:</b> ${d.apy_percent.toFixed(2)}%<br>`;

    // Add personalized APY if available
    if (personalizedApyValues && personalizedApyValues[i] !== null) {
      template += `<b>Custom APY:</b> ${personalizedApyValues[i].toFixed(2)}%<br>`;
    }

    template += `<b>Rolling Days:</b> ${d.rolling_days}<br>`;

    // Show rolling revenue in both SOL and USD if available
    if (d.rolling_revenue_usdc) {
      template += `<b>Rolling Revenue:</b> ${d.rolling_revenue_sol.toFixed(2)} SOL ($${d.rolling_revenue_usdc.toFixed(0)})<br>`;
    } else {
      template += `<b>Rolling Revenue:</b> ${d.rolling_revenue_sol.toFixed(2)} SOL<br>`;
    }

    template += `<b>TUNA Price:</b> ${d.tuna_price_sol.toFixed(6)} SOL<br>`;
    template += `<extra></extra>`;

    return template;
  });

  // Build traces array
  const traces: any[] = [
    {
      x: dates,
      y: apyValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Market APY',
      line: {
        color: 'rgba(0, 163, 180, 1)',  // Teal accent
        width: 2,
      },
      marker: {
        color: 'rgba(0, 163, 180, 0.8)',
        size: 4,
      },
      hovertemplate: hoverTemplate,
    }
  ];

  // Add personalized APY trace if available
  if (personalizedApyValues) {
    traces.push({
      x: dates,
      y: personalizedApyValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Custom APY',
      line: {
        color: 'rgba(34, 197, 94, 1)',  // Green
        width: 2,
        dash: 'dash',
      },
      marker: {
        color: 'rgba(34, 197, 94, 0.8)',
        size: 4,
      },
      hovertemplate: hoverTemplate,
    });
  }

  const handleEntryPriceChange = (value: string) => {
    if (value === '') {
      setEntryPriceInput('');
      localStorage.removeItem('tunaEntryPrice');
      window.dispatchEvent(new Event('tunaEntryPriceChanged'));
      return;
    }

    if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) {
      return;
    }

    const normalised = value.replace(',', '.');
    setEntryPriceInput(normalised);
    localStorage.setItem('tunaEntryPrice', normalised);
    window.dispatchEvent(new Event('tunaEntryPriceChanged'));

    // Track custom price usage
    const parsed = Number.parseFloat(normalised);
    if (Number.isFinite(parsed) && parsed > 0) {
      trackCustomEvent('APY', 'custom-price-set', String(parsed));
    }
  };

  const handleClearEntryPrice = () => {
    setEntryPriceInput('');
    localStorage.removeItem('tunaEntryPrice');
    window.dispatchEvent(new Event('tunaEntryPriceChanged'));
  };

  return (
    <>
      <div ref={plotRef} style={{
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
              text: 'TUNA Staking APY Over Time',
              font: { size: 18, weight: 600 },
            },
            xaxis: {
              ...template.layout.xaxis,
              title: 'Date',
              type: 'date',
            },
            yaxis: {
              ...template.layout.yaxis,
              title: 'APY (%)',
            },
            showlegend: personalizedApyValues ? true : false,
            legend: personalizedApyValues ? {
              orientation: 'h',
              y: -0.15,
              x: 0.5,
              xanchor: 'center',
            } : undefined,
            hovermode: 'closest',
          }}
          config={defaultPlotlyConfig}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
        />
      </div>

      {/* Personalized APY Input */}
      <div style={{
        marginBottom: '24px',
        padding: '20px',
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
      }}>
        <label style={{
          display: 'block',
          marginBottom: '12px',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ifm-font-color-base)',
        }}>
          Calculate Custom APY
        </label>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--ifm-color-secondary)' }}>
              Custom TUNA Entry Price:
            </span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ifm-font-color-base)' }}>$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.05 (public pre-sale)"
              value={entryPriceInput}
              onChange={(e) => handleEntryPriceChange(e.target.value)}
              style={{
                width: '150px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--ifm-toc-border-color)',
                borderRadius: '4px',
                background: 'var(--ifm-background-color)',
                color: 'var(--ifm-font-color-base)',
              }}
            />
          </div>
          {parsedEntryPrice !== null && (
            <button
              onClick={handleClearEntryPrice}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid var(--ifm-toc-border-color)',
                borderRadius: '4px',
                background: 'var(--ifm-background-color)',
                color: 'var(--ifm-font-color-base)',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--ifm-color-secondary)',
          marginTop: '8px',
          lineHeight: '1.5',
        }}>
          Enter the USD price you paid per TUNA to see your custom APY based on actual protocol revenue. Defaults to $0.05 (public pre-sale price).
          {parsedEntryPrice !== null && ` Custom entry price: $${parsedEntryPrice.toFixed(4)}`}
        </div>
      </div>
    </>
  );
}







