---
title: Overview & Intro
sidebar_custom_props:
  icon: Info
---

import BrowserOnly from '@docusaurus/BrowserOnly';
import LoadingSpinner from '@site/src/components/common/LoadingSpinner';

# Overview & Intro

## Key metrics

Before we talk about DefiTuna let's start with a summary of the key metrics that can be further explored in the pages below:

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    const { useEffect, useState } = require('react');

    function KeyMetricsDisplay() {
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        fetch('/data/key_metrics.json')
          .then(res => res.json())
          .then(data => {
            setData(data);
            setLoading(false);
          })
          .catch(err => {
            setError(err.message);
            setLoading(false);
          });
      }, []);

      if (loading) {
        return <LoadingSpinner />;
      }

      if (error || !data) {
        return null; // Silently skip if metrics not available
      }

      const { revenue_30d, market_data, metrics } = data;

      return (
        <div className="usage-summary-grid">
          <div className="usage-summary-card">
            <h3>30d Protocol Revenue</h3>
            <p>{revenue_30d?.sol?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '—'} SOL</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              ${revenue_30d?.usdc?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '—'}
            </div>
          </div>

          <div className="usage-summary-card">
            <h3>Annualized Revenue</h3>
            <p>{revenue_30d?.annualized_sol?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '—'} SOL</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              ${revenue_30d?.annualized_usdc?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '—'}
            </div>
          </div>

          <div className="usage-summary-card">
            <h3>FDV Market Cap</h3>
            <p>${(market_data?.fdv_usd || 0) >= 1_000_000
              ? `${((market_data?.fdv_usd || 0) / 1_000_000).toFixed(1)}M`
              : (market_data?.fdv_usd || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              ${market_data?.tuna_price_usd?.toFixed(4) || '—'} per TUNA
            </div>
          </div>

          <div className="usage-summary-card">
            <h3>Market Cap / Revenue</h3>
            <p>{metrics?.mcap_to_revenue_ratio?.toFixed(2) || '—'}x</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              annualized ratio
            </div>
          </div>

          <div className="usage-summary-card">
            <h3>Staking APY</h3>
            <p>{metrics?.staking_apy_percent?.toFixed(2) || '—'}%</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              30-day rolling
            </div>
          </div>

          <div className="usage-summary-card">
            <h3>Staking Wallets</h3>
            <p>{metrics?.staking_wallets?.toLocaleString() || '—'}</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              active wallets with stake
            </div>
          </div>

          <div className="usage-summary-card">
            <h3>TUNA Supply Staked</h3>
            <p>{metrics?.percent_staked?.toFixed(2) || '—'}%</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              {(metrics?.total_staked_tuna || 0) >= 1_000_000
                ? `${((metrics?.total_staked_tuna || 0) / 1_000_000).toFixed(0)}M TUNA`
                : (metrics?.total_staked_tuna || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="usage-summary-card">
            <h3>Weekly Active Wallets</h3>
            <p>{metrics?.weekly_active_wallets?.toLocaleString() || '—'}</p>
            <div style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '4px' }}>
              7-day rolling
            </div>
          </div>
        </div>
      );
    }

    return <KeyMetricsDisplay />;
  }}
</BrowserOnly>

## What is DefiTuna?

**Quoted from the Official Website** ([https://defituna.com](https://defituna.com)):

> At DefiTuna, everything comes together in one place: Traders, Liquidity Providers, and Lenders.
> This three-pronged design gives everyone a seat at the market — whether you’re trading, farming, or lending.
>
> By combining a Spot Market with Liquidity Provision and a Lending layer, we create a complete, self-reinforcing > ecosystem.
> - Traders get the most efficient and reliable DEX experience.
> - Liquidity Providers gain powerful tools to farm, hedge, and leverage.
> - Lenders enjoy attractive yields while enabling deeper liquidity.
> - All of this serves one ambition: to deliver the most efficient and reliable AMM on Solana

## Why DefiTuna?

[Placeholder: This section will explain the rationale for selecting DefiTuna as the subject of this on-chain analysis. Topics to cover include: the protocol's innovative approach to DeFi infrastructure, its growing adoption within the Solana ecosystem, the transparency of its treasury operations, and the analytical opportunities presented by its comprehensive on-chain data.]

## What Makes the Treasury Address Interesting?

[Placeholder: This section will highlight what makes DefiTuna's treasury address particularly valuable for analysis. Discussion points will include: the treasury as a complete record of protocol economics, how fee collection mechanisms create detailed revenue attribution possibilities, the insights available from staking program interactions, and how treasury flows reveal protocol health and user behavior patterns. The treasury serves as a single source of truth for understanding protocol fundamentals.]

## What can I learn from the data?

If you have one of the following questions, you are at the right place. Just click the link and it will bring you to the one chart I would recommend you the most for answering this question.
- Where does DefiTuna's revenue come from? --> Revenue Breakdown per Token, Transaction Types, Pools
- What are the biggest drivers of DefiTuna's protocol revenue? --> Pools vs. Types
- Why is the protocol revenue on certain days higher than on other days? --> Types per Day
- How big is the impact of Fusion on DefiTuna's revenue? --> Orca vs. Fusion
- Is the supply tightening because more TUNA is getting staked? --> TUNA Treasury Allocation
- Which wallets are currently increasing/ decreasing their stake the most? --> TUNA Treasury Allocation
- Does a certain wallet (e.g. Whales) further accumulate and stake or withdraw their staked TUNA? --> Wallet Timeline

## About the data presented in this section

The current focus lies on the analysis of DefiTuna's treasury account. There is a lot of information in this account alone. So all the charts and data shown in the pages below are based on transactions of this account ([G9XfJoY81n8A9bZKaJFhJYomRrcvFkuJ22em2g8rZuCh](https://solscan.io/account/G9XfJoY81n8A9bZKaJFhJYomRrcvFkuJ22em2g8rZuCh)) and partially information from the staking program ([tUnst2Y2sbmgSgARBpSBZhqPzpoy2iUsdCwb5ToYVJa](https://solscan.io/account/tUnst2Y2sbmgSgARBpSBZhqPzpoy2iUsdCwb5ToYVJa)). 

This is why the section currently available is called "Treasury Analysis".

In the future, additional analysis might be based on other accounts/ programs - e.g. Positions, Fusion AMM. 