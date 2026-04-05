"use client"

import { Store } from "lucide-react"

interface SellerHeaderProps {
  businessName: string
  categoryTag?: string
  logoUrl?: string
  coverPhotoUrl?: string
  slogan?: string
}

export function SellerHeader({ businessName, categoryTag, logoUrl, coverPhotoUrl, slogan }: SellerHeaderProps) {
  const hasCover = !!coverPhotoUrl

  return (
    <header className="flex flex-col items-center border-b border-border">
      {/* Cover photo */}
      {hasCover && (
        <div className="w-full h-32 -mx-4 overflow-hidden rounded-t-xl relative">
          <img
            src={coverPhotoUrl}
            alt=""
            className="w-full h-full object-cover object-center"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none" }}
          />
        </div>
      )}

      {/* Logo + name section */}
      <div className={`flex flex-col items-center gap-3 pb-6 ${hasCover ? "-mt-8 relative z-10" : "pt-0"}`}>
        <div className={`flex items-center justify-center size-16 rounded-2xl text-primary ${hasCover ? "ring-4 ring-background bg-background" : "bg-primary/10"}`}>
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
          {slogan && (
            <p className="text-sm text-muted-foreground text-center text-balance">
              {slogan}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
