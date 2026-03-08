import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./redesign.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
})

export const metadata: Metadata = {
  title: "InstaPay Checkout — Redesign Preview",
  description: "Redesigned landing page — Turn every chat into a sale",
}

export default function RedesignLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`redesign-theme ${plusJakarta.variable} min-h-screen bg-[var(--r-bg)] font-sans antialiased`}
      style={{ fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
    >
      {children}
    </div>
  )
}
