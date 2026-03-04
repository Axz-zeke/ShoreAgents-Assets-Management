"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { useUpdateAsset } from "@/hooks/use-assets-query"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  CalendarIcon,
  ArrowLeft,
  UserMinus,
  Plus,
  X,
  Package,
  CheckCircle,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  MapPin,
  ClipboardCheck,
  Zap,
  Boxes,
  Activity,
  User,
  History
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { parseAssetQrCode } from "@/lib/qr-parser"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Asset } from "@/lib/lists-data"
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, Search, Download, AlertTriangle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock locations
const storageLocations = [
  "Main Warehouse",
  "IT Room 101",
  "Storage Cabinet A",
  "Stockroom B",
  "Server Room",
  "Executive Floor",
  "Marketing Office",
]

// Mock recent returns data
const mockRecentReturns = [
  { id: "AST-2024-001", name: "MacBook Pro 16\"", date: new Date("2024-03-20T10:30:00"), location: "IT Room 101", condition: "Excellent", user: "John Smith" },
  { id: "AST-2024-005", name: "Dell P2723DE Monitor", date: new Date("2024-03-19T14:45:00"), location: "Main Warehouse", condition: "Good", user: "Sarah Johnson" },
  { id: "AST-2024-012", name: "Logitech MX Master 3S", date: new Date("2024-03-18T09:15:00"), location: "Storage Cabinet A", condition: "Fair", user: "Mike Wilson" },
  { id: "AST-2024-008", name: "iPhone 15 Pro", date: new Date("2024-03-17T16:20:00"), location: "Server Room", condition: "Good", user: "Emily Davis" },
  { id: "AST-2024-022", name: "Secretlab Titan Evo", date: new Date("2024-03-16T11:00:00"), location: "Stockroom B", condition: "Excellent", user: "David Brown" },
]

const getCheckedOutAssets = (assets: Asset[]) => {
  return assets.filter(a => {
    const status = (a.status || "").toLowerCase();
    return (
      status === "in use" ||
      status === "reserved" ||
      status === "maintenance" ||
      status === "leased" ||
      status === "move"
    );
  })
}

const checkinSchema = z.object({
  checkinDate: z.date({ message: "Return date is required" }),
  condition: z.string().min(1, "Asset condition is mandatory"),
  location: z.string().min(1, "Target storage location is required"),
  notes: z.string().optional(),
})

type CheckinFormValues = z.infer<typeof checkinSchema>

