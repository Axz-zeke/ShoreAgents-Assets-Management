"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import { BarChart3, PieChart as PieIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8b5cf6",
  "#06b6d4",
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur border border-border rounded-xl shadow-xl p-3 text-xs">
        <p className="font-black uppercase tracking-wider mb-1 text-muted-foreground text-[10px]">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 font-bold" style={{ color: p.fill || p.color }}>
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.fill || p.color }} />
            ₱{Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        ))}
      </div>
    )
  }
  return null
}

const PieCustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur border border-border rounded-xl shadow-xl p-3 text-xs">
        <p className="font-black truncate max-w-[160px]">{payload[0].name}</p>
        <p className="text-muted-foreground mt-1">
          <span className="font-bold text-foreground">₱{Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          {" "}· {payload[0].payload.count} assets
        </p>
      </div>
    )
  }
  return null
}

export function AssetValueChartWidget() {
  const { data: assets = [], isLoading } = useInstantAssets()
  const [view, setView] = React.useState<"bar" | "pie">("bar")

  const { chartData, totalValue, topCategory } = React.useMemo(() => {
    if (isLoading || assets.length === 0) return { chartData: [], totalValue: 0, topCategory: null }

    const categoryMap = assets.reduce((acc, asset) => {
      const cat = (asset.category || 'Uncategorized')
        .replace(/COMPUTER ACCESSORIES?.*/i, 'PC Accessories')
        .replace(/COMPUTER - MAIN ITEMS?/i, 'Computers')
        .replace(/NETWORK DEVICE/i, 'Network')
        .replace(/OFFICE FURNITURE/i, 'Furniture')
        .replace(/FIRE EQUIPMENT/i, 'Fire Safety')
        .replace(/HARDWARE AND OFFICE ESSENTIALS?/i, 'HW & Essentials')
        .replace(/PHOTOGRAPHY AND VIDEOGRAPHY/i, 'Photo/Video')
        .replace(/COMMUNICATION AND WATCHES?/i, 'Comms & Watches')
        .replace(/OFFICE ELECTRONICS.*$/i, 'Office Electronics')
        .trim()
        .slice(0, 18)

      if (!acc[cat]) acc[cat] = { value: 0, count: 0 }
      acc[cat].value += asset.value || 0
      acc[cat].count++
      return acc
    }, {} as Record<string, { value: number; count: number }>)

    const sorted = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b.value - a.value)
      .slice(0, 7)

    const data = sorted.map(([name, d]) => ({ name, value: d.value, count: d.count }))
    const total = data.reduce((sum, d) => sum + d.value, 0)

    return { chartData: data, totalValue: total, topCategory: data[0] ?? null }
  }, [assets, isLoading])

  return (
    <Card className="h-full border-border/50 shadow-sm overflow-hidden flex flex-col group/card bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight">Asset Value by Category</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                Total portfolio value breakdown
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm" variant={view === "bar" ? "default" : "ghost"}
              className="h-7 w-7 p-0" onClick={() => setView("bar")}
              title="Bar Chart"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm" variant={view === "pie" ? "default" : "ghost"}
              className="h-7 w-7 p-0" onClick={() => setView("pie")}
              title="Pie Chart"
            >
              <PieIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Summary row */}
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Total Value</p>
            <p className="text-lg font-black tracking-tight">
              {isLoading ? <span className="inline-block w-20 h-5 bg-muted/50 rounded animate-pulse" /> : `₱${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </p>
          </div>
          {topCategory && (
            <div className="border-l border-border/40 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Top Category</p>
              <p className="text-sm font-black truncate max-w-[120px]">{topCategory.name}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2 flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-32 w-48 bg-muted/40 rounded-xl animate-pulse mx-auto" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Loading chart data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">No asset value data</p>
          </div>
        ) : view === "bar" ? (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₱${v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius="35%"
                outerRadius="65%"
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<PieCustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: '9px', fontWeight: 700 }}
                formatter={(value) => value.length > 14 ? value.slice(0, 13) + '…' : value}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
