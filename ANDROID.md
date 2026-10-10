# Melo for Android

The player UI and a Capacitor Android project are included. An APK has **not** been compiled in the Lovable sandbox, which has no JDK or Android SDK.

## Build an installable APK

On a computer with Android Studio, Android SDK 36 and JDK 21 installed:

1. Export this project's source and install packages with `bun install`.
2. Run `bun run build`. Static prerendering emits `dist/client/index.html` and the library/favourites pages.
3. Run `bunx cap sync android`.
4. Run `bunx cap open android`.
5. In Android Studio, choose **Build → Generate App Bundles or APKs → Generate APKs**. The debug APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.
6. Transfer that APK to your Android phone and permit installation from that source. For distribution, generate a signed release APK and keep your signing key private.

Imported audio is saved privately on the device with IndexedDB. Artwork and the player interface are bundled; the three original 30-second ambient samples in the web preview are hosted assets and require the published site's asset URLs for an Android bundle. For an entirely self-contained APK, replace sample sources with bundled local audio before syncing.

Audio playback, device audio selection, favourites, themes and lock-screen media metadata are implemented in the web player. Native background playback, Android media scanning, Bluetooth/headset behavior, system notification controls and actual-device compatibility remain unverified and may need native Android integrations.

This is a native Android packaging path, not a home-screen shortcut. Publishing the website does not generate an APK.