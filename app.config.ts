export default {
  expo: {
    name: 'HindPDF', slug: 'hindpdf-mobile', scheme: 'hindpdf', version: '1.0.48',
    orientation: 'default', userInterfaceStyle: 'automatic',
    icon: './assets/hindpdf-logo.png',
    splash: { image: './assets/hindpdf-logo.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
    ios: { bundleIdentifier: 'com.hindpdf.app', supportsTablet: true, infoPlist: { NSCameraUsageDescription: 'Use the camera to scan documents and capture photos for your files.', NSPhotoLibraryUsageDescription: 'Choose photos and signatures to scan, crop, and resize.', UIFileSharingEnabled: true, LSSupportsOpeningDocumentsInPlace: true, ITSAppUsesNonExemptEncryption: false } },
    android: { package: 'com.hindpdf.app', versionCode: 49, permissions: ['android.permission.CAMERA', 'android.permission.INTERNET'], blockedPermissions: ['android.permission.RECORD_AUDIO'] },
    plugins: ['./plugins/withHindPdfStorage', './plugins/withPdfViewerAlias', ['expo-splash-screen', { image: './assets/hindpdf-logo.png', imageWidth: 220, resizeMode: 'contain', backgroundColor: '#ffffff' }], 'react-native-document-scanner-plugin', ['expo-camera', { cameraPermission: 'Scan documents using your camera.', microphonePermission: false, recordAudioAndroid: false }], 'expo-dev-client', 'expo-document-picker', ['expo-image-picker', { photosPermission: 'Choose photos and signatures to scan, crop, and resize.', cameraPermission: 'Use the camera to scan documents and capture photos for your files.', microphonePermission: false }]],
    extra: { apiBase: process.env.EXPO_PUBLIC_API_BASE || 'https://api.hindpdf.com' }
  }
};
