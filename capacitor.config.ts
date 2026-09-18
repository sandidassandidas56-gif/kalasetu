import type { CapacitorConfig } from '@capacitor/cli'

const serverUrl = process.env.CAPACITOR_SERVER_URL
const isLocalDevelopment = process.env.CAPACITOR_LOCAL_DEV === 'true'

if (!serverUrl) {
  throw new Error('CAPACITOR_SERVER_URL is required. Set it to the deployed HTTPS app URL before building the mobile app.')
}

if (!isLocalDevelopment && (serverUrl.startsWith('http://localhost') || serverUrl.startsWith('http://192.168.') || serverUrl.startsWith('http://10.') || serverUrl.startsWith('http://172.'))) {
  throw new Error('CAPACITOR_SERVER_URL must be a publicly reachable HTTPS URL for a production mobile build.')
}

const config: CapacitorConfig = {
  appId: 'com.kalasetu.app',
  appName: 'KalaSetu',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: isLocalDevelopment,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1800,
      backgroundColor: '#f7f3ec',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config