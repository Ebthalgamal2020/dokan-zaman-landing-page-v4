/*
 * Dokan Zaman V4 — page behaviour (vanilla JS, no dependencies).
 * Built into main.min.js together with story.js and quote-form.js (`npm run build:js`).
 *
 *  1. Logo assembly clean-up (V1)
 *  2. Header state and mobile navigation
 *  3. Current-section highlight
 *  4. Category gallery (desktop stage + small-screen track)
 */
(function () {
  'use strict';

  var body = document.body;
  var wide = window.matchMedia('(min-width: 1024px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var AR = '٠١٢٣٤٥٦٧٨٩';
  var toArabic = function (s) { return String(s).replace(/[0-9]/g, function (d) { return AR[d]; }); };

  /* 1. Logo assembly (from V1): when every part has finished assembling, drop the
     animation entirely so the header shows the plain, untouched original SVG from then on. */
  var logo = document.querySelector('.logo-svg');
  if (logo) {
    var pending = logo.querySelectorAll('.lg').length;
    logo.addEventListener('animationend', function (event) {
      if (event.target.classList.contains('lg') && --pending === 0) {
        logo.classList.add('is-assembled');
      }
    });
  }

  /* 2. Header: turns white once the page scrolls. */
  var header = document.querySelector('[data-header]');
  if (header) {
    var headerTicking = false;
    var updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      headerTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!headerTicking) { headerTicking = true; window.requestAnimationFrame(updateHeader); }
    }, { passive: true });
    // First check in the next frame: reading scrollY while the page is still being laid out
    // would force the whole first layout synchronously inside this script.
    window.requestAnimationFrame(updateHeader);
  }

  /* Mobile navigation sheet: the rest of the page is inert while it is open. */
  (function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var sheet = document.getElementById('mobile-nav');
    var label = document.querySelector('[data-menu-label]');
    var behind = document.querySelectorAll('main, .site-footer');
    var desktopNav = window.matchMedia('(min-width: 1120px)');
    if (!toggle || !sheet) return;

    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'إغلاق القائمة' : 'فتح القائمة';
      if (open && header) sheet.style.setProperty('--sheet-top', header.getBoundingClientRect().bottom + 'px');
      sheet.hidden = !open;
      body.classList.toggle('menu-open', open);
      behind.forEach(function (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
      if (open) {
        var first = sheet.querySelector('a');
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', true);
    });
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false, false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
    });
    var onDesktop = function () { if (desktopNav.matches) setOpen(false, false); };
    if (desktopNav.addEventListener) desktopNav.addEventListener('change', onDesktop);
  })();

  /* 3. Current section in the navigation. */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var links = document.querySelectorAll('.nav-link, .mobile-nav__link');
    var ids = [];
    links.forEach(function (a) { var id = a.getAttribute('href').slice(1); if (ids.indexOf(id) === -1) ids.push(id); });
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var mark = function () {
      var current = null;
      sections.forEach(function (s) { if (visible[s.id]) current = s.id; });
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + current;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      mark();
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  })();

  /* 4. Category gallery.
     Desktop: rows on one side, the active category as a dimensional panel on the other.
     The active row follows the middle of the viewport (native scroll), pointer hover,
     keyboard focus, a click on the category name, or a #cat-NN link.
     Small screens: a swipeable track (native horizontal scroll) with numbered shortcuts. */
  (function () {
    var gallery = document.querySelector('[data-gallery]');
    if (!gallery) return;
    var rows = Array.prototype.slice.call(gallery.querySelectorAll('.cat'));
    var figs = Array.prototype.slice.call(gallery.querySelectorAll('[data-for]'));
    var count = gallery.querySelector('[data-stage-count]');
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-dot]'));
    var track = gallery.querySelector('[data-cats]');
    var current = null;
    var pinned = false;

    var activate = function (id) {
      if (!id || id === current) return;
      current = id;
      rows.forEach(function (r) {
        var on = r.getAttribute('data-cat') === id;
        r.classList.toggle('is-active', on);
        if (on) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current');
      });
      figs.forEach(function (f) { f.classList.toggle('is-active', f.getAttribute('data-for') === id); });
      dots.forEach(function (d) {
        var on = d.getAttribute('data-dot') === id;
        d.classList.toggle('is-active', on);
        if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      if (count) count.textContent = toArabic(id) + ' / ٠٩';
    };
    var rowFor = function (id) { return document.getElementById('cat-' + id); };
    var showCard = function (id) {
      var card = rowFor(id);
      if (!card || !track) return;
      // Scroll the track only (never the page sideways).
      var t = track.getBoundingClientRect();
      var c = card.getBoundingClientRect();
      track.scrollBy({ left: (c.left + c.width / 2) - (t.left + t.width / 2), behavior: reduce.matches ? 'auto' : 'smooth' });
    };

    if ('IntersectionObserver' in window) {
      var band = new IntersectionObserver(function (entries) {
        if (!wide.matches || pinned) return;
        entries.forEach(function (e) { if (e.isIntersecting) activate(e.target.getAttribute('data-cat')); });
      }, { rootMargin: '-45% 0px -54% 0px' });
      var inTrack = new IntersectionObserver(function (entries) {
        if (wide.matches) return;
        entries.forEach(function (e) { if (e.isIntersecting) activate(e.target.getAttribute('data-cat')); });
      }, { root: track, threshold: 0.6 });
      rows.forEach(function (r) { band.observe(r); inTrack.observe(r); });
    }

    rows.forEach(function (r) {
      r.addEventListener('pointerenter', function (e) {
        if (!wide.matches || e.pointerType !== 'mouse') return;
        pinned = false;
        activate(r.getAttribute('data-cat'));
      });
      r.addEventListener('focusin', function () { activate(r.getAttribute('data-cat')); });
    });
    gallery.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-cat-select]');
      if (!btn) return;
      var id = btn.getAttribute('data-cat-select');
      activate(id);
      if (wide.matches) pinned = true; else showCard(id);
    });
    dots.forEach(function (d) {
      d.addEventListener('click', function (e) {
        if (wide.matches) return;
        e.preventDefault();
        var id = d.getAttribute('data-dot');
        activate(id);
        showCard(id);
      });
    });
    // A pinned choice holds until the visitor scrolls on.
    var unpin = function () { pinned = false; };
    ['wheel', 'touchmove'].forEach(function (t) { window.addEventListener(t, unpin, { passive: true }); });
    window.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].indexOf(e.key) !== -1) unpin();
    });

    var fromHash = function () {
      var m = /^#cat-(\d{2})$/.exec(window.location.hash);
      if (!m) return false;
      activate(m[1]);
      pinned = wide.matches;
      if (!wide.matches) showCard(m[1]);
      return true;
    };
    window.addEventListener('hashchange', fromHash);
    if (!fromHash()) activate(rows.length ? rows[0].getAttribute('data-cat') : null);
  })();

  /* Footer year. */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
