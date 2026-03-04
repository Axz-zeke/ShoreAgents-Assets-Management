"use client"
import Link from "next/link"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useSystemSettings } from "@/contexts/system-settings-context"
import { CurrencyDisplay } from "@/components/currency-display"
import { DateDisplay } from "@/components/date-display"
import { DollarSign, Calendar, Globe, Building2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SystemSettingsDemoPage() {
  const { settings, isLoading, formatCurrency, formatDate, formatDateTime, refreshSettings } = useSystemSettings()

  const sampleAmounts = [100, 1000, 5000, 12500, 99999]
  const sampleDates = [
    new Date('2024-01-15'),
    new Date('2024-06-20'),
    new Date(),
    new Date('2025-12-31'),
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <h1 className="text-lg font-semibold">System Settings Demo</h1>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 sm:p-6 md:p-8 pt-0">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild ><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild ><Link href="/setup">Setup</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>System Settings Demo</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings Demo</h1>
                <p className="text-muted-foreground">
                  See how timezone and currency settings affect displays across the app
                </p>
              </div>
              <Button onClick={refreshSettings} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Settings
              </Button>
            </div>

            {/* Current Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Current System Settings
                </CardTitle>
                <CardDescription>
                  These settings are loaded from your company info
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading settings...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Globe className="h-4 w-4" />
                        Timezone
                      </div>
                      <p className="text-2xl font-bold">{settings.timezone}</p>
                      <p className="text-sm text-muted-foreground">
                        Current time: {formatDateTime(new Date())}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <DollarSign className="h-4 w-4" />
                        Currency
                      </div>
                      <p className="text-2xl font-bold">{settings.currency}</p>
                      <p className="text-sm text-muted-foreground">
                        Example: {formatCurrency(1234.56)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Currency Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency Formatting Examples
                </CardTitle>
                <CardDescription>
                  All amounts automatically format with your configured currency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleAmounts.map((amount) => (
                    <div key={amount} className="flex items-center justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground">
                        Raw value: {amount}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Using Hook:</span>
                        <span className="text-lg font-semibold">{formatCurrency(amount)}</span>
                        <span className="text-sm">Using Component:</span>
                        <CurrencyDisplay amount={amount} className="text-lg font-semibold text-primary" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">ðŸ’¡ Pro Tip:</p>
                  <p className="text-sm text-muted-foreground">
                    Change your currency in <Link href="/setup/company-info" className="underline">Company Info</Link> 
                    {' '}and watch all these values update automatically!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Date Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date & Time Formatting Examples
                </CardTitle>
                <CardDescription>
                  All dates automatically format with your configured timezone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleDates.map((date, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Date #{index + 1}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {date.toISOString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Date Only</p>
                          <DateDisplay date={date} format="date" className="font-medium" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                          <DateDisplay date={date} format="datetime" className="font-medium" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Using Hook</p>
                          <span className="font-medium">{formatDate(date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">ðŸ’¡ Pro Tip:</p>
                  <p className="text-sm text-muted-foreground">
                    Change your timezone in <Link href="/setup/company-info" className="underline">Company Info</Link>
                    {' '}and watch all these dates update to the new timezone automatically!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use in Your Components</CardTitle>
                <CardDescription>
                  Quick reference for implementing system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Using the Hook (Client Components)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { useSystemSettings } from "@/contexts/system-settings-context"

const { formatCurrency, formatDate } = useSystemSettings()
<p>{formatCurrency(asset.cost)}</p>
<p>{formatDate(asset.purchaseDate)}</p>`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Using Components (Easiest)</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { CurrencyDisplay } from "@/components/currency-display"
import { DateDisplay } from "@/components/date-display"

<CurrencyDisplay amount={asset.cost} />
<DateDisplay date={asset.purchaseDate} />`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Supported Formats</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>30+ currencies with proper symbols (USD, EUR, GBP, JPY, etc.)</li>
                    <li>50+ timezones covering all major regions worldwide</li>
                    <li>Automatic updates when settings change</li>
                    <li>Type-safe with TypeScript support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}







