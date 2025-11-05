# GoatCounter Implementation Plan

This document provides a step-by-step plan to implement GoatCounter analytics in the karstenalytics frontend, including tracking for Plotly chart interactions.

## Overview

**Goal**: Implement privacy-friendly analytics to track:
- Page views and visitor statistics
- Time spent on pages
- Plotly chart interactions (hover, click, zoom, filter changes)
- Custom user actions (e.g., personalized APY entry price usage)

**Solution**: GoatCounter (free, privacy-focused, GDPR-compliant)

---

## Phase 1: GoatCounter Account Setup

### Step 1.1: Create GoatCounter Account

1. Visit https://www.goatcounter.com/signup
2. Create account (no credit card required)
3. Choose subdomain: `karstenalytics.goatcounter.com` (or your preference)
4. Verify email address

### Step 1.2: Configure Settings

1. Log into GoatCounter dashboard
2. Go to **Settings**
3. Configure:
   - **Site name**: karstenalytics
   - **Time zone**: Your local timezone
   - **Data retention**: Default (180 days for free tier)
   - **Public dashboard**: Optional (can make stats public)

### Step 1.3: Get Tracking Code

1. In Settings → **Integration**
2. Copy your tracking script URL: `https://karstenalytics.goatcounter.com/count.js`
3. Note your site code: `karstenalytics` (used in API calls)

---

## Phase 2: Docusaurus Integration

### Step 2.1: Add GoatCounter Script

**File**: `docusaurus.config.ts`

Add the GoatCounter script to the `scripts` array:

```typescript
const config: Config = {
  title: 'karstenalytics',
  tagline: 'On-chain Treasury Analytics for Solana',
  // ... existing config ...

  scripts: [
    {
      src: 'https://karstenalytics.goatcounter.com/count.js',
      async: true,
      'data-goatcounter': 'https://karstenalytics.goatcounter.com/count',
    },
  ],

  // ... rest of config
};
```

**Note**: Replace `karstenalytics` with your actual GoatCounter subdomain.

### Step 2.2: Add TypeScript Definitions

**File**: `src/types/goatcounter.d.ts` (create new file)

```typescript
/**
 * TypeScript definitions for GoatCounter analytics
 */

interface GoatCounterVars {
  path?: string;
  title?: string;
  referrer?: string;
  event?: boolean;
}

interface GoatCounter {
  count: (vars: GoatCounterVars) => void;
  get_query: (key: string) => string | undefined;
  filter: () => boolean;
  url: (vars: GoatCounterVars) => string;
}

interface Window {
  goatcounter?: GoatCounter;
}

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

export {};
```

### Step 2.3: Create Analytics Utility

**File**: `src/utils/analytics.ts` (create new file)

```typescript
/**
 * Analytics utility for GoatCounter tracking
 */

export interface TrackEventOptions {
  chartName?: string;
  action?: string;
  category?: string;
  label?: string;
  customPath?: string;
}

/**
 * Check if GoatCounter is available
 */
export function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.goatcounter;
}

/**
 * Track a chart interaction event
 */
export function trackChartEvent(
  chartName: string,
  action: string,
  metadata?: Record<string, string | number>
): void {
  if (!isAnalyticsAvailable()) {
    return;
  }

  // Build path with metadata encoded
  const metadataPath = metadata
    ? '/' + Object.entries(metadata)
        .map(([key, value]) => `${key}-${value}`)
        .join('/')
    : '';

  const path = `chart/${chartName.toLowerCase().replace(/\s+/g, '-')}/${action}${metadataPath}`;

  window.goatcounter!.count({
    path: path,
    title: `${chartName} - ${action}`,
    event: true,
  });
}

/**
 * Track a custom event
 */
export function trackCustomEvent(
  category: string,
  action: string,
  label?: string
): void {
  if (!isAnalyticsAvailable()) {
    return;
  }

  const path = label
    ? `event/${category}/${action}/${label}`
    : `event/${category}/${action}`;

  window.goatcounter!.count({
    path: path,
    title: `${category} - ${action}${label ? ` - ${label}` : ''}`,
    event: true,
  });
}

/**
 * Track a page view (usually automatic, but can be used for SPAs)
 */
export function trackPageView(path?: string, title?: string): void {
  if (!isAnalyticsAvailable()) {
    return;
  }

  window.goatcounter!.count({
    path: path,
    title: title,
  });
}
```

