/**
 * ═══════════════════════════════════════════════════
 *  FITGUM — TikTok Pixel  (Browser-side)
 *  Pixel ID : D1MFAIJC77U87UH7LNJ0
 *  Version  : 2026-06 | COD | Oman/GCC
 * ═══════════════════════════════════════════════════
 *
 *  HOW TO USE
 *  ──────────
 *  1. Add <script src="tiktok-pixel.js"></script> to every page <head>
 *     (after fitgum-config.js)
 *  2. Call window.FGPixel.<event>() at the right moment (see each page)
 *
 *  EVENTS MATRIX
 *  ─────────────
 *  PageView          → auto on every page load
 *  ViewContent       → index.html  — fired once on load
 *  AddToCart         → index.html  — when user taps package card
 *  InitiateCheckout  → checkout.html — on page load OR order-form submit
 *  CompletePayment   → thank-you.html — on page load (COD = order placed)
 */

(function () {
  /* ─── CONFIG ─────────────────────────────────────── */
  var PIXEL_ID = 'D1MFAIJC77U87UH7LNJ0';

  /* ─── INJECT BASE PIXEL ───────────────────────────── */
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = w[t] = w[t] || [];
    ttq.methods = [
      "page","track","identify","instances","debug","on","off","once",
      "ready","alias","group","enableCookie","disableCookie",
      "holdConsent","revokeConsent","grantConsent"
    ];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e, n) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js",
          o = n && n.partner;
      ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r;
      ttq._t = ttq._t || {}; ttq._t[e] = +new Date;
      ttq._o = ttq._o || {}; ttq._o[e] = n || {};
      var s = document.createElement("script");
      s.type = "text/javascript"; s.async = !0;
      s.src = r + "?sdkid=" + e + "&lib=" + t;
      var a = document.getElementsByTagName("script")[0];
      a.parentNode.insertBefore(s, a);
    };
    ttq.load(PIXEL_ID);
    ttq.page();   /* ← PageView fires here on every page */
  }(window, document, 'ttq');

  /* ─── HELPERS ─────────────────────────────────────── */

  /** Generate unique event_id for dedup between browser & CAPI */
  function uid() {
    return 'fg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  }

  /** Simple SHA-256 hash (for phone/email advanced matching) */
  async function sha256(str) {
    if (!str) return '';
    try {
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str.trim().toLowerCase()));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return ''; }
  }

  /** Normalize phone → E.164-ish: strip spaces/dashes, keep + */
  function normPhone(p) {
    if (!p) return '';
    return p.replace(/[\s\-().]/g, '').replace(/^00/, '+');
  }

  /** Read URL param */
  function qp(key) {
    return new URLSearchParams(location.search).get(key) || '';
  }

  /** Safe log */
  function log(ev, data) {
    if (typeof console !== 'undefined') {
      console.log('%c[FGPixel] ' + ev, 'color:#EE1D52;font-weight:bold', data || '');
    }
  }

  /* ─── PRODUCTS CATALOG ────────────────────────────── */
  var PRODUCTS = {
    1: { id: 'fitgum-1x', name: 'فيتجوم — علبة واحدة',  price: 21 },
    2: { id: 'fitgum-2x', name: 'فيتجوم — علبتين',       price: 27 },
    3: { id: 'fitgum-3x', name: 'فيتجوم — 3 علبات',      price: 31 },
  };

  function getProduct(qty, price) {
    var q = parseInt(qty) || 1;
    var p = parseFloat(price) || (PRODUCTS[q] && PRODUCTS[q].price) || 21;
    var prod = PRODUCTS[q] || PRODUCTS[1];
    return {
      contents: [{ content_id: prod.id, content_name: prod.name, content_type: 'product', quantity: q, price: p }],
      currency: 'OMR',
      value: p
    };
  }

  /* ─── ADVANCED MATCHING ───────────────────────────── */
  async function identifyUser(phone, email) {
    var ph = normPhone(phone);
    var em = (email || '').trim().toLowerCase();
    try {
      var hPhone = ph ? await sha256(ph) : '';
      var hEmail = em ? await sha256(em) : '';
      if (hPhone || hEmail) {
        window.ttq.identify({ sha256_phone_number: hPhone, sha256_email: hEmail });
        log('identify', { sha256_phone_number: hPhone ? '✓ hashed' : '—', sha256_email: hEmail ? '✓ hashed' : '—' });
      }
    } catch (e) {}
  }

  /* ─── PUBLIC API ──────────────────────────────────── */
  window.FGPixel = {

    /**
     * ViewContent — call on landing page load
     * @param {number} qty  default selected qty
     * @param {number} price
     */
    viewContent: function (qty, price) {
      var evId = uid();
      var data = getProduct(qty || 2, price);
      data.event_id = evId;
      window.ttq.track('ViewContent', data);
      log('ViewContent', data);
    },

    /**
     * AddToCart — call when user taps a package
     * @param {number} qty
     * @param {number} price
     */
    addToCart: function (qty, price) {
      var evId = uid();
      var data = getProduct(qty, price);
      data.event_id = evId;
      window.ttq.track('AddToCart', data);
      log('AddToCart', data);
    },

    /**
     * InitiateCheckout — call when checkout form is shown / submitted
     * @param {number} qty
     * @param {number} price
     * @param {string} phone  optional — for advanced matching
     */
    initiateCheckout: function (qty, price, phone) {
      var evId = uid();
      var data = getProduct(qty, price);
      data.event_id = evId;
      if (phone) identifyUser(phone, '');
      window.ttq.track('InitiateCheckout', data);
      log('InitiateCheckout', data);
    },

    /**
     * Purchase / CompletePayment — call on thank-you page
     * COD model: order placed = conversion
     * @param {object} opts  { qty, price, phone, orderId }
     */
    purchase: function (opts) {
      opts = opts || {};
      var evId = uid();
      var data = getProduct(opts.qty || qp('qty') || 1, opts.price || qp('price'));
      data.event_id = evId;
      data.order_id  = opts.orderId || qp('orderId') || evId;

      /* Advanced matching with hashed phone */
      if (opts.phone || qp('phone')) {
        identifyUser(opts.phone || qp('phone'), opts.email || '');
      }

      /* Fire both Purchase + CompletePayment for max attribution */
      window.ttq.track('CompletePayment', data);
      window.ttq.track('Purchase', data);
      log('CompletePayment + Purchase', data);

      /* Store in sessionStorage to prevent duplicate on refresh */
      try {
        var key = 'fg_purchase_' + data.order_id;
        if (sessionStorage.getItem(key)) {
          log('DUPLICATE BLOCKED — already fired for order', data.order_id);
          return;
        }
        sessionStorage.setItem(key, '1');
      } catch (e) {}
    },

    /* Manual test triggers (used in pixel-test.html) */
    testAll: function () {
      this.viewContent(2, 27);
      setTimeout(() => this.addToCart(2, 27), 800);
      setTimeout(() => this.initiateCheckout(2, 27, ''), 1600);
      setTimeout(() => this.purchase({ qty: 2, price: 27, orderId: 'TEST-' + Date.now() }), 2400);
    }
  };

  /* ─── AUTO-FIRE PER PAGE ──────────────────────────── */
  var page = location.pathname.split('/').pop();

  if (page === '' || page === 'index.html') {
    /* ViewContent on landing page — small delay so ttq script loads */
    window.addEventListener('load', function () {
      setTimeout(function () { window.FGPixel.viewContent(2, 27); }, 1200);
    });
  }

  if (page === 'checkout.html') {
    window.addEventListener('load', function () {
      var qty   = qp('qty')   || localStorage.getItem('fg_qty')   || 2;
      var price = qp('price') || localStorage.getItem('fg_price') || 27;
      setTimeout(function () { window.FGPixel.initiateCheckout(qty, price); }, 800);
    });
  }

  if (page === 'thank-you.html') {
    window.addEventListener('load', function () {
      setTimeout(function () {
        window.FGPixel.purchase({
          qty:     qp('qty')     || localStorage.getItem('fg_qty')     || 1,
          price:   qp('price')   || localStorage.getItem('fg_price')   || 21,
          phone:   qp('phone')   || '',
          orderId: qp('orderId') || ''
        });
      }, 1000);
    });
  }

  log('Pixel loaded ✓ | ID: ' + PIXEL_ID + ' | page: ' + (page || 'index.html'));

})();
