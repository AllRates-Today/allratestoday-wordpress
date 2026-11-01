/*!
 * AllRatesToday Currency Converter Widget
 * Free embeddable, real-time mid-market exchange rates.
 *
 * Usage (paste once, anywhere on your page — no API key needed):
 *   <div class="art-currency-widget" data-base="USD" data-target="EUR"></div>
 *   <a href="https://allratestoday.com">Exchange rates by AllRatesToday</a>
 *   <script async src="https://allratestoday.com/widget.js"></script>
 *
 * Keyless embeds use official ECB reference rates (updated daily, ~30 major
 * currencies) and MUST keep the "Exchange rates by AllRatesToday" attribution link
 * visible. Add a free API key (https://allratestoday.com/register) for
 * real-time mid-market rates across 150+ currencies, dedicated quota and
 * usage stats.
 *
 * Data attributes on the container:
 *   data-api-key="..."   optional — your AllRatesToday API key
 *   data-base="USD"      starting "from" currency
 *   data-target="EUR"    starting "to" currency
 *   data-amount="100"    starting amount
 *   data-theme="light"   "light" (default) or "dark"
 *
 * License: MIT. Keep the attribution link — it is how we keep the API free.
 */
(function () {
  'use strict';

  // Resolve the API origin from this script's own src so the widget works
  // no matter which domain it is embedded on.
  var API_BASE = (function () {
    try {
      var s = document.currentScript && document.currentScript.src;
      if (s) return new URL(s).origin;
    } catch (e) {}
    return 'https://allratestoday.com';
  })();
  if (window.ALLRATESTODAY_API_BASE) API_BASE = window.ALLRATESTODAY_API_BASE;

  var SITE = 'https://allratestoday.com';
  var ATTR = SITE + '/?utm_source=widget&utm_medium=embed&utm_campaign=currency_converter';

  var symbolsPromise = null;
  function getSymbols() {
    if (!symbolsPromise) {
      symbolsPromise = fetch(API_BASE + '/api/v1/symbols')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (d) { return (d && d.currencies) || []; })
        .catch(function () {
          // Minimal fallback so the widget still renders if symbols are unreachable.
          return [
            { code: 'USD', name: 'US Dollar', symbol: '$' },
            { code: 'EUR', name: 'Euro', symbol: '€' },
            { code: 'GBP', name: 'British Pound', symbol: '£' },
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
            { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
            { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
            { code: 'INR', name: 'Indian Rupee', symbol: '₹' }
          ];
        });
    }
    return symbolsPromise;
  }

  // Keyless embeds run on the open central-bank endpoint (official ECB
  // reference rates, cached at the edge) — it covers ~30 major currencies.
  var ecbTablePromise = null;
  function getEcbTable() {
    if (!ecbTablePromise) {
      ecbTablePromise = fetch(API_BASE + '/api/open/central-bank/ecb')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .catch(function () { return null; });
    }
    return ecbTablePromise;
  }

  function getSymbolsFor(hasKey) {
    if (hasKey) return getSymbols();
    return Promise.all([getSymbols(), getEcbTable()]).then(function (res) {
      var list = res[0];
      var table = res[1];
      if (!table || !table.rates || !table.rates.length) return list;
      var covered = { EUR: 1 };
      for (var i = 0; i < table.rates.length; i++) {
        if (table.rates[i].base) covered[table.rates[i].base] = 1;
        if (table.rates[i].quote) covered[table.rates[i].quote] = 1;
      }
      var filtered = [];
      for (var j = 0; j < list.length; j++) {
        if (covered[list[j].code]) filtered.push(list[j]);
      }
      return filtered.length ? filtered : list;
    });
  }

  // Cross rate from the ECB table (1 EUR = value QUOTE), so keyless embeds
  // can convert any pair the ECB covers, not only pairs that include EUR.
  function ecbCross(table, source, target) {
    if (!table || !table.rates) return null;
    var units = { EUR: 1 };
    for (var i = 0; i < table.rates.length; i++) {
      var r = table.rates[i];
      if (r.base === 'EUR' && r.quote && typeof r.value === 'number' && r.value > 0) units[r.quote] = r.value;
    }
    if (!units[source] || !units[target]) return null;
    return { rate: units[target] / units[source], date: table.rate_date || null };
  }

  function fetchRate(source, target, apiKey) {
    if (!apiKey) {
      return getEcbTable().then(function (table) {
        return ecbCross(table, source, target) || fetchRateFromApi(source, target, apiKey);
      });
    }
    return fetchRateFromApi(source, target, apiKey);
  }

  function fetchRateFromApi(source, target, apiKey) {
    // Keyed embeds get real-time mid-market rates + dedicated quota; keyless
    // embeds use the open central-bank endpoint (official ECB reference
    // rates, attribution link required).
    var u = apiKey
      ? API_BASE + '/api/widget/rate?source=' + encodeURIComponent(source) +
        '&target=' + encodeURIComponent(target) + '&key=' + encodeURIComponent(apiKey)
      : API_BASE + '/api/open/central-bank/ecb?source=' + encodeURIComponent(source) +
        '&target=' + encodeURIComponent(target);
    return fetch(u).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (r.ok && d && typeof d.rate === 'number') {
          return { rate: d.rate, date: d.rate_date || null };
        }
        var err = new Error((d && d.error) || 'rate error');
        err.status = r.status;
        throw err;
      });
    });
  }

  function fmt(value, code) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 4 }).format(value);
    } catch (e) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' ' + code;
    }
  }

  function styles(theme) {
    var dark = theme === 'dark';
    var bg = dark ? '#1e2230' : '#ffffff';
    var fg = dark ? '#e8eaf0' : '#1a1d29';
    var muted = dark ? '#9aa3b8' : '#6b7280';
    var border = dark ? '#363b4d' : '#e2e5ec';
    var field = dark ? '#272c3b' : '#f7f8fa';
    var accent = '#2563eb';
    return [
      ':host{all:initial}',
      '*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
      '.art{max-width:380px;background:' + bg + ';color:' + fg + ';border:1px solid ' + border + ';border-radius:14px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.06)}',
      '.art h3{margin:0 0 14px;font-size:15px;font-weight:600}',
      '.row{display:flex;gap:8px;margin-bottom:10px}',
      '.field{flex:1;display:flex;flex-direction:column;gap:4px}',
      '.field label{font-size:11px;color:' + muted + ';text-transform:uppercase;letter-spacing:.03em}',
      '.art input,.art select{width:100%;padding:9px 10px;font-size:14px;color:' + fg + ';background:' + field + ';border:1px solid ' + border + ';border-radius:9px;outline:none}',
      '.art input:focus,.art select:focus{border-color:' + accent + '}',
      '.swap{display:flex;align-items:flex-end;padding-bottom:1px}',
      '.swap button{cursor:pointer;background:' + field + ';border:1px solid ' + border + ';color:' + fg + ';border-radius:9px;width:38px;height:38px;font-size:16px;line-height:1}',
      '.swap button:hover{border-color:' + accent + '}',
      '.result{margin-top:6px;padding:12px;background:' + field + ';border-radius:10px;text-align:center}',
      '.result .amt{font-size:22px;font-weight:700}',
      '.result .sub{font-size:12px;color:' + muted + ';margin-top:3px}',
      '.foot{margin-top:12px;text-align:center;font-size:11px}',
      '.foot a{color:' + muted + ';text-decoration:none}',
      '.foot a:hover{color:' + accent + ';text-decoration:underline}',
      '.err{color:#dc2626;font-size:13px;text-align:center;padding:8px}',
      '.err a{color:inherit;text-decoration:underline}'
    ].join('');
  }

  function render(host) {
    if (host.getAttribute('data-art-init')) return;
    host.setAttribute('data-art-init', '1');

    var base = (host.getAttribute('data-base') || 'USD').toUpperCase();
    var target = (host.getAttribute('data-target') || 'EUR').toUpperCase();
    var amount = parseFloat(host.getAttribute('data-amount') || '1') || 1;
    var theme = host.getAttribute('data-theme') || 'light';

    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    var style = document.createElement('style');
    style.textContent = styles(theme);
    root.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'art';
    wrap.innerHTML =
      '<h3>Currency Converter</h3>' +
      '<div class="row">' +
        '<div class="field"><label>Amount</label><input type="number" min="0" step="any" class="amt-in" value="' + amount + '"></div>' +
        '<div class="field"><label>From</label><select class="from"></select></div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="swap"><button type="button" title="Swap currencies" aria-label="Swap">⇅</button></div>' +
        '<div class="field"><label>To</label><select class="to"></select></div>' +
      '</div>' +
      '<div class="result"><div class="amt">…</div><div class="sub"></div></div>' +
      '<div class="foot"><a href="' + ATTR + '" target="_blank" rel="noopener">Exchange rates by AllRatesToday</a></div>';
    root.appendChild(wrap);

    var amtIn = wrap.querySelector('.amt-in');
    var fromSel = wrap.querySelector('.from');
    var toSel = wrap.querySelector('.to');
    var swapBtn = wrap.querySelector('.swap button');
    var amtOut = wrap.querySelector('.result .amt');
    var subOut = wrap.querySelector('.result .sub');

    var initialKey = !!(host.getAttribute('data-api-key') || host.getAttribute('data-key'));
    getSymbolsFor(initialKey).then(function (list) {
      var opts = list.map(function (c) {
        return '<option value="' + c.code + '">' + c.code + ' — ' + c.name + '</option>';
      }).join('');
      fromSel.innerHTML = opts;
      toSel.innerHTML = opts;
      fromSel.value = base;
      toSel.value = target;
      if (fromSel.value !== base) fromSel.value = list[0] ? list[0].code : 'USD';
      if (toSel.value !== target) toSel.value = list[1] ? list[1].code : 'EUR';
      convert();
    });

    var t;
    function debounce() { clearTimeout(t); t = setTimeout(convert, 250); }

    function convert() {
      // Re-read the key each time so it can be set dynamically (e.g. live demo).
      var apiKey = host.getAttribute('data-api-key') || host.getAttribute('data-key') || '';
      var from = fromSel.value, to = toSel.value;
      var amt = parseFloat(amtIn.value);
      if (!from || !to) return;
      if (isNaN(amt)) amt = 0;
      if (from === to) {
        amtOut.textContent = fmt(amt, to);
        subOut.textContent = '1 ' + from + ' = 1 ' + to;
        return;
      }
      amtOut.textContent = '…';
      subOut.textContent = apiKey ? 'Fetching live rate…' : 'Fetching rate…';
      fetchRate(from, to, apiKey).then(function (res) {
        var rate = res.rate;
        amtOut.textContent = fmt(amt * rate, to);
        var line = '1 ' + from + ' = ' + rate.toLocaleString(undefined, { maximumFractionDigits: 6 }) + ' ' + to;
        if (!apiKey && res.date) line += ' · ECB ref. ' + res.date;
        subOut.textContent = line;
      }).catch(function (e) {
        amtOut.textContent = '—';
        if (e && e.status === 401) {
          subOut.innerHTML = '<span class="err">Invalid API key. <a href="' + SITE + '/register" target="_blank" rel="noopener">Get a free key</a></span>';
        } else if (e && e.status === 429) {
          subOut.innerHTML = '<span class="err">Monthly limit reached. <a href="' + SITE + '/pricing" target="_blank" rel="noopener">Upgrade</a></span>';
        } else if (!apiKey && e && (e.status === 404 || e.status === 400)) {
          subOut.innerHTML = '<span class="err">Pair not covered by the free ECB feed. <a href="' + SITE + '/register" target="_blank" rel="noopener">Get a free key</a> for 150+ currencies.</span>';
        } else {
          subOut.innerHTML = '<span class="err">Rate unavailable. Try again.</span>';
        }
      });
    }

    amtIn.addEventListener('input', debounce);
    fromSel.addEventListener('change', convert);
    toSel.addEventListener('change', convert);
    swapBtn.addEventListener('click', function () {
      var a = fromSel.value; fromSel.value = toSel.value; toSel.value = a; convert();
    });
  }

  function init() {
    var nodes = document.querySelectorAll('.art-currency-widget:not([data-art-init]),[data-art-currency-widget]:not([data-art-init])');
    for (var i = 0; i < nodes.length; i++) render(nodes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Re-scan for widgets injected after load (SPAs, lazy content).
  window.AllRatesTodayWidget = { init: init };
})();
