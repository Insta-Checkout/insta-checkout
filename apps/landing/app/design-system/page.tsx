import Link from "next/link"
import { ArrowRight, Palette } from "lucide-react"

const SYSTEMS = [
  {
    id: "1",
    path: "/design-system/1",
    title: "Design System 1",
    desc: "Social Proof-Focused",
    colors: ["#0EA5E9", "#38BDF8", "#F97316"],
    theme: "Sky blue + warm CTA (light)",
  },
  {
    id: "2",
    path: "/design-system/2",
    title: "Design System 2",
    desc: "InstaPay Brand",
    colors: ["#2D0A4E", "#F97316", "#FB923C"],
    theme: "Deep purple + orange (dark)",
  },
  {
    id: "3",
    path: "/design-system/3",
    title: "Design System 3",
    desc: "Purple Glassmorphism",
    colors: ["#0F172A", "#8B5CF6", "#A78BFA"],
    theme: "Purple variations (dark)",
  },
  {
    id: "4",
    path: "/design-system/4",
    title: "Design System 4",
    desc: "Teal Glassmorphism",
    colors: ["#0F172A", "#0D9488", "#14B8A6"],
    theme: "Teal variations (dark)",
  },
] as const

export default function DesignSystemHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 lg:py-24">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-[var(--r-text)] lg:text-4xl">
          Design Systems
        </h1>
        <p className="mt-3 text-lg text-[var(--r-text-muted)]">
          Insta Checkout landing page variations
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {SYSTEMS.map((sys) => (
          <Link
            key={sys.id}
            href={sys.path}
            className="group flex flex-col rounded-2xl border border-[var(--r-glass-border)] bg-[var(--r-bg-elevated)] p-6 transition-all hover:border-[var(--r-primary)]/40 hover:bg-[var(--r-glass)]/50 cursor-pointer"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--r-primary)]/20">
                <Palette className="h-5 w-5 text-[var(--r-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--r-text)]">
                  {sys.title}
                </h2>
                <p className="text-sm text-[var(--r-text-muted)]">{sys.desc}</p>
              </div>
            </div>
            <div className="mb-4 flex gap-2">
              {sys.colors.map((c) => (
                <div
                  key={c}
                  className="h-8 w-8 rounded-lg border border-[var(--r-border)]"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <p className="mb-4 text-sm text-[var(--r-text-muted)]">
              {sys.theme}
            </p>
            <span className="mt-auto flex items-center gap-2 text-sm font-medium text-[var(--r-primary)] group-hover:underline">
              View landing page
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
