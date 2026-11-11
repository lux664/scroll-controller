# Privacy

Scroll Controller doesn't collect anything about you.

- There are no analytics, ads, crash reports or tracking libraries in the app.
- The project has no server. The app only connects to instagram.com, plus whatever Instagram's own pages load.
- You log in on Instagram's own login page. Your username and password go straight to Instagram, the same as in a browser.
- Instagram's login cookies are stored in the app's private storage on your phone. Deleting the app deletes them.
- The only setting the app saves is whether **Hide Reels** is on.
- Links to other websites open in your normal browser, outside the app.

What you do on Instagram inside the app is covered by [Instagram's privacy policy](https://privacycenter.instagram.com/policy), the same as on the website.

The code is open, so you can check all of this yourself. The iPhone app's web view setup is in [`ios/ScrollController/InstagramWebView.swift`](ios/ScrollController/InstagramWebView.swift) and the Android one is in [`android/app/src/main/java/scrollcontroller/MainActivity.kt`](android/app/src/main/java/scrollcontroller/MainActivity.kt).
