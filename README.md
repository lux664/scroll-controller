# Scroll Controller

Use Instagram without Reels. A free, open-source app for iPhone and Android.

Scroll Controller opens Instagram's mobile website inside the app and hides everything to do with Reels. You still get your feed, stories, messages, search, profiles and posting. There's one switch at the top of the screen, **Hide Reels**, and you can flip it at any time.

There are no ads, accounts, subscriptions or tracking. The app talks to instagram.com and nothing else.

> Scroll Controller is not affiliated with Instagram or Meta.

## What gets hidden

With **Hide Reels** on:

- The Reels tab disappears from the bottom bar, and the other tabs close the gap.
- Reel posts are removed from your home feed.
- The Reels tab on people's profiles is hidden.
- If you open a Reel from a message or a link, you land on your home feed instead.

Turn the switch off and you get the normal Instagram website back straight away, without reloading.

## Limits you should know about

Scroll Controller is Instagram's website in a frame, so anything the website can't do, the app can't do either. Posting Reels and adding music to stories are the main gaps.

Instagram changes its website often. When that happens, Reels can show up again until the script is updated. The fix is usually a one-line change in [`shared/reels-blocker.js`](shared/reels-blocker.js), and [CONTRIBUTING.md](CONTRIBUTING.md) explains how to make it.

## Install

No release has been published yet. Until the first one is out, you can build the app yourself with the guides below.

- **iPhone:** [docs/iphone.md](docs/iphone.md) covers AltStore or SideStore (no Mac needed, once a release exists) and installing with Xcode over a cable.
- **Android:** [docs/android.md](docs/android.md) covers installing the APK and building it with Android Studio.

Both platforms are free to install. On iPhone a free Apple ID is enough, though Apple makes you refresh the app every 7 days.

## Getting the most out of it

The app works best if you stop opening the real Instagram app. Put a limit on it with **Screen Time** on iPhone (Settings → Screen Time → App Limits) or **Digital Wellbeing** on Android (Settings → Digital Wellbeing → Dashboard → Instagram → App timer), then use Scroll Controller for your feed and messages.

## How it's built

```
scroll-controller/
├── shared/reels-blocker.js   the script that hides Reels, used by both apps
├── ios/                      SwiftUI app with a WKWebView (project made with XcodeGen)
├── android/                  Kotlin app with a WebView
└── docs/                     install guides and technical notes
```

Both apps load the same script file from `shared/`, so a fix there applies to iPhone and Android at once. [docs/how-it-works.md](docs/how-it-works.md) explains the details.

## Privacy

The app has no analytics, crash reporting or servers of its own. Your Instagram login stays in the app's storage on your phone. More in [PRIVACY.md](PRIVACY.md).

## Contributing

Bug reports and pull requests are welcome, especially when Instagram changes something and Reels sneak back in. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). You can use, change and share the code freely as long as the copyright notice stays with it.

Instagram is a trademark of Meta Platforms, Inc. This project is independent and is not endorsed by or connected to Meta.
