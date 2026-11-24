/*
 * Ingress-Shim für die KX-Bridge-UI.
 *
 * Die UI spricht die Bridge über absolute Pfade (/kx/..., /api/...) und bei
 * mehreren Druckern über absolute URLs (http://kx-bridge.ingress:<port>) an.
 * Hinter Home-Assistant-Ingress liegt die UI aber unter
 * /api/hassio_ingress/<token>/. Dieser Shim schreibt alle URLs, die die UI zur
 * Laufzeit verwendet, auf den Ingress-Pfad um.
 *
 * ROOT = Ingress-Pfad, BASE = ROOT oder ROOT/_p/<port> (Instanz dieser Seite).
 */
(function () {
  'use strict';
  var cfg = window.__kxIngress;
  if (!cfg || !cfg.root) { return; }
  var ROOT = cfg.root.replace(/\/+$/, '');
  var BASE = (cfg.base || ROOT).replace(/\/+$/, '');
  var BRIDGE = /^(?:https?|wss?):\/\/kx-bridge\.ingress(?::(\d+))?(?=[\/?#]|$)/;
  var ORIGIN = window.location.origin;
  var WS_ORIGIN = ORIGIN.replace(/^http/, 'ws');

  function fix(u) {
    if (u && typeof u === 'object' && typeof u.href === 'string' && !u.tagName) { u = u.href; }
    if (typeof u !== 'string') { return u; }
    var m = BRIDGE.exec(u);
    if (m) { return ROOT + '/_p/' + (m[1] || '7125') + u.slice(m[0].length); }
    if (u.indexOf(ORIGIN + '/') === 0) { return ORIGIN + fix(u.slice(ORIGIN.length)); }
    if (u.charAt(0) === '/' && u.charAt(1) !== '/' && u !== ROOT && u.indexOf(ROOT + '/') !== 0) {
      return BASE + u;
    }
    return u;
  }

  function fixWs(u) {
    if (u && typeof u === 'object' && typeof u.href === 'string') { u = u.href; }
    if (typeof u !== 'string') { return u; }
    var m = BRIDGE.exec(u);
    if (m) { return WS_ORIGIN + ROOT + '/_p/' + (m[1] || '7125') + u.slice(m[0].length); }
    if (u.indexOf(WS_ORIGIN + '/') === 0) { return WS_ORIGIN + fix(u.slice(WS_ORIGIN.length)); }
    if (u.charAt(0) === '/') { return WS_ORIGIN + fix(u); }
    return u;
  }

  // Die UI liest den Drucker-Index aus "^/printer<N>$". Hinter Ingress steht
  // der Ingress-Pfad davor, deshalb wird der Index hier fest vorgegeben.
  var pm = window.location.pathname.match(/\/printer(\d+)\/?$/);
  if (pm) {
    var printerIndex = parseInt(pm[1], 10);
    try {
      Object.defineProperty(window, '_printerIndex', {
        configurable: true,
        get: function () { return printerIndex; },
        set: function () { /* Wert der UI ignorieren */ }
      });
    } catch (e) { /* dann bleibt es beim Verhalten der UI */ }
  }

  if (window.fetch) {
    var origFetch = window.fetch;
    window.fetch = function (input, init) {
      if (typeof input === 'string' || (input && !input.method && typeof input.href === 'string')) {
        input = fix(input);
      }
      return origFetch.call(this, input, init);
    };
  }

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    var args = Array.prototype.slice.call(arguments);
    args[1] = fix(url);
    return origOpen.apply(this, args);
  };

  function wrapCtor(name, fixer) {
    var Orig = window[name];
    if (!Orig) { return; }
    var Wrapped = function (url, opts) {
      return arguments.length > 1 ? new Orig(fixer(url), opts) : new Orig(fixer(url));
    };
    Wrapped.prototype = Orig.prototype;
    ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function (k) {
      if (k in Orig) { Wrapped[k] = Orig[k]; }
    });
    window[name] = Wrapped;
  }
  wrapCtor('EventSource', fix);
  wrapCtor('WebSocket', fixWs);

  var origWindowOpen = window.open;
  window.open = function (url) {
    var args = Array.prototype.slice.call(arguments);
    if (args.length) { args[0] = fix(url); }
    return origWindowOpen.apply(window, args);
  };

  // Zuweisungen wie img.src = '/api/camera/stream' oder a.href = '/kx/...'.
  function patchProp(ctorName, prop) {
    var C = window[ctorName];
    if (!C) { return; }
    var d = Object.getOwnPropertyDescriptor(C.prototype, prop);
    if (!d || !d.set || !d.configurable) { return; }
    Object.defineProperty(C.prototype, prop, {
      configurable: true,
      enumerable: d.enumerable,
      get: d.get,
      set: function (v) { d.set.call(this, fix(v)); }
    });
  }
  [['HTMLImageElement', 'src'], ['HTMLScriptElement', 'src'], ['HTMLIFrameElement', 'src'],
   ['HTMLMediaElement', 'src'], ['HTMLSourceElement', 'src'], ['HTMLAnchorElement', 'href'],
   ['HTMLLinkElement', 'href'], ['HTMLFormElement', 'action']].forEach(function (p) {
    patchProp(p[0], p[1]);
  });

  var URL_ATTRS = { src: 1, href: 1, action: 1 };
  var origSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    if (typeof name === 'string' && URL_ATTRS[name.toLowerCase()] === 1) { value = fix(value); }
    return origSetAttribute.call(this, name, value);
  };

  // Per innerHTML erzeugte Elemente (z. B. die Drucker-Auswahl).
  function fixElement(el) {
    if (!el || el.nodeType !== 1) { return; }
    for (var a in URL_ATTRS) {
      if (el.hasAttribute(a)) {
        var v = el.getAttribute(a);
        var f = fix(v);
        if (f !== v) { origSetAttribute.call(el, a, f); }
      }
    }
  }
  if (window.MutationObserver) {
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === 'attributes') { fixElement(r.target); continue; }
        for (var j = 0; j < r.addedNodes.length; j++) {
          var n = r.addedNodes[j];
          if (n.nodeType !== 1) { continue; }
          fixElement(n);
          var all = n.querySelectorAll('[src],[href],[action]');
          for (var k = 0; k < all.length; k++) { fixElement(all[k]); }
        }
      }
    }).observe(document, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'href', 'action']
    });
  }
})();