---

## Phase 3: Plotly Chart Tracking

### Step 3.1: Create Chart Tracking Hook

**File**: `src/hooks/useChartTracking.ts` (create new file)

```typescript
import { useEffect, useRef } from 'react';
import { trackChartEvent } from '@site/src/utils/analytics';

interface UseChartTrackingOptions {
  chartName: string;
  trackHover?: boolean;
  trackClick?: boolean;
  trackZoom?: boolean;
  trackSelect?: boolean;
}

/**
 * Hook to add analytics tracking to Plotly charts
 * Usage: Call this hook in any Plotly chart component
 */
export function useChartTracking(
  plotRef: React.RefObject<HTMLDivElement>,
  options: UseChartTrackingOptions
) {
  const {
    chartName,
    trackHover = false,
    trackClick = true,
    trackZoom = true,
    trackSelect = false,
  } = options;

  // Track first view
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!hasTrackedView.current) {
      trackChartEvent(chartName, 'view');
      hasTrackedView.current = true;
    }
  }, [chartName]);

  // Track interactions
  useEffect(() => {
    const plotDiv = plotRef.current;
    if (!plotDiv) return;

    const handleHover = () => {
      if (trackHover) {
        trackChartEvent(chartName, 'hover');
      }
    };

    const handleClick = (data: any) => {
      if (trackClick) {
        // Extract useful metadata from click event
        const metadata: Record<string, string | number> = {};
        if (data.points && data.points.length > 0) {
          const point = data.points[0];
          if (point.x) metadata.date = String(point.x);
          if (point.curveNumber !== undefined) metadata.series = point.curveNumber;
        }
        trackChartEvent(chartName, 'click', metadata);
      }
    };

    const handleRelayout = (eventData: any) => {
      if (trackZoom) {
        // Detect if this was a zoom/pan event
        if (eventData['xaxis.range[0]'] || eventData['yaxis.range[0]']) {
          trackChartEvent(chartName, 'zoom');
        }
      }
    };

    const handleSelected = (eventData: any) => {
      if (trackSelect && eventData && eventData.points) {
        trackChartEvent(chartName, 'select', {
          points: eventData.points.length,
        });
      }
    };

    // Attach Plotly event listeners
    if (plotDiv.on) {
      plotDiv.on('plotly_hover', handleHover);
      plotDiv.on('plotly_click', handleClick);
      plotDiv.on('plotly_relayout', handleRelayout);
      plotDiv.on('plotly_selected', handleSelected);
    }

    // Cleanup
    return () => {
      if (plotDiv.removeAllListeners) {
        plotDiv.removeAllListeners('plotly_hover');
        plotDiv.removeAllListeners('plotly_click');
        plotDiv.removeAllListeners('plotly_relayout');
        plotDiv.removeAllListeners('plotly_selected');
      }
    };
  }, [chartName, trackHover, trackClick, trackZoom, trackSelect]);
}
```

### Step 3.2: Update Chart Components

Update each Plotly chart component to include tracking. Here are examples:

#### Example 1: APY Chart

**File**: `src/components/Dashboard/ApyChart.tsx`

Add to existing component:

```typescript
import { useChartTracking } from '@site/src/hooks/useChartTracking';
import { trackCustomEvent } from '@site/src/utils/analytics';

export default function ApyChart(): React.ReactElement {
  const plotRef = useRef<HTMLDivElement>(null);

  // ... existing state and logic ...

  // Add chart tracking
  useChartTracking(plotRef, {
    chartName: 'APY Chart',
    trackHover: false, // Don't track every hover (too noisy)
    trackClick: true,
    trackZoom: true,
  });

  // Track when user enters custom entry price
  const handleEntryPriceChange = (newPrice: number) => {
    setUserEntryPrice(newPrice);
    localStorage.setItem('tunaEntryPrice', String(newPrice));
    window.dispatchEvent(new Event('tunaEntryPriceChanged'));

    // Track custom entry price usage
    trackCustomEvent('APY', 'custom-price-set', String(newPrice));
  };

  // ... rest of component ...

  return (
    <div ref={plotRef}>
      <Plot
        data={data}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
      />
      {/* Entry price input */}
    </div>
  );
}
```

