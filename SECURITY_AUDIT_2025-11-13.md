# Security Audit Report - karstenalytics Frontend
**Date:** 2025-11-13
**Auditor:** Claude Code (Senior Frontend Security Audit)
**Branch:** claude/blockchain-frontend-audit-011CV5jgAaPQyFjFaiCCLvPN

---

## Executive Summary

**Overall Security Grade: B+ (8.5/10)** ✅
**Risk Level: LOW**

This is a **Docusaurus v3-based static analytics dashboard** that visualizes Solana blockchain treasury data for the DeFi Tuna protocol. Importantly, **this is NOT a typical Web3 dApp** - it does not handle wallet connections, transaction signing, private keys, or direct blockchain interactions.

### Key Findings

✅ **Zero npm audit vulnerabilities** (1,552 dependencies scanned)
✅ **No Web3 wallet integration** (no private key exposure risk)
✅ **No XSS vulnerabilities** found
✅ **Privacy-friendly analytics** (GDPR compliant)
✅ **Secure CI/CD configuration**
⚠️ **Type safety issues** (29 `any` types)
⚠️ **Input validation gaps**
⚠️ **No data schema validation**

---

## 1. Architecture Overview

### Technology Stack

**Core Framework:**
- Docusaurus v3.5.2 (React 18.2.0 + TypeScript 5.2.2)
- Plotly.js 2.35.2 for data visualization
- pako 2.1.0 for gzip decompression

**Notable Absence:**
- ❌ No ethers.js, web3.js, wagmi, or @solana/wallet-adapter
- ❌ No blockchain RPC calls
- ❌ No transaction signing capabilities

### Data Architecture

```
Static JSON files (/static/data/)
    ↓
React hooks (useDashboardData, useWalletTimeline)
    ↓
Plotly charts (Dashboard components)
```

**Data Size:** ~3.5 MB across 20 JSON files (some gzip-compressed)

---

## 2. Critical Security Analysis

### 2.1 Dependency Vulnerabilities: ✅ **EXCELLENT**

```bash
npm audit: 0 vulnerabilities across 1,552 dependencies
```

No critical, high, or moderate severity issues detected.

### 2.2 XSS & Code Injection: ✅ **SECURE**

**Scanned for dangerous patterns:**
- No `dangerouslySetInnerHTML`
- No `eval()` or `Function()` constructor
- No `innerHTML` manipulation
- No `document.write()`

All dynamic content rendered through React's automatic escaping.

### 2.3 Input Validation: ⚠️ **NEEDS IMPROVEMENT**

**Issue 1: APY Calculator Entry Price** (`src/components/Dashboard/ApyChart.tsx:54-75`)

```typescript
const [entryPriceInput, setEntryPriceInput] = useState<string>('0.05');

useEffect(() => {
  const saved = localStorage.getItem('tunaEntryPrice');
  if (saved && saved.trim() !== '') {
    const normalised = saved.replace(',', '.');
    setEntryPriceInput(normalised);
    localStorage.setItem('tunaEntryPrice', normalised);
  }
}, []);
```

**Problems:**
- No validation that input is a valid number
- Could store/use `"NaN"`, `"Infinity"`, `"abc"`
- No bounds checking (negative values, extremely large values)

**Security Impact:** Medium (causes chart crashes, poor UX)

**Recommendation:**
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

### 2.4 Data Loading Security: ⚠️ **NEEDS VALIDATION**

**Issue: No JSON Schema Validation** (`src/hooks/useDashboardData.ts:3-14`)

```typescript
export interface DashboardData {
  summary: any;              // ❌ No type safety
  dailyStacked: any[];       // ❌ Unknown structure
  dailyByToken: any[];
  // ... 7 more `any` types
}
```

**Problems:**
- Trusts JSON structure without validation
- Silent failures return empty objects: `r.ok ? r.json() : {}`
- No Content-Type verification
- Malformed data crashes components

**Security Impact:** Medium (app breaks silently, poor error handling)

