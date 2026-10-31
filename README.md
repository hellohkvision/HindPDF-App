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

The API defaults to `https://api.hindpdf.com`. Copy `.env.example` to `.env` only when changing configuration; variables prefixed `EXPO_PUBLIC_` are included in the app and must never contain secrets. Email sign-in uses the existing Firebase project. Google sign-in requires public Android/iOS client IDs, correct Firebase/provider settings and redirect registration for the mobile application. Without a configured mobile client ID, the Google button is disabled. This integration needs device testing.

The app includes the approved compact header, search icon, Home and Tools layouts, five-tab navigation, camera scanner and file filters. The scanner still needs device validation and does not promise automatic cropping. The app contains the website tool catalog, local PDF operations, server conversion integration, camera/file selection, viewer, saved files, account details, email authentication, deletion recovery, payment history and refund requests. This is still a first implementation and does not have complete feature parity with the website. Native device, live backend and account flows need end-to-end tests before release. Website PDF-to-PowerPoint and secure redaction are unavailable; password protection, PDF repair and HTML-to-PDF remain disabled in this mobile implementation. Android Razorpay checkout and coupon code are implemented behind the `EXPO_PUBLIC_ENABLE_RAZORPAY` flag, which defaults to false. Configure and test the appropriate provider and distribution payment requirements before enabling it. iOS checkout and the website's detailed editor interactions are not implemented. Unlocking converts pages to images, which can lose selectable text.

To refresh the copied website tool catalog and government guidance, place a checkout of `HindPDF-Frontend` alongside this repository and run `node scripts/import-catalog.cjs`. The app does not depend on that checkout at runtime. No backend or website deployment is performed by this project.
