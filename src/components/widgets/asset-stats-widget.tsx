"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { Package, CheckCircle, Clock, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function AssetStatsWidget() {
  const { data: assets = [], isLoading } = useInstantAssets()

  const stats = React.useMemo(() => {
    if (isLoading || assets.length === 0) {
      return { totalAssets: 0, activeAssets: 0, maintenanceDue: 0, totalValue: 0, availableAssets: 0, disposedAssets: 0 }
    }
    return {
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.status === 'In Use').length,
      availableAssets: assets.filter(a => a.status === 'Available').length,
      maintenanceDue: assets.filter(a => a.status === 'Maintenance').length,
      disposedAssets: assets.filter(a => a.status === 'Disposed').length,
      totalValue: assets.reduce((sum, a) => sum + (a.value || 0), 0)
    }
  }, [assets, isLoading])

  const utilizationRate = stats.totalAssets > 0
    ? Math.round((stats.activeAssets / stats.totalAssets) * 100)
    : 0

  const cards = [
    {
      label: "Total Assets",
      value: isLoading ? "—" : stats.totalAssets.toLocaleString(),
      icon: Package,
      color: "blue",
      bg: "bg-blue-500/10 dark:bg-blue-400/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      href: "/assets"
    },
    {
      label: "Active Assets",
      value: isLoading ? "—" : stats.activeAssets.toLocaleString(),
      sub: `${utilizationRate}% utilization`,
      icon: CheckCircle,
      color: "emerald",
      bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      href: "/assets?status=In+Use"
    },
    {
      label: "Maintenance Due",
      value: isLoading ? "—" : stats.maintenanceDue.toLocaleString(),
      icon: Clock,
      color: "orange",
      bg: "bg-orange-500/10 dark:bg-orange-400/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
      href: "/lists/maintenances"
    },
    {
      label: "Total Value",
      value: isLoading ? "—" : `₱${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "purple",
      bg: "bg-purple-500/10 dark:bg-purple-400/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
      href: "/reports"
    }
  ]

  return (
    <Card className="h-full border-border/50 shadow-sm overflow-hidden flex flex-col group/card bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Asset Statistics</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                Overview of your asset inventory
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] bg-background/50">
            {isLoading ? "..." : `${stats.totalAssets} Total`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1">
        <div className="grid grid-cols-2 gap-3 h-full">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="block group">
              <div className={cn(
                "relative h-full min-h-[90px] rounded-xl border p-3 flex flex-col gap-2 transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02] cursor-pointer",
                card.bg, card.border
              )}>
                <div className="flex items-center justify-between">
                  <div className={cn("p-1.5 rounded-lg bg-white/50 dark:bg-black/20", card.iconColor)}>
                    <card.icon className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className={cn("h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity", card.iconColor)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 leading-none mb-1">{card.label}</p>
                  <p className={cn("text-xl font-black tracking-tight leading-none", card.iconColor)}>
                    {isLoading ? (
                      <span className="inline-block w-10 h-5 bg-muted/50 rounded animate-pulse" />
                    ) : card.value}
                  </p>
                  {card.sub && (
                    <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
