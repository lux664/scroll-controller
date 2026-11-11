/*
 * Scroll Controller: reels-blocker.js
 *
 * The one script both apps (Android and iOS) inject into instagram.com.
 * It hides Reels and keeps you out of Reels pages. Nothing else.
 *
 * How the native apps talk to it:
 *   - Before this script runs, the app sets  window.__SC_ENABLED = true/false
 *   - Later, the toggle calls               window.__scrollController.setEnabled(true/false)
 *
 * IMPORTANT for contributors: Instagram's CSS class names are random and change
 * all the time, so every rule here matches links by their URL (href) instead.
 * When Instagram changes its site and Reels come back, the fix almost always
 * belongs in the SELECTORS / PATH RULES sections below.
 *
 * No dependencies, no network requests, no data collected.
 */
(function () {
  'use strict';

  // If the script is injected twice (Android fallback path), just re-apply state.
  if (window.__scrollController) {
    window.__scrollController.setEnabled(window.__SC_ENABLED !== false);
    return;
  }

  var enabled = window.__SC_ENABLED !== false; // default: on
  var STYLE_ID = '__sc-reels-style';
  var HIDDEN_ATTR = 'data-sc-hidden';

  /* ------------------------------------------------------------------ *
   * SELECTORS: what gets hidden
   * ------------------------------------------------------------------ */

  // Navigation entries that lead to Reels. Their wrapper is hidden too,
  // so the tab disappears without leaving an empty gap.
  // Checked against logged-in mobile instagram.com, November 2026.
  var NAV_LINK_SELECTORS = [
    'a[href="/reels/"]',            // Reels tab in the bottom bar
    'a[href^="/reels/"]',           // /reels/audio/<id>/ ("Original audio" under Reel posts)
    'a[href$="/reels/"]',           // "Reels" tab on a profile page: /<user>/reels/
    'a[href*="instagram.com/reels/"]'
  ];

  // Links to a single Reel. Instagram uses two shapes:
  //   /<user>/reel/<code>/  (home feed, the timestamp link on a Reel post)
  //   /reel/<code>/         (shared links, DMs, Explore)
  // "/reel/" with both slashes doesn't match usernames that contain "reel".
  var REEL_LINK_SELECTORS = [
    'a[href*="/reel/"]'
  ];

  var ALL_LINKS = NAV_LINK_SELECTORS.concat(REEL_LINK_SELECTORS).join(',');

  var CSS = [
    // 1. The links themselves.
    ALL_LINKS + '{display:none !important;}',
    // 2. Elements the observer below marked as "only holds a Reels link".
    '[' + HIDDEN_ATTR + ']{display:none !important;}',
    // 3. Home-feed posts that are Reels: hide the whole post instead of only its link,
    //    so the video doesn't keep playing. (:has() is supported by iOS 16+ Safari
    //    and current Android WebView; older engines simply ignore this line.)
    'article:has(a[href*="/reel/"]){display:none !important;}'
  ].join('\n');

  /* ------------------------------------------------------------------ *
   * PATH RULES: which URLs count as "Reels pages"
   * ------------------------------------------------------------------ */

  // Returns where to send the user instead, or null if the path is fine.
  function redirectTargetFor(path) {
    if (/^\/reels?(\/|$)/.test(path)) return '/';              // /reels/, /reel/<code>/
    if (/^\/[^\/]+\/reel\//.test(path)) return '/';            // /<user>/reel/<code>/
    var m = path.match(/^\/([^\/]+)\/reels\/?$/);              // /<user>/reels/
    if (m) return '/' + m[1] + '/';
    return null;
  }

  /* ------------------------------------------------------------------ *
   * REEL VIEWER: Reels that open without changing the address
   * ------------------------------------------------------------------ */

  // Tapping a Reel inside a chat opens a swipeable Reels viewer in place.
  // The address stays /direct/t/<id>/, so the path rules never see it.
  // (On desktop layouts it opens as /p/<code>/ in a dialog instead.)
  // We recognise the viewer by what it shows: a video taller than most of
  // the screen, plus at least one Reel audio link (/reels/audio/<id>/).
  // Photos and personal videos sent in chats have no audio link.
  // The check only runs on chat pages and single-post pages, which is where
  // this viewer has been seen. The home feed and stories are left alone
  // (stories are full screen too and can have music).
  var VIEWER_PAGES = /^\/(direct|p)\//;
  var VIEWER_MIN_HEIGHT = 0.75;  // share of the window height
  var AUDIO_LINK = 'a[href^="/reels/audio/"]';

  function reelViewerIsOpen() {
    if (!VIEWER_PAGES.test(location.pathname)) return false;
    if (!document.querySelector(AUDIO_LINK)) return false;
    var videos = document.getElementsByTagName('video');
    var minHeight = window.innerHeight * VIEWER_MIN_HEIGHT;
    for (var i = 0; i < videos.length; i++) {
      var r = videos[i].getBoundingClientRect();
      if (r.height >= minHeight && r.bottom > 0 && r.top < window.innerHeight) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ *
   * Implementation
   * ------------------------------------------------------------------ */

  // At document start even <html> may not exist yet. In that case this does
  // nothing, and the MutationObserver below calls it again as soon as it can.
  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var parent = document.head || document.documentElement;
    if (!parent) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    parent.appendChild(style);
  }

  function removeStyle() {
    var style = document.getElementById(STYLE_ID);
    if (style) style.remove();
  }

  var leaving = false;

  // Stop any playing video and load the target page.
  function leaveTo(target) {
    if (leaving) return;
    leaving = true;
    var videos = document.getElementsByTagName('video');
    for (var i = 0; i < videos.length; i++) {
      try { videos[i].pause(); videos[i].muted = true; } catch (e) {}
    }
    location.replace(target);
  }

  function checkLocation() {
    if (!enabled) return;
    var target = redirectTargetFor(location.pathname);
    if (target && target !== location.pathname) leaveTo(target);
  }

  function checkViewer() {
    if (enabled && reelViewerIsOpen()) leaveTo('/');
  }

  // Walk up from a nav link and mark wrappers that hold nothing else,
  // so the tab vanishes without leaving a blank slot. Stops at 4 levels or
  // as soon as a wrapper contains other content.
  function markWrappers() {
    if (!enabled) return;
    var links = document.querySelectorAll(NAV_LINK_SELECTORS.join(','));
    for (var i = 0; i < links.length; i++) {
      var el = links[i];
      for (var depth = 0; depth < 4; depth++) {
        var parent = el.parentElement;
        if (!parent || parent === document.body) break;
        if (parent.children.length !== 1) break;
        parent.setAttribute(HIDDEN_ATTR, '');
        el = parent;
      }
    }
  }

  function unmarkWrappers() {
    var marked = document.querySelectorAll('[' + HIDDEN_ATTR + ']');
    for (var i = 0; i < marked.length; i++) marked[i].removeAttribute(HIDDEN_ATTR);
  }

  // Instagram is a single-page app, so most page changes don't reload.
  // Three layers catch them, because Instagram has used each of these:

  // 1. History API. Wrapped on the prototype, so calls that go through
  //    History.prototype.pushState directly are caught too.
  function wrapHistory(name) {
    var proto = window.History && History.prototype;
    var target = proto && proto[name] ? proto : history;
    var original = target[name];
    target[name] = function () {
      var result = original.apply(this, arguments);
      checkLocation();
      return result;
    };
  }
  wrapHistory('pushState');
  wrapHistory('replaceState');
  window.addEventListener('popstate', checkLocation);

  // 2. Navigation API (current Safari and Chrome). Stops a Reels navigation
  //    before Instagram renders anything, when the browser allows it.
  if (window.navigation && window.navigation.addEventListener) {
    window.navigation.addEventListener('navigate', function (event) {
      if (!enabled) return;
      var path;
      try { path = new URL(event.destination.url).pathname; } catch (e) { return; }
      var target = redirectTargetFor(path);
      if (!target) return;
      if (event.cancelable) event.preventDefault();
      setTimeout(function () { leaveTo(target); }, 0);
    });
  }

  // 3. A light check twice a second, in case a change slips past both.
  setInterval(function () {
    checkLocation();
    checkViewer();
  }, 500);

  // As Instagram re-renders the page: make sure our <style> is still there,
  // re-mark wrappers and look for a Reel viewer (batched to once per frame).
  var scheduled = false;
  var observer = new MutationObserver(function () {
    if (!enabled) return;
    addStyle();
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      markWrappers();
      checkViewer();
    });
  });

  function startObserver() {
    // Observe `document` itself: it exists even before <html> does.
    observer.observe(document, { childList: true, subtree: true });
  }

  function setEnabled(value) {
    enabled = !!value;
    window.__SC_ENABLED = enabled;
    if (enabled) {
      addStyle();
      markWrappers();
      checkLocation();
      checkViewer();
    } else {
      removeStyle();
      unmarkWrappers();
    }
  }

  window.__scrollController = { setEnabled: setEnabled };

  startObserver();
  setEnabled(enabled);
  document.addEventListener('DOMContentLoaded', function () { setEnabled(enabled); });
})();
