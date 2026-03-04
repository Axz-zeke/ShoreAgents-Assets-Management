"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { Package, Eye, UserCheck, UserMinus, Calendar, ArrowUpRight, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  'Available': { label: 'Available', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-800' },
  'In Use': { label: 'In Use', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-200 dark:border-blue-800' },
  'Maintenance': { label: 'Maintenance', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10 border-orange-200 dark:border-orange-800' },
  'Disposed': { label: 'Disposed', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10 border-rose-200 dark:border-rose-800' },
  'Reserved': { label: 'Reserved', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10 border-violet-200 dark:border-violet-800' },
}

export function RecentAddedAssetsWidget() {
  const { data: assets = [], isLoading } = useInstantAssets()

  const recentAssets = React.useMemo(() => {
    if (isLoading) return []
    return assets
      .filter(a => a.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5)
  }, [assets, isLoading])

  return (
    <Card className="h-full border-border/50 shadow-sm overflow-hidden flex flex-col group/card bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Recent Assets</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                Newly added to inventory
              </CardDescription>
            </div>
          </div>
          <Button size="sm" variant="ghost" asChild className="h-7 text-[10px] font-black uppercase tracking-wider gap-1">
            <Link href="/assets/add">
              <Plus className="h-3 w-3" /> Add
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentAssets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6">
            <Package className="h-10 w-10 opacity-15" />
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest opacity-50">No assets yet</p>
              <Link href="/assets/add" className="text-xs text-primary hover:underline mt-1 inline-block font-bold">
                Add your first asset →
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/30 flex-1">
            {recentAssets.map((asset) => {
              const cfg = statusConfig[asset.status] ?? statusConfig['Available']
              return (
                <div key={asset.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center border text-[10px] font-black",
                    cfg.bg, cfg.color
                  )}>
                    {asset.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-tight">{asset.name || 'Unnamed Asset'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium truncate">{asset.id}</span>
                      {asset.createdAt && (
                        <>
                          <span className="text-muted-foreground/30 text-[10px]">·</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge className={cn("text-[9px] font-black px-1.5 py-0 border", cfg.bg, cfg.color)}>
                      {cfg.label}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/assets/${asset.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="p-3 border-t border-border/30 bg-muted/5 mt-auto">
          <Button variant="outline" className="w-full h-8 text-[10px] font-black uppercase tracking-wider gap-1.5" asChild>
            <Link href="/assets">
              View All Assets <ArrowUpRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
