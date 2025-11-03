---
title: Analysis Overview
---

# Analysis Overview

Welcome to the on-chain treasury analytics platform. This section provides comprehensive data analysis for Solana-based DeFi protocols, with a focus on **100% accurate revenue attribution** through transaction-level classification.

## Our Approach

### Data Collection & Classification

Our analytics system captures every on-chain transaction involving protocol treasuries and classifies them using **log-based analysis** to achieve perfect attribution accuracy:

1. **Transaction Enumeration**: Identify all transactions involving treasury addresses (PDAs and associated token accounts)
2. **RPC Batch Loading**: Fetch complete transaction data including log messages via Helius API
3. **Pattern Matching**: Classify transactions by analyzing on-chain logs and instruction data
4. **Revenue Attribution**: Convert cross-token inflows to SOL equivalents and attribute to specific sources

This approach ensures that every SOL flowing into the treasury is correctly attributed to its source (pool, token, transaction type).

### Backend Architecture

The analytics pipeline consists of several key components:

- **`full_cache_reload.py`**: Main data loader using RPC batch requests with guaranteed log messages
- **`tx_classifier.py`**: Transaction classification engine with configurable pattern matching
- **`tools/generate_realized_types.py`**: Revenue attribution generator creating daily breakdown files
- **`treasury_analytics.py`**: Full-range analytics aggregator and reporter

All classification logic is defined in `transaction_types_config.json`, making the system transparent and auditable.

### Accuracy Standard

Our system maintains a **100% attribution accuracy standard** verified through dual accounting:

1. **Simple Method**: Direct WSOL inflows from transaction metadata
2. **Realized Types Method**: Transaction-by-transaction attribution with type classification

These two methods must reconcile to within rounding errors (≤0.01 SOL per day). Any discrepancy triggers investigation and system refinement.

## Protocol Coverage

### DefiTuna Treasury Analytics

The DefiTuna protocol treasury is our primary focus, with comprehensive coverage including:

- **Revenue Attribution**: Multi-dimensional breakdowns by token, transaction type, and liquidity pool
- **Staking APY**: Historical yield calculations based on treasury inflows and token metrics
- **Daily Trends**: Time-series analysis of revenue patterns and growth
- **Usage Statistics**: Cohort views of stakers plus daily and weekly active wallets`n- **TUNA Treasury Allocation**: Daily split of treasury-held TUNA between staked and liquid balances
- **Top Transactions**: Detailed views of largest revenue events

Navigate to the **DefiTuna** section in the sidebar to explore interactive dashboards and detailed analytics.

## Data Freshness

All analytics are generated from the latest available on-chain data. Check the **"Last updated"** timestamp in the site header for data freshness. The backend pipeline can be run daily to incorporate new transactions.

## Technical Documentation

For developers and technical users interested in the backend implementation:

- [Revenue Attribution System](https://github.com/yourusername/solana_analytics/blob/main/docs/REVENUE_ATTRIBUTION_SYSTEM.md)
- [Classification System](https://github.com/yourusername/solana_analytics/blob/main/docs/CLASSIFICATION_SYSTEM.md)
- [Daily Workflow](https://github.com/yourusername/solana_analytics/blob/main/docs/DAILY_WORKFLOW.md)

---

Use the sidebar navigation to explore specific analytics for each protocol.

As mentioned above, I have a high priority on data quality and several checks in place. Nevertheless, something might slip through. Feel free to let me know via indicated channels in case you detect something suspicious.

