#!/bin/sh
# Builds an unsigned IPA of the iPhone app for AltStore and SideStore,
# which sign it on the phone with the user's own Apple ID.
#
# Run on a Mac with Xcode:   ./scripts/build-ipa.sh
# Output:                    ios/build/ipa/ScrollController-<version>.ipa
#
# Signing is switched off and DEVELOPMENT_TEAM is cleared, so the IPA never
# contains your Apple team ID, certificate or device IDs, even if Xcode has
# saved your team in the project file. Debug symbols are stripped so the
# build folder path (which includes your Mac username) isn't left inside.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/ios/build/ipa"
VERSION="$(sed -n 's/^ *MARKETING_VERSION: *"\{0,1\}\([0-9.]*\)"\{0,1\} *$/\1/p' "$ROOT/ios/project.yml" | head -n 1)"
[ -n "$VERSION" ] || VERSION="dev"

rm -rf "$OUT"
mkdir -p "$OUT"

echo "Building Scroll Controller $VERSION (this takes a minute)..."
xcodebuild \
  -project "$ROOT/ios/ScrollController.xcodeproj" \
  -target ScrollController \
  -configuration Release \
  -sdk iphoneos \
  SYMROOT="$OUT/build" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  DEVELOPMENT_TEAM="" \
  DEPLOYMENT_POSTPROCESSING=YES \
  STRIP_INSTALLED_PRODUCT=YES \
  STRIP_STYLE=non-global \
  COPY_PHASE_STRIP=YES \
  DEBUG_INFORMATION_FORMAT=dwarf-with-dsym \
  OTHER_SWIFT_FLAGS="-file-prefix-map $ROOT=." \
  -quiet \
  build

APP="$OUT/build/Release-iphoneos/ScrollController.app"
[ -d "$APP" ] || { echo "Build finished but $APP is missing." >&2; exit 1; }

mkdir -p "$OUT/Payload"
cp -R "$APP" "$OUT/Payload/"

# A provisioning profile would carry your team ID and device IDs. An
# unsigned build shouldn't have one; stop if it somehow does.
if [ -e "$OUT/Payload/ScrollController.app/embedded.mobileprovision" ]; then
  echo "Stopping: the app contains a provisioning profile. Nothing was packaged." >&2
  exit 1
fi

# Debug information can hold the folder path the app was built in, which
# includes your Mac username. The build above strips it; stop if any is left.
if strings -a "$OUT/Payload/ScrollController.app/ScrollController" | grep -q -e "$HOME" -e "/Users/"; then
  echo "Stopping: the app still contains a path from this Mac (/Users/...). Nothing was packaged." >&2
  exit 1
fi

(cd "$OUT" && zip -qry "ScrollController-$VERSION.ipa" Payload)
echo "Done: $OUT/ScrollController-$VERSION.ipa"
