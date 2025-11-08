import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Intro sidebar
  introSidebar: [
    'index',
    'intro/tech-setup',
    'intro/about',
  ],

  // Analysis sidebar
  analysisSidebar: [
    'analysis/overview',
    'analysis/methodology',
    {
      type: 'html',
      value: '<span class="sidebar-heading">DEFITUNA</span>',
    },
    'analysis/defituna/overview',
    'analysis/defituna/methodology',
    {
      type: 'category',
      label: 'Treasury Analysis',
      customProps: {
        icon: 'Vault',
      },
      items: [
        {
          type: 'category',
          label: 'Revenue Breakdown',
          customProps: {
            icon: 'ChartPieSlice',
          },
          items: [
            'analysis/defituna/revenue-breakdown/by-token',
            'analysis/defituna/revenue-breakdown/by-type',
            'analysis/defituna/revenue-breakdown/by-pool',
            'analysis/defituna/revenue-breakdown/by-wallet',
            'analysis/defituna/revenue-breakdown/pools-vs-types',
            {
              type: 'doc',
              id: 'analysis/defituna/tx-type-per-day',
              label: 'Types per Day',
            },
            'analysis/defituna/orca-vs-fusion',
          ],
        },
        {
          type: 'category',
          label: 'Usage Statistics',
          customProps: {
            icon: 'ChartLineUp',
          },
          items: [
            'analysis/usage-statistics/usage-statistics-overview',
            'analysis/usage-statistics/usage-statistics-stakers',
            'analysis/usage-statistics/usage-statistics-daily',
            'analysis/usage-statistics/usage-statistics-weekly',
          ],
        },
        {
          type: 'category',
          label: 'Staking Analysis',
          customProps: {
            icon: 'Stack',
          },
          items: [
            'analysis/defituna/staked-tuna',
            'analysis/defituna/staker-conviction',
            'analysis/staking/wallet-timeline',
          ],
        },
        // Position Analysis - DISABLED (awaiting historical backfill implementation)
        // See docs/POSITION_TRACKING_PLAN.md for details
        // {
        //   type: 'category',
        //   label: 'Position Analysis',
        //   items: [
        //     'analysis/positions/growth',
        //   ],
        // },
        'analysis/defituna/staking-apy',
        'analysis/defituna/pool-ramp-up',
      ],
    },
  ],
};

export default sidebars;





