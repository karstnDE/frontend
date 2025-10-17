(function () {
  const mount = () => {
    const root = document.querySelector('[data-analytics-root]');
    if (!root) {
      return;
    }
    if (root.dataset.initialized === 'true') {
      return;
    }
    root.dataset.initialized = 'true';

    const findElement = (id) => document.getElementById(id) || root.querySelector(`#${id}`);
    const baseAttr = root.getAttribute('data-base') || '../analytics';
    const basePath = baseAttr.replace(/\/$/, '');
    const DATA_BASE = basePath + '/data';
    const TOP_TRANSACTIONS_LIMIT = 10;

    const TYPE_COLOR_BASE = {
      'fusion_collectprotocolfees': '#2C7BE5',
      'collect_protocol_fees': '#2C7BE5',
      'compound_fees_tuna': '#F6C026',
      'liquidate_position_orca_liquidation': '#E63946',
      'liquidate_position_orca_sl_tp': '#FF8C00',
      'liquidate_position_orca_unclear': '#FFA500',
      'openpositionwithliquidity': '#52B788',
      'open_position_with_liquidity_fusion': '#52B788',
      'add_liquidity_orca': '#90E0EF',
      'collect_and_compound_fees_orca': '#4CC9F0',
      'tuna_liquidatepositionfusion': '#6A4C93',
      'tuna_openpositionwithliquidityfusion': '#3A86FF',
      'tuna_addliquidityorca': '#219EBC',
      'tuna_liquidatetunalppositionorca': '#8D0801',
      'tuna_liquidatetunalppositionfusion': '#FF4D6D',
      'tuna_openandincreasetunalppositionfusion': '#8338EC',
      'liquidity_add_tuna': '#4361EE',
      'fusion_liquidatetunalpposition': '#BC4749',
      'token_transfer': '#6C757D',
      'Unattributed': '#6C757D'
    };
    const TYPE_COLOR_FALLBACK = ['#FF6B35', '#004E89', '#FF9F1C', '#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#003459', '#FFB997', '#7209B7'];

    const resolveTypeColor = (() => {
      const cache = new Map();
      let cursor = 0;
      return (typeName) => {
        if (!typeName) {
          return '#999999';
        }
        if (TYPE_COLOR_BASE[typeName]) {
          return TYPE_COLOR_BASE[typeName];
        }
        if (!cache.has(typeName)) {
          const color = TYPE_COLOR_FALLBACK[cursor % TYPE_COLOR_FALLBACK.length];
          cache.set(typeName, color);
          cursor += 1;
        }
        return cache.get(typeName);
      };
    })();

    const formatTypeLabel = (value) => {
      if (!value) return 'Unknown';
      if (value === 'Others') return 'Others';
      const withSpaces = value
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
      return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const address = root.getAttribute('data-address');
    const addressLabel = findElement('treasury-address');
    const metaRangeLabel = findElement('meta-range');
    const metaTotalSol = findElement('meta-total-sol');
    const metaUniqueTokens = findElement('meta-unique-tokens');
    const metaUniqueTypes = findElement('meta-unique-types');
    const metaUniquePools = findElement('meta-unique-pools');
    if (addressLabel && address) {
      addressLabel.textContent = address;
    }

    const updateSummaryMeta = (summary) => {
      if (!summary) {
        return;
      }
      if (summary.date_range && metaRangeLabel) {
        const start = summary.date_range.start || '--';
        const end = summary.date_range.end || '--';
        metaRangeLabel.textContent = `${start} - ${end}`;
      }
      const totals = summary.totals || {};
      if (metaTotalSol) {
        const totalSol = Number(totals.wsol_direct ?? totals.total_sol ?? totals.total ?? totals.realized_sol ?? NaN);
        if (!Number.isNaN(totalSol)) {
          metaTotalSol.textContent = `${totalSol.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} SOL`;
        } else {
          metaTotalSol.textContent = '--';
        }
      }
      if (metaUniqueTokens) {
        const value = totals.unique_mints ?? totals.unique_tokens ?? null;
        metaUniqueTokens.textContent = value != null ? value.toString() : '--';
      }
      if (metaUniqueTypes) {
        const value = totals.unique_types ?? null;
        metaUniqueTypes.textContent = value != null ? value.toString() : '--';
      }
      if (metaUniquePools) {
        const value = totals.unique_pools ?? null;
        metaUniquePools.textContent = value != null ? value.toString() : '--';
      }
    };

    let dailyStacked = [];
    let dailyByToken = [];
    let dailyByType = [];
    let dailyByPool = [];
    let dailyByPoolType = [];
    let poolTypeSummary = [];
    let topTokenByMint = {};
    let topTypeByLabel = {};
    let topPoolById = {};
    let summaryData = null;
    let tokenNameToMint = {};
    let poolLabelToId = {};
    let isLoading = false;

          const parseDate = (s) => new Date(s + 'T00:00:00Z');

          function showLoading(show = true) {
            const loader = document.getElementById('loading');
            if (loader) loader.style.display = show ? 'block' : 'none';
            isLoading = show;
          }

          function showError(message) {
            const container = document.getElementById('top-table');
            if (container) {
              container.innerHTML = `<div class="error">Error: ${message}</div>`;
            }
          }

          async function loadAll() {
            showLoading(true);
            try {
              const fetchJSON = async (p) => {
                try {
                  const r = await fetch(p);
                  if (!r.ok) throw new Error(`HTTP ${r.status}`);
                  return r.json();
                } catch (error) {
                  console.error('Failed to fetch', p, error);
                  return null;
                }
              };

              summaryData = await fetchJSON(`${DATA_BASE}/summary.json`);
              // Load all data sources
              let ds = await fetchJSON(`${DATA_BASE}/daily_stacked.json`);
              dailyStacked = ds || [];

              let dtok = await fetchJSON(`${DATA_BASE}/daily_by_token.json`);
              dailyByToken = dtok || [];

              let dpool = await fetchJSON(`${DATA_BASE}/daily_by_pool.json`);
              dailyByPool = dpool || [];
              poolLabelToId = {};
              for (const entry of dailyByPool) {
                if (entry && entry.pool_label) {
                  const pid = entry.pool_id || entry.pool_label;
                  if (!(entry.pool_label in poolLabelToId)) {
                    poolLabelToId[entry.pool_label] = pid;
                  }
                }
              }

              let dpooltype = await fetchJSON(`${DATA_BASE}/daily_by_pool_type.json`);
              dailyByPoolType = Array.isArray(dpooltype) ? dpooltype : [];

              let dtyp = await fetchJSON(`${DATA_BASE}/daily_by_type.json`);
              dailyByType = dtyp || [];

              let ttokm = await fetchJSON(`${DATA_BASE}/top_transactions_token.json`);
              topTokenByMint = ttokm || {};

              let tpool = await fetchJSON(`${DATA_BASE}/top_transactions_pool.json`);
              topPoolById = tpool || {};

              let ttypl = await fetchJSON(`${DATA_BASE}/top_transactions_type.json`);
              topTypeByLabel = ttypl || {};

              let ptypeSummary = await fetchJSON(`${DATA_BASE}/pool_type_summary.json`);
              poolTypeSummary = Array.isArray(ptypeSummary) ? ptypeSummary : [];

              if (!summaryData) {
                summaryData = {};
              }
              if (!summaryData.date_range) {
                const fallbackDates = (dailyStacked || []).map(r => r.date).filter(Boolean).sort();
                if (fallbackDates.length) {
                  summaryData.date_range = {
                    start: fallbackDates[0],
                    end: fallbackDates[fallbackDates.length - 1]
                  };
                }
              }
              // Build token name to mint mapping
              const tokenSums = {};
              dailyByToken.forEach(r => {
                if (!tokenSums[r.token_name]) tokenSums[r.token_name] = {};
                tokenSums[r.token_name][r.mint] = (tokenSums[r.token_name][r.mint] || 0) + r.sol_equivalent;
              });

              for (const [name, sums] of Object.entries(tokenSums)) {
                if (Object.keys(sums).length > 0) {
                  tokenNameToMint[name] = Object.entries(sums).sort((a,b) => b[1] - a[1])[0][0];
                }
              }

              console.log('Data loaded:', {
                dailyStacked: dailyStacked.length,
                dailyByToken: dailyByToken.length,
                dailyByPool: dailyByPool.length,
                dailyByPoolType: dailyByPoolType.length,
                dailyByType: dailyByType.length,
                topTokenByMint: Object.keys(topTokenByMint).length,
                topTypeByLabel: Object.keys(topTypeByLabel).length,
                topPoolById: Object.keys(topPoolById).length,
                poolTypeSummary: poolTypeSummary.length
              });
              return summaryData;
            } catch (error) {
              console.error('Failed to load data:', error);
              showError('Failed to load chart data');
            } finally {
              showLoading(false);
            }
          }

          function applyThreshold(records, key, start, end, thresholdPct = 0.1) {
            const m = new Map();
            for (const r of records) {
              const ds = r.date;
              if (!ds) continue;
              const dt = parseDate(ds);
              if (dt < start || dt >= end) continue;
              const k = r[key];
              if (!k) continue;
              const v = +r.sol_equivalent || 0;
              m.set(k, (m.get(k)||0)+v);
            }

            const entries = Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);
            const total = entries.reduce((s, [,v])=>s+v, 0);
            const threshold = total * (thresholdPct / 100);

            const significant = entries.filter(([,v]) => v >= threshold);
            const insignificant = entries.filter(([,v]) => v < threshold);
            const othersTotal = insignificant.reduce((s, [,v])=>s+v, 0);

            if (othersTotal > 0 && significant.length < entries.length) {
              significant.push(['Others', othersTotal]);
            }

          return significant.slice(0, 10);
        }

          function aggregatePoolTypeRange(start, end) {
            if (!Array.isArray(dailyByPoolType) || dailyByPoolType.length === 0) {
              return { pools: [], grandTotal: 0 };
            }
            const pools = new Map();
            for (const entry of dailyByPoolType) {
              if (!entry || !entry.date) continue;
              const dt = parseDate(entry.date);
              if (Number.isNaN(dt.getTime()) || dt < start || dt >= end) continue;
              const poolId = entry.pool_id || 'unknown_pool';
              const poolLabel = entry.pool_label || poolId;
              const typeKey = entry.type || 'Unknown';
              const amount = Number(entry.sol_equivalent) || 0;
              if (!(amount > 0)) continue;

              let pool = pools.get(poolId);
              if (!pool) {
                pool = {
                  pool_id: poolId,
                  pool_label: poolLabel,
                  total: 0,
                  types: new Map()
                };
                pools.set(poolId, pool);
              }
              pool.total += amount;
              pool.types.set(typeKey, (pool.types.get(typeKey) || 0) + amount);
            }
            const poolArray = Array.from(pools.values()).filter((p) => p.total > 1e-9);
            poolArray.sort((a, b) => b.total - a.total);
            const grandTotal = poolArray.reduce((sum, pool) => sum + pool.total, 0);
            return { pools: poolArray, grandTotal };
          }

          function renderMekko(start, end, useRawTypes = false, thresholdPct = 0.1) {
            const containerId = 'marimekko-chart';
            const container = document.getElementById(containerId);
            if (!container) {
              return;
            }

            let { pools, grandTotal } = aggregatePoolTypeRange(start, end);

            if ((!pools.length || grandTotal <= 1e-9) && Array.isArray(poolTypeSummary) && poolTypeSummary.length) {
              pools = poolTypeSummary
                .map((p) => ({
                  pool_id: p.pool_id || 'unknown_pool',
                  pool_label: p.pool_label || p.pool_id || 'Unknown Pool',
                  total: Number(p.total_sol) || 0,
                  types: new Map(
                    Array.isArray(p.types)
                      ? p.types.map((t) => [t.type || 'Unknown', Number(t.sol_equivalent) || 0])
                      : []
                  )
                }))
                .filter((p) => p.total > 1e-9);
              pools.sort((a, b) => b.total - a.total);
              grandTotal = pools.reduce((sum, pool) => sum + pool.total, 0);
            }

            if (!pools.length || grandTotal <= 1e-9) {
              Plotly.purge(containerId);
              container.innerHTML = '<div class="chart-empty">No pool/type revenue available for this range.</div>';
              return;
            }

            const maxPools = 8;
            let displayPools = pools.slice(0, maxPools);
            if (pools.length > maxPools) {
              const remainder = pools.slice(maxPools);
              const othersPool = {
                pool_id: 'OTHERS',
                pool_label: 'Others',
                total: remainder.reduce((sum, pool) => sum + pool.total, 0),
                types: new Map()
              };
              remainder.forEach((pool) => {
                pool.types.forEach((value, typeKey) => {
                  othersPool.types.set(typeKey, (othersPool.types.get(typeKey) || 0) + value);
                });
              });
              if (othersPool.total > 1e-9) {
                displayPools = displayPools.concat([othersPool]);
              }
            }

            const tickVals = [];
            const tickText = [];
            const annotations = [];
            const traces = [];
            const legendSeen = new Set();
            let xOffset = 0;
            const poolThresholdRatio = (thresholdPct || 0.1) / 100;
            const widthTotal = displayPools.reduce((sum, pool) => sum + pool.total, 0) || grandTotal;

            displayPools.forEach((pool) => {
              const poolWidth = pool.total / widthTotal;
              if (!(poolWidth > 0)) {
                return;
              }
              tickVals.push(xOffset + poolWidth / 2);
              tickText.push(pool.pool_label || pool.pool_id);

              const typeEntries = Array.from(pool.types.entries())
                .map(([typeKey, amount]) => ({ typeKey, amount }))
                .filter(({ amount }) => amount > 1e-9)
                .sort((a, b) => b.amount - a.amount);

              const filteredTypes = [];
              let othersSum = 0;
              const minTypeAmount = pool.total * poolThresholdRatio;

              for (let i = 0; i < typeEntries.length; i += 1) {
                const entry = typeEntries[i];
                if (entry.amount >= minTypeAmount || filteredTypes.length < 5) {
                  filteredTypes.push(entry);
                } else {
                  othersSum += entry.amount;
                }
              }

              if (othersSum > 0) {
                filteredTypes.push({ typeKey: 'Others', amount: othersSum });
              }
              if (filteredTypes.length === 0) {
                filteredTypes.push({ typeKey: 'Others', amount: pool.total });
              }

              let yOffset = 0;
              filteredTypes.forEach(({ typeKey, amount }) => {
                if (!(amount > 0)) {
                  return;
                }
                const height = amount / pool.total;
                if (!(height > 0)) {
                  return;
                }

                const x0 = xOffset;
                const x1 = xOffset + poolWidth;
                const y0 = yOffset;
                const y1 = yOffset + height;
                yOffset = y1;

                const displayName = typeKey === 'Others' ? 'Others' : (useRawTypes ? typeKey : formatTypeLabel(typeKey));
                const color = typeKey === 'Others' ? '#CCCCCC' : resolveTypeColor(typeKey);

                const trace = {
                  type: 'scatter',
                  mode: 'lines',
                  line: { width: 0 },
                  fill: 'toself',
                  fillcolor: color,
                  hovertemplate: `Pool: ${pool.pool_label || pool.pool_id}<br>Type: ${displayName}<br>Amount: ${amount.toFixed(2)} SOL<br>Pool Share: ${(poolWidth * 100).toFixed(1)}%<br>Type Share (pool): ${(height * 100).toFixed(1)}%<extra></extra>`,
                  x: [x0, x1, x1, x0, x0],
                  y: [y0, y0, y1, y1, y0],
                  name: displayName,
                  showlegend: false
                };
                if (!legendSeen.has(displayName)) {
                  trace.showlegend = true;
                  legendSeen.add(displayName);
                }
                traces.push(trace);

                if (height > 0.12 && poolWidth > 0.04) {
                  annotations.push({
                    x: x0 + poolWidth / 2,
                    y: y0 + height / 2,
                    text: `${displayName}<br>${amount.toFixed(1)} SOL`,
                    showarrow: false,
                    font: { size: 11, color: '#1f2933' }
                  });
                }
              });

              annotations.push({
                x: xOffset + poolWidth / 2,
                y: 1.03,
                text: `${pool.pool_label || pool.pool_id}<br>${pool.total.toFixed(1)} SOL`,
                showarrow: false,
                font: { size: 12 }
              });

              xOffset += poolWidth;
            });

            if (!traces.length) {
              Plotly.purge(containerId);
              container.innerHTML = '<div class="chart-empty">No pool/type revenue available for this range.</div>';
              return;
            }

            const layout = {
              margin: { l: 60, r: 30, t: 100, b: 160 },
              xaxis: {
                title: 'Pool Share of Total Revenue',
                range: [0, 1],
                tickmode: 'array',
                tickvals: tickVals,
                ticktext: tickText,
                tickformat: '.0%',
                showgrid: false,
                zeroline: false
              },
              yaxis: {
                title: 'Type Share Within Pool',
                range: [0, 1],
                tickformat: '.0%',
                showgrid: true,
                zeroline: false
              },
              legend: {
                orientation: 'h',
                yanchor: 'bottom',
                y: -0.45,
                x: 0,
                xanchor: 'left'
              },
              template: 'plotly_white',
              hovermode: 'closest',
              annotations,
              height: 800
            };
            const config = {
              displayModeBar: false,
              displaylogo: false,
              responsive: true
            };
            Plotly.react(containerId, traces, layout, config);
          }

          function renderBar(group, start, end, useRawTypes = false, thresholdPct = 0.1) {
            let records;
            let key;
            let axisLabel;
            if (group === 'token') {
              records = dailyByToken;
              key = 'token_name';
              axisLabel = 'Token';
            } else if (group === 'pool') {
              records = dailyByPool;
              key = 'pool_label';
              axisLabel = 'Pool';
            } else {
              records = dailyByType;
              key = 'type';
              axisLabel = 'Transaction Type';
            }

            // Calculate ACTUAL total from all records in date range (not just displayed bars)
            let actualTotal = 0;
            for (const r of records) {
              const ds = r.date;
              if (!ds) continue;
              const dt = parseDate(ds);
              if (dt < start || dt >= end) continue;
              actualTotal += (+r.sol_equivalent || 0);
            }

            const agg = applyThreshold(records, key, start, end, thresholdPct);
            const labels = agg.map(x=>x[0]);
            const vals = agg.map(x=>x[1]);

            const title = `Treasury Revenue: ${actualTotal.toFixed(1)} SOL`;
            document.getElementById('breakdown-title').textContent = title;

            const config = {
              displayModeBar: 'hover',
              displaylogo: false,
              modeBarButtonsToRemove: ['zoom2d', 'autoscale', 'select2d', 'lasso2d'],
              responsive: true
            };

            const layout = {
              margin: {l: 60, r: 30, t: 60, b: 100},
              yaxis: {title: 'Treasury Revenue (SOL)'},
              xaxis: {tickangle: -30, title: axisLabel},
              template: 'plotly_white',
              hovermode: 'closest',
              height: 500,
              autosize: true
            };

            const trace = {
              type: 'bar',
              x: labels,
              y: vals,
              text: vals.map(v => v.toFixed(2)),
              textposition: 'outside',
              texttemplate: '%{text}',
              hovertemplate: '%{x}<br>Revenue: %{y:.6f} SOL<extra></extra>',
              marker: {
                color: labels.map((_, i) => {
                  const colors = ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D', '#7209B7', '#F72585', '#4CC9F0', '#06FFA5', '#FFBE0B', '#FB8500'];
                  return colors[i % colors.length];
                })
              }
            };

            return Plotly.react('bar-chart', [trace], layout, config);
          }

          function renderDaily(start, end) {
            const within = dailyStacked.filter(r=>{ const d=parseDate(r.date); return d>=start && d<end; });
            const dates = within.map(r=>r.date);

            // Enhanced daily stacked chart by transaction type
            const typeKeys = Array.from(new Set(dailyByType.map(r=>r.type)));
            const totalsByType = new Map();

            for (const r of dailyByType){
              const d = parseDate(r.date);
              if (d < start || d >= end) continue;
              totalsByType.set(r.type, (totalsByType.get(r.type)||0)+(+r.sol_equivalent||0));
            }

            const sortedTypes = Array.from(totalsByType.entries()).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
            const topTypes = sortedTypes.slice(0, 15);
            const traces = [];

            for (let i = 0; i < topTypes.length; i++) {
              const t = topTypes[i];
              const color = resolveTypeColor(t);
              traces.push({
                type: 'bar',
                name: t,
                x: dates,
                y: dates.map(d => {
                  const rec = dailyByType.find(r => r.date === d && r.type === t);
                  return rec ? +rec.sol_equivalent || 0 : 0;
                }),
                marker: { color },
                hovertemplate: `%{fullData.name}<br>Date: %{x}<br>Amount: %{y:.6f} SOL<extra></extra>`
              });
            }

            const others = dates.map(d => {
              let s = 0;
              for (const r of dailyByType) {
                if (r.date === d && !topTypes.includes(r.type)) {
                  s += (+r.sol_equivalent || 0);
                }
              }
              return s;
            });

            if (others.some(v => v > 0)) {
              traces.push({
                type: 'bar',
                name: 'Others (Combined)',
                x: dates,
                y: others,
                marker: { color: '#CCCCCC' },
                hovertemplate: 'Others (Combined)<br>Date: %{x}<br>Amount: %{y:.6f} SOL<extra></extra>'
              });
            }

            const dailyLayout = {
              barmode: 'stack',
              margin: { l: 60, r: 50, t: 60, b: 50 },
              yaxis: { title: 'Daily Realized (SOL)' },
              xaxis: { title: 'Date' },
              legend: { orientation: 'v', yanchor: 'top', y: 1, x: 1.02 },
              template: 'plotly_white',
              title: `Daily Realized SOL by Transaction Type (Peak: ${Math.max(...dates.map(d => traces.reduce((sum, trace) => sum + (trace.y[traces[0].x.indexOf(d)] || 0), 0))).toFixed(1)} SOL/day)`,
              height: 500,
              autosize: true
            };

            const dailyConfig = {
              displayModeBar: 'hover',
              displaylogo: false,
              modeBarButtonsToRemove: ['zoom2d', 'autoscale', 'select2d', 'lasso2d'],
              responsive: true
            };

            Plotly.react('daily-stacked-chart', traces, dailyLayout, dailyConfig);

            // Enhanced cumulative chart with stacked areas
            const orca = within.map(r=>+r.orca_sol||0);
            const fusion = within.map(r=>+r.fusion_sol||0);
            const other = within.map(r=>+r.other_sol||0);

            const cumOrca = []; const cumFusion = []; const cumOther = [];
            let so = 0, sf = 0, st = 0;

            for (let i = 0; i < dates.length; i++) {
              so += orca[i] || 0;
              sf += fusion[i] || 0;
              st += other[i] || 0;
              cumOrca.push(so);
              cumFusion.push(sf);
              cumOther.push(st);
            }

            const totalCumulative = cumOrca[cumOrca.length - 1] + cumFusion[cumFusion.length - 1] + cumOther[cumOther.length - 1];

            const cumulativeTraces = [
              {
                name: 'Orca (Cumulative)',
                x: dates,
                y: cumOrca,
                mode: 'lines',
                stackgroup: 'one',
                line: { width: 0 },
                fillcolor: 'rgba(255, 193, 7, 0.6)',
                hovertemplate: 'Orca (Cumulative)<br>Date: %{x}<br>Amount: %{y:.6f} SOL<extra></extra>'
              },
              {
                name: 'Fusion (Cumulative)',
                x: dates,
                y: cumFusion,
                mode: 'lines',
                stackgroup: 'one',
                line: { width: 0 },
                fillcolor: 'rgba(128, 128, 128, 0.6)',
                hovertemplate: 'Fusion (Cumulative)<br>Date: %{x}<br>Amount: %{y:.6f} SOL<extra></extra>'
              }
            ];

            if (cumOther.some(v => v > 0)) {
              cumulativeTraces.push({
                name: 'Other (Cumulative)',
                x: dates,
                y: cumOther,
                mode: 'lines',
                stackgroup: 'one',
                line: { width: 0 },
                fillcolor: 'rgba(100, 100, 100, 0.4)',
                hovertemplate: 'Other (Cumulative)<br>Date: %{x}<br>Amount: %{y:.6f} SOL<extra></extra>'
              });
            }

            const cumulativeLayout = {
              margin: { l: 60, r: 30, t: 60, b: 50 },
              yaxis: { title: 'Cumulative Realized (SOL)' },
              xaxis: { title: 'Date' },
              legend: { orientation: 'v', yanchor: 'top', y: 1, x: 1.02 },
              template: 'plotly_white',
              title: `Cumulative Realized SOL by Platform (Total: ${totalCumulative.toFixed(1)} SOL)`,
              hovermode: 'x unified',
              height: 500,
              autosize: true
            };

            const cumulativeConfig = {
              displayModeBar: 'hover',
              displaylogo: false,
              modeBarButtonsToRemove: ['zoom2d', 'autoscale', 'select2d', 'lasso2d'],
              responsive: true
            };

            Plotly.react('cumulative-chart', cumulativeTraces, cumulativeLayout, cumulativeConfig);
          }

          function renderTop(group, start, end, selectedKey=null) {
            let rows = [];
            let dataSource = 'general';

            if (group === 'token') {
              if (selectedKey && selectedKey !== 'Others') {
                const mint = tokenNameToMint[selectedKey];
                rows = topTokenByMint[mint] || [];
                dataSource = `token-specific (${mint ? mint.slice(0,8)+'...' : 'unknown'})`;
              } else {
                rows = [];
                for (const [mint, txs] of Object.entries(topTokenByMint)) {
                  rows.push(...txs);
                }
                dataSource = 'all tokens';
              }
            } else if (group === 'pool') {
              if (selectedKey && selectedKey !== 'Others') {
                const poolId = poolLabelToId[selectedKey] || selectedKey;
                rows = topPoolById[poolId] || [];
                dataSource = `pool-specific (${selectedKey})`;
              } else {
                rows = [];
                for (const [poolId, txs] of Object.entries(topPoolById)) {
                  rows.push(...txs);
                }
                dataSource = 'all pools';
              }
            } else {
              if (selectedKey && selectedKey !== 'Others') {
                rows = topTypeByLabel[selectedKey] || [];
                dataSource = `type-specific (${selectedKey})`;
              } else {
                rows = [];
                for (const [type, txs] of Object.entries(topTypeByLabel)) {
                  rows.push(...txs);
                }
                dataSource = 'all types';
              }
            }

            console.log(`renderTop: group=${group}, selectedKey=${selectedKey}, rows=${rows.length}, dataSource=${dataSource}`);

            // Filter by date range
            const filteredRows = rows.filter(r => {
              const t = (r.timestamp || 0) * 1000;
              const inRange = (t === 0 || (t >= start.getTime() && t < end.getTime()));
              return inRange;
            });

            console.log(`After date filter: ${filteredRows.length} rows`);

            // Sort by amount and take top 10
            const topRows = filteredRows
              .sort((a, b) => (b.amount || 0) - (a.amount || 0))
              .slice(0, TOP_TRANSACTIONS_LIMIT);

            const shortSig = (s) => s ? (s.slice(0,5)+'…'+s.slice(-5)) : '-';

            // Format amount intelligently based on size
            const formatAmount = (amt) => {
              amt = +amt || 0;
              if (amt === 0) return '0.000000';
              // If amount is huge (>1000), it's likely in raw token units - show with fewer decimals
              if (amt > 1000) return amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              // If amount is reasonable SOL range, show 6 decimals
              if (amt > 0.000001) return amt.toFixed(6);
              // For very small amounts, use scientific notation
              return amt.toExponential(4);
            };

            let tableContent = '';
            if (topRows.length === 0) {
              tableContent = '<tr><td colspan="4" style="text-align:center; color:#666; padding:20px;">No transactions found for the selected criteria and date range.</td></tr>';
            } else {
              tableContent = topRows.map(r => {
                const t = r.timestamp ? new Date(r.timestamp * 1000).toISOString() : 'N/A';
                const a = formatAmount(r.amount);
                const sig = r.signature || '-';
                const lbl = r.label || 'Unknown';
                const poolInfo = r.pool_label ? `<div class="meta">Pool: ${r.pool_label}</div>` : '';
                return `<tr><td><a href="https://solscan.io/tx/${sig}" target="_blank">${shortSig(sig)}</a></td><td>${t}</td><td style="text-align:right">${a}</td><td>${lbl}${poolInfo}</td></tr>`;
              }).join('');
            }

            const html = [
              '<div class="meta" id="selected-key" style="margin:6px 0 8px 0;">',
              (selectedKey ? `Selected: ${selectedKey}` : `Showing top transactions (${dataSource})`),
              '</div>',
              '<table class="tbl">',
              '<thead><tr><th>Signature</th><th>Timestamp (UTC)</th><th>Realized SOL</th><th>Label</th></tr></thead>',
              '<tbody>',
              tableContent,
              '</tbody></table>'
            ].join('');

            document.getElementById('top-table').innerHTML = html;
          }

          async function main(){
            const summary = await loadAll();

            const startInput = document.getElementById('date-start');
            const endInput = document.getElementById('date-end');
            const rangeLabel = document.getElementById('range-label');
            if (summary && summary.date_range) {
              const startDate = summary.date_range.start;
              const endDate = summary.date_range.end;
              if (startInput && startDate) startInput.value = startDate;
              if (endInput && endDate) endInput.value = endDate;
              if (rangeLabel && startDate && endDate) {
                rangeLabel.textContent = `${startDate} - ${endDate}`;
              }
            } else {
              const fallbackDates = (dailyStacked || []).map(r => r.date).filter(Boolean).sort();
              if (fallbackDates.length) {
                if (startInput) startInput.value = fallbackDates[0];
                if (endInput) endInput.value = fallbackDates[fallbackDates.length - 1];
                if (rangeLabel) {
                  rangeLabel.textContent = `${fallbackDates[0]} - ${fallbackDates[fallbackDates.length - 1]}`;
                }
              }
            }
            const radios = Array.from(document.querySelectorAll('input[name="group"]'));
            const fullRangeCheckbox = document.getElementById('full-range');
            const rawTypesCheckbox = document.getElementById('raw-types');
            const thresholdInput = document.getElementById('threshold-pct');

            let group = 'token';
            let selectedKey = null;
            let useFullRange = false;
            let useRawTypes = false;
            let thresholdPct = 0.1;

            let updateTimeout;
            function debounceUpdate() {
              clearTimeout(updateTimeout);
              updateTimeout = setTimeout(updateAll, 300);
            }

            function currentRange(){
              const s = parseDate(startInput.value);
              const e = parseDate(endInput.value);
              const e2 = new Date(e.getTime());
              e2.setUTCDate(e2.getUTCDate() + 1);
              rangeLabel.textContent = `${s.toISOString().split('T')[0]} - ${e.toISOString().split('T')[0]}`;
              return [s, e2];
            }

            async function updateAll(){
              if (isLoading) return;
              showLoading(true);
              try {
                const [s, e] = currentRange();
                await renderBar(group, s, e, useRawTypes, thresholdPct);
                renderDaily(s, e);
                renderMekko(s, e, useRawTypes, thresholdPct);
                renderTop(group, s, e, selectedKey);
              } catch (error) {
                console.error('Update failed:', error);
                showError(`Failed to update charts: ${error && error.message ? error.message : error}`);
              } finally {
                showLoading(false);
              }
            }

            if (fullRangeCheckbox) {
              fullRangeCheckbox.addEventListener('change', () => {
                useFullRange = fullRangeCheckbox.checked;
                selectedKey = null;
                debounceUpdate();
              });
            }

            if (rawTypesCheckbox) {
              rawTypesCheckbox.addEventListener('change', () => {
                useRawTypes = rawTypesCheckbox.checked;
                selectedKey = null;
                debounceUpdate();
              });
            }

            if (thresholdInput) {
              thresholdInput.addEventListener('input', () => {
                thresholdPct = parseFloat(thresholdInput.value) || 0.1;
                selectedKey = null;
                debounceUpdate();
              });
            }

            const setupChartClicks = () => {
              const barDiv = document.getElementById('bar-chart');
              if (barDiv && barDiv.on) {
                barDiv.on('plotly_click', (ev) => {
                  try {
                    if (ev && ev.points && ev.points[0]) {
                      selectedKey = ev.points[0].x;
                      updateAll();
                    }
                  } catch (error) {
                    console.error('Chart click error:', error);
                  }
                });
              }
            };

            for (const r of radios) {
              r.addEventListener('change', () => {
                group = document.querySelector('input[name="group"]:checked').value;
                selectedKey = null;
                debounceUpdate();
              });
            }

            startInput.addEventListener('change', () => {
              selectedKey = null;
              debounceUpdate();
            });

            endInput.addEventListener('change', () => {
              selectedKey = null;
              debounceUpdate();
            });

            await updateAll();
            setTimeout(setupChartClicks, 500);
            console.log('Dashboard initialized successfully');
          }

          window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            showError('Application error occurred');
          });

          // Initialize when DOM and Plotly are ready
          function initWhenReady() {
            if (typeof Plotly !== 'undefined') {
              console.log('Plotly loaded, initializing dashboard...');
              main();
            } else {
              console.log('Waiting for Plotly to load...');
              setTimeout(initWhenReady, 100);
            }
          }

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initWhenReady);
          } else {
            initWhenReady();
          }



  };

  if (window.document$) {
    window.document$.subscribe(() => {
      mount();
    });
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }

  mount();

})();