export default function CheckinPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)

  // History Table States
  const [historySearchTerm, setHistorySearchTerm] = useState("")
  const [historySortField, setHistorySortField] = useState<string>("date")
  const [historySortDirection, setHistorySortDirection] = useState<"asc" | "desc">("desc")
  const [historyFilter, setHistoryFilter] = useState("All")

  // QR States
  const [showQrOptions, setShowQrOptions] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [unrecognizedData, setUnrecognizedData] = useState('')
  const [scannedId, setScannedId] = useState<string | null>(null)

  const checkedOutAssets = getCheckedOutAssets(assets)

  const form = useForm<CheckinFormValues>({
    resolver: zodResolver(checkinSchema),
    defaultValues: {
      checkinDate: new Date(),
      condition: "Good",
      location: "",
      notes: "",
    },
  })

  // Filter assets based on search
  const filteredAssets = checkedOutAssets.filter(a =>
    a.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    (a.name || '').toLowerCase().includes(assetSearch.toLowerCase())
  )

  // Memoized and Sorted History
  const sortedHistory = useMemo(() => {
    let filtered = [...mockRecentReturns]

    // Search filter
    if (historySearchTerm) {
      const term = historySearchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.user.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      )
    }

    // Category filter
    if (historyFilter !== "All") {
      filtered = filtered.filter(item => item.condition === historyFilter)
    }

    // Sorting logic
    filtered.sort((a, b) => {
      const field = historySortField as keyof typeof a
      const aVal = a[field]
      const bVal = b[field]

      if (field === 'date') {
        const aTime = (aVal as Date).getTime()
        const bTime = (bVal as Date).getTime()
        return historySortDirection === "asc" ? aTime - bTime : bTime - aTime
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()

      if (historySortDirection === "asc") {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
      }
    })

    return filtered
  }, [historySearchTerm, historyFilter, historySortField, historySortDirection])

  const toggleHistorySort = (field: string) => {
    if (historySortField === field) {
      setHistorySortDirection(historySortDirection === "asc" ? "desc" : "asc")
    } else {
      setHistorySortField(field)
      setHistorySortDirection("asc")
    }
  }

  const addAsset = (id: string) => {
    if (!selectedIds.includes(id)) {
      const newIds = [...selectedIds, id]
      setSelectedIds(newIds)
      setAssetSearch("")
      setShowAssetSuggestions(false)
      toast.success(`Asset ${id} queued for intake`)
    } else {
      toast.info("Asset already in queue")
    }
  }

  // QR Logic
  const handleQrScan = (result: string) => {
    const id = parseAssetQrCode(result)
    if (!id) {
      setUnrecognizedData(result)
      setIsScannerOpen(false)
      setShowQrOptions(false)
      toast.error("Invalid QR structure")
      return
    }
    const asset = checkedOutAssets.find(a => a.id.toLowerCase() === id.toLowerCase())
    if (asset) {
      setScannedId(asset.id)
      setIsScannerOpen(false)
      setShowQrOptions(false)
    } else {
      const existsButInStock = assets.find(a => a.id.toLowerCase() === id.toLowerCase())
      if (existsButInStock) {
        setUnrecognizedData(`Asset ${id} is already in the main registry (Status: ${existsButInStock.status}). Only Out-of-Office assets can be checked in.`)
      } else {
        setUnrecognizedData(`Asset ${id} not found.`)
      }
      setIsScannerOpen(false)
      setShowQrOptions(false)
    }
  }

  // Handle QR image file upload
  const handleQrFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    toast.loading('Scanning QR code...', { id: 'qr-scan' })
    try {
      const Html5Qrcode = await import('html5-qrcode')
      const tempContainer = document.createElement('div')
      tempContainer.id = 'temp-qr-reader'
      tempContainer.style.display = 'none'
      document.body.appendChild(tempContainer)
      try {
        const html5QrCode = new Html5Qrcode.Html5Qrcode("temp-qr-reader")
        const result = await html5QrCode.scanFile(file, true)
        toast.dismiss('qr-scan')
        toast.success('QR code scanned successfully!')
        handleQrScan(result)
      } finally {
        document.body.removeChild(tempContainer)
      }
    } catch (error) {
      toast.dismiss('qr-scan')
      toast.error('Cannot read QR code')
    }
  }

  useEffect(() => {
    if (scannedId) {
      addAsset(scannedId)
      setScannedId(null)
    }
  }, [scannedId])

  // Camera Scanner Setup
  useEffect(() => {
    let html5QrCode: any = null

    if (isScannerOpen) {
      const startScanner = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode')
          html5QrCode = new Html5Qrcode("qr-reader")

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText: string) => {
              handleQrScan(decodedText)
            },
            () => {
              // Ignore scan errors
            }
          )
        } catch (err) {
          console.error("Scanner failed to start:", err)
          toast.error("Could not access camera")
          setIsScannerOpen(false)
        }
      }

      startScanner()
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: any) => console.error("Error stopping scanner:", err))
      }
    }
  }, [isScannerOpen])

  const onSubmit = async (data: CheckinFormValues) => {
    setIsSubmitting(true)
    try {
      const today = format(data.checkinDate, "yyyy-MM-dd")
      for (const id of selectedIds) {
        const updatePayload = {
          status: "Available" as const,
          assignedTo: "",
          location: data.location,
          notes: `[INTAKE ${today}] Condition: ${data.condition}${data.notes ? ` | Audit Notes: ${data.notes}` : ''}`
        }
        await updateAssetMutation.mutateAsync({ id, updates: updatePayload })
      }
      toast.success(`${selectedIds.length} assets returned to inventory`)
      router.push("/assets")
    } catch (err) {
      toast.error("Bulk check-in failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedDetails = selectedIds.map(id => assets.find(a => a.id === id)).filter(Boolean) as Asset[]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="/assets">Assets</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Check In</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Asset Check In</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-stretch">
            {/* Left: Queue Management */}
            <Card className="lg:col-span-3 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-blue-500" />
                  Asset Queue
                </CardTitle>
                <CardDescription>Select or scan assets to check in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search asset ID or name..."
                    value={assetSearch}
                    onChange={(e) => { setAssetSearch(e.target.value); setShowAssetSuggestions(true) }}
                    onFocus={() => setShowAssetSuggestions(true)}
                    className="pl-10 pr-10 focus-visible:ring-primary/30"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      onClick={() => setShowQrOptions(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  {showAssetSuggestions && assetSearch.length > 0 && (
                    <div className="absolute z-[60] left-0 top-full w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <ScrollArea className="max-h-60">
                        {filteredAssets.length > 0 ? filteredAssets.map(a => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-0"
                            onClick={() => addAsset(a.id)}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-foreground">{a.id}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-medium">{a.name} • {a.status}</span>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <Plus className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                        )) : (
                          <div className="p-6 text-sm text-center text-muted-foreground italic">No matches found</div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center justify-between">
                    Selected Assets ({selectedIds.length})
                    {selectedIds.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive">
                        Clear all
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {selectedDetails.length > 0 ? selectedDetails.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group border">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{a.id}</span>
                              <span className="text-xs text-muted-foreground">{a.name}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setSelectedIds(prev => prev.filter(id => id !== a.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg px-6 py-10">
                          <History className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-sm font-medium">Queue is empty</p>
                          <p className="text-xs text-center mt-1">Search or scan assets to begin intake</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Right: Processing Form */}
            <div className="lg:col-span-4 h-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
                  <Card className="flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-emerald-500" />
                        Processing Details
                      </CardTitle>
                      <CardDescription>Configure return and condition details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="checkinDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Check In Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="condition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Asset Condition</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select condition" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Excellent">Excellent</SelectItem>
                                  <SelectItem value="Good">Good</SelectItem>
                                  <SelectItem value="Fair">Fair</SelectItem>
                                  <SelectItem value="Poor">Poor</SelectItem>
                                  <SelectItem value="Damaged">Damaged</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Storage Location</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="pl-10 relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <SelectValue placeholder="Select target location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {storageLocations.map(loc => (
                                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audit Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Additional observations..." className="resize-none min-h-[100px]" {...field} />
                            </FormControl>
                            <FormDescription>These notes will be appended to the asset history.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 flex justify-end gap-2 border-t">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || selectedIds.length === 0}
                          className="min-w-[120px]"
                        >
                          {isSubmitting ? (
                            <>
                              <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete Check In ({selectedIds.length})
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
          </div>

          {/* Recent Returns Table */}
          <Card className="mt-8 flex flex-col overflow-hidden border">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <History className="h-5 w-5 text-amber-500" />
                    Recent Intake History
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">Recently processed assets and their return status</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-muted p-1 rounded-md border border-border">
                    <span className="text-[10px] text-muted-foreground px-2 py-1 font-bold">Today: 5 intake</span>
                  </div>
                  <Button variant="outline" size="sm" className="bg-muted/50 border-border text-xs h-8 gap-2">
                    <Download className="h-3 w-3" /> Export Table
                  </Button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <div className="relative flex-1 min-w-[300px] group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="Search recent intake history..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground/60 h-10 w-full rounded-md ring-offset-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="flex bg-muted/50 p-1 rounded-md border border-border">
                  {(["All", "Good", "Excellent", "Fair", "Damaged"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setHistoryFilter(tab)}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded transition-all duration-200",
                        historyFilter === tab
                          ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="h-[400px] w-full border-t border-border">
                <div className="min-w-[1000px]">
                  <Table>
                    <TableHeader className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b overflow-hidden">
                      <TableRow className="hover:bg-transparent border-b border-border transition-colors">
                        <TableHead
                          className="pl-6 text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleHistorySort('id')}
                        >
                          <div className="flex items-center gap-2">
                            Asset ID
                            <ArrowUpDown className={cn("h-3 w-3 transition-colors", historySortField === 'id' ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleHistorySort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Asset Name
                            <ArrowUpDown className={cn("h-3 w-3 transition-colors", historySortField === 'name' ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleHistorySort('date')}
                        >
                          <div className="flex items-center gap-2">
                            Return Date
                            <ArrowUpDown className={cn("h-3 w-3 transition-colors", historySortField === 'date' ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleHistorySort('condition')}
                        >
                          <div className="flex items-center gap-2">
                            Condition
                            <ArrowUpDown className={cn("h-3 w-3 transition-colors", historySortField === 'condition' ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleHistorySort('location')}
                        >
                          <div className="flex items-center gap-2">
                            Storage
                            <ArrowUpDown className={cn("h-3 w-3 transition-colors", historySortField === 'location' ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="pr-6 text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleHistorySort('user')}
                        >
                          <div className="flex items-center gap-2 justify-end">
                            Checked By
                            <ArrowUpDown className={cn("h-3 w-3 transition-colors", historySortField === 'user' ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedHistory.length > 0 ? sortedHistory.map((r, idx) => (
                        <TableRow key={`${r.id}-${idx}`} className="hover:bg-muted/30 border-b border-border group transition-colors">
                          <TableCell className="pl-6 font-mono text-muted-foreground/80 text-[13px] py-4">{r.id}</TableCell>
                          <TableCell className="text-foreground font-semibold py-4">{r.name}</TableCell>
                          <TableCell className="text-muted-foreground text-[13px] py-4">{format(r.date, "MMM dd, h:mm a")}</TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border-none",
                                r.condition === "Excellent" && "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                                r.condition === "Good" && "bg-blue-500/10 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
                                r.condition === "Fair" && "bg-amber-500/10 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
                                r.condition === "Poor" && "bg-orange-500/10 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)]",
                                r.condition === "Damaged" && "bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
                              )}
                            >
                              {r.condition}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[13px] py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 opacity-40 group-hover:text-primary transition-colors" />
                              {r.location}
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 py-4 text-right">
                            <div className="flex items-center gap-2 justify-end text-blue-500/80 font-bold hover:text-blue-500 transition-colors cursor-pointer group/user">
                              <User className="h-3 w-3 opacity-50 group-hover/user:opacity-100" />
                              <span className="text-[13px] underline-offset-4 group-hover/user:underline">{r.user}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                            No intake records found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              {/* Footer / Pagination style */}
              <div className="flex items-center justify-between px-6 py-4 bg-card border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="text-foreground font-bold">1-5</span> of <span className="text-foreground font-bold">5</span> intake records
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 text-xs bg-primary text-white border-none rounded">1</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* QR Scan Dialog */}
        <Dialog open={showQrOptions} onOpenChange={setShowQrOptions}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Scan Asset QR Code</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select your preferred method to identify an asset for check-in.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => { setShowQrOptions(false); setIsScannerOpen(true) }}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Use Live Camera</span>
              </Button>
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                onClick={() => {
                  setShowQrOptions(false);
                  const i = document.createElement("input");
                  i.type = "file";
                  i.accept = "image/*";
                  i.onchange = (e: any) => handleQrFileUpload(e);
                  i.click()
                }}
              >
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Upload QR Image</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Live Scanner Dialog */}
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none shadow-2xl">
            <div className="p-6 bg-card/95 backdrop-blur-xl">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold uppercase tracking-wider">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Live Asset Scanner
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                  Point your camera at the asset QR code
                </DialogDescription>
              </DialogHeader>
              <div id="qr-reader" className="w-full aspect-square overflow-hidden rounded-xl bg-black border border-white/10 relative shadow-inner" />
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScannerOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest px-8 border-2 hover:bg-muted"
                >
                  Cancel Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error/Unrecognized Dialog */}
        <Dialog open={!!unrecognizedData} onOpenChange={() => setUnrecognizedData('')}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-rose-500">
                <AlertTriangle className="h-5 w-5" />
                Scan Error
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm text-foreground/80 font-medium whitespace-pre-wrap">
                {unrecognizedData}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-6 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnrecognizedData('')}
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setUnrecognizedData('')
                  setShowQrOptions(true)
                }}
                className="bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20"
              >
                Try Again
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

