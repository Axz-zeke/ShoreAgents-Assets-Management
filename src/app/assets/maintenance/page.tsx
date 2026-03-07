"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { useInstantMaintenance } from "@/hooks/use-instant-maintenance"
import { useCreateMaintenance } from "@/hooks/use-maintenance-query"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CalendarIcon,
  ArrowLeft,
  Wrench,
  Plus,
  X,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Zap,
  ShieldCheck,
  History,
  Search,
  Activity,
  Download,
  ShieldAlert,
  Coins,
  ArrowUpDown,
  FileText,
  TrendingDown,
  Timer
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { parseAssetQrCode } from "@/lib/qr-parser"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Asset } from "@/lib/lists-data"

const getAvailableAssets = (assets: Asset[]) => {
  return assets.filter(asset => asset.status !== "Disposed")
}

const maintenanceFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  maintenanceTitle: z.string().min(1, "Maintenance title is required"),
  maintenanceDetails: z.string().optional(),
  maintenanceDueDate: z.date({
    message: "Maintenance due date is required",
  }),
  maintenanceBy: z.string().min(1, "Maintenance by is required"),
  maintenanceStatus: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  serviceType: z.enum(["preventive", "corrective", "emergency", "routine"]),
  dateCompleted: z.date().optional(),
  maintenanceCost: z.number().min(0),
  isRepeating: z.enum(["yes", "no"]),
})

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>

