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
          <table className="usage-top-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Rank</th>
                <th style={{ textAlign: 'left' }}>Address</th>
                <th style={{ textAlign: 'right' }}>Days Active</th>
                {showWeeks && <th style={{ textAlign: 'right' }}>Active Weeks</th>}
                {showMonths && <th style={{ textAlign: 'right' }}>Active Months</th>}
                <th style={{ textAlign: 'right' }}>Transactions</th>
                <th style={{ textAlign: 'right' }}>First Seen</th>
                <th style={{ textAlign: 'right' }}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.address}>
                  <td style={{ textAlign: 'left', fontWeight: 600 }}>{index + 1}</td>
                  <td style={{ textAlign: 'left', fontFamily: 'var(--ifm-font-family-monospace)' }}>
                    <a href={`https://solscan.io/account/${row.address}`} target="_blank" rel="noopener noreferrer">
                      {shorten(row.address)}
                    </a>
                  </td>
                  <td style={{ textAlign: 'right' }}>{row.days_active}</td>
                  {showWeeks && (
                    <td style={{ textAlign: 'right' }}>{row.active_weeks ?? 0}</td>
                  )}
                  {showMonths && (
                    <td style={{ textAlign: 'right' }}>{row.active_months ?? 0}</td>
                  )}
                  <td style={{ textAlign: 'right' }}>{row.tx_count}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {row.first_seen ?? '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
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

