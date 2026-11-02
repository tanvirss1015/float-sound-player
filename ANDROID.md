# NocTune for Android

NocTune is a Capacitor Android app wrapping the same player as the website. A build of the app is produced automatically by GitHub Actions; it has not been tested on a physical Android device.

## Download the built app

1. Open **Actions → Build NocTune APK** in your GitHub repository.
2. Open the most recent run with a green check.
3. Under **Artifacts**, download **NocTune-Android-APK** and unzip it. The file inside is `app-debug.apk`.

Artifacts are kept for 30 days. The package is debug-signed, which is fine for installing on your own phone; use a privately signed release before distributing it to anyone else.

## Install it on your phone

1. Copy `app-debug.apk` to the phone (USB, Drive, or any file transfer).
2. Open the file with the phone's file manager.
3. When Android warns about installing from an unknown source, allow it for that file manager once.
4. Tap **Install**, then open NocTune from the app drawer.

If a previous NocTune build is already installed, uninstall it first — a differently signed build cannot replace it.

## How the build works

The workflow (`.github/workflows/android-apk.yml`) runs on every push to `main` and can also be started by hand from **Actions → Build NocTune APK → Run workflow**. It:

1. Installs JDK 21 and the Android SDK on the runner.
2. Builds the web app with `LOVABLE_SANDBOX=1`, which is what makes the build emit the static files the Android package needs.
3. Downloads the three ambient samples and rewrites the app to play them from inside the package, so they work with no connection.
4. Syncs the web output into the Android project, compiles the debug APK, and uploads it as an artifact.

## Building locally instead

On a computer with Android Studio, Android SDK 36 and JDK 21:

1. `bun install`
2. `LOVABLE_SANDBOX=1 bun run build`
3. `node scripts/prepare-android.mjs`, then `bunx cap sync android`
4. `bunx cap open android`, then **Build → Generate App Bundles or APKs → Generate APKs**

## What is and is not verified

Imported audio is saved privately on the device with IndexedDB. Artwork, the player interface, and all three 30-second ambient samples ship inside the package.

Audio playback, device audio selection, favourites, themes and lock-screen media metadata are implemented in the web player. Native background playback, Android media scanning, Bluetooth/headset behavior, system notification controls and actual-device compatibility remain unverified and may need native Android integrations.

This is a native Android package, not a home-screen shortcut. Publishing the website does not produce an APK.
