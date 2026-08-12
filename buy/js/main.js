/* Hotel Dilley Grand — deal site JS. No dependencies. */
(function () {
  'use strict';

  var T12_NOI = 69333; // T12 NOI (Aug 2025 - Jul 2026), owner P&L

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var fmtUSD = function (n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  };

  /* ---------- DSCR calculator ---------- */
  var calc = $('#dscr-calc');
  if (calc) {
    var price = $('#c-price'), down = $('#c-down'), rate = $('#c-rate'), amort = $('#c-amort');

    var update = function () {
      var p = +price.value, d = +down.value / 100, r = +rate.value / 100 / 12, n = +amort.value * 12;
      var loan = p * (1 - d);
      var pmt = r > 0 ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
      var annual = pmt * 12;
      var dscr = T12_NOI / annual;
      var cash = (T12_NOI - annual) / 12;

      $('#o-price').textContent = fmtUSD(p);
      $('#o-down').textContent = down.value + '%';
      $('#o-rate').textContent = (+rate.value).toFixed(2) + '%';
      $('#o-amort').textContent = amort.value + ' yr';
      $('#o-downdollar').textContent = fmtUSD(p * d);
      $('#o-loan').textContent = fmtUSD(loan);
      $('#o-payment').textContent = fmtUSD(pmt) + '/mo';
      $('#o-annual').textContent = fmtUSD(annual);
      $('#o-cash').textContent = fmtUSD(cash) + '/mo';
      $('#o-dscr').textContent = dscr.toFixed(2);
      var flag = $('#o-dscr-flag');
      if (dscr >= 1.25) { flag.textContent = 'clears typical 1.25 minimum'; flag.className = 'dscr-flag ok'; }
      else { flag.textContent = 'below typical 1.25 minimum'; flag.className = 'dscr-flag tight'; }
    };

    [price, down, rate, amort].forEach(function (el) {
      el.addEventListener('input', function () {
        $$('.preset', calc).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        update();
      });
    });

    $$('.preset', calc).forEach(function (btn) {
      btn.addEventListener('click', function () {
        price.value = btn.dataset.price;
        down.value = btn.dataset.down;
        rate.value = btn.dataset.rate;
        amort.value = btn.dataset.amort;
        $$('.preset', calc).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        update();
      });
    });

    update();
  }

  /* ---------- gallery lightbox ---------- */
  var lb = $('#lightbox');
  if (lb) {
    var links = $$('.gallery-grid a');
    var idx = 0;
    var img = $('#lb-img'), cap = $('#lb-cap');

    var show = function (i) {
      idx = (i + links.length) % links.length;
      var a = links[idx];
      img.src = a.getAttribute('href');
      img.alt = a.dataset.caption || '';
      cap.textContent = (idx + 1) + ' / ' + links.length + ' — ' + (a.dataset.caption || '');
    };

    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        show(i);
        lb.showModal();
      });
    });
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- lazy 3D tour ---------- */
  var tour = $('#tour-frame');
  if (tour) {
    var loadTour = function () {
      if (tour.dataset.loaded) return;
      tour.dataset.loaded = '1';
      var f = document.createElement('iframe');
      f.src = tour.dataset.src;
      f.title = '3D virtual tour of Hotel Dilley Grand';
      f.allow = 'fullscreen';
      f.loading = 'lazy';
      tour.appendChild(f);
      var btn = $('.tour-load', tour); if (btn) btn.remove();
      var poster = $('.tour-poster', tour); if (poster) poster.remove();
    };
    var btn = $('.tour-load', tour);
    if (btn) btn.addEventListener('click', loadTour);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { loadTour(); io.disconnect(); }
        });
      }, { rootMargin: '600px' });
      io.observe(tour);
    }
  }

  /* ---------- preserve UTM params on internal links ---------- */
  if (location.search && /utm_|gclid|fbclid/.test(location.search)) {
    $$('a[href^="/"]').forEach(function (a) {
      if (a.host === location.host && a.pathname !== location.pathname) {
        a.search = location.search;
      }
    });
    // carry attribution into the form
    var src = $('#f-source');
    if (src) src.value = location.search.slice(1);
  }

  /* ---------- funnel events (GA4 placeholder-safe) ---------- */
  var track = function (name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  };
  $$('a[href="#package"], a[href="/#package"]').forEach(function (a) {
    a.addEventListener('click', function () { track('cta_package_click', { location: a.dataset.loc || 'page' }); });
  });
  var form = $('form[name="buyer-inquiry"]');
  if (form) form.addEventListener('submit', function () { track('lead_form_submit'); });
})();
