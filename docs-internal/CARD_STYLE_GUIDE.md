# Card Style Guide

This document defines the standard styling for stat cards across the DefiTuna Analytics frontend.

## Standard Card Structure

### Container Styles
```jsx
{
  padding: '16px 20px',
  background: 'var(--ifm-background-surface-color)',
  border: '1px solid var(--ifm-toc-border-color)',
  borderRadius: 'var(--ifm-global-radius)',
  boxShadow: '0 4px 16px rgba(15, 20, 27, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}
```

### Grid Layout for Cards
```jsx
{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
  marginBottom: '32px',
}
```

## Typography & Colors

### Row 1: Label/Title
- **Font Size**: 16px (1rem)
- **Font Weight**: 600
- **Color**: `var(--ifm-color-secondary)`
- **Purpose**: Section heading or metric name

```jsx
<div style={{ fontSize: '16px', color: 'var(--ifm-color-secondary)', fontWeight: '600' }}>
  Label Text
</div>
```

### Row 2: Primary Value
- **Font Size**: 32px
- **Font Weight**: 600
- **Color**: `var(--accent)` (teal)
- **Purpose**: Main metric or KPI value

```jsx
<div style={{ fontSize: '32px', fontWeight: '600', color: 'var(--accent)' }}>
  Primary Value
</div>
```

### Row 3: Supplementary Information
- **Font Size**: 14px
- **Font Weight**: Normal (400) or bold (600) for emphasis
- **Color**: `var(--ifm-color-emphasis-600)`
- **Purpose**: Additional context, secondary metrics, or explanatory text

```jsx
<div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-600)' }}>
  Additional info: <strong style={{ color: 'var(--ifm-color-emphasis-600)' }}>value</strong>
</div>
```

## Example Implementation

```jsx
const StatCard = ({ label, value, supplementaryText }) => (
  <div style={{
    padding: '16px 20px',
    background: 'var(--ifm-background-surface-color)',
    border: '1px solid var(--ifm-toc-border-color)',
    borderRadius: 'var(--ifm-global-radius)',
    boxShadow: '0 4px 16px rgba(15, 20, 27, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }}>
    {/* Row 1: Label */}
    <div style={{ fontSize: '16px', color: 'var(--ifm-color-secondary)', fontWeight: '600' }}>
      {label}
    </div>

    {/* Row 2: Primary Value */}
    <div style={{ fontSize: '32px', fontWeight: '600', color: 'var(--accent)' }}>
      {value}
    </div>

    {/* Row 3: Supplementary Info */}
    <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-600)' }}>
      {supplementaryText}
    </div>
  </div>
);
```

## CSS Class Alternative

For components using CSS modules, reference the `.usage-summary-card` class in `custom.css`:

```css
.usage-summary-card {
  padding: 16px 20px;
  border-radius: var(--ifm-global-radius);
  border: 1px solid var(--ifm-color-emphasis-200);
  background: var(--ifm-background-surface-color);
  box-shadow: 0 4px 16px rgba(15, 20, 27, 0.05);
}
.usage-summary-card h3 {
  margin: 0 0 8px;
  font-size: 1rem; /* 16px */
  font-weight: 600;
  color: var(--ifm-color-emphasis-700);
}
.usage-summary-card p {
  margin: 0;
  font-size: 1.75rem; /* 28px - adjust to 32px for consistency */
  font-weight: 600;
  color: var(--ifm-color-primary);
}
```

## Key Principles

1. **Consistent Spacing**: Use 8px gap between rows, 16px vertical padding
2. **Shadow for Depth**: Always include subtle box shadow
3. **Teal Accent**: Primary values use `var(--accent)` for visual hierarchy
4. **Grey Tones**: Use `var(--ifm-color-secondary)` for labels, `var(--ifm-color-emphasis-600)` for supplementary text
5. **Responsive Grid**: Use `repeat(auto-fit, minmax(300px, 1fr))` for flexible layouts
6. **Remove Trailing Zeroes**: Format numeric values to remove unnecessary decimal places

## Number Formatting

```javascript
// Remove trailing zeroes from decimal numbers
const formatNumber = (num) => {
  return parseFloat(num.toFixed(4)).toString();
};

// Example: 0.0500 → 0.05
```

## References

- **Overview Page**: See usage statistics cards for reference implementation
- **TUNA Staking APR Page**: See stat cards showing three-row structure
- **Custom CSS**: `src/css/custom.css` - `.usage-summary-card` class

## Last Updated

2025-11-12
