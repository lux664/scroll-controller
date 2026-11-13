# Installing Scroll Controller with AltStore

This guide walks you through installing Scroll Controller on your iPhone with [AltStore](https://altstore.io), using a free Apple ID and a Mac or Windows computer. It takes about 20 minutes the first time. After that, keeping the app working takes a few seconds a week.

## Before you start

**How it works.** Apple only lets apps outside the App Store run if they're signed with an Apple ID. AltStore does that signing for you with your own Apple ID. A free Apple ID signs apps for **7 days**, so AltStore has to refresh Scroll Controller at least once a week. Refreshing needs **AltServer**, a small program on your computer, so your iPhone has to reach that computer now and then, either on the same Wi-Fi or with a cable.

**You'll need:**

- an iPhone with iOS 16 or newer
- a Mac (macOS 11 or newer) or a Windows PC that stays on your home Wi-Fi
- the cable for your iPhone, for the first setup
- your Apple ID email and password

**About your Apple ID.** AltServer asks for your Apple ID to sign the app. According to AltStore, the details are sent only to Apple. If you'd rather not use your main Apple ID, you can make a separate free one at [appleid.apple.com](https://appleid.apple.com) and use that instead.

**Free account limits.** A free Apple ID can have at most 3 sideloaded apps active at the same time, and AltStore itself is one of them.

Now follow the part for your computer.

---

## Part 1 (Mac): set up AltServer and AltStore

1. **Download AltServer** for macOS from [altstore.io](https://altstore.io). Open the download and drag **AltServer** into your **Applications** folder.
2. **Start AltServer** from Applications. It doesn't open a window; a small diamond icon appears in the menu bar at the top right of the screen.
3. **Connect your iPhone** with the cable and unlock it. If the iPhone asks whether to trust this computer, tap **Trust** and enter your passcode.
4. **Turn on Wi-Fi syncing**, so AltServer can reach your iPhone without the cable later. Open **Finder**, click your iPhone in the sidebar, and on the **General** tab tick **Show this iPhone when on Wi-Fi**. Click **Apply**.
5. **Install AltStore.** Click the AltServer icon in the menu bar, choose **Install AltStore**, and pick your iPhone.
6. If you see a message about a **Mail plug-in**, follow the steps it links to. Newer setups may not ask for it.
7. **Sign in** with your Apple ID email and password when AltServer asks.
8. **Wait** for a notification saying AltStore was installed. If nothing appears after a minute or two, check that notifications for AltServer are allowed in System Settings. You may need to restart the iPhone before the AltStore icon shows up.

Continue with Part 2.

## Part 1 (Windows): set up AltServer and AltStore

1. **Install iTunes and iCloud from Apple's website**, not from the Microsoft Store. AltServer needs Apple's own versions. The [AltStore Windows guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows) links to the right downloads. If you already have the Microsoft Store versions, uninstall them first.
2. **Download AltServer** for Windows from [altstore.io](https://altstore.io). Unzip the download and run **Setup.exe**.
3. **Start AltServer as administrator.** Type "AltServer" in the Windows search box, right-click it and choose **Run as administrator**. If Windows asks about network access, allow it on private networks. A small diamond icon appears in the taskbar, near the clock. You may need to click the arrow there to see it.
4. **Connect your iPhone** with the cable and unlock it. If the iPhone asks whether to trust this computer, tap **Trust** and enter your passcode.
5. **Open iTunes and sign in** with your Apple ID (Account → Sign In).
6. **Turn on Wi-Fi syncing**, so AltServer can reach your iPhone without the cable later. In iTunes, click the small iPhone icon near the top left, go to **Summary**, tick **Sync with this iPhone over Wi-Fi** and click **Apply**.
7. **Install AltStore.** Click the AltServer icon in the taskbar, choose **Install AltStore**, and pick your iPhone.
8. **Sign in** with your Apple ID email and password when AltServer asks.
9. **Wait** for a notification saying AltStore was installed. You may need to restart the iPhone before the AltStore icon shows up.

Continue with Part 2.

---

## Part 2 (iPhone): allow AltStore to run

Do this once, on the iPhone, whichever computer you used.

1. **Trust your Apple ID as a developer.** Go to **Settings → General → VPN & Device Management**, tap your Apple ID under Developer App, tap **Trust** and confirm.
2. **Turn on Developer Mode.** Go to **Settings → Privacy & Security → Developer Mode** and switch it on. The iPhone restarts. After it starts up again, tap **Turn On** when asked and enter your passcode.
3. **Open AltStore** to check it works.

## Part 3: install Scroll Controller

1. On your iPhone, open Safari and go to the [Releases page](https://github.com/lux664/scroll-controller/releases).
2. Under the latest release, tap **ScrollController-x.y.z.ipa** to download it. It goes to the Downloads folder in the Files app.
3. Make sure the iPhone is on the same Wi-Fi as your computer and that AltServer is running there. Plugging in the cable works too.
4. Open **AltStore**, go to the **My Apps** tab and tap **+** at the top left.
5. Find the `.ipa` you downloaded (Browse → Downloads) and tap it. AltStore installs Scroll Controller. This can take a minute.
6. Open **Scroll Controller** from the Home Screen and log in to Instagram.

**Installing from the computer instead.** You can also install the `.ipa` straight from your computer with the iPhone connected. On a Mac, hold **Option (⌥)** and click the AltServer icon. On Windows, hold **Shift** and click it. Choose **Sideload .ipa…**, pick your iPhone and select the file.

---

## Keeping it working: the weekly refresh

Apps signed with a free Apple ID stop opening 7 days after they were last signed. AltStore fixes this by refreshing them, which needs your computer.

**Automatic.** AltStore tries to refresh in the background when your iPhone and computer are on the same Wi-Fi and AltServer is running. To make this reliable:

- set AltServer to start when your computer starts (Mac: System Settings → General → Login Items; Windows: put a shortcut to AltServer in the Startup folder, which you can open by typing `shell:startup` in the Run box)
- leave **Background App Refresh** on for AltStore in the iPhone's Settings

**By hand.** Open AltStore, go to **My Apps** and tap **Refresh All**, while you're on the same Wi-Fi as the computer or plugged in. AltStore shows how many days each app has left, so you can see when it's due.

**If you forget.** Scroll Controller won't open until it's refreshed. Nothing is lost: your Instagram login and settings stay on the phone. Refresh it with AltStore as above. If AltStore itself has expired too, click the AltServer icon on your computer and choose **Install AltStore** again; this refreshes it without deleting anything.

## Updating to a new version

When a new release comes out, download the new `.ipa` from the Releases page and install it the same way (My Apps → **+**). It replaces the old version and keeps your login.

## Common problems

**"Could not find AltServer"** or the refresh fails. Check that AltServer is running on the computer, that both devices are on the same Wi-Fi, and that Wi-Fi syncing is turned on (Part 1, step 4 on Mac, step 6 on Windows). Plugging in the cable is the quickest test.

**The `.ipa` is greyed out in AltStore.** The file isn't really an `.ipa`. Download it again from the Releases page in Safari. If you send it from a Mac with AirDrop, the Mac may relabel it; use Safari on the phone or the **Sideload .ipa…** option on the computer instead.

**"Maximum number of apps" or similar.** You've reached the 3-app limit. In AltStore, **deactivate** an app you don't need right now (long-press it in My Apps). Its data is kept and you can turn it back on later.

**AltServer on Windows doesn't see the iPhone.** Make sure iTunes and iCloud are Apple's versions from Apple's website, run AltServer as administrator, and unlock the iPhone.

For anything else, AltStore's own [troubleshooting guide](https://faq.altstore.io/altstore-classic/troubleshooting-guide) covers most errors. Problems with Scroll Controller itself, such as Reels showing up again, go to [our issues page](https://github.com/lux664/scroll-controller/issues).
