import React from 'react';
import { DiscordLogo, DiscordLogoIcon, EnvelopeIcon, HeartIcon, HeartStraight, TwitterLogo, XLogoIcon } from '@phosphor-icons/react';

const LINKS = [
  {
    href: 'https://x.com/karstenalytics',
    label: '@karstenalytics',
    title: 'Follow on X (Twitter)',
    Icon: XLogoIcon,
  },
  {
    href: 'https://discord.com/users/karstn#9338',
    label: 'karsten',
    title: 'discord',
    Icon: DiscordLogoIcon,
  },
];

const DONATION_PLACEHOLDER = '7bYtEL23TT9YeELjSaNLi59PHwerNw9woMacYXefr6RF';

export default function SocialFooter(): React.ReactElement {
  return (
    <div className="social-footer" role="contentinfo" aria-label="Social links and donation">
      <div className="social-footer__content">
        {LINKS.map(({ href, label, title, Icon }) => (
          <a
            key={href}
            className="social-footer__link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={title}
          >
            <Icon size={18} weight="regular" />
            <span>{label}</span>
          </a>
        ))}
        <div className="social-footer__donate" title="Solana donation address placeholder">
          <HeartIcon size={18} weight="regular" />
          <span>Donate (SOL): {DONATION_PLACEHOLDER}</span>
        </div>
      </div>
    </div>
  );
}
