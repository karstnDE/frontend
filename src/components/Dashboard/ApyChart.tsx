import React, { useEffect, useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import { useColorMode } from '@docusaurus/theme-common';
import { getPlotlyTemplate, defaultPlotlyConfig } from '@site/src/utils/plotlyTheme';
import LoadingSpinner from '../common/LoadingSpinner';
import { useChartTracking } from '@site/src/hooks/useChartTracking';
import { trackCustomEvent } from '@site/src/utils/analytics';
import { ShareButton } from '@site/src/components/ShareButton';

interface AprDataPoint {
  date: string;
  reference_apr_percent: number;
  your_apr_percent: number;
  rolling_days: number;
  rolling_revenue_sol: number;
  rolling_revenue_usd: number;
  annualized_revenue_sol: number;
  annualized_revenue_usd: number;
  tuna_price_usd: number;
  tuna_price_source: string;
  revenue_per_tuna_usd: number;
  daily_revenue_sol: number;
  daily_revenue_usd: number;
  usd_sol_rate: number;
}

interface AprSummary {
  current_reference_apr: number;
  current_your_apr: number;
  average_reference_apr: number;
  average_your_apr: number;
  max_reference_apr: number;
  max_your_apr: number;
  min_reference_apr: number;
  min_your_apr: number;
}

interface AprData {
  date_range: {
    start: string;
    end: string;
  };
  daily_apr: AprDataPoint[];
  summary: AprSummary;
}

export default function ApyChart(): React.ReactElement {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const template = getPlotlyTemplate(isDark);

  const [data, setData] = useState<AprData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entryPriceInput, setEntryPriceInput] = useState<string>('0.05');

  // Chart tracking
  const plotRef = useRef<HTMLDivElement>(null);
  useChartTracking(plotRef, {
    chartName: 'APR Chart',
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
    fetch('/data/apr_data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load APR data: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData: AprData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading APR data:', err);
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
        Error loading APR data: {error}
      </div>
    );
  }

  if (!data || data.daily_apr.length === 0) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        color: 'var(--ifm-color-secondary)',
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
      }}>
        No APR data available
      </div>
    );
  }

  // Extract data for chart
  const dates = data.daily_apr.map(d => d.date);
  const referenceAprValues = data.daily_apr.map(d => d.reference_apr_percent);
  const yourAprValues = data.daily_apr.map(d => d.your_apr_percent);

  const parsedEntryPrice = (() => {
    const trimmed = entryPriceInput.trim();
    if (trimmed === '') {
      return null;
    }
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  })();

  // Calculate custom APR if user has entered a different price than default ($0.05)
  const customAprValues = parsedEntryPrice !== null && parsedEntryPrice > 0 ? data.daily_apr.map(d => {
    if (d.revenue_per_tuna_usd) {
      return (d.revenue_per_tuna_usd / parsedEntryPrice) * 100;
    }
    return null;
  }) : null;

  // Create hover template with detailed information
  const hoverTemplate = data.daily_apr.map((d, i) => {
    let template = `<b>Date:</b> ${d.date}<br>` +
      `<b>Reference APR:</b> ${d.reference_apr_percent.toFixed(2)}%<br>`;

    // Add custom APR if user changed entry price, otherwise show "Your APR"
    if (customAprValues && customAprValues[i] !== null && parsedEntryPrice !== 0.05) {
      template += `<b>Custom APR:</b> ${customAprValues[i].toFixed(2)}%<br>`;
    } else {
      template += `<b>Your APR:</b> ${d.your_apr_percent.toFixed(2)}%<br>`;
    }

    template += `<b>Rolling Days:</b> ${d.rolling_days}<br>`;

    // Show rolling revenue in both SOL and USD
    template += `<b>Rolling Revenue:</b> ${d.rolling_revenue_sol.toFixed(2)} SOL ($${d.rolling_revenue_usd.toFixed(0)})<br>`;

    // Show TUNA price in USD with source
    template += `<b>TUNA Price:</b> $${d.tuna_price_usd.toFixed(4)} (${d.tuna_price_source})<br>`;
    template += `<extra></extra>`;

    return template;
  });

  // Build traces array
  const traces: any[] = [
    {
      x: dates,
      y: referenceAprValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Reference APR',
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

  // Add Your/Custom APR trace (always show, either default $0.05 or custom price)
  const yourAprTraceValues = customAprValues && parsedEntryPrice !== 0.05 ? customAprValues : yourAprValues;
  const yourAprTraceName = customAprValues && parsedEntryPrice !== 0.05 ? 'Custom APR' : 'Your APR';

  traces.push({
    x: dates,
    y: yourAprTraceValues,
    type: 'scatter',
    mode: 'lines+markers',
    name: yourAprTraceName,
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <div style={{ flex: 1 }} />
          <ShareButton
            plotRef={plotRef}
            chartName="TUNA Staking APR"
            shareText={`Check out the TUNA Staking APR trends - currently at ${data.summary.current_reference_apr.toFixed(2)}%! 📊`}
          />
        </div>
        <Plot
          data={traces}
          layout={{
            ...template.layout,
            title: {
              text: 'TUNA Staking APR Over Time',
              font: { size: 18, weight: 600 },
            },
            xaxis: {
              ...template.layout.xaxis,
              title: 'Date',
              type: 'date',
            },
            yaxis: {
              ...template.layout.yaxis,
              title: 'APR (%)',
            },
            showlegend: true,
            legend: {
              orientation: 'h',
              y: -0.15,
              x: 0.5,
              xanchor: 'center',
            },
            hovermode: 'closest',
          }}
          config={defaultPlotlyConfig}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
        />
      </div>

      {/* Your TUNA Entry Price Input */}
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
          Your TUNA Entry Price
        </label>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--ifm-color-secondary)' }}>
              Your Entry Price:
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
          Enter the USD price you paid per TUNA to see your custom APR based on actual protocol revenue. Defaults to $0.05 (public pre-sale price).
          {parsedEntryPrice !== null && ` Your entry price: $${parsedEntryPrice.toFixed(4)}`}
        </div>
      </div>
    </>
  );
}







