/*
 * Dokan Zaman V4 — the supply box.
 *
 * Nothing here ever moves, snaps, smooths or blocks the page scroll. A and B READ the
 * scroll position and pose the box to match (one requestAnimationFrame per scroll event at
 * most, only while on screen); C is a short timed sequence that scrolling merely starts.
 *
 *  A. Story box (hero → categories): tape splits, flaps open one by one, the nine
 *     categories rise out in three waves and fan out beside their chapter text.
 *  B. Courier box (procurement): travels the six-stage track.
 *  C. Seal box (quote): plays once, 3.6 s — flaps close, then the tape seals.
 *
 * Motion runs only under html.motion (set in <head>: no reduced-motion preference and a
 * screen at least 520px tall). Otherwise the CSS static poses apply: the story box open
 * with the first wave out, the courier box at the end of the track, the seal box closed.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var MOTION_QUERY = '(prefers-reduced-motion: no-preference) and (min-height: 520px)';
  var motionQuery = window.matchMedia(MOTION_QUERY);
  var wide = window.matchMedia('(min-width: 1024px)');
  var trackWide = window.matchMedia('(min-width: 768px)');

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var seg = function (t, a, b) { return clamp((t - a) / (b - a), 0, 1); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var OPEN = -118; // flap angle when fully open (degrees); closed is 90
  var flapAngle = function (t) { return lerp(90, OPEN, ease(t)); };
  var on = function () { return root.classList.contains('motion'); };

  var jobs = [];
  var ticking = false;
  var frame = function () {
    ticking = false;
    if (!on()) return;
    for (var i = 0; i < jobs.length; i++) jobs[i]();
  };
  var schedule = function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(frame); }
  };
  var watch = function (el, flag) {
    if (!('IntersectionObserver' in window)) { flag.v = true; return; }
    new IntersectionObserver(function (entries) {
      flag.v = entries[0].isIntersecting;
      if (flag.v) schedule();
    }, { rootMargin: '10% 0px' }).observe(el);
  };
  var resets = [];

  /* ------------------------------------------------------------ A. Story box */
  (function () {
    var story = document.querySelector('[data-story]');
    if (!story) return;
    var stage = story.querySelector('[data-story-stage]');
    var body = stage.querySelector('[data-box-body]');
    var front = body.querySelector('.bx--front');
    var cut = body.querySelector('[data-cut]');
    var flaps = {};
    body.querySelectorAll('[data-flap]').forEach(function (f) { flaps[f.getAttribute('data-flap')] = f; });
    var items = Array.prototype.slice.call(body.querySelectorAll('[data-item]'));
    var chapters = {};
    story.querySelectorAll('[data-chapter]').forEach(function (c) { chapters[c.getAttribute('data-chapter')] = c; });
    var visible = { v: true };
    watch(story, visible);

    // How far the focus line has travelled through a chapter (0 before it, 1 after it).
    var through = function (el, focus) {
      var r = el.getBoundingClientRect();
      return clamp((focus - r.top) / r.height, 0, 1);
    };

    var render = function () {
      if (!visible.v) return;
      var W = front.offsetWidth;
      if (!W) return;
      var vh = window.innerHeight;
      var focus;
      if (wide.matches) {
        focus = vh * 0.55;
      } else {
        var stageBottom = stage.getBoundingClientRect().bottom;
        focus = stageBottom + (vh - stageBottom) * 0.4;
      }
      var tAbout = through(chapters.about, focus);
      var tOpen = through(chapters.open, focus);
      var tw = [through(chapters.wave1, focus), through(chapters.wave2, focus), through(chapters.wave3, focus)];

      // The box turns towards the visitor and tips forward so its inside can be seen.
      var a = ease(tAbout);
      var o = ease(tOpen);
      var drift = (tw[0] + tw[1] + tw[2]) / 3;
      var rx = lerp(lerp(-17, -25, a), -33, o);
      var ry = lerp(lerp(-36, -22, a), -12, o) + lerp(0, 9, drift);
      var ty = lerp(0, -0.05, a) * W;
      body.style.transform = 'translate3d(0,' + ty.toFixed(2) + 'px,0) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';

      // Tape splits along the seam, then the long flaps open, then the short ones.
      cut.style.transform = 'scaleX(' + seg(tAbout, 0.45, 0.95).toFixed(3) + ')';
      flaps.front.style.transform = 'rotateX(' + flapAngle(seg(tOpen, 0, 0.42)).toFixed(2) + 'deg)';
      flaps.back.style.transform = 'rotateX(' + flapAngle(seg(tOpen, 0.12, 0.55)).toFixed(2) + 'deg)';
      flaps.left.style.transform = 'rotateX(' + flapAngle(seg(tOpen, 0.36, 0.78)).toFixed(2) + 'deg)';
      flaps.right.style.transform = 'rotateX(' + flapAngle(seg(tOpen, 0.46, 0.9)).toFixed(2) + 'deg)';

      // Products: three waves of three. Each rises, turns to face the visitor, fans out
      // beside its chapter, then lifts away as the next wave comes up.
      var fanX = wide.matches ? 0.52 : 0.42;
      var riseY = wide.matches ? -0.8 : -0.7;
      var risenScale = wide.matches ? 0.72 : 0.62;
      items.forEach(function (el, i) {
        var k = Math.floor(i / 3);
        var j = i % 3;
        var t = tw[k];
        var rise = ease(seg(t, 0.04 + j * 0.08, 0.36 + j * 0.08));
        var fan = ease(seg(t, 0.3, 0.56));
        var exit = ease(seg(t, 0.8, 1));
        var zIn = (i / 8 - 0.5) * 0.3;
        var x = lerp(0, [fanX, 0, -fanX][j], fan);
        var y = lerp(0.03, riseY - (j === 1 ? 0.12 : 0) * fan, rise) - 0.42 * exit;
        var z = lerp(zIn, j === 1 ? 0.18 : 0.1, rise);
        var rY = -ry * rise;
        var rX = -rx * rise * 0.72;
        var rZ = [4, 0, -4][j] * fan;
        var s = lerp(0.78, risenScale, rise) * (1 - 0.18 * exit);
        el.style.transform = 'translate(-50%,-50%) translate3d(' + (x * W).toFixed(1) + 'px,' + (y * W).toFixed(1) + 'px,' + (z * W).toFixed(1) +
          'px) rotateY(' + rY.toFixed(2) + 'deg) rotateX(' + rX.toFixed(2) + 'deg) rotateZ(' + rZ.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
        el.style.opacity = exit > 0 ? (1 - exit).toFixed(3) : '';
        el.style.visibility = exit >= 1 ? 'hidden' : '';
      });
    };
    jobs.push(render);
    resets.push(function () {
      [body, cut].concat(items).forEach(function (el) { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
      Object.keys(flaps).forEach(function (k) { flaps[k].style.transform = ''; });
    });
  })();

  /* ------------------------------------------------------------ B. Courier box on the track */
  (function () {
    var cycle = document.querySelector('[data-cycle]');
    if (!cycle) return;
    var track = cycle.querySelector('[data-cycle-track]');
    var line = cycle.querySelector('.cycle__line');
    var fill = cycle.querySelector('[data-cycle-fill]');
    var box = cycle.querySelector('[data-cycle-box]');
    var steps = Array.prototype.slice.call(cycle.querySelectorAll('[data-step]'));
    var last = steps.length - 1;
    var visible = { v: true };
    watch(cycle, visible);

    var place = function (p) {
      var pos = p * last;
      var current = Math.min(last, Math.floor(pos + 0.02));
      steps.forEach(function (li, i) {
        li.classList.toggle('is-reached', i <= current);
        li.classList.toggle('is-current', i === current);
      });
      var t = track.getBoundingClientRect();
      var l = line.getBoundingClientRect();
      var rtl = getComputedStyle(track).direction === 'rtl';
      // Anchor of each stage on the line: its marker on wide screens, its centre when stacked.
      var anchors = steps.map(function (li) {
        var r = li.getBoundingClientRect();
        if (trackWide.matches) return (rtl ? r.right - 8 : r.left + 8) - t.left;
        return r.top + r.height / 2 - t.top;
      });
      var i = Math.min(last - 1, Math.floor(pos));
      var v = anchors[i] + (anchors[i + 1] - anchors[i]) * (pos - i);
      var a = Math.min(anchors[0], v);
      var b = Math.max(anchors[0], v);
      if (trackWide.matches) {
        var y = l.top + l.height / 2 - t.top;
        box.style.transform = 'translate3d(' + v.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        fill.style.left = a.toFixed(1) + 'px';
        fill.style.right = 'auto';
        fill.style.width = (b - a).toFixed(1) + 'px';
        fill.style.top = '';
        fill.style.height = '';
      } else {
        var x = l.left + l.width / 2 - t.left;
        box.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + v.toFixed(1) + 'px,0)';
        fill.style.top = a.toFixed(1) + 'px';
        fill.style.height = (b - a).toFixed(1) + 'px';
        fill.style.left = '';
        fill.style.right = '';
        fill.style.width = '';
      }
    };
    var progress = function () {
      var r = track.getBoundingClientRect();
      var vh = window.innerHeight;
      // 0 when the track's centre is at 82% of the viewport height, 1 when it reaches 32%.
      return clamp((vh * 0.82 - (r.top + r.height / 2)) / (vh * 0.5), 0, 1);
    };
    jobs.push(function () { if (visible.v) place(progress()); });
    // Without motion the courier box simply waits at the end of the track.
    resets.push(function () { place(1); });
    cycle.classList.add('has-js');
    // First placement in the next frame (measuring now would force layout during page load).
    window.requestAnimationFrame(function () { place(on() ? progress() : 1); });
    window.addEventListener('resize', function () { place(on() ? progress() : 1); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(on() ? progress() : 1); });
  })();

  /* ------------------------------------------------------------ C. Seal box at the quote
   * A timed sequence, not scroll-scrubbed, so it looks the same on every screen size and at
   * any scroll speed. It starts once, when the box is 60% on screen, and plays for 3.6 s:
   * the two short flaps fold in, a pause, the two long flaps close, a pause, then the orange
   * tape runs across the seam and down the sides. It never restarts or reverses; scrolling
   * only starts it and is never blocked. Timeline (share of SEAL_MS):
   *   left 0–.22 · right .06–.28 · back .34–.54 · front .50–.70 · tape .76–.98 */
  (function () {
    var section = document.querySelector('[data-quote-section]');
    if (!section) return;
    var holder = section.querySelector('.seal');
    var body = section.querySelector('[data-box-body]');
    if (!body || !holder) return;
    var SEAL_MS = 3600;
    var flaps = {};
    body.querySelectorAll('[data-flap]').forEach(function (f) { flaps[f.getAttribute('data-flap')] = f; });
    var tapesH = body.querySelectorAll('.bx-tape-h');
    var tapesV = body.querySelectorAll('.bx-tape-v');
    var state = 'idle'; // idle → playing → sealed
    var started = 0;

    var pose = function (p) {
      var close = function (a, b) { return lerp(OPEN, 90, ease(seg(p, a, b))); };
      flaps.left.style.transform = 'rotateX(' + close(0, 0.22).toFixed(2) + 'deg)';
      flaps.right.style.transform = 'rotateX(' + close(0.06, 0.28).toFixed(2) + 'deg)';
      flaps.back.style.transform = 'rotateX(' + close(0.34, 0.54).toFixed(2) + 'deg)';
      flaps.front.style.transform = 'rotateX(' + close(0.5, 0.7).toFixed(2) + 'deg)';
      var seal = ease(seg(p, 0.76, 0.98));
      tapesH.forEach(function (t) { t.style.transform = 'scaleX(' + seal.toFixed(3) + ')'; });
      tapesV.forEach(function (t) { t.style.transform = 'scaleY(' + seal.toFixed(3) + ')'; });
      var e = ease(p);
      body.style.transform = 'rotateX(' + lerp(-32, -20, e).toFixed(2) + 'deg) rotateY(' + lerp(-14, -34, e).toFixed(2) + 'deg)';
    };
    var tick = function (now) {
      if (state !== 'playing') return;
      if (!started) started = now;
      var p = Math.min(1, (now - started) / SEAL_MS);
      pose(p);
      if (p < 1) window.requestAnimationFrame(tick);
      else { state = 'sealed'; holder.setAttribute('data-sealed', ''); }
    };
    var play = function () {
      if (state !== 'idle' || !on()) return;
      state = 'playing';
      started = 0;
      window.requestAnimationFrame(tick);
    };

    if (on()) pose(0); // arrives open (the CSS open pose, written explicitly)
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        play();
        if (state !== 'idle') io.disconnect();
      }, { threshold: 0.6 });
      io.observe(holder);
    } else {
      state = 'sealed';
      pose(1);
    }
    // Reduced motion / short screen: no sequence — the CSS closed, sealed pose shows at once.
    resets.push(function () {
      state = 'sealed';
      body.style.transform = '';
      Object.keys(flaps).forEach(function (k) { flaps[k].style.transform = ''; });
      Array.prototype.forEach.call(tapesH, function (t) { t.style.transform = ''; });
      Array.prototype.forEach.call(tapesV, function (t) { t.style.transform = ''; });
    });
  })();

  /* ------------------------------------------------------------ Wiring */
  var sync = function () {
    root.classList.toggle('motion', motionQuery.matches);
    if (!motionQuery.matches) resets.forEach(function (fn) { fn(); });
    schedule();
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', sync);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  sync();
})();