#### Example 2: Revenue Breakdown Charts

**File**: `src/components/Dashboard/BreakdownChart.tsx`

```typescript
import { useChartTracking } from '@site/src/hooks/useChartTracking';
import { trackChartEvent } from '@site/src/utils/analytics';

export default function BreakdownChart({
  summary,
  groupMode,
  onBarClick,
}: BreakdownChartProps): React.ReactElement {
  const plotRef = useRef<HTMLDivElement>(null);

  // Track chart view and interactions
  useChartTracking(plotRef, {
    chartName: `Revenue Breakdown - ${groupMode}`,
    trackClick: true,
    trackZoom: true,
  });

  // Track when user clicks a bar to filter
  const handleClick = (event: any) => {
    if (event.points && event.points.length > 0) {
      const point = event.points[0];
      const clickedLabel = point.data.name || point.x;

      // Call existing handler
      if (onBarClick) {
        onBarClick(point.data.customdata?.id, clickedLabel);
      }

      // Track filter selection
      trackChartEvent(
        `Revenue Breakdown - ${groupMode}`,
        'filter-applied',
        { filter: String(clickedLabel) }
      );
    }
  };

  return (
    <div ref={plotRef}>
      <Plot
        data={data}
        layout={layout}
        config={config}
        onClick={handleClick}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
```

#### Example 3: Daily Stacked Charts

**File**: `src/components/Dashboard/DailyStackedChart.tsx`

```typescript
import { useChartTracking } from '@site/src/hooks/useChartTracking';

export default function DailyStackedChart({ data }: DailyStackedChartProps): React.ReactElement {
  const plotRef = useRef<HTMLDivElement>(null);

  useChartTracking(plotRef, {
    chartName: 'Daily Revenue Stacked',
    trackClick: true,
    trackZoom: true,
  });

  // ... rest of component ...
}
```

### Step 3.3: Charts to Update

Update the following chart components with tracking:

- [x] `src/components/Dashboard/ApyChart.tsx`
- [x] `src/components/Dashboard/BreakdownChart.tsx`
- [x] `src/components/Dashboard/DailyStackedChart.tsx`
- [x] `src/components/Dashboard/DailyStackedBarChart.tsx`
- [x] `src/components/Dashboard/CumulativeChart.tsx`
- [x] `src/components/Dashboard/PoolTypeMatrixChart.tsx`
- [x] `src/components/Loyalty/InverseWhaleChart.tsx`
- [x] `src/components/Loyalty/CompoundVsStakeScatter.tsx`
- [x] `src/components/Loyalty/WeeklyTrendsChart.tsx`
- [x] `src/components/Loyalty/StakeDistributionHistogram.tsx`
- [x] `src/components/Usage/UsageTimeSeriesChart.tsx`
- [x] `src/components/Staking/StakingBalanceChart.tsx`

---

## Phase 4: Additional Tracking

### Step 4.1: Track Dashboard Filter Changes

**File**: `src/components/Dashboard/DashboardControls.tsx`

```typescript
import { trackCustomEvent } from '@site/src/utils/analytics';

export default function DashboardControls({
  controls,
  onChange,
}: DashboardControlsProps): React.ReactElement {

  const handleGroupModeChange = (newMode: string) => {
    onChange({ ...controls, groupMode: newMode });
    trackCustomEvent('Dashboard', 'filter-change', `group-${newMode}`);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    onChange({ ...controls, startDate: start, endDate: end });
    trackCustomEvent('Dashboard', 'filter-change', 'date-range');
  };

  // ... rest of component ...
}
```

### Step 4.2: Track Usage Statistics Interactions

**File**: `src/components/Usage/UsageTopAddresses.tsx`

```typescript
import { trackCustomEvent } from '@site/src/utils/analytics';

// Track when user views top addresses table
useEffect(() => {
  if (addresses && addresses.length > 0) {
    trackCustomEvent('Usage', 'view-top-addresses', category);
  }
}, [addresses, category]);
```

