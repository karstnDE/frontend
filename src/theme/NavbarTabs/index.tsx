import React from 'react';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import {
  HouseSimple,
  NewspaperClipping,
  ChartLineUp,
  type IconProps,
} from '@phosphor-icons/react';
import './styles.css';

interface NavTab {
  label: string;
  to: string;
  activePattern: RegExp;
  Icon: React.ComponentType<IconProps>;
}

const tabs: NavTab[] = [
  {
    label: 'Intro',
    to: '/',
    activePattern: /^\/(intro\/)?$/,
    Icon: HouseSimple,
  },
  {
    label: 'Blog',
    to: '/blog/general',
    activePattern: /^\/blog\//,
    Icon: NewspaperClipping,
  },
  {
    label: 'Analysis',
    to: '/interactive',
    activePattern: /^\/(interactive|analysis)\//,
    Icon: ChartLineUp,
  },
];

export default function NavbarTabs(): JSX.Element {
  const location = useLocation();

  const isTabActive = (tab: NavTab): boolean => tab.activePattern.test(location.pathname);

  return (
    <div className="navbar-tabs">
      <div className="navbar-tabs__inner">
        {tabs.map((tab) => {
          const active = isTabActive(tab);
          const { Icon } = tab;
          return (
            <Link
              key={tab.label}
              to={tab.to}
              className={`navbar-tabs__link ${active ? 'navbar-tabs__link--active' : ''}`}
            >
              <Icon
                size={18}
                weight={active ? 'fill' : 'regular'}
                className="navbar-tabs__icon"
                aria-hidden="true"
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
