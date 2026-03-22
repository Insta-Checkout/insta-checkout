"use client"

import { Instagram } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"

export function Footer() {
  const { t, get } = useTranslations()
  const links = (get("landing.footer.links") ?? {}) as Record<string, Array<{ label: string; href: string }>>

  const defaultLinks = {
    product: [
      { label: t("landing.nav.features"), href: "#features" },
      { label: t("landing.nav.pricing"), href: "#pricing" },
      { label: t("landing.nav.howItWorks"), href: "#how-it-works" },
    ],
    company: [
      { label: t("landing.footer.about"), href: "#" },
      { label: t("landing.footer.contact"), href: "#" },
    ],
    legal: [
      { label: t("landing.footer.privacy"), href: "#" },
      { label: t("landing.footer.terms"), href: "#" },
    ],
  }

  const groupLabels: Record<string, string> = {
    product: t("landing.footer.groupProduct"),
    company: t("landing.footer.groupCompany"),
    legal: t("landing.footer.groupLegal"),
  }

  const footerLinks = Object.keys(links).length > 0 ? links : defaultLinks

  return (
    <footer className="border-t border-[#E4D8F0] bg-[#F3EEFA]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="inline-flex items-center cursor-pointer">
              <img
                src="/logo/logo.svg"
                alt="Insta Checkout"
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#64748B]">
              {t("landing.footer.tagline")}
            </p>

            {/* Social */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E4D8F0] bg-white text-[#64748B] transition-colors hover:bg-[#7C3AED] hover:text-white hover:border-[#7C3AED]"
              >
                <Instagram className="h-4 w-4" />
              </a>
              {/* WhatsApp */}
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#E4D8F0] bg-white text-[#64748B] transition-colors hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.531 3.503" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, items]) => (
            <div key={group}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#1E0A3C]/60">
                {groupLabels[group] ?? group}
              </h4>
              <ul className="space-y-2.5">
                {(items as Array<{ label: string; href: string }>).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#64748B] transition-colors hover:text-[#1E0A3C] cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#E4D8F0] pt-8 sm:flex-row">
          <p className="text-sm text-[#64748B]">
            {t("landing.footer.copyright")}
          </p>
          <p className="text-xs text-[#64748B]/60">
            {t("landing.footer.madeWith")}
          </p>
        </div>
      </div>
    </footer>
  )
}
