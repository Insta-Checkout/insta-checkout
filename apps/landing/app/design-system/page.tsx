import Link from "next/link"
import { ArrowRight, Palette } from "lucide-react"

const SYSTEMS = [
  {
    id: "2",
    path: "/design-system/2",
    title: "Design System 2",
    desc: "InstaPay Brand (Dark)",
    colors: ["#2D0A4E", "#F97316", "#6D28D9"],
    theme: "Deep purple + orange",
  },
  {
    id: "light",
    path: "/design-system/light",
    title: "Design System — Light Mode",
    desc: "White + orange accents",
    colors: ["#FAFAFA", "#F97316", "#FFEDD5"],
    theme: "White + orange",
  },
  {
    id: "light-purple",
    path: "/design-system/light-purple",
    title: "Design System — Light Purple",
    desc: "White + purple accents",
    colors: ["#FAFAFA", "#7C3AED", "#EDE9FE"],
    theme: "White + purple",
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