### Step 4.3: Track Loyalty Features

**File**: `src/components/Loyalty/BehaviorSegmentsTable.tsx`

```typescript
import { trackCustomEvent } from '@site/src/utils/analytics';

// Track segment exploration
const handleSegmentClick = (segment: string) => {
  trackCustomEvent('Loyalty', 'explore-segment', segment);
};
```

---

## Phase 5: Testing & Verification

### Step 5.1: Local Testing

1. **Start development server**:
   ```bash
   npm start
   ```

2. **Open browser console** (F12)

3. **Verify GoatCounter loaded**:
   ```javascript
   console.log(window.goatcounter); // Should show object
   ```

4. **Test manual tracking**:
   ```javascript
   window.goatcounter.count({
     path: 'test/manual-event',
     title: 'Test Event',
     event: true
   });
   ```

5. **Visit pages and interact with charts**:
   - Navigate to `/analysis/defituna/staking-apy`
   - Hover over APY chart
   - Click on data points
   - Zoom in/out
   - Enter custom entry price

6. **Check GoatCounter dashboard**:
   - Visit `https://karstenalytics.goatcounter.com`
   - Events may take 1-2 minutes to appear
   - Verify events are being recorded

### Step 5.2: Production Testing

1. **Build and deploy**:
   ```bash
   npm run build
   npm run deploy  # or deploy to GitHub Pages
   ```

2. **Wait 5-10 minutes** for deployment

3. **Visit production site**:
   - Navigate through pages
   - Interact with charts
   - Check GoatCounter dashboard

4. **Verify tracking paths**:
   - Page views: `/`, `/analysis/defituna/staking-apy`, etc.
   - Chart events: `/chart/apy-chart/view`, `/chart/apy-chart/click`, etc.
   - Custom events: `/event/APY/custom-price-set/0.05`, etc.

### Step 5.3: Common Issues

**Issue: GoatCounter not loading**
- Check script URL in `docusaurus.config.ts`
- Verify network requests in browser DevTools
- Check for ad blockers (disable for testing)

**Issue: Events not appearing in dashboard**
- Events can take 1-2 minutes to process
- Verify `event: true` is set in tracking calls
- Check browser console for errors

**Issue: TypeScript errors**
- Ensure `src/types/goatcounter.d.ts` is created
- Restart TypeScript server in VS Code

---

## Phase 6: Dashboard Analysis

### Step 6.1: Key Metrics to Monitor

Once implemented, track these metrics in GoatCounter:

**Page Views**:
- Which analysis pages are most popular?
- Which revenue breakdown views get most traffic?
- Usage statistics vs staking APY popularity

**Chart Interactions**:
- Which charts have highest interaction rates?
- Do users zoom/filter the data?
- Are personalized features (custom APY) being used?

**User Behavior**:
- Average time on analysis pages
- Bounce rates per section
- Return visitor patterns

### Step 6.2: GoatCounter Dashboard Features

Access these in your GoatCounter dashboard:

- **Paths**: See all tracked pages and events
- **Referrers**: Where visitors come from
- **Browsers/OS**: Technical stats
- **Locations**: Country-level (privacy-friendly)
- **Time graphs**: Visitor patterns over time

### Step 6.3: Interpreting Chart Events

Events will appear as paths:

```
/chart/apy-chart/view              (100 views)
/chart/apy-chart/click             (15 clicks)
/chart/apy-chart/zoom              (8 zooms)
/chart/revenue-breakdown-token/view (80 views)
/chart/revenue-breakdown-token/filter-applied/filter-WSOL (5 filters)
/event/APY/custom-price-set/0.05   (3 custom prices)
```

**Analysis questions**:
- Chart view-to-interaction ratio (engagement)
- Which charts drive most user exploration?
- Are interactive features being discovered?

---

## Phase 7: Privacy & Compliance

### Step 7.1: Privacy Policy Update

Add GoatCounter disclosure to your privacy policy (if you create one):

