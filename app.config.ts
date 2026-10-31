export default {
  expo: {
    name: 'HindPDF', slug: 'hindpdf-mobile', scheme: 'hindpdf', version: '1.0.2',
    orientation: 'default', userInterfaceStyle: 'light',
    icon: './assets/hindpdf-logo.png',
    splash: { image: './assets/hindpdf-logo.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
    ios: { bundleIdentifier: 'com.hindpdf.app', supportsTablet: true, infoPlist: { NSCameraUsageDescription: 'Scan paper documents and capture application photos.', NSPhotoLibraryUsageDescription: 'Choose photos and signatures for your documents.', UIFileSharingEnabled: true, LSSupportsOpeningDocumentsInPlace: true, ITSAppUsesNonExemptEncryption: false } },
    android: { package: 'com.hindpdf.app', versionCode: 3, permissions: ['CAMERA'], blockedPermissions: ['android.permission.RECORD_AUDIO'] },
    plugins: ['react-native-document-scanner-plugin', ['expo-camera', { cameraPermission: 'Scan documents using your camera.', microphonePermission: false, recordAudioAndroid: false }], 'expo-dev-client', 'expo-document-picker', ['expo-image-picker', { photosPermission: 'Choose photos and signatures for PDF tools.', cameraPermission: 'Scan documents and capture application photos.', microphonePermission: false }]],
    extra: { apiBase: process.env.EXPO_PUBLIC_API_BASE || 'https://api.hindpdf.com' }
  }
};
