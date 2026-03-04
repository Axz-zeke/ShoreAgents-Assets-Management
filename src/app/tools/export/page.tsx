"use client"

import { useState } from "react"
import { useSystemSettings } from "@/contexts/system-settings-context"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Download, ArrowLeft, FileSpreadsheet, FileText, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ExportPage() {
  const { formatDate, formatCurrency } = useSystemSettings()
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv')
  const [exporting, setExporting] = useState(false)
  const [includeFields, setIncludeFields] = useState({
    basic: true,
    financial: true,
    location: true,
    assignment: true,
    dates: true,
    custom: true
  })
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const handleExport = async () => {
    setExporting(true)
    
    try {
      const queryParams = new URLSearchParams({
        format,
        status: filterStatus,
        category: filterCategory,
        ...Object.fromEntries(
          Object.entries(includeFields).map(([key, value]) => [key, value.toString()])
        )
      })

      const response = await fetch(`/api/export/assets?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assets_export_${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Successfully exported assets as ${format.toUpperCase()}!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error("Failed to export assets")
    } finally {
      setExporting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Export Assets</h1>
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
                  <BreadcrumbLink asChild ><Link href="/tools">Tools</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Export</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tools">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Tools
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Export Assets</h1>
                  <p className="text-muted-foreground">
                    Download asset data in CSV or Excel format
                  </p>
                </div>
              </div>
            </div>

            {/* Export Format */}
            <Card>
              <CardHeader>
                <CardTitle>Export Format</CardTitle>
                <CardDescription>
                  Choose the file format for your export
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={format} onValueChange={(value: 'csv' | 'xlsx') => setFormat(value)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">CSV (Comma-Separated Values)</div>
                        <div className="text-sm text-muted-foreground">
                          Universal format compatible with Excel, Google Sheets, and most applications
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="xlsx" id="xlsx" />
                    <Label htmlFor="xlsx" className="flex items-center gap-2 cursor-pointer flex-1">
                      <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Excel (.xlsx)</div>
                        <div className="text-sm text-muted-foreground">
                          Native Excel format with formatting and multiple sheets support
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter assets to export only specific items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="In Use">In Use</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Vehicle">Vehicle</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                        <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Field Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Fields to Include</CardTitle>
                <CardDescription>
                  Select which groups of fields to include in the export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="basic"
                    checked={includeFields.basic}
                    onCheckedChange={(checked) => setIncludeFields({...includeFields, basic: !!checked})}
                  />
                  <Label htmlFor="basic" className="cursor-pointer">
                    <div className="font-medium">Basic Information</div>
                    <div className="text-sm text-muted-foreground">Asset Tag ID, Name, Description, Serial Number</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="financial"
                    checked={includeFields.financial}
                    onCheckedChange={(checked) => setIncludeFields({...includeFields, financial: !!checked})}
                  />
                  <Label htmlFor="financial" className="cursor-pointer">
                    <div className="font-medium">Financial Information</div>
                    <div className="text-sm text-muted-foreground">Cost, Purchase Date, Depreciation</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="location"
                    checked={includeFields.location}
                    onCheckedChange={(checked) => setIncludeFields({...includeFields, location: !!checked})}
                  />
                  <Label htmlFor="location" className="cursor-pointer">
                    <div className="font-medium">Location Information</div>
                    <div className="text-sm text-muted-foreground">Location, Site, Department</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assignment"
                    checked={includeFields.assignment}
                    onCheckedChange={(checked) => setIncludeFields({...includeFields, assignment: !!checked})}
                  />
                  <Label htmlFor="assignment" className="cursor-pointer">
                    <div className="font-medium">Assignment Information</div>
                    <div className="text-sm text-muted-foreground">Assigned To, Status, Asset Type</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dates"
                    checked={includeFields.dates}
                    onCheckedChange={(checked) => setIncludeFields({...includeFields, dates: !!checked})}
                  />
                  <Label htmlFor="dates" className="cursor-pointer">
                    <div className="font-medium">Date Information</div>
                    <div className="text-sm text-muted-foreground">Created At, Updated At, Date Acquired</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="custom"
                    checked={includeFields.custom}
                    onCheckedChange={(checked) => setIncludeFields({...includeFields, custom: !!checked})}
                  />
                  <Label htmlFor="custom" className="cursor-pointer">
                    <div className="font-medium">Custom Fields</div>
                    <div className="text-sm text-muted-foreground">Brand, Model, Manufacturer, Notes</div>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Export Button */}
            <Card>
              <CardContent className="p-6">
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Export Assets
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Information */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Export Information:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The export will include all assets matching your filter criteria</li>
                  <li>CSV format is recommended for maximum compatibility</li>
                  <li>Excel format provides better formatting and formula support</li>
                  <li>You can open the exported file in Excel, Google Sheets, or any spreadsheet application</li>
                  <li>Use the exported data for reporting, analysis, or as a backup</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}

