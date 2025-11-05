---
slug: understanding-treasury-apy
title: Understanding Treasury APY Metrics
tags: [analytics, treasury, education]
---

# Understanding Treasury APY Metrics

Annual Percentage Yield (APY) is a critical metric for evaluating treasury performance. Let's break down how we calculate and interpret these metrics on Solana.

<!-- truncate -->

## What is APY?

APY represents the real rate of return earned on an investment over a year, accounting for compound interest. For on-chain treasuries, this includes:

- Staking rewards
- Protocol fees
- Trading revenues
- Liquidity mining incentives

## Key Considerations

When analyzing treasury APY, consider these factors:

### 1. Time Horizon

Short-term APY fluctuations are normal due to:
- Network congestion affecting transaction volumes
- Market volatility impacting fee generation
- Seasonal patterns in user activity

### 2. Risk-Adjusted Returns

Higher APY doesn't always mean better performance. Consider:
- Smart contract risk
- Market exposure
- Liquidity requirements
- Protocol sustainability

### 3. Comparative Analysis

Compare APY across:
- Similar protocols in the ecosystem
- Different treasury strategies
- Various time periods

## How We Calculate APY

Our dashboard uses on-chain data to calculate:

```
APY = ((End Value / Start Value) ^ (365 / Days)) - 1
```

This provides a standardized way to compare returns across different time periods.

## Best Practices

When evaluating treasury performance:

1. **Look at trends over time**, not just snapshots
2. **Consider multiple metrics** beyond just APY
3. **Understand the underlying strategies** generating returns
4. **Monitor for sustainability** and risk factors

Check out our interactive APY charts in the Analysis section to explore historical trends!
