import { CreditCard, Instagram } from "lucide-react"

const productLinks = [
  { label: "الميزات", href: "#features" },
  { label: "الأسعار", href: "#pricing" },
  { label: "ازاي بتشتغل", href: "#how-it-works" },
]

const companyLinks = [
  { label: "عننا", href: "#" },
  { label: "تواصل معانا", href: "#" },
]

const legalLinks = [
  { label: "سياسة الخصوصية", href: "#" },
  { label: "الشروط والأحكام", href: "#" },
]

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-footer-bg px-4 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-footer-foreground">
                InstaPay Checkout
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-footer-muted">
              أسهل طريقة تقبض InstaPay
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-bold text-footer-foreground">المنتج</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-footer-muted transition-colors hover:text-footer-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-footer-foreground">الشركة</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-footer-muted transition-colors hover:text-footer-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-footer-foreground">قانوني</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-footer-muted transition-colors hover:text-footer-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social + Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-footer-muted/20 pt-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Instagram" className="text-footer-muted transition-colors hover:text-footer-foreground">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="WhatsApp" className="text-footer-muted transition-colors hover:text-footer-foreground">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="TikTok" className="text-footer-muted transition-colors hover:text-footer-foreground">
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="text-footer-muted transition-colors hover:text-footer-foreground">
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>
          <p className="text-xs text-footer-muted">
            {'© ٢٠٢٦ InstaPay Checkout. كل الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
