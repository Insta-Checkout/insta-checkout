import type { Metadata, Viewport } from "next"
import { Cairo, Outfit, Plus_Jakarta_Sans } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { LocaleProvider } from "@/lib/locale-provider"
import "./globals.css"

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Admin | Insta Checkout",
  description: "Insta Checkout admin dashboard",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#2D0A4E",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${cairo.variable} ${outfit.variable} ${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}>
        <LocaleProvider>
          {children}
          <Toaster position="top-center" richColors />
        </LocaleProvider>
      </body>
    </html>
  )
}
