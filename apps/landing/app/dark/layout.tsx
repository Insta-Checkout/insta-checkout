import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./dark-theme.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
})

export const metadata: Metadata = {
  title: "InstaPay Checkout — Dark (Teal)",
  description: "Dark landing page with teal theme — Turn every chat into a sale",
}

export default function DarkLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`dark-theme ${plusJakarta.variable} min-h-screen bg-[var(--r-bg)] font-sans antialiased`}
      style={{ fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
    >
      {children}
    </div>
  )
}
