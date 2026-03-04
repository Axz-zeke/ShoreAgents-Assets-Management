"use client";
import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  Mail,
  Settings,
  Shield,
  Users,
  Clock,
  TrendingDown,
  AlertTriangle,
  Calendar,
  ArrowRightLeft,
  Wrench,
  MoreHorizontal,
  ArrowRight
} from "lucide-react";

const reportCategories = [
  {
    title: "Automated Reports",
    description: "Pre-scheduled reports delivered automatically via email",
    icon: Mail,
    href: "/reports/automated",
    color: "bg-blue-500"
  },
  {
    title: "Custom Reports",
    description: "Build tailored reports with specific filters and data fields",
    icon: Settings,
    href: "/reports/custom",
    color: "bg-purple-500"
  },
  {
    title: "Asset Reports",
    description: "Reports on assets by category, location, cost, depreciation, etc.",
    icon: FileText,
    href: "/reports/assets",
    color: "bg-green-500"
  },
  {
    title: "Audit Reports",
    description: "Track changes, updates, or deletions in the system for accountability",
    icon: Shield,
    href: "/reports/audit",
    color: "bg-red-500"
  },
  {
    title: "Check-Out Reports",
    description: "Shows which assets are currently checked out, by whom, and for how long",
    icon: Users,
    href: "/reports/checkout",
    color: "bg-orange-500"
  },
  {
    title: "Depreciation Reports",
    description: "Calculates asset depreciation over time using accounting methods",
    icon: TrendingDown,
    href: "/reports/depreciation",
    color: "bg-yellow-500"
  },
  {
    title: "Insurance Reports",
    description: "Provides asset insurance details for claims and compliance",
    icon: AlertTriangle,
    href: "/reports/insurance",
    color: "bg-indigo-500"
  },
  {
    title: "Maintenance Reports",
    description: "Shows maintenance history, costs, and schedules",
    icon: Wrench,
    href: "/reports/maintenance",
    color: "bg-teal-500"
  },
  {
    title: "Reservation Reports",
    description: "Lists reserved assets and their booking details",
    icon: Clock,
    href: "/reports/reservation",
    color: "bg-cyan-500"
  },
  {
    title: "Status Reports",
    description: "Summarizes asset statuses (available, disposed, checked out, under repair, etc.)",
    icon: BarChart3,
    href: "/reports/status",
    color: "bg-emerald-500"
  },
  {
    title: "Transaction Reports",
    description: "Full record of asset transactions (additions, disposals, movements, check-in/out)",
    icon: ArrowRightLeft,
    href: "/reports/transaction",
    color: "bg-violet-500"
  },
  {
    title: "Other Reports",
    description: "Miscellaneous or combined reports for custom needs",
    icon: MoreHorizontal,
    href: "/reports/other",
    color: "bg-gray-500"
  }
];

export default function ReportsOverviewPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild ><Link href="/dashboard">
                    Dashboard
                  </Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Reports</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Reports Overview</h1>
                <p className="text-muted-foreground">
                  Access all available reports and analytics for your asset management system
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                      <p className="text-2xl font-bold">{reportCategories.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Automated</p>
                      <p className="text-2xl font-bold">1</p>
                    </div>
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Custom</p>
                      <p className="text-2xl font-bold">1</p>
                    </div>
                    <Settings className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Standard</p>
                      <p className="text-2xl font-bold">{reportCategories.length - 2}</p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportCategories.map((report) => {
                const IconComponent = report.icon;
                return (
                  <Card key={report.href} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${report.color} bg-opacity-10`}>
                          <IconComponent className={`h-6 w-6 ${report.color.replace('bg-', 'text-')}`} />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={() => window.location.href = report.href}
                      >
                        View Report
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Report Activity</CardTitle>
                <CardDescription>
                  Latest reports generated and accessed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Asset Report generated</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Transaction Report accessed</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Custom Report created</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

