# NocTune for Android

An installable debug APK has been compiled successfully with JDK 21 and Android SDK 36. This is a Capacitor Android app with a bundled interface, artwork and sample music, not a home-screen shortcut.

## Build an installable APK

On a computer with Android Studio, Android SDK 36 and JDK 21 installed:

1. Export this project's source and install packages with `bun install`.
2. Run `bun run android:web`. This emits the Android-only static shell to `dist/android` and bundles the three original audio samples for offline use.
3. Run `bunx cap sync android` (or use `bun run android:sync` for both steps).
4. Run `bunx cap open android`.
5. In Android Studio, choose **Build → Generate App Bundles or APKs → Generate APKs**. The debug APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.
6. Transfer that APK to your Android phone and permit installation from that source. For distribution, generate a signed release APK and keep your signing key private.

Imported audio is saved privately on the device with IndexedDB. Artwork, the player interface and the three original 30-second ambient samples are bundled. The audio-copy step downloads the existing samples from the published site; set `ANDROID_ASSET_ORIGIN` if using another origin. The installed APK does not need the website for playback.

Audio playback, device audio selection, favourites, themes, five-band Web Audio equalizer and lock-screen media metadata are implemented in the shared player. Browser checks cover the Android bundle at phone sizes, including offline sample playback. Native background playback, Android media scanning, Bluetooth/headset behavior, system notification controls and actual-device compatibility remain unverified and may need native Android integrations. The supplied debug APK is for personal installation/testing, not a signed store release.

This is a native Android packaging path, not a home-screen shortcut. Publishing the website does not generate an APK.