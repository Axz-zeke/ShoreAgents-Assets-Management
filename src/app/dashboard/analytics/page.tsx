"use client"
import Link from "next/link"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Wrench
} from "lucide-react"

// Mock data for analytics
const assetValueData = [
  { month: 'Jan', value: 2400000, depreciation: 120000 },
  { month: 'Feb', value: 2600000, depreciation: 130000 },
  { month: 'Mar', value: 2500000, depreciation: 125000 },
  { month: 'Apr', value: 2700000, depreciation: 135000 },
  { month: 'May', value: 2800000, depreciation: 140000 },
  { month: 'Jun', value: 2847500, depreciation: 142375 },
]

const assetStatusData = [
  { name: 'In Use', value: 1156, color: '#22c55e' },
  { name: 'Available', value: 68, color: '#3b82f6' },
  { name: 'Maintenance', value: 23, color: '#f59e0b' },
  { name: 'Disposed', value: 12, color: '#ef4444' },
  { name: 'Reserved', value: 45, color: '#8b5cf6' },
]

const departmentData = [
  { department: 'IT', assets: 450, value: 1200000, utilization: 85 },
  { department: 'HR', assets: 120, value: 350000, utilization: 70 },
  { department: 'Finance', assets: 80, value: 280000, utilization: 90 },
  { department: 'Marketing', assets: 95, value: 220000, utilization: 75 },
  { department: 'Operations', assets: 200, value: 650000, utilization: 80 },
]

const maintenanceTrends = [
  { month: 'Jan', scheduled: 45, emergency: 12, completed: 42 },
  { month: 'Feb', scheduled: 52, emergency: 8, completed: 48 },
  { month: 'Mar', scheduled: 48, emergency: 15, completed: 50 },
  { month: 'Apr', scheduled: 55, emergency: 10, completed: 52 },
  { month: 'May', scheduled: 60, emergency: 18, completed: 58 },
  { month: 'Jun', scheduled: 58, emergency: 14, completed: 55 },
]

const utilizationData = [
  { time: '00:00', utilization: 15 },
  { time: '04:00', utilization: 12 },
  { time: '08:00', utilization: 85 },
  { time: '12:00', utilization: 92 },
  { time: '16:00', utilization: 88 },
  { time: '20:00', utilization: 25 },
]

