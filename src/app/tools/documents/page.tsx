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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { FileText, ArrowLeft, Upload, Download, Eye, Trash2, Plus, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedDate: string
  assetId: string
  assetName: string
  category: string
  description?: string
}

export default function DocumentsPage() {
  const { formatDate } = useSystemSettings()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterAsset, setFilterAsset] = useState("all")

  // Mock documents data
  const [documents] = useState<Document[]>([
    {
      id: "DOC-001",
      name: "MacBook Pro Purchase Receipt",
      type: "Receipt",
      size: 245760,
      uploadedDate: "2024-01-15",
      assetId: "AST-001",
      assetName: "MacBook Pro 16\"",
      category: "IT Equipment",
      description: "Original purchase receipt from Apple Store"
    },
    {
      id: "DOC-002",
      name: "Dell Monitor Warranty",
      type: "Warranty",
      size: 512000,
      uploadedDate: "2024-01-20",
      assetId: "AST-002",
      assetName: "Dell Monitor 27\"",
      category: "IT Equipment",
      description: "3-year warranty documentation"
    },
    {
      id: "DOC-003",
      name: "Office Chair Manual",
      type: "Manual",
      size: 1024000,
      uploadedDate: "2024-01-25",
      assetId: "AST-003",
      assetName: "Office Chair",
      category: "Furniture",
      description: "User manual and assembly instructions"
    },
    {
      id: "DOC-004",
      name: "Toyota Camry Insurance",
      type: "Insurance",
      size: 768000,
      uploadedDate: "2024-02-01",
      assetId: "AST-004",
      assetName: "Toyota Camry",
      category: "Vehicle",
      description: "Vehicle insurance policy document"
    },
    {
      id: "DOC-005",
      name: "Projector Maintenance Log",
      type: "Maintenance",
      size: 128000,
      uploadedDate: "2024-02-05",
      assetId: "AST-005",
      assetName: "Projector",
      category: "IT Equipment",
      description: "Maintenance history and service records"
    }
  ])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || doc.type === filterType
    const matchesAsset = filterAsset === "all" || doc.assetId === filterAsset

    return matchesSearch && matchesType && matchesAsset
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Receipt': return 'bg-green-100 text-green-800'
      case 'Warranty': return 'bg-blue-100 text-blue-800'
      case 'Manual': return 'bg-purple-100 text-purple-800'
      case 'Insurance': return 'bg-yellow-100 text-yellow-800'
      case 'Maintenance': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleUpload = () => {
    toast.info("Document upload feature coming soon!")
  }

  const handleDownload = (document: Document) => {
    toast.success(`Downloading ${document.name}...`)
  }

  const handleView = (document: Document) => {
    toast.info(`Viewing ${document.name}...`)
  }

  const handleDelete = (document: Document) => {
    toast.success(`Deleted ${document.name}`)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Documents Gallery</h1>
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
                  <BreadcrumbPage>Documents Gallery</BreadcrumbPage>
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
                  <h1 className="text-3xl font-bold tracking-tight">Documents Gallery</h1>
                  <p className="text-muted-foreground">
                    Repository for documents related to assets (receipts, purchase orders, manuals)
                  </p>
                </div>
              </div>
              <Button onClick={handleUpload} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search and Filter</CardTitle>
                <CardDescription>
                  Find documents by name, type, or associated asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type-filter">Document Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger id="type-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Receipt">Receipt</SelectItem>
                        <SelectItem value="Warranty">Warranty</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-filter">Asset</Label>
                    <Select value={filterAsset} onValueChange={setFilterAsset}>
                      <SelectTrigger id="asset-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        {Array.from(new Set(documents.map(doc => doc.assetId))).map(assetId => {
                          const doc = documents.find(d => d.assetId === assetId)
                          return (
                            <SelectItem key={assetId} value={assetId}>
                              {doc?.assetName} ({assetId})
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Results</Label>
                    <div className="flex items-center h-10 px-3 text-sm text-muted-foreground">
                      {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
              <CardHeader>
                <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
                <CardDescription>
                  Manage and view asset-related documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{document.name}</div>
                                {document.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {document.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(document.type)}>
                              {document.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{document.assetName}</div>
                              <div className="text-sm text-muted-foreground">
                                {document.assetId} • {document.category}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(document.size)}</TableCell>
                          <TableCell>{formatDate(document.uploadedDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(document)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(document)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(document)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}




