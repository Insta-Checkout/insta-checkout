import { notFound } from "next/navigation"

const VALID_IDS = ["2", "light", "light-purple"] as const

export default async function DesignSystemIdLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ id: string }>
}>) {
  const { id } = await params
  if (!VALID_IDS.includes(id as (typeof VALID_IDS)[number])) {
    notFound()
  }
  const themeClass = `ds-theme-${id}`
  return (
    <div className={`${themeClass} min-h-screen bg-[var(--r-bg)]`}>
      {children}
    </div>
  )
}
