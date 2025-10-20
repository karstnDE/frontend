import React from 'react';
import type { TopTransactionsData, GroupMode } from './types';

interface TopTransactionsTableProps {
  topTransactionsToken: TopTransactionsData;
  topTransactionsType: TopTransactionsData;
  topTransactionsPool: TopTransactionsData;
  groupMode: GroupMode;
}

export default function TopTransactionsTable({
  topTransactionsToken,
  topTransactionsType,
  topTransactionsPool,
  groupMode,
}: TopTransactionsTableProps): React.ReactElement {
  // Select data based on group mode
  let topTransactions: TopTransactionsData = {};
  let groupLabel = '';

  switch (groupMode) {
    case 'token':
      topTransactions = topTransactionsToken;
      groupLabel = 'Token';
      break;
    case 'type':
      topTransactions = topTransactionsType;
      groupLabel = 'Type';
      break;
    case 'pool':
      topTransactions = topTransactionsPool;
      groupLabel = 'Pool';
      break;
  }

  // Flatten and sort all transactions by amount
  const allTransactions = Object.entries(topTransactions).flatMap(([group, txs]) =>
    txs.map(tx => ({ ...tx, group }))
  );

  const top10 = allTransactions
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  if (top10.length === 0) {
    return (
      <div style={{
        padding: '48px',
        textAlign: 'center',
        color: 'var(--ifm-color-secondary)',
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
      }}>
        No transaction data available
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{
      background: 'var(--ifm-background-surface-color)',
      border: '1px solid var(--ifm-toc-border-color)',
      borderRadius: 'var(--ifm-global-radius)',
      padding: '24px',
      marginBottom: '24px',
      overflowX: 'auto',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Top 10 Transactions</h3>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px',
      }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Rank</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Amount</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Date</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Type</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>{groupLabel}</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Pool</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Signature</th>
          </tr>
        </thead>
        <tbody>
          {top10.map((tx, idx) => (
            <tr key={tx.signature} style={{
              borderBottom: '1px solid var(--ifm-toc-border-color)',
              transition: 'background 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ifm-toc-border-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              <td style={{ padding: '12px 8px', color: 'var(--ifm-color-secondary)' }}>
                #{idx + 1}
              </td>
              <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--accent)' }}>
                {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOL
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--ifm-color-secondary)' }}>
                {formatDate(tx.timestamp)}
              </td>
              <td style={{ padding: '12px 8px' }}>
                <div style={{
                  fontSize: '13px',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.label}
                </div>
              </td>
              <td style={{ padding: '12px 8px' }}>
                <div style={{
                  fontSize: '13px',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.group}
                </div>
              </td>
              <td style={{ padding: '12px 8px' }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--ifm-color-secondary)',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.pool_label}
                </div>
              </td>
              <td style={{ padding: '12px 8px' }}>
                <a
                  href={`https://solscan.io/tx/${tx.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--ifm-font-family-monospace)',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