const chartConfig = {
  value: {
    label: "Asset Value",
    color: "var(--chart-1)",
  },
  depreciation: {
    label: "Depreciation",
    color: "var(--chart-2)",
  },
  assets: {
    label: "Assets",
    color: "var(--chart-1)",
  },
  utilization: {
    label: "Utilization %",
    color: "var(--chart-2)",
  },
  maintenance: {
    label: "Maintenance Count",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")
  const [chartType, setChartType] = useState("bar")
  const [assetValueChartType, setAssetValueChartType] = useState("bar")
  const [statusChartType, setStatusChartType] = useState("pie")
  const [departmentChartType, setDepartmentChartType] = useState("bar")
  const [utilizationChartType, setUtilizationChartType] = useState("area")
  const [maintenanceChartType, setMaintenanceChartType] = useState("bar")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild ><Link href="/dashboard">
                    Dashboard
                  </Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Analytics</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <Separator />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into your asset management system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.85M</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% from last month
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,304</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.2% from last month
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88.6%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2.1% from last month
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -5 from last week
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Asset Value Trend */}
            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5" />
                    <CardTitle>Asset Value Trend</CardTitle>
                  </div>
                  <Select value={assetValueChartType} onValueChange={setAssetValueChartType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  Asset portfolio value and depreciation over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  {assetValueChartType === "bar" ? (
                    <BarChart data={assetValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value'] as [string, string]}
                          />
                        }
                      />
                      <Bar dataKey="value" fill="var(--color-value)" />
                    </BarChart>
                  ) : assetValueChartType === "line" ? (
                    <LineChart data={assetValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value'] as [string, string]}
                          />
                        }
                      />
                      <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <AreaChart data={assetValueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value'] as [string, string]}
                          />
                        }
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.3} />
                    </AreaChart>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Asset Status Distribution */}
            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    <CardTitle>Asset Status Distribution</CardTitle>
                  </div>
                  <Select value={statusChartType} onValueChange={setStatusChartType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  Current status breakdown of all assets
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-[350px] w-full flex flex-col">
                  <ChartContainer config={chartConfig} className="h-[200px] w-full flex-1">
                    {statusChartType === "pie" ? (
                      <PieChart>
                        <Pie
                          data={assetStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {assetStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value: any) => [value.toString(), 'Assets']}
                            />
                          }
                        />
                      </PieChart>
                    ) : statusChartType === "doughnut" ? (
                      <PieChart>
                        <Pie
                          data={assetStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {assetStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value: any) => [value.toString(), 'Assets']}
                            />
                          }
                        />
                      </PieChart>
                    ) : (
                      <BarChart data={assetStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value: any) => [value.toString(), 'Assets']}
                            />
                          }
                        />
                        <Bar dataKey="value" fill="var(--chart-1)" />
                      </BarChart>
                    )}
                  </ChartContainer>
                  <div className="p-4 flex-shrink-0">
                    <div className="grid grid-cols-2 gap-2">
                      {assetStatusData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{item.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <CardTitle>Department Asset Distribution</CardTitle>
                  </div>
                  <Select value={departmentChartType} onValueChange={setDepartmentChartType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  Assets and values by department
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  {departmentChartType === "bar" ? (
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any, name: any) => [
                              name === 'assets' ? value : `$${value.toLocaleString()}`,
                              name === 'assets' ? 'Assets' : 'Value'
                            ]}
                          />
                        }
                      />
                      <Bar dataKey="assets" fill="var(--chart-1)" />
                    </BarChart>
                  ) : departmentChartType === "line" ? (
                    <LineChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any, name: any) => [
                              name === 'assets' ? value : `$${value.toLocaleString()}`,
                              name === 'assets' ? 'Assets' : 'Value'
                            ]}
                          />
                        }
                      />
                      <Line type="monotone" dataKey="assets" stroke="var(--chart-1)" strokeWidth={2} />
                    </LineChart>
                  ) : (
                    <AreaChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any, name: any) => [
                              name === 'assets' ? value : `$${value.toLocaleString()}`,
                              name === 'assets' ? 'Assets' : 'Value'
                            ]}
                          />
                        }
                      />
                      <Area type="monotone" dataKey="assets" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
                    </AreaChart>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <CardTitle>Daily Utilization Pattern</CardTitle>
                  </div>
                  <Select value={utilizationChartType} onValueChange={setUtilizationChartType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  Asset utilization throughout the day
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  {utilizationChartType === "area" ? (
                    <AreaChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any) => [`${value}%`, 'Utilization'] as [string, string]}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="utilization"
                        stroke="var(--chart-2)"
                        fill="var(--chart-2)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  ) : utilizationChartType === "line" ? (
                    <LineChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any) => [`${value}%`, 'Utilization'] as [string, string]}
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="utilization"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={utilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value: any) => [`${value}%`, 'Utilization'] as [string, string]}
                          />
                        }
                      />
                      <Bar dataKey="utilization" fill="var(--chart-2)" />
                    </BarChart>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Maintenance Trends */}
          <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  <CardTitle>Maintenance Trends</CardTitle>
                </div>
                <Select value={maintenanceChartType} onValueChange={setMaintenanceChartType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Scheduled vs emergency maintenance over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                {maintenanceChartType === "bar" ? (
                  <BarChart data={maintenanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value: any, name: any) => [value, name]}
                        />
                      }
                    />
                    <Bar dataKey="scheduled" fill="var(--chart-1)" name="Scheduled" />
                    <Bar dataKey="emergency" fill="var(--chart-2)" name="Emergency" />
                    <Bar dataKey="completed" fill="var(--chart-3)" name="Completed" />
                  </BarChart>
                ) : maintenanceChartType === "line" ? (
                  <LineChart data={maintenanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value: any, name: any) => [value, name]}
                        />
                      }
                    />
                    <Line type="monotone" dataKey="scheduled" stroke="var(--chart-1)" strokeWidth={2} name="Scheduled" />
                    <Line type="monotone" dataKey="emergency" stroke="var(--chart-2)" strokeWidth={2} name="Emergency" />
                    <Line type="monotone" dataKey="completed" stroke="var(--chart-3)" strokeWidth={2} name="Completed" />
                  </LineChart>
                ) : (
                  <AreaChart data={maintenanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value: any, name: any) => [value, name]}
                        />
                      }
                    />
                    <Area type="monotone" dataKey="scheduled" stackId="1" stroke="var(--chart-1)" fill="var(--chart-1)" name="Scheduled" />
                    <Area type="monotone" dataKey="emergency" stackId="1" stroke="var(--chart-2)" fill="var(--chart-2)" name="Emergency" />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--chart-3)" fill="var(--chart-3)" name="Completed" />
                  </AreaChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="hover:shadow-md transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest asset management activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-4 pr-4">
                  {[
                    { action: "Asset Checked Out", asset: "Laptop-001", user: "John Doe", time: "2 minutes ago", type: "checkout" },
                    { action: "Maintenance Scheduled", asset: "Printer-045", user: "IT Team", time: "15 minutes ago", type: "maintenance" },
                    { action: "Asset Added", asset: "Monitor-123", user: "Admin", time: "1 hour ago", type: "add" },
                    { action: "Asset Returned", asset: "Tablet-078", user: "Sarah Wilson", time: "2 hours ago", type: "return" },
                    { action: "Asset Moved", asset: "Desk-012", user: "Facilities", time: "3 hours ago", type: "move" },
                    { action: "Asset Reserved", asset: "Projector-034", user: "Marketing", time: "4 hours ago", type: "reserve" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`w-2 h-2 rounded-full ${activity.type === 'checkout' ? 'bg-blue-500' :
                        activity.type === 'maintenance' ? 'bg-yellow-500' :
                          activity.type === 'add' ? 'bg-green-500' :
                            activity.type === 'return' ? 'bg-purple-500' :
                              activity.type === 'move' ? 'bg-orange-500' :
                                'bg-pink-500'
                        }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.asset} • {activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