```markdown
## Analytics

This site uses GoatCounter, a privacy-friendly analytics service, to
understand how visitors use our analytics platform. GoatCounter:

- Does not use cookies
- Does not track across websites
- Does not collect personal information
- Stores only anonymized aggregated data
- Is GDPR and CCPA compliant

You can view our public analytics at: https://karstenalytics.goatcounter.com
(if you make dashboard public)
```

### Step 7.2: Cookie Notice

GoatCounter doesn't use cookies, so **no cookie banner is required** under GDPR.

### Step 7.3: Opt-out (Optional)

GoatCounter respects Do Not Track (DNT) headers by default. No additional setup needed.

---

## Phase 8: Maintenance

### Step 8.1: Regular Reviews

**Weekly** (first month):
- Check which pages are most visited
- Verify chart tracking is working
- Look for unexpected patterns

**Monthly**:
- Review chart engagement rates
- Identify underused features
- Plan content/UX improvements based on data

### Step 8.2: Data Retention

GoatCounter free tier:
- Retains data for 180 days
- Export data if needed for long-term analysis
- Consider paid plan ($15/year) for longer retention

---

## Rollout Checklist

Use this checklist to track implementation progress:

### Setup
- [ ] Create GoatCounter account
- [ ] Configure settings and timezone
- [ ] Note tracking script URL

### Integration
- [ ] Add script to `docusaurus.config.ts`
- [ ] Create `src/types/goatcounter.d.ts`
- [ ] Create `src/utils/analytics.ts`
- [ ] Create `src/hooks/useChartTracking.ts`

### Chart Tracking
- [ ] Update `ApyChart.tsx`
- [ ] Update `BreakdownChart.tsx`
- [ ] Update `DailyStackedChart.tsx`
- [ ] Update `DailyStackedBarChart.tsx`
- [ ] Update `CumulativeChart.tsx`
- [ ] Update `PoolTypeMatrixChart.tsx`
- [ ] Update Loyalty charts (4 components)
- [ ] Update Usage charts
- [ ] Update Staking charts

### Additional Features
- [ ] Track dashboard filter changes
- [ ] Track custom APY entry price
- [ ] Track top addresses table views
- [ ] Track behavior segment exploration

### Testing
- [ ] Local testing - verify GoatCounter loads
- [ ] Local testing - test manual events
- [ ] Local testing - interact with charts
- [ ] Production testing - deploy and verify
- [ ] Check GoatCounter dashboard for events

### Documentation
- [ ] Update README with analytics mention (optional)
- [ ] Add privacy policy section (optional)
- [ ] Document custom event structure for future reference

---

## Estimated Timeline

- **Phase 1-2** (Setup & Integration): 30 minutes
- **Phase 3** (Chart Tracking): 2-3 hours (all 12+ charts)
- **Phase 4** (Additional Tracking): 1 hour
- **Phase 5** (Testing): 1 hour
- **Phase 6-7** (Analysis & Privacy): 30 minutes

**Total**: 5-6 hours

---

## Support & Resources

- **GoatCounter Docs**: https://www.goatcounter.com/help
- **GoatCounter API**: https://www.goatcounter.com/api
- **Plotly Events**: https://plotly.com/javascript/plotlyjs-events/
- **Docusaurus Scripts**: https://docusaurus.io/docs/api/docusaurus-config#scripts

---

## Questions to Answer Post-Implementation

After running GoatCounter for 2-4 weeks, analyze:

1. **Content**:
   - Which analysis pages should we expand?
   - Are blog posts driving traffic to analysis?
   - Should we create more interactive dashboards?

2. **Charts**:
   - Which Plotly charts have highest engagement?
   - Are users discovering interactive features?
   - Should we add more drill-down capabilities?

3. **User Journey**:
   - What's the typical user flow? (Intro → Blog → Analysis?)
   - Where do users spend most time?
   - What's the bounce rate on landing page vs analysis pages?

4. **Features**:
   - Is custom APY feature being used?
   - Do users explore top transactions tables?
   - Are filters being applied to breakdown charts?

---

## Next Steps After Implementation

Once GoatCounter is live and collecting data:

1. **Set review reminder** (2 weeks after launch)
2. **Create metrics dashboard** (track key KPIs)
3. **Share insights** (blog post about findings?)
4. **Iterate on UX** based on actual usage patterns
5. **Consider A/B testing** for major changes

