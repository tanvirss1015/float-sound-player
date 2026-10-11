# NocTune for Android

The NocTune player and Capacitor Android project are included. An APK has **not** been compiled or delivered: this sandbox has no installed Android SDK and no generated static web output. Phone-size web checks are not actual Android-device testing.

## Get an APK without installing Android Studio

1. Export/sync this project to your GitHub repository, including the `.github/workflows/android-apk.yml` workflow.
2. In GitHub, open **Actions → Build NocTune APK → Run workflow**.
3. When the job succeeds, download **NocTune-Android-APK** from the run's artifacts and extract `app-debug.apk`.
4. Transfer the APK to your Android phone and allow installation from that source.

The workflow installs the Android tools, builds NocTune, bundles its three sample tracks for offline use, and compiles a debug-signed APK. It has not been run from this sandbox; a successful GitHub run is required before an APK exists. For public distribution, use a privately signed release instead of the debug package.

## Build an installable APK

On a computer with Android Studio, Android SDK 36 and JDK 21 installed:

1. Export this project's source and install packages with `bun install`.
2. Run `bun run build`. Static prerendering emits `dist/client/index.html` and the library/favourites pages.
3. Run `node scripts/prepare-android.mjs` to bundle the sample tracks, then `bunx cap sync android`.
4. Run `bunx cap open android`.
5. In Android Studio, choose **Build → Generate App Bundles or APKs → Generate APKs**. The debug APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.
6. Transfer that APK to your Android phone and permit installation from that source. For distribution, generate a signed release APK and keep your signing key private.

Imported audio is saved privately on the device with IndexedDB. Artwork, the player interface, and all three 30-second ambient samples are bundled by the APK preparation script. The script needs internet access during packaging; the packaged samples then play offline. The equalizer uses five Web Audio frequency bands with presets and adjustable gain; skip icons use a fixed centered frame for Android WebView alignment.

Audio playback, device audio selection, favourites, themes and lock-screen media metadata are implemented in the web player. Native background playback, Android media scanning, Bluetooth/headset behavior, system notification controls and actual-device compatibility remain unverified and may need native Android integrations.

This is a native Android packaging path, not a home-screen shortcut. Publishing the website does not generate an APK.