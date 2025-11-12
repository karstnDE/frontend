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
            // 'analysis/defituna/revenue-breakdown/by-wallet', // TODO: Not yet functional
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
          label: 'Users / Wallets',
          customProps: {
            icon: 'ChartLineUp',
          },
          items: [
            'analysis/usage-statistics/usage-statistics-overview',
            'analysis/usage-statistics/usage-statistics-stakers',
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
            'analysis/defituna/vesting-timeline',
            'analysis/staking/wallet-timeline',
            'analysis/defituna/staker-conviction',
          ],
        },
        // Position Analysis - DISABLED (data quality issues)
        // Issue: Fusion position openings tracked from July 31, but Fusion revenue attribution
        // is fragmented due to tuna4u IDL rename (see TODO.md: "Unify post-2025-09-09 Fusion transaction aliases")
        // Re-enable after fixing transaction type aliases and regenerating cache
        // {
        //   type: 'category',
        //   label: 'Position Analysis',
        //   customProps: {
        //     icon: 'ChartLineUp',
        //   },
        //   items: [
        //     'analysis/defituna/position-openings',
        //   ],
        // },
        'analysis/defituna/staking-apy',
        'analysis/defituna/pool-ramp-up',
      ],
    },
  ],
};

export default sidebars;





