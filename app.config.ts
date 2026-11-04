const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const googleIosClientMatch = googleIosClientId?.match(/^([^.]+)\.apps\.googleusercontent\.com$/);
if (googleIosClientId && !googleIosClientMatch) throw new Error('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID must be an iOS OAuth client ID.');
const googleIosPlugin = googleIosClientMatch ? [['@react-native-google-signin/google-signin', { iosUrlScheme: `com.googleusercontent.apps.${googleIosClientMatch[1]}` }]] : [];

export default {
  expo: {
    name: 'HindPDF', slug: 'hindpdf-mobile', scheme: 'hindpdf', version: '1.0.61',
    orientation: 'default', userInterfaceStyle: 'automatic',
    icon: './assets/hindpdf-app-icon.png',
    splash: { image: './assets/hindpdf-mark.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
    ios: { bundleIdentifier: 'com.hindpdf.app', supportsTablet: true, infoPlist: { NSCameraUsageDescription: 'Use the camera to scan documents and capture photos for your files.', NSPhotoLibraryUsageDescription: 'Choose photos and signatures to scan, crop, and resize.', UIFileSharingEnabled: true, LSSupportsOpeningDocumentsInPlace: true, ITSAppUsesNonExemptEncryption: false } },
    android: { package: 'com.hindpdf.app', versionCode: 62, permissions: ['android.permission.CAMERA', 'android.permission.INTERNET'], blockedPermissions: ['android.permission.RECORD_AUDIO'] },
    plugins: [...googleIosPlugin, './plugins/withHindPdfStorage', './plugins/withPdfViewerAlias', ['expo-splash-screen', { image: './assets/hindpdf-mark.png', imageWidth: 120, resizeMode: 'contain', backgroundColor: '#ffffff' }], 'react-native-document-scanner-plugin', ['expo-camera', { cameraPermission: 'Scan documents using your camera.', microphonePermission: false, recordAudioAndroid: false }], 'expo-dev-client', 'expo-document-picker', ['expo-image-picker', { photosPermission: 'Choose photos and signatures to scan, crop, and resize.', cameraPermission: 'Use the camera to scan documents and capture photos for your files.', microphonePermission: false }]],
    extra: { apiBase: process.env.EXPO_PUBLIC_API_BASE || 'https://api.hindpdf.com' }
  }
};
