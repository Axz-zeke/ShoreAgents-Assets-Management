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
import { Image, ArrowLeft, Upload, Download, Eye, Trash2, Plus, Search, Grid, List } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AssetImage {
  id: string
  name: string
  url: string
  size: number
  uploadedDate: string
  assetId: string
  assetName: string
  category: string
  description?: string
  tags: string[]
}

export default function ImagesPage() {
  const { formatDate } = useSystemSettings()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAsset, setFilterAsset] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Mock images data
  const [images] = useState<AssetImage[]>([
    {
      id: "IMG-001",
      name: "MacBook Pro Front View",
      url: "/api/placeholder/400/300",
      size: 1024000,
      uploadedDate: "2024-01-15",
      assetId: "AST-001",
      assetName: "MacBook Pro 16\"",
      category: "IT Equipment",
      description: "Front view of the MacBook Pro showing the screen and keyboard",
      tags: ["front", "laptop", "apple"]
    },
    {
      id: "IMG-002",
      name: "Dell Monitor Setup",
      url: "/api/placeholder/400/300",
      size: 2048000,
      uploadedDate: "2024-01-20",
      assetId: "AST-002",
      assetName: "Dell Monitor 27\"",
      category: "IT Equipment",
      description: "Monitor setup on desk with cables connected",
      tags: ["setup", "monitor", "desk"]
    },
    {
      id: "IMG-003",
      name: "Office Chair Side View",
      url: "/api/placeholder/400/300",
      size: 1536000,
      uploadedDate: "2024-01-25",
      assetId: "AST-003",
      assetName: "Office Chair",
      category: "Furniture",
      description: "Side view showing ergonomic design and lumbar support",
      tags: ["side", "chair", "ergonomic"]
    },
    {
      id: "IMG-004",
      name: "Toyota Camry Exterior",
      url: "/api/placeholder/400/300",
      size: 3072000,
      uploadedDate: "2024-02-01",
      assetId: "AST-004",
      assetName: "Toyota Camry",
      category: "Vehicle",
      description: "Exterior view of the company vehicle",
      tags: ["exterior", "car", "vehicle"]
    },
    {
      id: "IMG-005",
      name: "Projector Mounted",
      url: "/api/placeholder/400/300",
      size: 1280000,
      uploadedDate: "2024-02-05",
      assetId: "AST-005",
      assetName: "Projector",
      category: "IT Equipment",
      description: "Projector mounted on ceiling in conference room",
      tags: ["mounted", "projector", "ceiling"]
    },
    {
      id: "IMG-006",
      name: "Conference Table Overview",
      url: "/api/placeholder/400/300",
      size: 2560000,
      uploadedDate: "2024-02-10",
      assetId: "AST-006",
      assetName: "Conference Table",
      category: "Furniture",
      description: "Overview of the conference table with chairs",
      tags: ["overview", "table", "conference"]
    }
  ])

  const filteredImages = images.filter(img => {
    const matchesSearch = img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesAsset = filterAsset === "all" || img.assetId === filterAsset

    return matchesSearch && matchesAsset
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = () => {
    toast.info("Image upload feature coming soon!")
  }

  const handleDownload = (image: AssetImage) => {
    toast.success(`Downloading ${image.name}...`)
  }

  const handleView = (image: AssetImage) => {
    toast.info(`Viewing ${image.name}...`)
  }

  const handleDelete = (image: AssetImage) => {
    toast.success(`Deleted ${image.name}`)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Image Gallery</h1>
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
                  <BreadcrumbPage>Image Gallery</BreadcrumbPage>
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
                  <h1 className="text-3xl font-bold tracking-tight">Image Gallery</h1>
                  <p className="text-muted-foreground">
                    Repository for uploading and storing images of assets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button onClick={handleUpload} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search and Filter</CardTitle>
                <CardDescription>
                  Find images by name, asset, or tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search images..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-filter">Asset</Label>
                    <Select value={filterAsset} onValueChange={setFilterAsset}>
                      <SelectTrigger id="asset-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        {Array.from(new Set(images.map(img => img.assetId))).map(assetId => {
                          const img = images.find(i => i.assetId === assetId)
                          return (
                            <SelectItem key={assetId} value={assetId}>
                              {img?.assetName} ({assetId})
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Results</Label>
                    <div className="flex items-center h-10 px-3 text-sm text-muted-foreground">
                      {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images Display */}
            <Card>
              <CardHeader>
                <CardTitle>Images ({filteredImages.length})</CardTitle>
                <CardDescription>
                  Manage and view asset images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="aspect-video bg-muted relative">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleView(image)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDownload(image)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDelete(image)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="font-medium text-sm truncate">{image.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {image.assetName} ({image.assetId})
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {image.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {image.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{image.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(image.size)} • {formatDate(image.uploadedDate)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Asset</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredImages.map((image) => (
                          <TableRow key={image.id}>
                            <TableCell>
                              <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{image.name}</div>
                                {image.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {image.description}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {image.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{image.assetName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {image.assetId} • {image.category}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatFileSize(image.size)}</TableCell>
                            <TableCell>{formatDate(image.uploadedDate)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(image)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(image)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(image)}
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
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  )
}

