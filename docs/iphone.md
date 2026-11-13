# Installing on iPhone

Apple doesn't allow apps like this on the App Store without a paid developer account, so you install Scroll Controller yourself. There are two ways to do it. Both work with a free Apple ID.

| | AltStore | Xcode with a cable |
|---|---|---|
| Needs a computer | A Mac or Windows PC for setup and the weekly refresh | A Mac |
| Uses the IPA from Releases | Yes | No, it builds from the source |
| Refresh every 7 days | Yes, from AltStore while the computer is on the same Wi-Fi | Yes, by pressing Run again |

Requires iOS 16 or newer.

## Option 1: AltStore

This is the way for most people. It uses the IPA file from the [Releases](../../../releases) page and works with a Mac or a Windows PC.

The full walkthrough, with separate steps for Mac and Windows, is in **[install-with-altstore.md](install-with-altstore.md)**. In short:

1. Install AltServer on your computer and use it to put AltStore on your iPhone.
2. On the iPhone, download `ScrollController-x.y.z.ipa` from Releases and install it from AltStore's **My Apps** tab.
3. Let AltStore refresh it at least once a week, while your iPhone and computer are on the same Wi-Fi.

If you miss the weekly refresh, the app won't open until you refresh it, but your login is kept.

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

## Building the IPA yourself

To make your own IPA, for example to publish a release, run this on a Mac with Xcode:

```sh
./scripts/build-ipa.sh
```

The file ends up in `ios/build/ipa/ScrollController-<version>.ipa`. It's unsigned on purpose: AltStore signs it with the user's own Apple ID during install. The script switches signing off and clears `DEVELOPMENT_TEAM`, so your team ID and device IDs never end up in the file.

## Using the app

- The **Hide Reels** switch sits in the top bar. Your choice is saved between launches.
- Tap **Scroll Controller** in the top bar to see the About screen.
- Swipe from the left edge to go back, and from the right edge to go forward.
- Links to other websites open in Safari.
