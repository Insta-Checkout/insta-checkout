import type { Metadata, Viewport } from 'next'
import { Cairo, Inter, JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { FirebaseAnalytics } from '@/components/firebase-analytics'
import { LocaleProvider } from '@/lib/locale-provider'
import { LocalePersist } from '@/components/locale-persist'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Insta Checkout — Turn every chat into a sale | حوّل كل محادثة لعملية بيع',
  description:
    'Create an InstaPay payment link in seconds and send it to your customer on WhatsApp. أنشئ لينك دفع InstaPay في ثانيتين وابعته لعميلك على واتساب.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#2D0A4E',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${cairo.variable} ${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} ${plusJakarta.variable} font-sans antialiased`}>
        <LocaleProvider>
          <LocalePersist />
          {children}
          <Analytics />
          <FirebaseAnalytics />
        </LocaleProvider>
      </body>
    </html>
  )
}
