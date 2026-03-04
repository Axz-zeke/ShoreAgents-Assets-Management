"use client"

import { useState, useRef } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Upload, ArrowLeft, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface ImportRow {
  row: number
  data: Record<string, any>
  status: 'pending' | 'success' | 'error'
  error?: string
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<ImportRow[]>([])
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile)
        setImportResults([])
        setProgress(0)
        toast.success(`File "${selectedFile.name}" selected`)
      } else {
        toast.error("Please select a valid CSV or Excel file")
        e.target.value = ''
      }
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setImporting(true)
    setProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/assets', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Import failed')
      }

      const result = await response.json()
      
      setImportResults(result.results || [])
      setProgress(100)
      
      const successCount = result.results.filter((r: ImportRow) => r.status === 'success').length
      const errorCount = result.results.filter((r: ImportRow) => r.status === 'error').length
      
      if (errorCount === 0) {
        toast.success(`Successfully imported ${successCount} assets!`)
      } else {
        toast.warning(`Imported ${successCount} assets with ${errorCount} errors`)
      }
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || "Failed to import assets")
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `Asset Tag ID,Asset Name,Description,Serial Number,Brand,Model,Cost,Purchase Date,Date Acquired,Category,Sub Category,Location,Site,Department,Status,Assigned To,Asset Type,Notes,Manufacturer
AST-001,Sample Asset,Sample description,SN12345,Sample Brand,Model X,1000.00,2024-01-15,2024-01-15,IT Equipment,Laptop,Office Floor 1,Main Office,IT Department,Available,John Doe,Equipment,Sample notes,Sample Manufacturer`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asset_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success("Template downloaded successfully!")
  }

  const successCount = importResults.filter(r => r.status === 'success').length
  const errorCount = importResults.filter(r => r.status === 'error').length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Import Assets</h1>
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
                  <BreadcrumbPage>Import</BreadcrumbPage>
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
                  <h1 className="text-3xl font-bold tracking-tight">Import Assets</h1>
                  <p className="text-muted-foreground">
                    Upload bulk asset data from CSV or Excel files
                  </p>
                </div>
              </div>
            </div>

            {/* Download Template */}
            <Card>
              <CardHeader>
                <CardTitle>Download Template</CardTitle>
                <CardDescription>
                  Get started by downloading our CSV template with the correct format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>
                  Select a CSV or Excel file containing your asset data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Choose File
                    </Button>
                    {file && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </div>
                    )}
                  </div>

                  {file && (
                    <Button
                      onClick={handleImport}
                      disabled={importing}
                      className="w-full flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {importing ? "Importing..." : "Start Import"}
                    </Button>
                  )}

                  {importing && (
                    <div className="space-y-2">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-muted-foreground text-center">
                        Processing... {progress}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Import Results Summary */}
            {importResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{importResults.length}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{successCount}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Import Results Details */}
            {importResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Import Results</CardTitle>
                  <CardDescription>
                    Detailed results for each row in the import file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Asset Tag ID</TableHead>
                          <TableHead>Asset Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResults.map((result) => (
                          <TableRow key={result.row}>
                            <TableCell className="font-medium">{result.row}</TableCell>
                            <TableCell>{result.data['Asset Tag ID'] || '-'}</TableCell>
                            <TableCell>{result.data['Asset Name'] || '-'}</TableCell>
                            <TableCell>
                              {result.status === 'success' ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  Success
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="h-4 w-4" />
                                  Error
                                </div>
                              )}
                            </TableCell>
                            <TableCell className={result.status === 'error' ? 'text-red-600' : ''}>
                              {result.error || 'Imported successfully'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            {importResults.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Import Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Download the CSV template to see the required format</li>
                    <li>Fill in your asset data following the template structure</li>
                    <li>Save your file as CSV or Excel (.xlsx)</li>
                    <li>Upload the file using the &quot;Choose File&quot; button above</li>
                    <li>Click &quot;Start Import&quot; to process your data</li>
                    <li>Review the results and fix any errors if needed</li>
                  </ol>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <strong>Required Fields:</strong> Asset Tag ID, Asset Name
                    <br />
                    <strong>Optional Fields:</strong> Description, Serial Number, Brand, Model, Cost, Purchase Date, Category, Location, etc.
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}

