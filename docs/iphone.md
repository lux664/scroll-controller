# Installing on iPhone

Apple doesn't allow apps like this on the App Store without a paid developer account, so you install Scroll Controller yourself. There are two ways to do it. Both work with a free Apple ID.

| | AltStore or SideStore | Xcode with a cable |
|---|---|---|
| Needs a Mac | No (AltStore needs a computer once) | Yes |
| Needs a released IPA file | Yes | No, it builds from the source |
| Refresh every 7 days | Yes, from the AltStore or SideStore app | Yes, by pressing Run again |

Requires iOS 16 or newer.

## Option 1: AltStore or SideStore

This option needs an IPA file from the [Releases](../../../releases) page. None has been published yet, so for now use option 2.

1. Install [AltStore](https://altstore.io) or [SideStore](https://sidestore.io) by following the instructions on their website, and sign in with your Apple ID.
2. On your iPhone, download the latest `ScrollController-x.y.z.ipa` from Releases.
3. Open the file with AltStore or SideStore and install it.
4. Open Scroll Controller and log in to Instagram.

Free Apple IDs can only sign an app for 7 days. Open AltStore or SideStore at least once a week and refresh Scroll Controller there. If you miss it, the app won't open until you refresh it, but your login is kept.

## Option 2: Xcode with a cable

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and [Homebrew](https://brew.sh).

### Get the project ready

Open Terminal and run:

```sh
git clone https://github.com/lux664/scroll-controller.git
cd scroll-controller/ios
open ScrollController.xcodeproj
```

The Xcode project is included in the repo. If you change `project.yml`, regenerate the project with `brew install xcodegen` and then `xcodegen generate` inside the `ios` folder.

### Sign in and choose your team

1. In Xcode, open **Xcode → Settings → Accounts**, click **+** and sign in with your Apple ID.
2. Click the blue **ScrollController** project at the top of the left sidebar, then select the **ScrollController** target.
3. Switch the editor to **Signing & Capabilities**. Depending on your Xcode version this is a tab or an option in the menu above the settings.
4. Keep **Automatically manage signing** ticked and set **Team** to the one ending in **(Personal Team)**.
5. If Xcode says the bundle identifier isn't available, change it to something of your own, for example `io.github.yourname.scrollcontroller`.

### Install on the phone

1. Connect the iPhone with a cable and unlock it. Tap **Trust** if the phone asks whether to trust the computer.
2. In the device menu at the top of the Xcode window, pick your iPhone under **Devices** (not one of the simulators).
3. Press the **▶ Run** button or ⌘R.

The first install can take a few minutes. Along the way you may see these prompts:

- **"codesign wants to access key … in your keychain."** macOS is asking whether Xcode may sign the app with the certificate it just made for you. Type your Mac login password and click **Always Allow**. The password stays on your Mac.
- **Developer Mode required.** On the iPhone, go to Settings → Privacy & Security → Developer Mode, turn it on and let the phone restart. After it restarts, confirm with **Turn On**, then press Run in Xcode again.
- **Untrusted Developer.** On the iPhone, go to Settings → General → VPN & Device Management, tap the Apple Development entry with your Apple ID and tap **Trust**.

When the app opens, log in to Instagram once. You can unplug the cable afterwards and the app stays on your phone.

### Every 7 days

A free Apple ID signs the app for 7 days. When it stops opening, plug the phone in, open the project in Xcode, check that your iPhone is selected and press Run. Your Instagram login is kept. A free account can have up to 3 apps installed this way at the same time.

### If you plan to contribute

When you pick a team, Xcode writes your team ID into `ios/ScrollController.xcodeproj/project.pbxproj` as `DEVELOPMENT_TEAM`. Please don't commit that line. See [CONTRIBUTING.md](../CONTRIBUTING.md) for a small pre-commit hook that blocks it.

## Using the app

- The **Hide Reels** switch sits in the top bar. Your choice is saved between launches.
- Tap **Scroll Controller** in the top bar to see the About screen.
- Swipe from the left edge to go back, and from the right edge to go forward.
- Links to other websites open in Safari.
