# HindPDF mobile

React Native / Expo Android and iOS app using the existing HindPDF backend. This project is under development; the checks below do not replace testing on a phone.

## Open in Android Studio

Install Node.js 20 or newer, Java 17, Android Studio and its Android SDK. Clone this repository and run these commands in a terminal from its root:

```sh
npm install
npm run prebuild:android
```

The second command builds the offline document engine and generates the `android/` project. In Android Studio choose **Open** and select the generated `android` folder. Allow Gradle to sync, select an emulator or device and run the app. For a development build, start the JavaScript server from a second terminal in the repository root:

```sh
npm start
```

Alternatively, `npm run android` generates and runs the Android project from the terminal. The generated `android/` folder is deliberately not committed; run prebuild after cloning or when native configuration changes. Android Studio, Android SDK and Java are required locally. Expo Go cannot run the native PDF and file modules used by this app.

On macOS, `npm run ios` generates and runs the iOS development project with Xcode and CocoaPods installed. No production signing is configured.

## Checks

`npm run engine`, `npm run typecheck`, and `npm test` check the offline engine bundle, TypeScript and page selection. GitHub Actions also exports Android and iOS JavaScript bundles and compiles an Android debug build. The bundle and compiler checks do not exercise the UI or live services on a device.

## Configuration and current coverage

The API defaults to `https://api.hindpdf.com`. Copy `.env.example` to `.env` only when changing configuration; variables prefixed `EXPO_PUBLIC_` are included in the app and must never contain secrets. Email sign-in uses the existing Firebase project. Native Google sign-in uses the same Firebase authentication account and requires the setup below; it must be tested on a signed device build.

The app includes the approved compact header, search icon, Home and Tools layouts, five-tab navigation, camera scanner and file filters. The scanner still needs device validation and does not promise automatic cropping. The app contains the website tool catalog, local PDF operations, server conversion integration, camera/file selection, viewer, saved files, account details, email authentication, deletion recovery, payment history and refund requests. This is still a first implementation and does not have complete feature parity with the website. Native device, live backend and account flows need end-to-end tests before release. Website PDF-to-PowerPoint and secure redaction are unavailable; password protection, PDF repair and HTML-to-PDF remain disabled in this mobile implementation. Android Razorpay checkout and coupon code are implemented behind the `EXPO_PUBLIC_ENABLE_RAZORPAY` flag, which defaults to false. Configure and test the appropriate provider and distribution payment requirements before enabling it. iOS checkout and the website's detailed editor interactions are not implemented. Unlocking converts pages to images, which can lose selectable text.

To refresh the copied website tool catalog and government guidance, place a checkout of `HindPDF-Frontend` alongside this repository and run `node scripts/import-catalog.cjs`. The app does not depend on that checkout at runtime. No backend or website deployment is performed by this project.

## Google sign-in setup

The Android build uses the supplied `google-services.json`, Google Services Gradle plugin 4.5.0, and Firebase BoM 35.1.0 with Firebase Analytics. Analytics is separate from Google authentication.

1. In Firebase Authentication for project `hindpdf-a7965`, enable the Google sign-in provider. Confirm that the web OAuth client used below belongs to that project.
2. Register Android package `com.hindpdf.app` in that Firebase/Google Cloud project and add the SHA-1 signing certificate for **each** build that will be used (local debug, CI/preview, and Play App Signing/release as applicable). Create or confirm the Android OAuth client for each package and certificate. The local debug SHA-1 can be obtained with `keytool -list -v -alias androiddebugkey -keystore android/app/debug.keystore -storepass android -keypass android`. Use the real release/Play certificate for published builds; it is usually different.
3. The app defaults to the public HindPDF website web OAuth client ID `191538884503-kh40dmge1h4bldt4bf5fobv1jcfgaknt.apps.googleusercontent.com`. If Firebase uses a different web OAuth client, set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` when building. Client IDs are public identifiers; never put a client secret in the app.
4. For iOS, register bundle ID `com.hindpdf.app` and set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` to the iOS OAuth client ID when building. The app config adds its reversed URL scheme. Without this iOS setting the Google button stays unavailable on iOS.
5. Generate a new native build after changing native modules or OAuth configuration. Test sign-in, cancellation, sign-out/account switching, and account deletion on actual devices, including the release-signed build. Google Play services are required on Android. Expo Go is not supported.

No Google client secret is needed in the mobile app. Provider enablement and signing registrations are managed in the Firebase/Google Cloud consoles and cannot be verified from this repository.

## Android live scan edges

The Android development/release build uses a postinstall patch for Expo Camera frame analysis. It detects approximate rectangular edges offline and shows them as a live guide; the captured page is reviewed and cropped separately. The detector is conservative and may not follow skewed or low-contrast documents. iOS retains the fixed guide. A new native build and real-device tests are required after installing this integration.