export default function MaintenancePage() {
  const router = useRouter()
  const { data: assets = [], isLoading: assetsLoading, error: assetsError } = useInstantAssets()
  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useInstantMaintenance()
  const createMaintenanceMutation = useCreateMaintenance()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)

  // QR States
  const [showQrOptions, setShowQrOptions] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [unrecognizedData, setUnrecognizedData] = useState('')
  const [scannedId, setScannedId] = useState<string | null>(null)

  const [historySearchTerm, setHistorySearchTerm] = useState("")
  const [historySortField, setHistorySortField] = useState<"date" | "cost" | "status">("date")
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("desc")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const availableAssets = getAvailableAssets(assets)
  const isLoading = assetsLoading || maintenanceLoading
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowAssetSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      assetIds: [],
      maintenanceTitle: "",
      maintenanceDetails: "",
      maintenanceDueDate: new Date(),
      maintenanceBy: "",
      maintenanceStatus: "scheduled",
      priority: "medium",
      serviceType: "routine",
      maintenanceCost: 0,
      isRepeating: "no",
    },
  })

  const maintenanceStatus = form.watch("maintenanceStatus")

  const filteredAssets = availableAssets.filter(a =>
    a.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    (a.name || '').toLowerCase().includes(assetSearch.toLowerCase())
  )

  const addAsset = (id: string) => {
    if (!selectedIds.includes(id)) {
      const newIds = [...selectedIds, id]
      setSelectedIds(newIds)
      form.setValue("assetIds", newIds)
      setAssetSearch("")
      setShowAssetSuggestions(false)
      toast.success(`Asset ${id} added to ticket`)
    } else {
      toast.info("Asset already selected")
    }
  }

  const removeAsset = (id: string) => {
    const newIds = selectedIds.filter(i => i !== id)
    setSelectedIds(newIds)
    form.setValue("assetIds", newIds)
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

  // QR Logic
  const handleQrScan = (result: string) => {
    const id = parseAssetQrCode(result)
    if (!id) {
      setUnrecognizedData(result)
      setIsScannerOpen(false)
      setShowQrOptions(false)
      return
    }
    const asset = availableAssets.find(a => a.id.toLowerCase() === id.toLowerCase())
    if (asset) {
      setScannedId(asset.id)
      setIsScannerOpen(false)
      setShowQrOptions(false)
    } else {
      setUnrecognizedData(`Asset ${id} not found in inventory.`)
      setIsScannerOpen(false)
      setShowQrOptions(false)
    }
  }

  useEffect(() => {
    if (scannedId) {
      addAsset(scannedId)
      setScannedId(null)
    }
  }, [scannedId])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.trigger().then((isValid) => {
      if (isValid && selectedIds.length > 0) {
        setShowConfirmDialog(true)
      }
    })
  }

  const handleConfirmTicket = async () => {
    const data = form.getValues()
    setShowConfirmDialog(false)
    setIsSubmitting(true)
    try {
      const payload = {
        asset_ids: selectedIds,
        maintenance_title: data.maintenanceTitle,
        maintenance_details: data.maintenanceDetails || "",
        maintenance_due_date: format(data.maintenanceDueDate, "yyyy-MM-dd"),
        maintenance_by: data.maintenanceBy,
        maintenance_status: data.maintenanceStatus,
        priority: data.priority,
        service_type: data.serviceType,
        date_completed: data.dateCompleted ? format(data.dateCompleted, "yyyy-MM-dd") : undefined,
        maintenance_cost: data.maintenanceCost,
        is_repeating: data.isRepeating,
      }
      await createMaintenanceMutation.mutateAsync(payload)
      toast.success("Maintenance ticket generated")
      form.reset({
        assetIds: [],
        maintenanceTitle: "",
        maintenanceDetails: "",
        maintenanceDueDate: new Date(),
        maintenanceBy: "",
        maintenanceStatus: "scheduled",
        priority: "medium",
        serviceType: "routine",
        maintenanceCost: 0,
        isRepeating: "no",
      })
      setSelectedIds([])
    } catch (err) {
      toast.error("Failed to generate ticket")
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
              <BreadcrumbItem><BreadcrumbPage>Maintenance</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-10 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-primary border-primary bg-primary/5 uppercase tracking-wider font-bold text-[10px] px-3 h-6">
                Technical Management
              </Badge>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Active Tickets</p>
                  <Activity className="h-4 w-4 text-primary opacity-50" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">
                    {maintenanceRecords.filter(r => r.status === 'scheduled' || r.status === 'in_progress').length}
                  </div>
                  <div className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">Open</div>
                </div>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Completed MTD</p>
                  <CheckCircle className="h-4 w-4 text-emerald-500 opacity-50" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-emerald-500">
                    {maintenanceRecords.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-tighter">Tickets</div>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">Month-to-date performance</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Maintenance Spend</p>
                  <DollarSign className="h-4 w-4 text-amber-500 opacity-50" />
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-[14px] font-bold text-amber-500">₱</div>
                  <div className="text-3xl font-bold text-amber-500">
                    {maintenanceRecords.reduce((s, r) => s + (r.maintenance_cost || 0), 0).toLocaleString()}
                  </div>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">Cumulative expenditure</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Service Health</p>
                  <Zap className="h-4 w-4 text-primary opacity-50" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-lg font-bold uppercase tracking-tight">Operational</div>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">Technical systems online</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-stretch">
            {/* Asset Selection */}
            <Card className="lg:col-span-3 flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Select Assets
                </CardTitle>
                <CardDescription>Select units requiring technical service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="relative group" id="asset-search-container" ref={searchContainerRef}>
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
                        <div className="p-1">
                          {filteredAssets.length > 0 ? (
                            <div className="space-y-0.5">
                              {filteredAssets.map(a => (
                                <div
                                  key={a.id}
                                  className="flex items-center justify-between p-3 hover:bg-primary/10 cursor-pointer transition-colors rounded-lg group/item"
                                  onClick={() => addAsset(a.id)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold text-sm group-hover/item:text-primary transition-colors">{a.id}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{a.name} • {a.status}</span>
                                  </div>
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Plus className="h-3 w-3 text-primary" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-[10px] font-bold uppercase tracking-widest text-center text-muted-foreground/60">No matched assets</div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center justify-between">
                    <span>Selected Units ({selectedIds.length})</span>
                    {selectedIds.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-auto p-0 text-[10px] font-bold uppercase text-muted-foreground hover:text-destructive">
                        Clear all
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[400px] border rounded-lg bg-muted/10 p-2">
                    <div className="space-y-2">
                      {selectedDetails.length > 0 ? selectedDetails.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 bg-card border rounded-lg group shadow-sm transition-all hover:border-primary/30">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-primary/60" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{a.id}</span>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase">{a.name}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeAsset(a.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg px-6 py-10">
                          <Wrench className="h-8 w-8 mb-4 opacity-20 text-primary" />
                          <p className="text-sm font-bold uppercase tracking-widest opacity-40">Empty Registry</p>
                          <p className="text-[10px] text-center mt-2 font-medium opacity-40 uppercase tracking-tighter">Identify assets requiring technical intervention</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Logic */}
            <div className="lg:col-span-4 h-full">
              <Form {...form}>
                <form onSubmit={handleFormSubmit} className="space-y-4 h-full flex flex-col">
                  <Card className="flex-1 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-primary" />
                        Technical Manifest
                      </CardTitle>
                      <CardDescription>Detail the maintenance protocol and objectives</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                      <FormField
                        control={form.control}
                        name="maintenanceTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Work Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Diagnostic, Repair, Calibration..." className="h-10 font-bold" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="maintenanceBy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service Provider</FormLabel>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Internal Team or Vendor..." className="pl-10 h-10 font-bold" {...field} />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maintenanceDueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("h-10 pl-3 text-left font-bold", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="maintenanceStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Initial Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 font-bold">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maintenanceCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimated Cost (₱)</FormLabel>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₱</span>
                                <Input type="number" className="pl-8 h-10 font-mono font-bold" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 font-bold uppercase text-xs">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="urgent" className="text-red-500 font-bold uppercase text-[10px]">Urgent</SelectItem>
                                  <SelectItem value="high" className="text-amber-500 font-bold uppercase text-[10px]">High Priority</SelectItem>
                                  <SelectItem value="medium" className="text-primary font-bold uppercase text-[10px]">Medium</SelectItem>
                                  <SelectItem value="low" className="text-muted-foreground font-bold uppercase text-[10px]">Low Priority</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Service Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 font-bold">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="preventive">Preventive</SelectItem>
                                  <SelectItem value="corrective">Corrective</SelectItem>
                                  <SelectItem value="emergency">Emergency</SelectItem>
                                  <SelectItem value="routine">Routine</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="maintenanceDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Diagnostic Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Faults, parts needed, procedures..." className="min-h-[100px] resize-none font-medium" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isRepeating"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-bold uppercase tracking-[0.1em]">Recurring Event</FormLabel>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Schedule this as a repeating technical task?</div>
                            </div>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-[100px] h-9 font-bold text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />


                      <div className="mt-auto pt-6 flex justify-end gap-3 border-t">
                        <Button type="button" variant="ghost" onClick={() => router.push("/assets")} className="h-10 px-6 font-bold uppercase tracking-widest text-[10px]">Back to assets</Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || selectedIds.length === 0}
                          className="min-w-[180px] h-10 font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                          {isSubmitting ? "Processing..." : `Issue Ticket (${selectedIds.length})`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
          </div>

          {/* Maintenance Tracking Log */}
          <Card className="flex flex-col overflow-hidden border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Maintenance Tracking Log
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs mt-1 font-medium">Consolidated history of technical services and life-cycle events</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-muted/50 border-border text-[10px] h-8 gap-2 font-bold uppercase tracking-wider">
                    <Download className="h-3 w-3" /> Export Archive
                  </Button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <div className="relative flex-1 min-w-[300px] group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="Search by title, asset, provider or notes..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="pl-10 h-10 w-full rounded-md font-bold text-sm"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 border-t">
              <ScrollArea className="h-[500px] w-full">
                <div className="min-w-[1000px]">
                  <Table>
                    <TableHeader className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Ticket</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Target Date</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider w-[30%]">Service Details</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Provider</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Category</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Cost</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider pr-6 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords.length > 0 ? (
                        maintenanceRecords
                          .filter(r => {
                            if (!historySearchTerm) return true
                            const s = historySearchTerm.toLowerCase()
                            return (
                              r.id?.toLowerCase().includes(s) ||
                              r.maintenance_title.toLowerCase().includes(s) ||
                              r.maintenance_by.toLowerCase().includes(s) ||
                              r.maintenance_details?.toLowerCase().includes(s)
                            )
                          })
                          .map((r) => (
                            <TableRow key={r.id} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50 group">
                              <TableCell className="pl-6 py-4">
                                <span className="font-mono text-muted-foreground text-[12px] font-bold">#{r.id?.slice(-6) || 'N/A'}</span>
                              </TableCell>
                              <TableCell className="text-[12px] text-muted-foreground font-bold whitespace-nowrap py-4 uppercase">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-3 w-3 opacity-50 text-primary" />
                                  {r.maintenance_due_date}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-[13px] text-foreground uppercase tracking-tight">{r.maintenance_title}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5 opacity-60">
                                    Asset: {r.asset_id} {r.assets?.name ? `• ${r.assets.name}` : ''}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-[12px] font-bold text-foreground/80 uppercase tracking-tighter">
                                {r.maintenance_by}
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 font-bold uppercase text-[9px] px-2 h-5 tracking-wider">
                                  {r.service_type || 'Routine'}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-col">
                                  <span className="font-mono text-[13px] font-bold text-amber-600">₱{(r.maintenance_cost || 0).toLocaleString()}</span>
                                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight opacity-50">Expense Log</span>
                                </div>
                              </TableCell>
                              <TableCell className="pr-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {r.status === 'completed' ? (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-500 font-bold uppercase text-[8px] h-4 tracking-wider">Certified</Badge>
                                  ) : r.status === 'in_progress' ? (
                                    <Badge className="bg-primary hover:bg-primary font-bold uppercase text-[8px] h-4 tracking-wider animate-pulse">In Progress</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="font-bold uppercase text-[8px] h-4 tracking-wider text-muted-foreground/60">Scheduled</Badge>
                                  )}
                                  {r.priority === 'urgent' && <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" title="Urgent Priority" />}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-40 text-center text-muted-foreground opacity-30 uppercase font-black tracking-[0.3em] text-[10px]">
                            Technical Logs Empty • Awaiting Events
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border/50 bg-muted/5 flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  Registry: {maintenanceRecords.length} service lifecycle events archived
                </p>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-muted-foreground/40">
                  <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-red-500" /> Urgent</span>
                  <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Scan Method Selection Dialog */}
        <Dialog open={showQrOptions} onOpenChange={setShowQrOptions}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight">Scan Asset QR Code</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium">
                Select your preferred method to identify an asset for maintenance.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => { setShowQrOptions(false); setIsScannerOpen(true) }}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                  <Camera className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Live Capture</span>
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
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform text-emerald-500">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload Disk</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Live Scanner Dialog */}
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none shadow-2xl">
            <div className="p-6 bg-card/95 backdrop-blur-xl">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Live Asset Scanner
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                  Align protocol QR code within the viewfinder
                </DialogDescription>
              </DialogHeader>
              <div id="qr-reader" className="w-full aspect-square overflow-hidden rounded-xl bg-black border border-white/10 relative shadow-inner" />
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScannerOpen(false)}
                  className="text-[10px] font-bold uppercase tracking-wider px-8 border-2 hover:bg-muted"
                >
                  Terminate Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scan Error Dialog */}
        <Dialog open={!!unrecognizedData} onOpenChange={() => setUnrecognizedData('')}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-rose-500">
                <AlertTriangle className="h-5 w-5" />
                Registry Mismatch
              </DialogTitle>
              <DialogDescription className="pt-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                SCAN ERROR / DATA UNRECOGNIZED
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-bold uppercase tracking-tight text-foreground/80 whitespace-pre-wrap">
                {unrecognizedData}
              </p>
            </div>
            <div className="flex justify-end pt-6 gap-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnrecognizedData('')}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                Ignore
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setUnrecognizedData('')
                  setShowQrOptions(true)
                }}
                className="bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-wider px-6 shadow-lg shadow-primary/20"
              >
                Retry Logic
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Maintenance Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl sm:max-w-[500px]">
            <AlertDialogHeader className="items-center sm:items-start">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold tracking-tight text-center sm:text-left">Issue Service Ticket</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground pt-2 text-center sm:text-left font-medium">
                Generate a technical maintenance ticket for <span className="text-foreground font-bold underline decoration-primary/30 decoration-2 underline-offset-4">{selectedIds.length} units</span>.
                <br /><br />
                This will notify <span className="text-primary font-bold uppercase">{form.getValues().maintenanceBy}</span> and update the asset life-cycle registry.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="bg-muted/30 rounded-lg p-4 my-4 space-y-3 border shadow-inner">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Objective</span>
                <span className="font-bold text-[11px] uppercase truncate max-w-[200px]">{form.getValues().maintenanceTitle}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Registry Status</span>
                <Badge className={cn(
                  "font-bold uppercase text-[10px] tracking-wider",
                  form.getValues().priority === 'urgent' ? "bg-red-500" :
                    form.getValues().priority === 'high' ? "bg-amber-500" :
                      "bg-primary"
                )}>
                  {form.getValues().priority}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border/50 pt-3">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Budgetary Logic</span>
                <span className="font-mono font-bold text-amber-500">₱{form.getValues().maintenanceCost.toLocaleString()}</span>
              </div>
            </div>

            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="font-bold uppercase tracking-wider text-[10px] h-10 px-6 border-2 transition-all hover:bg-muted">
                Abort Ticket
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmTicket}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[10px] h-10 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Confirm & Issue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
