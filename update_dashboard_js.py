# -*- coding: utf-8 -*-
from pathlib import Path

path = Path('docs/javascripts/treasury-dashboard.js')
text = path.read_text(encoding='utf-8')

target = """    const root = document.querySelector('[data-analytics-root]');
    if (!root) {
      return;
    }
    if (root.dataset.initialized === 'true') {
      return;
    }
    root.dataset.initialized = 'true';

    const baseAttr = root.getAttribute('data-base') || '../analytics';
    const basePath = baseAttr.replace(/\/$/, '');
    const DATA_BASE = basePath + '/data';

    const address = root.getAttribute('data-address');
    const addressLabel = root.querySelector('#treasury-address');
    if (addressLabel && address) {
      addressLabel.textContent = address;
    }

"""

replacement = """    const root = document.querySelector('[data-analytics-root]');
    if (!root) {
      return;
    }
    if (root.dataset.initialized === 'true') {
      return;
    }
    root.dataset.initialized = 'true';

    const findElement = (id) => document.getElementById(id) || root.querySelector(#);
    const baseAttr = root.getAttribute('data-base') || '../analytics';
    const basePath = baseAttr.replace(/\/$/, '');
    const DATA_BASE = basePath + '/data';

    const address = root.getAttribute('data-address');
    const addressLabel = findElement('treasury-address');
    const metaRangeLabel = findElement('meta-range');
    const metaTotalSol = findElement('meta-total-sol');
    const metaUniqueTokens = findElement('meta-unique-tokens');
    const metaUniqueTypes = findElement('meta-unique-types');

    if (addressLabel && address) {
      addressLabel.textContent = address;
    }

    const updateSummaryMeta = (summary) => {
      if (!summary) {
        return;
      }
      if (summary.date_range && metaRangeLabel) {
        const start = summary.date_range.start or '--';
        const end = summary.date_range.end or '--';
        metaRangeLabel.textContent = ${start} - ;
      }
      const totals = summary.totals or {};
      if (metaTotalSol) {
        const totalSol = Number(totals.get('wsol_direct', float('nan')))
"""
