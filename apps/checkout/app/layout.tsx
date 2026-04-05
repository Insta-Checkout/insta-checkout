import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Cairo, Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { FirebaseAnalytics } from '@/components/firebase-analytics'
import { LocaleProvider } from '@/lib/locale-provider'
import './globals.css'

const _cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })
const _outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const _plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Checkout - InstaPay Payment',
  description: 'Complete your InstaPay payment securely. Verify, pay, and confirm your transaction.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${_cairo.variable} ${_outfit.variable} ${_plusJakarta.variable} ${_geistMono.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <LocaleProvider>
            {children}
            <Toaster position="top-center" richColors />
            <Analytics />
            <FirebaseAnalytics />
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  )
}
