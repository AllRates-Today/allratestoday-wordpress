/*!
 * AllRatesToday Official Rates Widget
 * Embeddable official central-bank and tax-authority exchange rates.
 *
 * Usage (paste once, anywhere on your page — no API key needed):
 *   <div class="art-official-rate" data-bank="ecb" data-source="USD" data-target="EUR"></div>
 *   <script async src="https://allratestoday.com/official-rates.js"></script>
 *
 * These are OFFICIAL published rates — the ones tax filings, customs
 * declarations and audits cite — not live market prices. Every response
 * carries the publishing body's own publication date, and the widget shows it,
 * because a rate without its date is not citable.
 *
 * Attribution: the widget renders a visible "Rates by AllRatesToday" link and
 * will not remove it. That link is why the endpoint can stay free and keyless.
 *
 * Data attributes on the container:
 *   data-bank="ecb"      source code (ecb, boe, hmrc, bazg, ustreasury, ...)
 *   data-source="USD"    from currency
 *   data-target="EUR"    to currency
 *   data-theme="light"   "light" (default) or "dark"
 *
 * License: MIT. Keep the attribution link.
 */
(function () {
  'use strict';

  var API_BASE = (function () {
    try {
      var s = document.currentScript && document.currentScript.src;
      if (s) return new URL(s).origin;
    } catch (e) {}
    return 'https://allratestoday.com';
  })();
  // Self-hosted copies (WordPress plugin, bundlers) point back at the API.
  if (window.ALLRATESTODAY_API_BASE) API_BASE = window.ALLRATESTODAY_API_BASE;

  var SITE = 'https://allratestoday.com';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function style(node, theme) {
    var dark = theme === 'dark';
    node.style.cssText = [
      'font-family:system-ui,-apple-system,"Segoe UI",sans-serif',
      'border:1px solid ' + (dark ? '#374151' : '#e5e7eb'),
      'border-radius:10px',
      'padding:14px 16px',
      'background:' + (dark ? '#111827' : '#ffffff'),
      'color:' + (dark ? '#f9fafb' : '#111827'),
      'max-width:320px',
      'line-height:1.4',
    ].join(';');
  }

  function render(node, data, theme) {
    node.textContent = '';
    style(node, theme);
    var dark = theme === 'dark';
    var muted = dark ? '#9ca3af' : '#6b7280';

    var rate = el('div', null, data.rate.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    rate.style.cssText = 'font-size:1.6rem;font-weight:700;font-variant-numeric:tabular-nums';

    var pair = el('div', null, '1 ' + data.source + ' = ' + data.target);
    pair.style.cssText = 'font-size:0.85rem;color:' + muted;

    // The publication date is not decoration — it is what makes the number
    // citable, so it is never omitted.
    var date = el('div', null, 'Official rate published ' + data.rate_date);
    date.style.cssText = 'font-size:0.75rem;margin-top:6px;color:' + muted;

    if (data.derived) {
      var d = el('div', null, 'Derived (' + data.method + ') from the published table');
      d.style.cssText = 'font-size:0.7rem;margin-top:2px;color:' + muted;
      node.appendChild(d);
    }

    var credit = el('a', null, 'Rates by AllRatesToday');
    credit.href = SITE + '/central-bank-rates-api/' + encodeURIComponent(data.bank) + '/';
    credit.target = '_blank';
    credit.rel = 'noopener';
    credit.style.cssText =
      'display:inline-block;margin-top:8px;font-size:0.75rem;color:#25A557;text-decoration:none;font-weight:600';

    node.appendChild(pair);
    node.appendChild(rate);
    node.appendChild(date);
    node.appendChild(credit);
  }

  function fail(node, message, theme) {
    node.textContent = '';
    style(node, theme);
    var m = el('div', null, message);
    m.style.cssText = 'font-size:0.85rem;color:#b91c1c';
    var credit = el('a', null, 'AllRatesToday');
    credit.href = SITE;
    credit.target = '_blank';
    credit.rel = 'noopener';
    credit.style.cssText = 'display:inline-block;margin-top:8px;font-size:0.75rem;color:#25A557;text-decoration:none';
    node.appendChild(m);
    node.appendChild(credit);
  }

  function load(node) {
    var bank = (node.getAttribute('data-bank') || 'ecb').toLowerCase();
    var source = (node.getAttribute('data-source') || 'USD').toUpperCase();
    var target = (node.getAttribute('data-target') || 'EUR').toUpperCase();
    var theme = node.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

    var url =
      API_BASE + '/api/open/central-bank/' + encodeURIComponent(bank) +
      '?source=' + encodeURIComponent(source) + '&target=' + encodeURIComponent(target);

    fetch(url)
      .then(function (r) {
        return r.json().then(function (b) {
          if (!r.ok) throw new Error(b && b.error ? b.error : 'Request failed');
          return b;
        });
      })
      .then(function (data) { render(node, data, theme); })
      .catch(function (e) { fail(node, e.message || 'Rate unavailable', theme); });
  }

  function init() {
    var nodes = document.querySelectorAll('.art-official-rate');
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].getAttribute('data-art-done')) {
        nodes[i].setAttribute('data-art-done', '1');
        load(nodes[i]);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.AllRatesTodayOfficialRates = { init: init };
})();
