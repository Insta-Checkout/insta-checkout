"use client"

import Link from "next/link"
import { Package, Link2, Zap } from "lucide-react"
import { useTranslations } from "@/lib/locale-provider"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

type DashboardActionBarProps = {
  onQuickLinkClick: () => void
}

export function DashboardActionBar({ onQuickLinkClick }: DashboardActionBarProps): React.JSX.Element {
  const { t } = useTranslations()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/dashboard/products">
        <Button
          variant="outline"
          className="gap-2 font-cairo border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA] cursor-pointer h-11"
        >
          <Package className="h-4 w-4" aria-hidden="true" />
          {t("dashboard.home.addProduct")}
        </Button>
      </Link>

      <Link href="/dashboard/links">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 font-cairo border-[#E4D8F0] text-[#7C3AED] hover:bg-[#F3EEFA] cursor-pointer h-11"
            >
              <Link2 className="h-4 w-4" aria-hidden="true" />
              {t("dashboard.home.createLink")}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {t("dashboard.home.createPaymentLinkTooltip")}
          </TooltipContent>
        </Tooltip>
      </Link>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="gap-2 font-cairo bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer h-11"
            onClick={onQuickLinkClick}
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            {t("dashboard.home.createQuickLink")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {t("dashboard.home.createQuickLinkTooltip")}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
