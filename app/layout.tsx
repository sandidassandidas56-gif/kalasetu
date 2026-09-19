import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import './globals.css'
import { InstallPrompt } from './install-prompt'
import { NativeAppBridge } from '@/components/native-app-bridge'
import { AuthProvider } from '@/components/auth-provider'

export const metadata: Metadata = {
  title: "KalaSetu · India's Handmade Heritage",
  description: "Discover one-of-a-kind Indian handicrafts made by the hands that carry generations of craft forward.",
  generator: 'v0.app',
  icons: {
    icon: '/kalasetu.png',
    apple: '/kalasetu.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <InstallPrompt />
        <NativeAppBridge />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
