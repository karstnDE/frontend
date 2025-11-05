import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'karstenalytics',
  tagline: 'On-chain Treasury Analytics for Solana',
  favicon: 'img/logo.png',

  // Set the production url of your site here
  url: 'https://karstenalytics.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'karstenalytics',
  projectName: 'karstenalytics.github.io',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',

  markdown: {
    format: 'mdx',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // GoatCounter analytics - privacy-friendly, GDPR-compliant
  scripts: [
    {
      src: 'https://karstenalytics.goatcounter.com/count.js',
      async: true,
      'data-goatcounter': 'https://karstenalytics.goatcounter.com/count',
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Remove this to remove the "edit this page" links.
          editUrl: undefined,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
          },
          blogTitle: 'karstenalytics Blog',
          blogDescription: 'Insights and updates on Solana treasury analytics',
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 5,
          postsPerPage: 10,
          // Remove edit links for blog posts
          editUrl: undefined,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/logo.png',
    navbar: {
      title: '',
      logo: {
        alt: 'karstenalytics Logo',
        src: 'img/logo.png',
        srcDark: 'img/logo_dark.png',
      },
      hideOnScroll: false,
      items: [
        // Tabs (Intro, Blog, Analysis) moved to separate NavbarTabs component
        // Search bar is added automatically by @easyops-cn/docusaurus-search-local
      ],
    },
    footer: undefined, // Footer removed - GitHub link moved to navbar
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
