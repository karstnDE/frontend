import React, { useMemo } from 'react';
import type { TopTransactionsData, GroupMode, SummaryData } from './types';

interface TopTransactionsTableProps {
  topTransactionsToken: TopTransactionsData;
  topTransactionsType: TopTransactionsData;
  topTransactionsPool: TopTransactionsData;
  groupMode: GroupMode;
  selectedFilter?: string | string[] | null;
  selectedFilterLabel?: string | null;
  summary?: SummaryData;
}

export default function TopTransactionsTable({
  topTransactionsToken,
  topTransactionsType,
  topTransactionsPool,
  groupMode,
  selectedFilter,
  selectedFilterLabel,
  summary,
}: TopTransactionsTableProps): React.ReactElement {
  // Create mint-to-name mapping from summary
  const mintToName = useMemo(() => {
    if (!summary) return {};
    const mapping: Record<string, string> = {};
    summary.top_tokens_by_value.forEach(token => {
      if (token.mint === 'WSOL_DIRECT') {
        // Map WSOL_DIRECT to actual wrapped SOL address
        mapping['So11111111111111111111111111111111111111112'] = token.name;
      }
      mapping[token.mint] = token.name;
    });
    return mapping;
  }, [summary]);

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
  let allTransactions = Object.entries(topTransactions).flatMap(([group, txs]) =>
    txs.map(tx => ({ ...tx, group }))
  );

  // Apply filter if selectedFilter is provided
  if (selectedFilter) {
    // Handle both single string and array of types
    const filterValues = Array.isArray(selectedFilter) ? selectedFilter : [selectedFilter];

    // Map WSOL_DIRECT to actual wrapped SOL address
    const mappedFilters = filterValues.map(f =>
      f === 'WSOL_DIRECT' ? 'So11111111111111111111111111111111111111112' : f
    );

    // Filter transactions that match ANY of the filter values
    allTransactions = allTransactions.filter(tx => mappedFilters.includes(tx.group));
  }

  // Deduplicate by signature (same transaction might appear in multiple groups)
  const seenSignatures = new Set<string>();
  const uniqueTransactions = allTransactions.filter(tx => {
    if (seenSignatures.has(tx.signature)) {
      return false;
    }
    seenSignatures.add(tx.signature);
    return true;
  });

  const top10 = uniqueTransactions
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

  const tableTitle = selectedFilter
    ? `Top 10 Transactions for ${selectedFilterLabel || selectedFilter}`
    : 'Top 10 Transactions';

  return (
    <div style={{
      background: 'var(--ifm-background-surface-color)',
      border: '1px solid var(--ifm-toc-border-color)',
      borderRadius: 'var(--ifm-global-radius)',
      padding: '24px',
      marginBottom: '24px',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{tableTitle}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          display: 'table',
          width: '100%',
          minWidth: '800px',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Rank</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Amount</th>
            <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Date</th>
            {groupMode === 'token' && <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Token</th>}
            {groupMode === 'type' && <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Type</th>}
            {groupMode === 'pool' && <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Pool</th>}
            {groupMode !== 'type' && <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Type</th>}
            {groupMode !== 'pool' && <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Pool</th>}
            {groupMode !== 'token' && <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>Token</th>}
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

              {/* Primary column (first): Token, Type, or Pool based on groupMode */}
              {groupMode === 'token' && (
                <td style={{ padding: '12px 8px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'help',
                    }}
                    title={tx.mint}
                  >
                    {tx.token_name || mintToName[tx.mint] || tx.mint}
                  </div>
                </td>
              )}
              {groupMode === 'type' && (
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
              )}
              {groupMode === 'pool' && (
                <td style={{ padding: '12px 8px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--ifm-color-secondary)',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tx.pool_label.replace(/<br>/g, ' ')}
                  </div>
                </td>
              )}

              {/* Type column (if not primary) */}
              {groupMode !== 'type' && (
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
              )}

              {/* Pool column (if not primary) */}
              {groupMode !== 'pool' && (
                <td style={{ padding: '12px 8px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--ifm-color-secondary)',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {tx.pool_label.replace(/<br>/g, ' ')}
                  </div>
                </td>
              )}

              {/* Token column (if not primary) */}
              {groupMode !== 'token' && (
                <td style={{ padding: '12px 8px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      cursor: 'help',
                    }}
                    title={tx.mint}
                  >
                    {tx.token_name || mintToName[tx.mint] || tx.mint}
                  </div>
                </td>
              )}

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
                  {tx.signature.slice(0, 5)}...{tx.signature.slice(-5)}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
