# Contributing

Thanks for helping. The most useful contribution is fixing the script when Instagram changes its website and Reels start showing again.

## Reporting a problem

Open an issue and include:

- whether you're on iPhone or Android, and the OS version
- what you saw (a screenshot helps, with personal details covered)
- where in Instagram it happened, for example the home feed, a profile or Explore
- the app version, or the commit you built from

Please don't paste cookies, session IDs or anything from your account settings into an issue.

## Fixing the script when Reels come back

Everything that decides what gets hidden is in [`shared/reels-blocker.js`](shared/reels-blocker.js), in the sections marked **SELECTORS** and **PATH RULES**. [docs/how-it-works.md](docs/how-it-works.md) explains each rule.

1. Open `https://www.instagram.com/` in Chrome or Safari on a computer and log in. The logged-in layout is different from the logged-out one, so this matters.
2. Open the developer tools and switch to a phone-sized view (device toolbar in Chrome, Responsive Design Mode in Safari). Reload the page so Instagram serves the mobile site.
3. Find the Reels element that came back and look at the link it uses, for example `href="/someone/reel/ABC123/"`.
4. Add or adjust a selector that matches the link's address. Please don't use Instagram's class names (the random-looking ones like `x1lliihq`). They change every few days.
5. To try your change without rebuilding, paste the whole script into the developer console with `window.__SC_ENABLED = true;` in front of it, then check the page.
6. Check that normal posts and stories still show, and that turning the switch off brings Reels back.
7. Rebuild one of the apps and test it there too if you can.

Keep the script free of dependencies, and add a short comment to each new rule saying what it targets.

## Working on the apps

- iPhone: [docs/iphone.md](docs/iphone.md) has the build steps. If you change project settings, edit `ios/project.yml`, run `xcodegen generate` and commit both files.
- Android: [docs/android.md](docs/android.md). Build with `./gradlew assembleDebug` inside `android/`.

The goal is a small utility with one switch. Please open an issue before adding a feature so we can talk about whether it fits.

## Keep personal details out of commits

When you pick a signing team in Xcode, your Apple team ID is written into `ios/ScrollController.xcodeproj/project.pbxproj` as `DEVELOPMENT_TEAM`. Don't commit that line. Android keystores, `keystore.properties`, `local.properties` and Xcode's `xcuserdata` folders are already in `.gitignore`.

You can install a local pre-commit hook that refuses commits containing a team ID or anything that looks like a key or password. Save this as `.git/hooks/pre-commit` and make it executable with `chmod +x .git/hooks/pre-commit`:

```sh
#!/bin/sh
added=$(git diff --cached -U0 | grep '^+' | grep -v '^+++')
fail=0
if printf '%s\n' "$added" | grep -E 'DEVELOPMENT_TEAM *= *"?[A-Z0-9]{10}' >/dev/null; then
  echo "Blocked: your Apple team ID (DEVELOPMENT_TEAM) is in this commit." >&2
  fail=1
fi
if printf '%s\n' "$added" | grep -i -E 'api[_-]?key *[:=] *["'\'']?[A-Za-z0-9_-]{16,}|secret *[:=] *["'\'']?[A-Za-z0-9_-]{12,}|passw(or)?d *[:=] *["'\'']?[^ "'\''().]{6,}["'\'']?[,;]? *$|-----BEGIN [A-Z ]*PRIVATE KEY-----|sessionid=[A-Za-z0-9%]{8,}|csrftoken=[A-Za-z0-9]{8,}' >/dev/null; then
  echo "Blocked: something that looks like a key, password or login token is in this commit." >&2
  fail=1
fi
if git diff --cached --name-only | grep -E '\.(jks|keystore|p12|mobileprovision|ipa|apk)$|keystore\.properties$|local\.properties$|xcuserdata/' >/dev/null; then
  echo "Blocked: a signing key, build output or personal Xcode file is in this commit." >&2
  fail=1
fi
exit $fail
```

## License

By contributing you agree that your changes are released under the [MIT License](LICENSE).
