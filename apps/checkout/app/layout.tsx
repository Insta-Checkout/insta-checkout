import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Cairo } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { FirebaseAnalytics } from '@/components/firebase-analytics'
import { LocaleProvider } from '@/lib/locale-provider'
import './globals.css'

const _cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Checkout - InstaPay Payment',
  description: 'Complete your InstaPay payment securely. Verify, pay, and confirm your transaction.',
}

export const viewport: Viewport = {
  themeColor: '#0D9488',
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${_cairo.variable} ${_geistMono.variable} font-sans antialiased`}>
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
