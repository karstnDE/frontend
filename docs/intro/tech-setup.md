---
title: Tech Set-up
sidebar_position: 2
sidebar_custom_props:
  icon: Gear
---

# Tech Set-up

## How This Works

This platform provides transparent, on-chain analytics for Solana DeFi protocols. All data comes directly from the blockchain—there's no opinion, just raw facts about how protocols generate revenue, how users interact, and how the ecosystem evolves.

## The Data Journey

### 1. Collecting Blockchain Data

Every transaction on Solana is public and permanent. I monitor specific protocol treasury addresses and collect all their transactions:

- **What gets collected**: Every swap, every fee, every stake, every token transfer
- **Where it comes from**: Solana blockchain via Helius API
- **How often**: Daily updates with historical backfill to protocol launch
- **Coverage**: 100% of transactions—nothing is filtered out

### 2. Understanding What Transactions Mean

Raw blockchain data is cryptic. A transaction might look like "Program X called instruction Y," but what does that actually mean for revenue?

I classify each transaction to understand:
- Is this a revenue event or something else?
- What type of revenue? (swap fees, liquidity fees, staking rewards, etc.)
- Which pool or wallet generated it?
- What tokens were involved?

This classification achieves **100% accuracy**—every SOL is accounted for. If the numbers don't add up perfectly, I don't publish until they do.

### 3. Turning Data into Insights

Once transactions are classified, I aggregate them into meaningful metrics:

- **Daily revenue trends**: Track protocol earnings over time
- **Revenue by source**: See which pools, tokens, or transaction types drive value
- **User behavior**: Understand staking patterns, loyalty, and whale activity
- **APY calculations**: Real, on-chain yield rates based on actual revenue

All this happens behind the scenes. When you visit the site, the data is already processed and ready to explore.

### 4. Interactive Visualizations

The dashboards you see are built with:
- **Interactive charts** that let you zoom, filter, and drill down
- **Real-time filtering** to focus on specific time periods or metrics
- **Dark mode support** for comfortable viewing
- **Direct blockchain links** to verify any transaction yourself

Everything updates daily, and the "Last updated" timestamp shows when data was refreshed.

## Why Trust This Data?

### Transparency
- All data comes directly from Solana blockchain
- No third-party APIs for metrics calculations
- Transaction links let you verify anything on Solana Explorer
- Open-source code (available on GitHub)

### Accuracy
- 100% revenue attribution standard
- Automated verification checks on every update
- Discrepancies > 0.01 SOL trigger alerts
- Historical data matches protocol inception

### Objectivity
- No editorial decisions about what to show/hide
- No paid promotions or protocol partnerships
- No opinions—just on-chain facts
- All transactions included, whether positive or negative

## What Makes This Different

Unlike aggregator platforms that cover thousands of protocols at a high level, this site focuses on **depth over breadth**:

- **Transaction-level analysis** instead of just TVL and volume
- **Revenue attribution** to specific pools, wallets, and transaction types
- **User behavior analytics** like loyalty metrics and staking patterns
- **Custom visualizations** designed for each protocol's unique features

Think of it as the difference between checking a stock price vs reading the company's financial statements.

## Technology Behind the Scenes

For those curious about the technical stack:

**Data Pipeline**
- Python-based automation for data collection and processing
- Daily updates via scheduled scripts
- Local caching for fast reprocessing

**Website**
- Static site built with Docusaurus (React-based)
- Plotly.js for interactive charts
- Hosted on GitHub Pages (free, reliable)

**Why Static?**
- Fast page loads (no database queries)
- Easy to audit (just JSON files)
- Simple deployment
- Cost-effective at scale

## Current Coverage

Right now, the platform focuses exclusively on **DefiTuna**, a Solana-based DeFi protocol. This depth-first approach ensures:
- Complete historical data (from protocol launch)
- Daily updates
- High-quality, verified analytics
- Custom features for protocol-specific insights

Future expansion will add other emerging Solana protocols, maintaining the same standard of quality and depth.

## Data Updates

- **Frequency**: Daily
- **Coverage**: Complete history from protocol launch
- **Latency**: Typically updated within 24 hours of transactions
- **Verification**: Every update passes accuracy checks before publishing

Check the "Last updated" timestamp in the site header to see when data was refreshed.

## Have Questions?

- Want to see a specific metric? Let me know
- Notice something that doesn't look right? I want to hear about it
- Interested in covering a protocol? Reach out

This is a community project, and feedback helps make it better.
