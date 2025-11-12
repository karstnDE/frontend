import React, { useMemo } from 'react';
import type { VestingSchedule } from '@site/src/hooks/useVestingTimeline';

interface DailyUnlock {
  date: string;
  totalAmount: number;
  daysUntil: number;
  scheduleCount: number;
  signatures: string[];
}

interface NextUnlocksTableProps {
  schedules: VestingSchedule[];
}

export default function NextUnlocksTable({
  schedules,
}: NextUnlocksTableProps): React.ReactElement {
  const nextUnlocks = useMemo(() => {
    const now = new Date();
    // Group by date: date -> {totalAmount, signatures[]}
    const unlocksByDate = new Map<string, { amount: number; signatures: Set<string> }>();

    for (const schedule of schedules) {
      if (!schedule.first_unlock || !schedule.last_unlock) continue;

      const firstUnlockTime = new Date(schedule.first_unlock);
      const unlockPeriodHours = schedule.unlock_period_hours;
      const unlockRate = schedule.unlock_rate_tuna;
      const numUnlocks = schedule.num_unlocks;

      // Generate all unlock events for this schedule
      for (let i = 0; i < numUnlocks; i++) {
        const unlockTime = new Date(
          firstUnlockTime.getTime() + i * unlockPeriodHours * 60 * 60 * 1000
        );

        // Skip past unlocks
        if (unlockTime > now) {
          const dateStr = unlockTime.toISOString().split('T')[0];

          if (!unlocksByDate.has(dateStr)) {
            unlocksByDate.set(dateStr, {
              amount: 0,
              signatures: new Set()
            });
          }

          const entry = unlocksByDate.get(dateStr)!;
          entry.amount += unlockRate;
          entry.signatures.add(schedule.signature);
        }
      }
    }

    // Convert to array and calculate days until
    const dailyUnlocks: DailyUnlock[] = [];
    for (const [date, data] of unlocksByDate.entries()) {
      const unlockDate = new Date(date);
      const daysUntil = Math.ceil(
        (unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      dailyUnlocks.push({
        date,
        totalAmount: data.amount,
        daysUntil,
        scheduleCount: data.signatures.size,
        signatures: Array.from(data.signatures),
      });
    }

    // Sort by date and return top 10 days
    return dailyUnlocks
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [schedules]);

  if (nextUnlocks.length === 0) {
    return (
      <div
        style={{
          background: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-toc-border-color)',
          borderRadius: 'var(--ifm-global-radius)',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <div style={{ marginTop: 0, marginBottom: '4px', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.25 }}>
          Next Unlocks
        </div>
        <p style={{ color: 'var(--ifm-color-secondary)', fontSize: '14px' }}>
          All vesting schedules have completed unlocking.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 'var(--ifm-global-radius)',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ marginTop: 0, marginBottom: '4px', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.25 }}>
        Next 10 Unlock Days
      </div>
      <div style={{ fontSize: '13px', color: 'var(--ifm-color-secondary)', marginBottom: '16px' }}>
        Upcoming unlock events grouped by day. Amounts are summed when multiple schedules unlock on the same day.
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          display: 'table',
          width: '100%',
          minWidth: '600px',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>Unlock Date</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Total Amount (TUNA)</th>
              <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Days Until</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600 }}>Schedules</th>
            </tr>
          </thead>
          <tbody>
            {nextUnlocks.map((daily) => (
              <tr
                key={daily.date}
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
                <td style={{ padding: '12px 8px', color: 'var(--ifm-color-secondary)' }}>{daily.date}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600, color: 'var(--accent)' }}>
                  {daily.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td
                  style={{
                    padding: '12px 8px',
                    textAlign: 'right',
                    color: daily.daysUntil < 7 ? 'var(--ifm-color-warning)' : 'var(--ifm-color-secondary)',
                  }}
                >
                  {daily.daysUntil}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <span
                    className="badge badge--secondary"
                    style={{ fontSize: '12px' }}
                    title={`${daily.scheduleCount} schedule${daily.scheduleCount > 1 ? 's' : ''} unlocking`}
                  >
                    {daily.scheduleCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
