# Analytics Developer Guide

This guide explains how to add GoatCounter analytics tracking to new components in the karstenalytics frontend.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Adding Tracking to Plotly Charts](#adding-tracking-to-plotly-charts)
- [Adding Custom Event Tracking](#adding-custom-event-tracking)
- [Event Naming Conventions](#event-naming-conventions)
- [Testing Analytics Locally](#testing-analytics-locally)
- [Viewing the Dashboard](#viewing-the-dashboard)
- [Troubleshooting](#troubleshooting)

---

## Overview

The karstenalytics site uses [GoatCounter](https://www.goatcounter.com/), a privacy-friendly web analytics platform that tracks:

- **Page views** (automatic)
- **Chart interactions** (view, click, zoom)
- **Custom events** (filter changes, feature usage)

GoatCounter is:
- Privacy-friendly (no cookies, no cross-site tracking)
- GDPR and CCPA compliant
- Free for personal projects

**Analytics Dashboard**: https://karstenalytics.goatcounter.com

---

## Quick Start

### For Plotly Charts

```typescript
import { useChartTracking } from '@site/src/hooks/useChartTracking';

export default function MyChart() {
  const plotRef = useRef<HTMLDivElement>(null);

  // Add chart tracking
  useChartTracking(plotRef, {
    chartName: 'My Chart Name',
    trackClick: true,
    trackZoom: true,
  });

  return (
    <div ref={plotRef}>
      <Plot data={data} layout={layout} />
    </div>
  );
}
```

### For Custom Events

```typescript
import { trackCustomEvent } from '@site/src/utils/analytics';

// Track a user action
const handleFilterChange = (newFilter: string) => {
  setFilter(newFilter);
  trackCustomEvent('Dashboard', 'filter-change', newFilter);
};
```

---

## Adding Tracking to Plotly Charts

The `useChartTracking` hook provides automatic tracking for Plotly chart interactions.

### Step 1: Import the Hook

```typescript
import { useChartTracking } from '@site/src/hooks/useChartTracking';
```

### Step 2: Create a Ref for the Chart Container

```typescript
export default function MyChart() {
  const plotRef = useRef<HTMLDivElement>(null);

  // ... rest of component
}
```

### Step 3: Add the Hook

```typescript
useChartTracking(plotRef, {
  chartName: 'Revenue Breakdown',
  trackHover: false,  // Usually disabled (too noisy)
  trackClick: true,   // Track when users click data points
  trackZoom: true,    // Track when users zoom/pan
  trackSelect: false, // Track when users select regions
});
```

### Step 4: Attach the Ref to Container

```typescript
return (
  <div ref={plotRef}>
    <Plot
      data={data}
      layout={layout}
      config={config}
    />
  </div>
);
```

### Complete Example

```typescript
import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import { useChartTracking } from '@site/src/hooks/useChartTracking';

export default function RevenueChart(): React.ReactElement {
  const plotRef = useRef<HTMLDivElement>(null);

  // Track chart interactions
  useChartTracking(plotRef, {
    chartName: 'Daily Revenue',
    trackClick: true,
    trackZoom: true,
  });

  const data = [
    {
      x: ['2025-01-01', '2025-01-02'],
      y: [100, 150],
      type: 'scatter',
    },
  ];

  const layout = {
    title: 'Daily Revenue',
  };

  return (
    <div ref={plotRef}>
      <Plot
        data={data}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
```

### Tracking Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `chartName` | string | required | Display name for the chart (used in event paths) |
| `trackHover` | boolean | false | Track hover events (usually disabled - can be noisy) |
| `trackClick` | boolean | true | Track click events on data points |
| `trackZoom` | boolean | true | Track zoom and pan interactions |
| `trackSelect` | boolean | false | Track box/lasso selection events |

---

## Adding Custom Event Tracking

Use `trackCustomEvent` to track user actions that aren't chart interactions.

### Import the Function

```typescript
import { trackCustomEvent } from '@site/src/utils/analytics';
```

### Track Filter Changes

```typescript
const handleGroupModeChange = (newMode: string) => {
  setGroupMode(newMode);

  // Track the filter change
  trackCustomEvent('Dashboard', 'filter-change', `group-${newMode}`);
};
```

### Track Feature Usage

```typescript
const handleCustomPriceSet = (price: number) => {
  setEntryPrice(price);

  // Track custom APY entry price usage
  trackCustomEvent('APY', 'custom-price-set', String(price));
};
```

### Track Table Views

```typescript
useEffect(() => {
  if (data && data.length > 0) {
    // Track when user views a data table
    trackCustomEvent('Usage', 'view-top-addresses', category);
  }
}, [data, category]);
```

### Function Signature

```typescript
trackCustomEvent(
  category: string,  // e.g., 'Dashboard', 'APY', 'Loyalty'
  action: string,    // e.g., 'filter-change', 'custom-price-set'
  label?: string     // Optional: additional context
): void
```

### Complete Examples

#### Example 1: Dashboard Controls

```typescript
import { trackCustomEvent } from '@site/src/utils/analytics';

export default function DashboardControls({ onChange }) {
  const handleGroupModeChange = (newMode: string) => {
    onChange({ groupMode: newMode });
    trackCustomEvent('Dashboard', 'filter-change', `group-${newMode}`);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    onChange({ startDate: start, endDate: end });
    trackCustomEvent('Dashboard', 'filter-change', 'date-range');
  };

  return (
    <div>
      <select onChange={(e) => handleGroupModeChange(e.target.value)}>
        <option value="token">By Token</option>
        <option value="type">By Type</option>
      </select>
    </div>
  );
}
```

#### Example 2: Segment Exploration

```typescript
import { trackCustomEvent } from '@site/src/utils/analytics';

export default function BehaviorSegmentsTable({ segments }) {
  const handleSegmentClick = (segment: string) => {
    // Show segment details
    showSegmentDetails(segment);

    // Track exploration
    trackCustomEvent('Loyalty', 'explore-segment', segment);
  };

  return (
    <table>
      {segments.map(segment => (
        <tr key={segment.name} onClick={() => handleSegmentClick(segment.name)}>
          <td>{segment.name}</td>
        </tr>
      ))}
    </table>
  );
}
```

---

## Event Naming Conventions

Following consistent naming conventions makes analytics easier to analyze.

### Chart Event Paths

Chart events are automatically formatted as:

```
/chart/{chart-name}/{action}/{metadata}
```

**Examples**:
- `/chart/apy-chart/view`
- `/chart/apy-chart/click`
- `/chart/apy-chart/zoom`
- `/chart/revenue-breakdown/click/date-2025-01-15/series-0`

**Rules**:
- Chart names are lowercased and spaces replaced with hyphens
- Metadata is formatted as `key-value` pairs separated by `/`

### Custom Event Paths

Custom events are formatted as:

```
/event/{category}/{action}/{label}
```

**Examples**:
- `/event/Dashboard/filter-change/group-token`
- `/event/APY/custom-price-set/0.05`
- `/event/Loyalty/explore-segment/whales`

**Rules**:
- Use PascalCase for categories (Dashboard, APY, Loyalty, Usage)
- Use kebab-case for actions (filter-change, custom-price-set)
- Labels are freeform but should be descriptive

### Category Guidelines

| Category | Purpose | Example Actions |
|----------|---------|----------------|
| `Dashboard` | Main dashboard interactions | `filter-change`, `date-range-change` |
| `APY` | APY chart features | `custom-price-set`, `view-personalized` |
| `Loyalty` | Loyalty analytics features | `explore-segment`, `view-whale-data` |
| `Usage` | Usage statistics features | `view-top-addresses`, `sort-table` |
| `Staking` | Staking analytics features | `view-wallet-timeline`, `filter-wallets` |

---

## Testing Analytics Locally

### Step 1: Start Development Server

```bash
cd ../frontend
npm start
```

### Step 2: Open Browser Console

Open your browser's developer tools (F12) and navigate to the Console tab.

### Step 3: Verify GoatCounter Loaded

```javascript
console.log(window.goatcounter);
// Should output: Object { count: function, filter: function, ... }
```

If this returns `undefined`, GoatCounter is not loaded. Check:
- Network tab for failed script loads
- Ad blockers (disable for testing)
- Script URL in `docusaurus.config.ts`

### Step 4: Test Manual Events

```javascript
// Test tracking manually
window.goatcounter.count({
  path: 'test/manual-event',
  title: 'Test Event',
  event: true
});
```

### Step 5: Interact with Charts

Navigate to pages with charts and interact with them:
- Click on data points
- Zoom in/out using scroll or box zoom
- Change filters in dashboard controls
- Enter custom values in inputs

### Step 6: Check GoatCounter Dashboard

1. Visit https://karstenalytics.goatcounter.com
2. Log in to your account
3. Events should appear within 1-2 minutes
4. Look for paths like `/chart/...` and `/event/...`

### Step 7: Monitor Console for Errors

Watch the browser console for any errors related to analytics:
- TypeScript type errors
- Runtime errors in tracking functions
- GoatCounter API errors

### Common Local Testing Issues

**Issue: Events not appearing in dashboard**
- Events can take 1-2 minutes to process
- Check that `event: true` is set in tracking calls
- Verify you're logged into the correct GoatCounter account

**Issue: TypeScript errors about window.goatcounter**
- Ensure `src/types/goatcounter.d.ts` exists
- Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "Restart TypeScript Server")

**Issue: Charts not tracking**
- Verify plotRef is attached to the correct div
- Check that the ref div wraps the Plot component
- Look for errors in useEffect cleanup

---

## Viewing the Dashboard

### Accessing GoatCounter

1. Visit https://karstenalytics.goatcounter.com
2. Log in with your account credentials
3. Dashboard shows real-time analytics

### Key Dashboard Sections

#### Paths

Shows all tracked pages and events sorted by popularity:

```
Path                                          | Views
--------------------------------------------- | -----
/                                             | 1,234
/analysis/defituna/staking-apy                | 456
/chart/apy-chart/view                         | 234
/chart/apy-chart/click                        | 45
/event/Dashboard/filter-change/group-token    | 12
```

**Filtering**: Use the search box to filter by path (e.g., `/chart/` to see all chart events)

#### Pages

Shows page views (excludes events):
- Total page views
- Unique visitors
- Average time on page

#### Referrers

Shows where visitors come from:
- Direct traffic
- Search engines
- External links
- Social media

#### Browsers & Devices

Shows technical statistics:
- Browser distribution (Chrome, Firefox, Safari, etc.)
- Operating system (Windows, macOS, Linux, etc.)
- Device type (Desktop, Mobile, Tablet)
- Screen resolution

#### Locations

Shows visitor geographic distribution (country-level only for privacy):
- Top countries
- No IP addresses or city-level data collected

### Analyzing Chart Engagement

To analyze chart engagement:

1. **Filter by chart events**: Search for `/chart/` in the Paths view
2. **Calculate engagement rate**:
   - `view` events = total chart views
   - `click` events = users who clicked data points
   - `zoom` events = users who zoomed/panned
   - Engagement rate = (clicks + zooms) / views

3. **Compare charts**:
   - Which charts have highest view counts?
   - Which charts have highest engagement rates?
   - Are some charts viewed but not interacted with?

4. **Identify patterns**:
   - Do users zoom more on time-series charts?
   - Do users click on bar charts to filter?
   - Which custom features are used?

### Example Analysis Queries

**Which charts are most popular?**
```
Search: /chart/
Group by: First two path segments
Sort by: Views descending
```

**What's the engagement rate for APY chart?**
```
Filter: /chart/apy-chart/
Calculate: (clicks + zooms) / views * 100
```

**Which dashboard filters are used most?**
```
Search: /event/Dashboard/filter-change/
Group by: Label
Sort by: Events descending
```

### Exporting Data

GoatCounter allows exporting data for deeper analysis:

1. Go to **Settings → Export**
2. Choose date range
3. Download CSV file
4. Analyze in Excel, Python, R, etc.

---

## Troubleshooting

### GoatCounter Not Loading

**Symptom**: `window.goatcounter` is undefined

**Solutions**:
1. Check script URL in `docusaurus.config.ts`:
   ```typescript
   scripts: [
     {
       src: 'https://karstenalytics.goatcounter.com/count.js',
       async: true,
       'data-goatcounter': 'https://karstenalytics.goatcounter.com/count',
     },
   ],
   ```

2. Verify network request succeeded (check Network tab in DevTools)

3. Disable ad blockers for testing (many block analytics scripts)

4. Check browser console for errors

5. Verify GoatCounter account is active and subdomain is correct

### Events Not Appearing in Dashboard

**Symptom**: Tracking code runs but events don't show up

**Solutions**:
1. Wait 1-2 minutes (events are processed asynchronously)

2. Verify `event: true` is set:
   ```typescript
   window.goatcounter.count({
     path: 'my/event',
     event: true,  // Required for custom events
   });
   ```

3. Check GoatCounter dashboard filter settings (unfilter if needed)

4. Verify you're logged into the correct account

5. Check GoatCounter status page for service issues

### TypeScript Errors

**Symptom**: TypeScript errors about `window.goatcounter` or missing types

**Solutions**:
1. Verify `src/types/goatcounter.d.ts` exists and is correct

2. Restart TypeScript server in VS Code:
   - Cmd/Ctrl + Shift + P
   - Type "Restart TypeScript Server"
   - Press Enter

3. Check tsconfig.json includes `src/types`:
   ```json
   {
     "include": ["src/**/*"]
   }
   ```

4. Rebuild the project:
   ```bash
   npm run clear
   npm start
   ```

### Chart Tracking Not Working

**Symptom**: useChartTracking hook doesn't fire events

**Solutions**:
1. Verify plotRef is attached to the correct div:
   ```typescript
   // Correct: ref on div wrapping Plot
   <div ref={plotRef}>
     <Plot ... />
   </div>

   // Incorrect: ref on Plot component
   <Plot ref={plotRef} ... />
   ```

2. Check that Plot component has rendered (inspect DOM)

3. Verify Plotly event listeners are attaching:
   ```javascript
   // In browser console
   console.log(plotRef.current.on); // Should be a function
   ```

4. Look for errors in useEffect cleanup (check console)

5. Try simplifying tracking options (disable all but one event type)

### Events Tracked Multiple Times

**Symptom**: Same event appears multiple times in dashboard

**Solutions**:
1. Check for duplicate tracking calls (search codebase for tracking function)

2. Verify useEffect dependencies are correct:
   ```typescript
   // Good: Only track once per chartName change
   useEffect(() => {
     trackChartEvent(chartName, 'view');
   }, [chartName]);

   // Bad: Tracks on every render
   useEffect(() => {
     trackChartEvent(chartName, 'view');
   }); // Missing dependency array
   ```

3. Use ref to track "already tracked" state:
   ```typescript
   const hasTrackedView = useRef(false);

   useEffect(() => {
     if (!hasTrackedView.current) {
       trackChartEvent(chartName, 'view');
       hasTrackedView.current = true;
     }
   }, [chartName]);
   ```

### Production vs Development Discrepancies

**Symptom**: Analytics work locally but not in production

**Solutions**:
1. Verify production build includes analytics script:
   ```bash
   npm run build
   grep -r "goatcounter" build/
   ```

2. Check production site in browser DevTools (same as local testing)

3. Ensure GoatCounter account allows your production domain

4. Check Content Security Policy (CSP) headers allow GoatCounter

5. Test production build locally:
   ```bash
   npm run build
   npm run serve
   ```

---

## API Reference

### trackChartEvent

Tracks user interactions with Plotly charts.

```typescript
trackChartEvent(
  chartName: string,
  action: string,
  metadata?: Record<string, string | number>
): void
```

**Parameters**:
- `chartName`: Display name of the chart (e.g., "APY Chart")
- `action`: Type of interaction (e.g., "view", "click", "zoom")
- `metadata`: Optional metadata to include in the event path

**Example**:
```typescript
trackChartEvent('APY Chart', 'view');
trackChartEvent('Revenue Breakdown', 'click', { date: '2025-10-15' });
```

**Event Path Format**: `/chart/{chart-name}/{action}/{metadata}`

---

### trackCustomEvent

Tracks custom user actions.

```typescript
trackCustomEvent(
  category: string,
  action: string,
  label?: string
): void
```

**Parameters**:
- `category`: Event category (e.g., "Dashboard", "APY", "Loyalty")
- `action`: Action performed (e.g., "filter-change", "custom-price-set")
- `label`: Optional label for additional context

**Example**:
```typescript
trackCustomEvent('Dashboard', 'filter-change', 'group-token');
trackCustomEvent('APY', 'custom-price-set', '0.05');
```

**Event Path Format**: `/event/{category}/{action}/{label}`

---

### useChartTracking

React hook for adding analytics tracking to Plotly charts.

```typescript
useChartTracking(
  plotRef: React.RefObject<HTMLDivElement>,
  options: UseChartTrackingOptions
): void
```

**Parameters**:
- `plotRef`: React ref to the Plotly chart container div
- `options`: Tracking configuration

**Options**:
```typescript
interface UseChartTrackingOptions {
  chartName: string;       // Required: Display name for the chart
  trackHover?: boolean;    // Optional: Track hover events (default: false)
  trackClick?: boolean;    // Optional: Track click events (default: true)
  trackZoom?: boolean;     // Optional: Track zoom events (default: true)
  trackSelect?: boolean;   // Optional: Track selection events (default: false)
}
```

**Example**:
```typescript
const plotRef = useRef<HTMLDivElement>(null);

useChartTracking(plotRef, {
  chartName: 'Revenue Chart',
  trackClick: true,
  trackZoom: true,
});

return (
  <div ref={plotRef}>
    <Plot data={data} layout={layout} />
  </div>
);
```

---

### isAnalyticsAvailable

Checks if GoatCounter is loaded and available.

```typescript
isAnalyticsAvailable(): boolean
```

**Returns**: `true` if GoatCounter is loaded, `false` otherwise

**Example**:
```typescript
if (isAnalyticsAvailable()) {
  trackCustomEvent('Feature', 'used');
}
```

---

## Additional Resources

- **GoatCounter Documentation**: https://www.goatcounter.com/help
- **GoatCounter API**: https://www.goatcounter.com/api
- **Plotly Events Documentation**: https://plotly.com/javascript/plotlyjs-events/
- **Privacy Policy**: https://www.goatcounter.com/help/privacy
- **Implementation Plan**: `GOATCOUNTER_IMPLEMENTATION_PLAN.md`

---

## Support

If you encounter issues not covered in this guide:

1. Check the [GoatCounter documentation](https://www.goatcounter.com/help)
2. Review the implementation plan (`GOATCOUNTER_IMPLEMENTATION_PLAN.md` in the frontend root)
3. Inspect browser console for errors
4. Test in a clean browser profile (no extensions)
5. Compare your implementation to working examples in `src/components/`

---

**Document Version**: 1.0
**Last Updated**: November 5, 2025
**Maintainer**: karstenalytics
