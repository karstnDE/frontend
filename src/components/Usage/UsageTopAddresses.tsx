import React, { useEffect } from 'react';
import type { UsageTopWallet } from '@site/src/hooks/useUsageMetrics';
import { trackCustomEvent } from '@site/src/utils/analytics';

interface UsageTopAddressesProps {
  rows: UsageTopWallet[];
  title: string;
  showWeeks?: boolean;
  showMonths?: boolean;
  description?: React.ReactNode;
}

function shorten(address: string, size = 4): string {
  if (!address) return '';
  if (address.length <= size * 2 + 3) return address;
  return `${address.slice(0, size)}…${address.slice(-size)}`;
}

export default function UsageTopAddresses({
  rows,
  title,
  showWeeks = false,
  showMonths = false,
  description,
}: UsageTopAddressesProps): React.ReactElement {
  const data = rows || [];

  // Track when table is viewed with data
  useEffect(() => {
    if (data.length > 0) {
      trackCustomEvent('Usage', 'view-top-addresses', title);
    }
  }, [data.length, title]);

  return (
    <div
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
      {data.length === 0 ? (
        <div style={{ padding: '16px 0', color: 'var(--ifm-color-emphasis-600)' }}>
          No active addresses detected for this period.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            display: 'table',
            width: '100%',
            minWidth: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Rank</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Address</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>Days Active</th>
                {showWeeks && <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>Active Weeks</th>}
                {showMonths && <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>Active Months</th>}
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>Transactions</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>First Seen</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={row.address}
                  style={{
                    borderBottom: '1px solid var(--ifm-toc-border-color)',
                    transition: 'background 120ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--ifm-toc-border-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>{index + 1}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'left', fontFamily: 'var(--ifm-font-family-monospace)' }}>
                    <a href={`https://solscan.io/account/${row.address}`} target="_blank" rel="noopener noreferrer">
                      {shorten(row.address)}
                    </a>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>{row.days_active}</td>
                  {showWeeks && (
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>{row.active_weeks ?? 0}</td>
                  )}
                  {showMonths && (
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>{row.active_months ?? 0}</td>
                  )}
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>{row.tx_count}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {row.first_seen ?? '—'}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {row.last_seen ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

