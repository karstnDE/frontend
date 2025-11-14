import React from 'react';
import type { Props } from '@theme/Root';
import SocialFooter from '@site/src/components/SocialFooter';
import MobileBlocker from '@site/src/components/MobileBlocker';

export default function Root({ children }: Props): React.ReactElement {
  return (
    <>
      <MobileBlocker />
      {children}
      <SocialFooter />
    </>
  );
}
