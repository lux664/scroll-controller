# Installing on Android

> **Early version.** The Android app builds and passes our checks, but it hasn't been tried on a real phone yet. If something doesn't work, please [open an issue](../../../issues) with your phone model and Android version.

Requires Android 8.0 or newer.

## Install the APK

1. On your phone, open the [Releases](../../../releases) page and download the latest `ScrollController-x.y.z.apk`.
2. Open the downloaded file. If Android asks, allow your browser or file manager to **install unknown apps**.
3. Open Scroll Controller and log in to Instagram.

### About Google's developer verification

Google is rolling out identity checks for developers of apps that are installed from outside the Play Store. Enforcement started on 30 September 2026 in Brazil, Indonesia, Singapore and Thailand and is planned for the rest of the world from 2027. In countries where it applies, Android may show extra steps before installing an app from an unregistered developer. Sideloading itself is still allowed. Google's [developer verification guide](https://developer.android.com/developer-verification/guides) has the current rules.

## Build it yourself

Install [Android Studio](https://developer.android.com/studio). It comes with the Android SDK and a JDK.

```sh
git clone https://github.com/lux664/scroll-controller.git
cd scroll-controller/android
./gradlew assembleDebug
```

The APK ends up in `android/app/build/outputs/apk/debug/app-debug.apk`. You can also open the `android` folder in Android Studio and press Run with your phone connected or an emulator running.

To install the debug APK on a phone over USB, turn on **USB debugging** under Developer options and run:

```sh
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Signed release builds

Release APKs are signed so that later versions install as updates. The signing key isn't in the repo. To sign your own builds, create `android/keystore.properties` (it's ignored by git) pointing to your own key:

```properties
storeFile=/path/to/your-release-key.jks
storePassword=...
keyAlias=...
keyPassword=...
```

Then run `./gradlew assembleRelease`. Without that file, `assembleRelease` makes an unsigned APK, which Android won't install. Use `assembleDebug` for testing instead.

An APK signed with a different key can't update the official one. Uninstall Scroll Controller first if you switch between them.

## Using the app

- The **Hide Reels** switch sits in the top bar. Your choice is saved between launches.
- Tap **Scroll Controller** in the top bar to see the About screen.
- The back button goes back a page in Instagram, and leaves the app when there's nothing to go back to.
- You can attach photos and videos when posting, using the normal Android file picker.
- Links to other websites open in your browser.