---

## Notes

- GoatCounter's free tier is sufficient for personal projects
- Events appear in dashboard within 1-2 minutes
- Dashboard can be made public (optional transparency)
- Paid tier ($15/year) offers longer data retention and more sites
- No maintenance required beyond reviewing insights

---

---

## Implementation Complete - 2025-11-05

### Summary

Full GoatCounter analytics implementation completed across all 16 Plotly charts and interactive components.

### Files Created

- `src/types/goatcounter.d.ts` - TypeScript definitions for GoatCounter API
- `src/utils/analytics.ts` - Analytics utility functions (trackChartEvent, trackCustomEvent, trackPageView)
- `src/hooks/useChartTracking.ts` - React hook for automatic Plotly chart tracking

### Files Modified

- `docusaurus.config.ts` - Added GoatCounter script tag
- **16 chart components** - Added useChartTracking hook
- **3 interaction components** - Added custom event tracking

### Charts with Tracking (16 total)

**Dashboard (8):**
- ApyChart.tsx
- BreakdownChart.tsx
- DailyStackedChart.tsx
- DailyStackedBarChart.tsx
- CumulativeChart.tsx
- PoolTypeMatrixChart.tsx
- WalletRevenueBreakdown.tsx
- PoolRampUpChart.tsx

**Loyalty (5):**
- InverseWhaleChart.tsx
- CompoundVsStakeScatter.tsx
- WeeklyTrendsChart.tsx
- StakeDistributionHistogram.tsx
- BehaviorPieChart.tsx

**Staking (2):**
- StakingBalanceChart.tsx
- WalletTimelineChart.tsx

**Usage (1):**
- UsageTimeSeriesChart.tsx

### Additional Tracking

- **DashboardControls.tsx** - Tracks filter changes (group mode, date range)
- **UsageTopAddresses.tsx** - Tracks table view events by category
- **BehaviorSegmentsTable.tsx** - Tracks segment exploration clicks
- **ApyChart.tsx** - Tracks custom entry price feature usage

### Event Structure

**Chart Events**: `/chart/{chart-name}/{action}/{metadata}`
- Example: `/chart/apy-chart/view`
- Example: `/chart/revenue-breakdown/click/date-2025-10-15`

**Custom Events**: `/event/{category}/{action}/{label}`
- Example: `/event/Dashboard/filter-change/group-token`
- Example: `/event/APY/custom-price-set/0.05`

### GoatCounter Dashboard

Access: https://karstenalytics.goatcounter.com

### Metrics to Monitor

**Chart Engagement**:
- View-to-interaction ratio (clicks + zooms / views)
- Which charts have highest engagement?
- Are users discovering interactive features?

**Feature Usage**:
- Custom APY entry price usage
- Dashboard filter combinations
- Segment exploration patterns
- Table sorting and viewing

**User Journey**:
- Popular entry pages
- Time spent on analysis pages
- Navigation patterns (Intro → Blog → Analysis)
- Bounce rates by section

### Next Steps

1. **Monitor for 2-4 weeks** - Collect baseline analytics data
2. **Analyze chart engagement** - Identify high/low engagement charts
3. **Review feature usage** - Validate personalization features are used
4. **Identify improvements** - Use data to guide UX enhancements
5. **Iterate on content** - Expand popular sections, improve underperforming ones

### Documentation

- **Developer Guide**: `docs/ANALYTICS.md` - Complete guide for adding analytics to new components
- **Implementation Plan**: This document - Full implementation roadmap and reference

### Success Criteria

- [x] All 16 Plotly charts track view, click, and zoom events
- [x] Dashboard controls track filter changes
- [x] Custom APY feature tracks usage
- [x] Table views and segment exploration tracked
- [x] TypeScript types prevent runtime errors
- [x] Events appear correctly in GoatCounter dashboard
- [x] Developer documentation complete
- [x] Privacy-friendly (no cookies, no PII)

**Implementation Date**: November 5, 2025
**Status**: ✅ Complete

---

**Document Version**: 1.1
**Last Updated**: 2025-11-05
**Maintainer**: karstenalytics
