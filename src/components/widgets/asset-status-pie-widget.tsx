"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { useInstantAssets } from "@/hooks/use-instant-assets"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  count: {
    label: "Assets",
  },
  available: {
    label: "Available",
    color: "hsl(var(--chart-1))",
  },
  "checked-out": {
    label: "Checked out",
    color: "hsl(var(--chart-2))",
  },
  maintenance: {
    label: "Maintenance",
    color: "hsl(var(--chart-3))",
  },
  reserved: {
    label: "Reserved",
    color: "hsl(var(--chart-4))",
  },
  disposed: {
    label: "Disposed",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function AssetStatusPieWidget() {
  const { data: assets = [], isLoading } = useInstantAssets()

  const chartData = React.useMemo(() => {
    if (isLoading) return []

    const statusCounts = assets.reduce((acc, asset) => {
      let status = (asset.status || 'available').toLowerCase().replace(/\s+/g, '-')
      // Map aliases
      if (status === 'in-use' || status === 'checkedout') status = 'checked-out'
      if (status === 'dispose') status = 'disposed'
      if (status === 'reserve') status = 'reserved'

      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      { status: "available", count: statusCounts.available || 0, fill: "var(--color-available)" },
      { status: "checked-out", count: statusCounts['checked-out'] || 0, fill: "var(--color-checked-out)" },
      { status: "maintenance", count: statusCounts.maintenance || 0, fill: "var(--color-maintenance)" },
      { status: "reserved", count: statusCounts.reserved || 0, fill: "var(--color-reserved)" },
      { status: "disposed", count: statusCounts.disposed || 0, fill: "var(--color-disposed)" },
    ].filter(item => item.count > 0)
  }, [assets, isLoading])
  const totalAssets = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col hover:shadow-md transition-all duration-300 ease-in-out">
      <CardHeader className="items-center pb-0">
        <CardTitle>Asset Status</CardTitle>
        <CardDescription>Asset inventory status overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalAssets.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Assets
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Asset utilization up by 2.1% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Current asset status distribution across all categories
        </div>
      </CardFooter>
    </Card>
  )
}
