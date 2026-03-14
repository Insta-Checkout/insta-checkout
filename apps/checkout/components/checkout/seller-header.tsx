"use client"

import { Store } from "lucide-react"

interface SellerHeaderProps {
  businessName: string
  categoryTag?: string
  logoUrl?: string
}

export function SellerHeader({ businessName, categoryTag, logoUrl }: SellerHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-3 pb-6 border-b border-border">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10 text-primary">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${businessName} logo`}
            className="size-16 rounded-2xl object-cover"
          />
        ) : (
          <Store className="size-8" />
        )}
      </div>
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-xl font-bold text-foreground text-balance text-center">
          {businessName}
        </h1>
      </div>
    </header>
  )
}