**Recommendation:**
```typescript
import { z } from 'zod';

const SummarySchema = z.object({
  date_range: z.object({
    start: z.string(),
    end: z.string(),
    days: z.number()
  }),
  totals: z.object({
    wsol_direct: z.number(),
    unique_mints: z.number(),
  })
});

async function fetchJSON<T>(url: string, schema: z.Schema<T>): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Invalid content-type: ${contentType}`);
  }

  const data = await response.json();
  return schema.parse(data); // Validates structure
}
```

### 2.5 Compressed Data Handling: ⚠️ **MINOR RISK**

**File:** `src/hooks/useWalletTimeline.ts`

```typescript
const compressed = await response.arrayBuffer();
const decompressed = pako.ungzip(new Uint8Array(compressed), { to: 'string' });
```

**Issue:** No size limit checks before decompression

**Recommendation:**
```typescript
const MAX_DECOMPRESSED_SIZE = 50 * 1024 * 1024; // 50 MB limit
if (compressed.byteLength > MAX_DECOMPRESSED_SIZE) {
  throw new Error('Compressed file too large');
}
```

---

## 3. Third-Party Integration Security

### 3.1 GoatCounter Analytics: ✅ **PRIVACY-FRIENDLY**

**Configuration:** `docusaurus.config.ts:31-38`

```typescript
scripts: [{
  src: 'https://karstenalytics.goatcounter.com/count.js',
  async: true,
}]
```

**Assessment:**
- ✅ No cookies
- ✅ No personal data collection
- ✅ GDPR/CCPA compliant
- ⚠️ Missing Subresource Integrity (SRI) hash

**Recommendation:**
```typescript
scripts: [{
  src: 'https://karstenalytics.goatcounter.com/count.js',
  async: true,
  integrity: 'sha384-...', // Add SRI hash
  crossorigin: 'anonymous',
}]
```

### 3.2 External Links: ⚠️ **MINOR IMPROVEMENT**

Transaction links to Solscan are safe (signatures from trusted data), but should add:

```typescript
<a href={url} target="_blank" rel="noopener noreferrer">
```

---

## 4. Type Safety Issues (29 instances)

**Impact:** Medium (maintenance risk, runtime errors)

**Affected Files:**
- `src/hooks/useDashboardData.ts` (9 `any` types)
- `src/hooks/useChartTracking.ts` (3 `any` types)
- `src/hooks/useWalletTimeline.ts` (3 `any` types)
- `src/components/Dashboard/*.tsx` (14 instances across 8 files)

**Note:** This issue was already documented in your existing `AUDIT.md` file.

---

## 5. CI/CD Security: ✅ **EXCELLENT**

**GitHub Actions:** `.github/workflows/main.yml`

```yaml
permissions:
  contents: read      # ✅ Read-only
  pages: write        # ✅ Only for deployment
  id-token: write     # ✅ OIDC auth

steps:
  - uses: actions/checkout@v4        # ✅ Latest
  - uses: actions/setup-node@v4      # ✅ Latest
  - run: npm ci                      # ✅ Uses lockfile
```

**Excellent practices:**
- Least privilege permissions
- Pinned action versions
- OIDC authentication (no long-lived secrets)
- Reproducible builds (`npm ci`)

**Recommendation:** Add security checks before build:
```yaml
- run: npm audit --audit-level=high
- run: npm run lint  # If configured
```

---

## 6. Configuration & Secrets: ✅ **SECURE**

**No secrets found in codebase:**
- No `.env` files
- No API keys
- No private keys
- No authentication tokens

**`.gitignore` is properly configured** (excludes `node_modules/`, `build/`, `.docusaurus/`)

**Defensive recommendation:** Add to `.gitignore`:
```
.env
.env.local
.env.*.local
*.pem
*.key
credentials.json
```

---

## 7. Blockchain-Specific Security

### 7.1 Wallet Integration: ✅ **NOT APPLICABLE**

**This application does NOT:**
- ❌ Connect to crypto wallets
- ❌ Sign transactions
- ❌ Handle private keys
- ❌ Approve token allowances
- ❌ Interact with smart contracts

**Therefore, these common dApp vulnerabilities DO NOT APPLY:**
- Wallet drainer attacks
- Malicious transaction approval
- Private key exposure
- Phishing for seed phrases
- Slippage manipulation

### 7.2 Public Blockchain Data: ✅ **APPROPRIATE**

The wallet address lookup feature displays data that's already public on the Solana blockchain (similar to Etherscan/Solscan). No privacy concerns.

---

## 8. Data Privacy & GDPR: ✅ **COMPLIANT**

**Personal Data Collected:**
- ❌ No names, emails, or IP addresses
- ✅ Only: Public blockchain addresses (already public)
- ✅ Only: Anonymous analytics events

**LocalStorage Usage:**
- Only stores APY calculator preference (non-sensitive)
- No tracking or fingerprinting

**Compliance:**
- ✅ No consent banner needed
- ✅ No "Right to be Forgotten" concerns
- ✅ No cookies used

---

## 9. Prioritized Recommendations

### 🔴 Week 1: Critical Improvements (8 hours)

1. **Add Input Validation** (2 hours)
   - File: `src/components/Dashboard/ApyChart.tsx:54-75`
   - Validate entry price bounds (0 < price < 1000)
   - Handle `NaN`, `Infinity`, invalid strings

2. **Fix Type Safety Violations** (4 hours)
   - File: `src/hooks/useDashboardData.ts:3-14`
   - Define proper interfaces for all data structures
   - Replace 29 `any` types with real types

3. **Add Data Schema Validation** (2 hours)
   - Install Zod: `npm install zod`
   - Validate JSON structures on load
   - Catch malformed data before rendering

### 🟡 Week 2: Medium Priority (6 hours)

4. **Improve Error Handling** (2 hours)
   - User-friendly error messages instead of silent failures
   - Add React error boundaries

5. **Add Security Headers** (1 hour)
   - Add SRI hashes to external scripts
   - Configure Content-Security-Policy

6. **Add Size Limits** (1 hour)
   - Max decompression size check (50 MB)
   - Timeout on fetch requests (10 seconds)

7. **Update Dependencies** (2 hours)
   - Update Docusaurus: `npm update @docusaurus/core @docusaurus/preset-classic`
   - Update React to 18.3.1
   - Test all changes

### 🟢 Week 3: Low Priority (4 hours)

8. **Add External Link Security** (30 min)
   - Add `rel="noopener noreferrer"` to all `<a>` tags

9. **Add CI/CD Security Checks** (1 hour)
   - Run `npm audit` in GitHub Actions
   - Fail build on high/critical vulnerabilities

10. **Documentation** (2.5 hours)
    - Document data file formats
    - Add security considerations to README

---

## 10. Final Verdict

### Overall Security Posture: **LOW RISK** ✅

**Why This Project is Secure:**
1. ✅ No wallet connections or transaction signing
2. ✅ Zero dependency vulnerabilities
3. ✅ Static data only (no injection attacks)
4. ✅ Privacy-friendly analytics
5. ✅ Well-configured CI/CD
6. ✅ No secrets in codebase

**Primary Risks:**
1. ⚠️ App crashes from invalid input (UX issue, not security)
2. ⚠️ Silent failures from malformed data (monitoring issue)
3. ⚠️ Type safety violations (maintenance risk)

### Comparison to Typical Web3 dApps

Most blockchain frontends have **HIGH or CRITICAL** risks due to:
- Wallet connection vulnerabilities
- Transaction signing exploits
- Smart contract interaction bugs
- Private key exposure

**This project has NONE of those risks** because it's fundamentally a static analytics dashboard, not a transaction-handling dApp.

---

## 11. Summary Table

| Category | Status | Priority |
|----------|--------|----------|
| Dependency Vulnerabilities | ✅ Excellent | - |
| XSS/Injection Attacks | ✅ Secure | - |
| Input Validation | ⚠️ Needs Improvement | High |
| Data Validation | ⚠️ Missing | High |
| Type Safety | ⚠️ 29 issues | High |
| Third-Party Scripts | 🟡 Add SRI | Medium |
| Error Handling | ⚠️ Too Silent | Medium |
| CI/CD Security | ✅ Excellent | - |
| Secrets Management | ✅ No secrets | - |
| Wallet Security | ✅ N/A (static site) | - |
| Privacy/GDPR | ✅ Compliant | - |

---

## 12. Conclusion

**karstenalytics is a well-architected, low-risk analytics dashboard** with solid security fundamentals. The absence of wallet connections, transaction signing, and user authentication dramatically reduces the attack surface compared to typical Web3 dApps.

**The recommended improvements focus on code quality and robustness rather than fixing exploitable security holes.** This project is **safe to use in production** in its current state.

**Excellent work on:**
- Choosing a static architecture (security by simplicity)
- Maintaining zero npm vulnerabilities
- Privacy-friendly analytics implementation
- Professional CI/CD configuration
