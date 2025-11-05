import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Intro sidebar
  introSidebar: [
    'index',
    'intro/about',
  ],

  // Analysis sidebar
  analysisSidebar: [
    'analysis/overview',
    {
      type: 'html',
      value: '<span class="sidebar-heading">DEFITUNA</span>',
    },
    'analysis/defituna/overview',
    {
      type: 'category',
      label: 'Treasury Analysis',
      items: [
        'analysis/defituna/staking-apy',
        'analysis/defituna/staked-tuna',
        'analysis/defituna/staker-conviction',
        {
          type: 'category',
          label: 'Revenue Breakdown',
          items: [
            'analysis/defituna/revenue-breakdown/by-token',
            'analysis/defituna/revenue-breakdown/by-type',
            'analysis/defituna/revenue-breakdown/by-pool',
            'analysis/defituna/revenue-breakdown/pools-vs-types',
          ],
        },
        {
          type: 'category',
          label: 'Usage Statistics',
          items: [
            'analysis/usage-statistics/usage-statistics-overview',
            'analysis/usage-statistics/usage-statistics-stakers',
            'analysis/usage-statistics/usage-statistics-daily',
            'analysis/usage-statistics/usage-statistics-weekly',
          ],
        },
        'analysis/defituna/tx-type-per-day',
        'analysis/defituna/orca-vs-fusion',
      ],
    },
  ],
};

export default sidebars;





