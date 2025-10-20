import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Intro sidebar
  introSidebar: [
    'index',
    'intro/about',
  ],

  // Blog sidebar
  blogSidebar: [
    'blog/general',
    'blog/defituna',
  ],

  // Analysis sidebar
  analysisSidebar: [
    'interactive',
    {
      type: 'category',
      label: 'Treasury Analysis',
      items: [
        'analysis/defituna/overview',
        {
          type: 'category',
          label: 'Revenue Breakdown',
          items: [
            'analysis/defituna/revenue-breakdown/by-token',
            'analysis/defituna/revenue-breakdown/by-type',
            'analysis/defituna/revenue-breakdown/by-pool',
          ],
        },
        'analysis/defituna/tx-type-development',
        'analysis/defituna/orca-vs-sol',
      ],
    },
    'analysis/general',
  ],
};

export default sidebars;
