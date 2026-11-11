# How it works

Scroll Controller is a small native app around a web view. The web view loads `https://www.instagram.com/`, and before Instagram's own code runs, the app injects one JavaScript file, [`shared/reels-blocker.js`](../shared/reels-blocker.js). That script does all the hiding. The native code on each platform is mostly plumbing: login persistence, the switch, file uploads and opening outside links.

The app never touches the real Instagram app and can't read anything outside its own web view.

## The script

### Starting state and the switch

Before the script, the app injects one line with the saved setting:

```js
window.__SC_ENABLED = true; // or false
```

The script reads it on start and exposes a single function:

```js
window.__scrollController.setEnabled(true | false);
```

The switch in the top bar calls this function, so turning Reels on or off takes effect without reloading the page. The app also re-registers the starting line so the next page load begins in the right state.

### Finding Reels by address

Instagram's CSS class names are generated and change constantly, so the script ignores them. It looks for links by where they point:

| Selector | What it matches |
|---|---|
| `a[href="/reels/"]` | The Reels tab in the bottom bar |
| `a[href^="/reels/"]` | Other `/reels/...` links, such as the "Original audio" link under a Reel |
| `a[href$="/reels/"]` | The Reels tab on a profile (`/<user>/reels/`) |
| `a[href*="instagram.com/reels/"]` | Full links to the Reels page |
| `a[href*="/reel/"]` | Links to a single Reel, both `/reel/<code>/` and `/<user>/reel/<code>/` |

Matching `/reel/` with a slash on both sides keeps usernames that contain "reel" from being caught.

### How hiding works

The script adds one `<style>` element with three kinds of rules:

1. The matching links get `display: none`.
2. Home feed posts that contain a Reel link are hidden as a whole, using `article:has(a[href*="/reel/"])`. Hiding the whole post stops the video from playing in the background.
3. Wrappers marked by the script (see below) are hidden.

The Reels tab is wrapped in several layers of `div`s. Hiding only the link would leave an empty slot in the bottom bar, so the script walks up from the link and marks each parent that contains nothing else, up to four levels. A `MutationObserver` repeats this whenever Instagram re-renders the page, and puts the `<style>` element back if it ever goes missing.

Turning the switch off removes the `<style>` element and the markers, which brings everything back.

### Keeping you out of Reels pages

Instagram is a single-page app, so moving between pages usually happens without a real page load. The script wraps `history.pushState` and `history.replaceState` and listens for `popstate`. After each navigation it checks the address:

| Address | Sent to |
|---|---|
| `/reels/...` | `/` (home feed) |
| `/reel/<code>/` | `/` |
| `/<user>/reel/<code>/` | `/` |
| `/<user>/reels/` | `/<user>/` (their profile) |

The same check runs when the page first loads, which covers links opened from messages. It also runs when you turn the switch on while a Reels page is open.

Instagram has moved between page changes using `history.pushState`, the newer Navigation API and other routes, so the script watches all of them. It wraps `History.prototype` (so calls that skip the `history` object are caught), cancels Reels navigations through the Navigation API's `navigate` event where the browser allows it, and checks the address twice a second as a fallback.

### Reels opened from a chat

In the mobile layout, tapping a Reel that someone sent you opens a swipeable Reels viewer on top of the chat, and the address stays `/direct/t/<id>/`. On desktop layouts the same tap opens `/p/<code>/` in a dialog. Neither address looks like a Reel, so the script recognises the viewer by its content instead:

- on a chat page (`/direct/...`) or a single post (`/p/...`), a video on screen takes up at least 75% of the window height
- the page also contains a Reel audio link (`/reels/audio/<id>/`)

When both are true, the script pauses the videos and loads the home feed. Photos and personal videos sent in a chat have no audio link, so they open normally. The home feed and stories are never checked, since stories are full screen and can have music too.

### Injection timing

The script runs at document start, before Instagram's code. At that moment even the `<html>` element may not exist yet, so adding the style is retried until there's a place to put it.

## iPhone (`ios/`)

- SwiftUI app with a `WKWebView` wrapped in `UIViewRepresentable`. Minimum iOS 16.
- Two `WKUserScript`s at `.atDocumentStart`, main frame only: the state line, then the shared script loaded from the app bundle.
- `WKWebsiteDataStore.default()` keeps cookies, so the login survives restarts.
- A current mobile Safari user agent, so Instagram serves its usual mobile site.
- The switch is stored with `@AppStorage` and applied with `evaluateJavaScript`.
- Swipe gestures for back and forward are on.
- Links outside instagram.com open in Safari.
- No entitlements or paid-only capabilities, so it builds with a free Apple ID.
- The Xcode project is generated from `ios/project.yml` with [XcodeGen](https://github.com/yonaskolb/XcodeGen). The generated project is committed too, so you can open it without installing XcodeGen. The shared script is referenced from `../shared`, not copied.

## Android (`android/`)

- Kotlin, one Activity, plain Views. minSdk 26.
- `WebView` with JavaScript and DOM storage on. `CookieManager` accepts first-party and third-party cookies and is flushed when the app pauses, so the login persists.
- The `; wv` marker is removed from the user agent so Instagram serves its usual mobile site.
- The script is injected with `WebViewCompat.addDocumentStartJavaScript` from `androidx.webkit` when the device supports it. Otherwise it falls back to `evaluateJavascript` in `onPageStarted` and `onPageFinished`.
- `shared/` is added as an assets folder in `app/build.gradle.kts`, so the APK uses the same file as the iPhone app.
- The switch is stored in `SharedPreferences` and applied with `evaluateJavascript`.
- `onShowFileChooser` opens the system picker for photo and video uploads.
- The back button goes back in web history and closes the app at the start.
- Links outside instagram.com open in the default browser.

## Network access

The only permission on Android is `INTERNET`. Neither app contains analytics or crash reporting, and the only server either app contacts is Instagram (plus whatever Instagram's own pages load).
