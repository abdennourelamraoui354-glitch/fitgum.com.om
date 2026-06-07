/**
 * ═══════════════════════════════════════════════════
 *  FITGUM — TikTok Pixel
 *  Pixel ID : D1MFAIJC77U87UH7LNJ0
 *  Version  : 2026-06-v3 | COD | Oman/GCC
 * ═══════════════════════════════════════════════════
 *
 *  Events per page:
 *  index.html     → PageView, ViewContent, AddToCart
 *  checkout.html  → PageView, InitiateCheckout (on form submit only)
 *  thank-you.html → PageView, CompletePayment
 */

(function () {
  var PIXEL_ID = 'D1MFAIJC77U87UH7LNJ0';

  /* ─── INJECT BASE PIXEL ─────────────────────────── */
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
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
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
    ttq.page();
  }(window, document, 'ttq');

  /* ─── HELPERS ───────────────────────────────────── */

  function uid() {
    return 'fg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  }

  async function sha256(str) {
    if (!str) return '';
    try {
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str.trim().toLowerCase()));
      return Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) { return ''; }
  }

  function normPhone(p) {
    if (!p) return '';
    return p.replace(/[\s\-().]/g, '').replace(/^00/, '+');
  }

  function qp(key) {
    return new URLSearchParams(location.search).get(key) || '';
  }

  function log(ev, data) {
    if (typeof console !== 'undefined') {
      console.log('%c[FGPixel] ' + ev, 'color:#EE1D52;font-weight:bold', data || '');
    }
  }

  /* Check & set dedup flag — returns true if ALREADY fired (duplicate) */
  function isDuplicate(key, persistent) {
    try {
      var store = persistent ? localStorage : sessionStorage;
      if (store.getItem(key)) return true;
      store.setItem(key, '1');
      return false;
    } catch (e) { return false; }
  }

  /* ─── PRODUCTS CATALOG ──────────────────────────── */
  var PRODUCTS = {
    1: { id: 'fitgum-1x', name: 'فيتجوم — علبة واحدة', price: 21, units: 1 },
    2: { id: 'fitgum-2p1', name: 'فيتجوم — 2+1 مجاناً', price: 29, units: 3 },
    3: { id: 'fitgum-3p2', name: 'فيتجوم — 3+2 مجاناً', price: 33, units: 5 },
  };

  function getProduct(packId, price) {
    var q = parseInt(packId) || 2;
    var prod = PRODUCTS[q] || PRODUCTS[1];
    var p = parseFloat(price) || prod.price;
    var units = prod.units || 1;
    return {
      contents: [{ content_id: prod.id, content_name: prod.name, content_type: 'product', quantity: units, price: p }],
      currency: 'OMR',
      value: p
    };
  }

  /* ─── ADVANCED MATCHING ─────────────────────────── */
  async function identifyUser(phone) {
    var ph = normPhone(phone);
    if (!ph) return;
    try {
      var hPhone = await sha256(ph);
      if (hPhone) {
        window.ttq.identify({ sha256_phone_number: hPhone });
        log('identify', 'phone hashed ✓');
      }
    } catch (e) {}
  }

  /* ─── PUBLIC API ────────────────────────────────── */
  window.FGPixel = {

    viewContent: function (qty, price) {
      if (isDuplicate('fg_vc_' + location.pathname)) return;
      var data = getProduct(qty || 2, price);
      data.event_id = uid();
      window.ttq.track('ViewContent', data);
      log('ViewContent', data);
    },

    addToCart: function (qty, price) {
      var data = getProduct(qty, price);
      data.event_id = uid();
      window.ttq.track('AddToCart', data);
      log('AddToCart', data);
    },

    /* Call ONCE — on checkout form submit only */
    initiateCheckout: function (qty, price, phone) {
      if (isDuplicate('fg_ic_' + (qty || '') + '_' + location.pathname)) return;
      var data = getProduct(qty, price);
      data.event_id = uid();
      window.ttq.track('InitiateCheckout', data);
      log('InitiateCheckout', data);
      if (phone) identifyUser(phone);
    },

    /* Call on thank-you page — CompletePayment = COD conversion event */
    purchase: function (opts) {
      opts = opts || {};
      var orderId = opts.orderId || qp('orderId') || '';
      var phone   = opts.phone   || qp('phone')   || '';

      /* Only fire for real orders — need orderId + phone from checkout redirect */
      if (!orderId || !phone) {
        log('CompletePayment SKIPPED (missing orderId/phone)', { orderId: orderId, phone: phone });
        return;
      }

      /* Persistent dedup — survives refresh/new tab */
      if (isDuplicate('fg_cp_' + orderId, true)) {
        log('CompletePayment BLOCKED (duplicate)', orderId);
        return;
      }

      var qty   = opts.qty   || qp('qty')   || 1;
      var price = opts.price || qp('price')  || 21;
      var data  = getProduct(qty, price);
      data.event_id = uid();
      data.order_id = orderId;

      identifyUser(phone);

      /* CompletePayment only — the correct COD conversion event for TikTok */
      window.ttq.track('CompletePayment', data);
      log('CompletePayment', data);
    },

    testAll: function () {
      /* Clear session flags before test */
      try {
        Object.keys(sessionStorage).filter(function(k){ return k.startsWith('fg_'); }).forEach(function(k){ sessionStorage.removeItem(k); });
      } catch(e) {}
      this.viewContent(2, 29);
      setTimeout(function() { window.FGPixel.addToCart(2, 29); }, 800);
      setTimeout(function() { window.FGPixel.initiateCheckout(2, 29, ''); }, 1600);
      setTimeout(function() { window.FGPixel.purchase({ qty: 2, price: 29, orderId: 'TEST-' + Date.now() }); }, 2400);
    }
  };

  /* ─── AUTO-FIRE PER PAGE ────────────────────────── */
  var page = location.pathname.split('/').pop() || 'index.html';

  /* index.html: ViewContent on load */
  if (page === '' || page === 'index.html') {
    window.addEventListener('load', function () {
      setTimeout(function () {
        window.FGPixel.viewContent(2, 29);
      }, 800);
    });
  }

  /* checkout.html: InitiateCheckout fires from checkout.html form submit — NOT here */

  /* thank-you.html: CompletePayment on load */
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

  log('Pixel loaded ✓ | ID: ' + PIXEL_ID + ' | page: ' + page);

})();
