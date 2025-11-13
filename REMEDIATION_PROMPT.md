# Security Audit Remediation Tasks for karstenalytics Frontend

You are working on a Docusaurus-based Solana treasury analytics dashboard. A security audit has been completed and identified several improvements needed. Please implement the following changes in order of priority.

## Project Context
- **Framework**: Docusaurus v3.5.2 + React 18.2.0 + TypeScript 5.2.2
- **Type**: Static analytics dashboard (NOT a Web3 dApp)
- **No wallet connections or transaction signing**
- **Data source**: Static JSON files in `/static/data/`
- **Current status**: 0 npm vulnerabilities ✅

## PRIORITY 1: Critical Improvements (Complete First)

### 1. Add Input Validation to APY Calculator

**File**: `src/components/Dashboard/ApyChart.tsx`

**Issue**: Lines 54-75 load entry price from localStorage without validation. Values like "abc", "NaN", or "Infinity" can crash the chart.

**Action**:
1. Create a validation function that:
   - Parses the input safely
   - Rejects NaN, Infinity, negative values
   - Enforces bounds (0 < price < 1000)
   - Returns default value (0.05) on invalid input

2. Update the `useEffect` that loads from localStorage (around line 65-75) to use this validation
3. Update the `handleEntryPriceChange` function (around line 218-240) to use validation before storing

**Example validation function**:
```typescript
function parseEntryPrice(input: string): number {
  const normalized = input.trim().replace(',', '.');
  const parsed = parseFloat(normalized);

  if (isNaN(parsed) || parsed <= 0 || !isFinite(parsed)) {
    return 0.05; // Default fallback
  }

  if (parsed > 1000) return 1000; // Max cap
  return parsed;
}
```

### 2. Fix Type Safety - Define Proper Interfaces

**File**: `src/hooks/useDashboardData.ts`

**Issue**: Lines 3-14 use `any` types for all data structures (9 instances). This causes runtime errors and maintenance issues.

**Action**:
1. Look at the actual JSON structure from `/static/data/summary.json`, `/static/data/daily_stacked.json`, etc.
2. Create proper TypeScript interfaces based on the actual data structure
3. Replace all `any` types with specific interfaces

**Example for summary data**:
```typescript
interface DateRange {
  start: string;
  end: string;
  days: number;
}

interface Totals {
  wsol_direct: number;
  unique_mints: number;
  unique_wallets: number;
  // Add other fields based on actual data
}

interface Summary {
  date_range: DateRange;
  totals: Totals;
  // Add other fields
}

export interface DashboardData {
  summary: Summary;  // ✅ Not 'any'
  dailyStacked: DailyDataPoint[];  // ✅ Not 'any[]'
  // ... define all other types
}
```

**Also fix similar issues in**:
- `src/hooks/useChartTracking.ts` (3 `any` instances)
- `src/hooks/useWalletTimeline.ts` (3 `any` instances)
- `src/components/Dashboard/*.tsx` (14 instances across 8 files)

### 3. Add Data Schema Validation with Zod

**Action**:
1. Install Zod: `npm install zod`
2. Create schemas for critical data structures
3. Create a validated fetch utility function
4. Update all data-loading hooks to use validated fetching

**Create new file**: `src/utils/dataValidation.ts`

