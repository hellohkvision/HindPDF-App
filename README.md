# HindPDF mobile — work in progress

React Native / Expo development project for Android and iOS, using the existing HindPDF API and the site's tool catalog. This is **not yet a release build**. Dependencies have not been installed in the current environment, and no Android or iOS build or device test has been performed.

## Setup

With Node.js installed and npm registry access:

```sh
npm install
npm run engine
npm run typecheck
npm test
npx expo run:android
# On a Mac with Xcode and CocoaPods:
npx expo run:ios
```

Native modules require a development build; Expo Go is not sufficient. `npm start` builds the offline processing engine first. `eas.json` provides example EAS build profiles. Set the final Android package and iOS bundle identifiers before release. No store publishing has been performed.

## Current status

- Catalog is imported from `../HindPDF-Frontend`, including 39 tools and 12 sourced application guidance entries. Run `node scripts/import-catalog.cjs` when the website catalog changes.
- Native screens, file picker, camera, email authentication, file list, reader, native share/save, and processing code have been drafted. Device processing uses a bundled, offline WebView as a computation engine; the visible application is React Native. Server tools use the existing HTTPS API.
- Website tools PDF-to-PowerPoint and secure redaction are marked unavailable there and here. Mobile password protection, repair and HTML-to-PDF remain disabled until verified and hardened. Other tools are implemented as first-pass versions, and may not have full website parity; all require real-device verification.
- Profile editing, password change, email verification, deletion request/recovery, payment history and refund request code are present but require integration and device testing. Payment checkout, coupons, Google/Facebook sign-in and website-specific editor interactions are not implemented yet. Payment distribution must follow the applicable app-store rules.
- Drawing, PDF rendering, large files, offline engine and iOS/Android permissions need device testing. Output from unlock is rasterized and can lose selectable text; it should be tested with protected samples before release.
- No production backend or existing website files were modified. 
