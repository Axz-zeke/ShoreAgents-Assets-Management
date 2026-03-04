"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { Building2, ArrowUpRight, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const DEPT_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-pink-500",
]

export function DepartmentOverviewWidget() {
  const { data: assets = [], isLoading } = useInstantAssets()

  const departmentData = React.useMemo(() => {
    if (isLoading) return []

    const deptMap = assets.reduce((acc, asset) => {
      const dept = asset.department?.trim() || 'Unassigned'
      if (!acc[dept]) {
        acc[dept] = { name: dept, assetCount: 0, value: 0, active: 0 }
      }
      acc[dept].assetCount++
      acc[dept].value += asset.value || 0
      if (asset.status === 'In Use') acc[dept].active++
      return acc
    }, {} as Record<string, { name: string; assetCount: number; value: number; active: number }>)

    return Object.values(deptMap)
      .sort((a, b) => b.assetCount - a.assetCount)
      .slice(0, 7)
  }, [assets, isLoading])

  const maxCount = Math.max(...departmentData.map(d => d.assetCount), 1)
  const totalAssets = departmentData.reduce((sum, d) => sum + d.assetCount, 0)

  return (
    <Card className="h-full border-border/50 shadow-sm overflow-hidden flex flex-col group/card bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Department Overview</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                Asset distribution by department
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] bg-background/50">
            {isLoading ? "..." : `${departmentData.length} Depts`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col gap-3 overflow-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-muted/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : departmentData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Building2 className="h-8 w-8 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">No department data</p>
          </div>
        ) : (
          <div className="space-y-2">
            {departmentData.map((dept, idx) => {
              const pct = Math.round((dept.assetCount / maxCount) * 100)
              const sharePct = Math.round((dept.assetCount / totalAssets) * 100)
              return (
                <div key={dept.name} className="group/row">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={cn("h-2 w-2 rounded-full flex-shrink-0", DEPT_COLORS[idx % DEPT_COLORS.length])} />
                    <span className="text-xs font-bold flex-1 truncate">{dept.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground font-bold">{dept.active} active</span>
                      <Badge variant="secondary" className="text-[10px] font-black px-1.5 py-0">
                        {dept.assetCount}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-5">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        DEPT_COLORS[idx % DEPT_COLORS.length]
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && departmentData.length > 0 && (
          <Link
            href="/assets"
            className="mt-auto flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors pt-2 border-t border-border/30"
          >
            View All Assets <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
