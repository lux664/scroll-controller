/*
 * Scroll Controller — reels-blocker.js
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
   * SELECTORS — what gets hidden
   * ------------------------------------------------------------------ */

  // Navigation entries that lead to Reels. Their wrapper is hidden too,
  // so the tab disappears without leaving an empty gap.
  var NAV_LINK_SELECTORS = [
    'a[href="/reels/"]',            // Reels tab in the bottom bar / side bar
    'a[href^="/reels/"]',           // any /reels/... link (Reels feed, audio pages)
    'a[href$="/reels/"]'            // "Reels" tab on a profile page: /<user>/reels/
  ];

  // Links to a single Reel (feed, Explore grid, DMs, profiles).
  var REEL_LINK_SELECTORS = [
    'a[href^="/reel/"]',            // /reel/<code>/
    'a[href*="instagram.com/reel/"]',
    'a[href*="instagram.com/reels/"]'
  ];

  var ALL_LINKS = NAV_LINK_SELECTORS.concat(REEL_LINK_SELECTORS).join(',');

  var CSS = [
    // 1. The links themselves.
    ALL_LINKS + '{display:none !important;}',
    // 2. Elements the observer below marked as "only holds a Reels link".
    '[' + HIDDEN_ATTR + ']{display:none !important;}',
    // 3. Home-feed posts that are Reels: hide the whole post, not just its link,
    //    so the video doesn't keep playing. (:has() is supported by iOS 16+ Safari
    //    and current Android WebView; older engines simply ignore this line.)
    'article:has(a[href^="/reel/"]){display:none !important;}'
  ].join('\n');

  /* ------------------------------------------------------------------ *
   * PATH RULES — which URLs count as "Reels pages"
   * ------------------------------------------------------------------ */

  // Returns where to send the user instead, or null if the path is fine.
  function redirectTargetFor(path) {
    if (/^\/reels?(\/|$)/.test(path)) return '/';              // /reels/, /reel/<code>/
    var m = path.match(/^\/([^\/]+)\/reels\/?$/);              // /<user>/reels/
    if (m) return '/' + m[1] + '/';
    return null;
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

  function checkLocation() {
    if (!enabled) return;
    var target = redirectTargetFor(location.pathname);
    if (target && target !== location.pathname) location.replace(target);
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

  // Instagram is a single-page app: catch in-app navigation too.
  function wrapHistory(name) {
    var original = history[name];
    history[name] = function () {
      var result = original.apply(this, arguments);
      checkLocation();
      return result;
    };
  }
  wrapHistory('pushState');
  wrapHistory('replaceState');
  window.addEventListener('popstate', checkLocation);

  // As Instagram re-renders the page: make sure our <style> is still there
  // and re-mark wrappers (batched to once per frame).
  var scheduled = false;
  var observer = new MutationObserver(function () {
    if (!enabled) return;
    addStyle();
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      markWrappers();
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
