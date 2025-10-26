import React from 'react';
import type { StakingTopEntry } from '@site/src/hooks/useStakingMetrics';

interface StakingTopTablesProps {
  topStakers: StakingTopEntry[];
  topWithdrawers: StakingTopEntry[];
}

function renderTable(title: string, rows: StakingTopEntry[], emptyMessage: string) {
  return (
    <div className="staking-top-table">
      <h4>{title}</h4>
      {rows.length === 0 ? (
        <p className="staking-top-empty">{emptyMessage}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Rank</th>
              <th style={{ textAlign: 'left' }}>Address</th>
              <th style={{ textAlign: 'right' }}>TUNA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.address}>
                <td style={{ textAlign: 'left', fontWeight: 600 }}>{index + 1}</td>
                <td style={{ textAlign: 'left', fontFamily: 'var(--ifm-font-family-monospace)' }}>
                  <a href={`https://solscan.io/account/${row.address}`} target="_blank" rel="noopener noreferrer">
                    {row.address.slice(0, 4)}…{row.address.slice(-4)}
                  </a>
                </td>
                <td style={{ textAlign: 'right' }}>{row.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function StakingTopTables({ topStakers, topWithdrawers }: StakingTopTablesProps): React.ReactElement {
  return (
    <div className="staking-top-grid">
      {renderTable('Top Stakers (last 7 days)', topStakers, 'No staking activity recorded in the past week.')}
      {renderTable('Top Withdrawers (last 7 days)', topWithdrawers, 'No withdrawals recorded in the past week.')}
    </div>
  );
}