```typescript
import { z } from 'zod';

// Define schemas for your data
export const SummarySchema = z.object({
  date_range: z.object({
    start: z.string(),
    end: z.string(),
    days: z.number()
  }),
  totals: z.object({
    wsol_direct: z.number(),
    unique_mints: z.number(),
    // Add all fields from actual summary.json
  })
});

// Validated fetch utility
export async function fetchJSON<T>(
  url: string,
  schema: z.Schema<T>,
  fallback?: T
): Promise<T> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Invalid content-type for ${url}: ${contentType}`);
    }

    const data = await response.json();
    return schema.parse(data); // Validates structure
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}
```

**Update**: `src/hooks/useDashboardData.ts` to use `fetchJSON()` instead of raw `fetch().then()`

## PRIORITY 2: Medium Priority Improvements

### 4. Improve Error Handling

**Files**: All components that display charts

**Action**:
1. Add user-friendly error messages instead of silent console.error()
2. Add React error boundaries to catch component crashes
3. Display helpful messages when data fails to load

**Create**: `src/components/common/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          color: 'var(--ifm-color-danger)',
          background: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-toc-border-color)',
          borderRadius: 'var(--ifm-global-radius)',
        }}>
          <h3>Something went wrong</h3>
          <p>Unable to display this chart. Please refresh the page.</p>
          {this.state.error && (
            <details style={{ marginTop: '16px', fontSize: '12px' }}>
              <summary>Error details</summary>
              <pre>{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5. Add Security Headers to External Scripts

**File**: `docusaurus.config.ts`

**Issue**: Line 31-38 loads GoatCounter without Subresource Integrity (SRI) hash

**Action**:
1. Generate SRI hash for the script (visit https://www.srihash.org/)
2. Add `integrity` and `crossorigin` attributes

```typescript
scripts: [{
  src: 'https://karstenalytics.goatcounter.com/count.js',
  async: true,
  integrity: 'sha384-[GENERATE_THIS_HASH]',
  crossorigin: 'anonymous',
  'data-goatcounter': 'https://karstenalytics.goatcounter.com/count',
}]
```

### 6. Add Size Limits to Data Decompression

**File**: `src/hooks/useWalletTimeline.ts`

**Issue**: No size checks before decompressing gzip files

**Action**: Add size validation before decompression:

```typescript
const MAX_COMPRESSED_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DECOMPRESSED_SIZE = 50 * 1024 * 1024; // 50 MB

const compressed = await response.arrayBuffer();

if (compressed.byteLength > MAX_COMPRESSED_SIZE) {
  throw new Error('Compressed file too large');
}

const decompressed = pako.ungzip(new Uint8Array(compressed), { to: 'string' });

if (decompressed.length > MAX_DECOMPRESSED_SIZE) {
  throw new Error('Decompressed data too large');
}
```

### 7. Update Dependencies

**Action**:
```bash
npm update @docusaurus/core @docusaurus/preset-classic
npm update react react-dom
npm audit
npm test  # If tests exist
```

## PRIORITY 3: Low Priority Improvements

### 8. Add Security to External Links

**Action**: Search for all external links (Solscan, etc.) and add `rel="noopener noreferrer"`:

```bash
# Find all external links
grep -r "target=\"_blank\"" src/
```

Update each to:
```tsx
<a href={url} target="_blank" rel="noopener noreferrer">
  View Transaction
</a>
```

### 9. Add Security Checks to CI/CD

**File**: `.github/workflows/main.yml`

**Action**: Add security checks before the build step:

```yaml
- name: Security audit
  run: npm audit --audit-level=high

- name: Dependency check
  run: npm outdated || true

- run: npm ci
- run: npm run build
```

### 10. Defensive .gitignore Entries

**File**: `.gitignore`

**Action**: Add defensive entries even though no secrets currently exist:

```
# Secrets (defensive)
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local
*.pem
*.key
credentials.json
secrets.json
```

## Verification Steps

After completing all changes:

1. **Run build**: `npm run build` - should succeed without errors
2. **Check types**: `npx tsc --noEmit` - should have fewer type errors
3. **Test input validation**:
   - Enter invalid values in APY calculator ("abc", "-5", "999999")
   - Should handle gracefully with defaults
4. **Test error handling**: Temporarily rename a data file to trigger 404, check error display
5. **Run security audit**: `npm audit` - should still show 0 vulnerabilities
6. **Visual inspection**: Load site, interact with all charts, verify no console errors

## Implementation Order

1. ✅ Start with **Priority 1** tasks (most important for stability)
2. ✅ Continue with **Priority 2** tasks (security hardening)
3. ✅ Finish with **Priority 3** tasks (defensive measures)
4. ✅ Run verification steps
5. ✅ Commit changes with clear messages

## Questions to Ask If Unclear

- "Should I look at actual JSON file structure before creating interfaces?"
- "Do you want me to add error boundaries to all chart components?"
- "Should I create unit tests for the validation functions?"

## Notes

- This is a **static analytics site** with no wallet connections
- **Zero critical security vulnerabilities** currently exist
- These improvements focus on **robustness and maintainability**
- The site is **safe to use in production** now; these are **preventative measures**

Good luck with the implementation! Ask questions if you need clarification on any task.
