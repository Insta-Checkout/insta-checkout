import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./themes/base.css"
import "./themes/ds1.css"
import "./themes/ds2.css"
import "./themes/ds3.css"
import "./themes/ds4.css"
import { DesignSystemSwitcher } from "@/components/design-system/DesignSystemSwitcher"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
})

export const metadata: Metadata = {
  title: "Insta Checkout — Design Systems",
  description: "Design system variations for landing page",
}

export default function DesignSystemLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`ds-theme-4 ${plusJakarta.variable} min-h-screen bg-[var(--r-bg)] font-sans antialiased`}
      style={{ fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
    >
      {children}
      <DesignSystemSwitcher />
    </div>
  )
}
