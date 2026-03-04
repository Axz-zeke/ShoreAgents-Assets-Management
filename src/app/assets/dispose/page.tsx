"use client"

import { useState, useEffect } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
  Trash2,
  Plus,
  X,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Camera,
  Image as ImageIcon,
  ShieldAlert,
  Coins,
  HeartHandshake,
  Recycle,
  Search,
  History as HistoryIcon,
  Building2,
  Users,
  ArrowUpDown,
  Download,
  Clock,
  Briefcase,
  FileText,
  TrendingDown,
  Activity,
  Paperclip,
  Upload
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { parseAssetQrCode } from "@/lib/qr-parser"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Asset } from "@/lib/lists-data"

const getAvailableAssets = (assets: Asset[]) => {
  return assets.filter(asset => {
    const status = (asset.status || "").toLowerCase();
    return (
      status === "available" ||
      status === "in use" ||
      status === "reserved" ||
      status === "move"
    );
  }).filter(asset => {
    const status = (asset.status || "").toLowerCase();
    return (
      status !== "maintenance" &&
      status !== "disposed"
    );
  });
}

const disposeFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  disposalDate: z.date({
    message: "Disposal date is required",
  }),
  disposalMethod: z.enum(["sold", "donated", "scrapped", "recycled", "destroyed", "other"], {
    message: "Please select disposal method",
  }),
  disposalReason: z.string().min(1, "Disposal reason is required"),
  disposalValue: z.number().min(0, "Disposal value must be positive"),
  buyerRecipient: z.string().optional(),
  disposalLocation: z.string().optional(),
  disposalCertificate: z.string().optional(),
  notes: z.string().optional(),
})

type DisposeFormValues = z.infer<typeof disposeFormSchema>

export default function DisposeAssetPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [historySearchTerm, setHistorySearchTerm] = useState("")
  const [historySortField, setHistorySortField] = useState<"date" | "asset" | "value">("date")
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("desc")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  // QR Scanner states
  const [showQrOptionsDialog, setShowQrOptionsDialog] = useState(false)
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const [isCameraScanning, setIsCameraScanning] = useState(false)
  const [showUnrecognizedQrDialog, setShowUnrecognizedQrDialog] = useState(false)
  const [unrecognizedQrData, setUnrecognizedQrData] = useState('')
  const [scannedAssetId, setScannedAssetId] = useState<string | null>(null)

  const availableAssets = getAvailableAssets(assets)

  const form = useForm<DisposeFormValues>({
    resolver: zodResolver(disposeFormSchema),
    defaultValues: {
      assetIds: [],
      disposalDate: new Date(),
      disposalMethod: "scrapped",
      disposalReason: "",
      disposalValue: 0,
      buyerRecipient: "",
      disposalLocation: "",
      disposalCertificate: "",
      notes: "",
    },
  })

  const disposalMethod = form.watch("disposalMethod")

  const filteredAssets = availableAssets.filter(asset =>
    asset.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
    (asset.name || '').toLowerCase().includes(assetSearch.toLowerCase())
  )

  const addAsset = (id: string) => {
    if (!selectedAssetIds.includes(id)) {
      const newIds = [...selectedAssetIds, id]
      setSelectedAssetIds(newIds)
      form.setValue("assetIds", newIds)
      setAssetSearch("")
      setShowSuggestions(false)
      toast.success(`Asset ${id} added`)
    } else {
      toast.info("Asset already selected")
    }
  }

  const removeAsset = (id: string) => {
    const newIds = selectedAssetIds.filter(i => i !== id)
    setSelectedAssetIds(newIds)
    form.setValue("assetIds", newIds)
  }

  const selectedDetails = selectedAssetIds.map(id => assets.find(a => a.id === id)).filter(Boolean) as Asset[]
  const totalValue = selectedDetails.reduce((sum, a) => sum + (a.value || 0), 0)

  // QR Logic
  const handleQrScan = (result: string) => {
    const id = parseAssetQrCode(result)
    if (!id) {
      setUnrecognizedQrData(result)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      return
    }
    const asset = availableAssets.find(a => a.id.toLowerCase() === id.toLowerCase())
    if (asset) {
      setScannedAssetId(asset.id)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    } else {
      setUnrecognizedQrData(`Asset ${id} not found or unavailable for disposal.`)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
    }
  }

  const handleQrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    toast.loading("Scanning...", { id: "qr" })
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const temp = document.createElement("div"); temp.id = "temp-qr"; temp.style.display = "none"; document.body.appendChild(temp)
      const reader = new Html5Qrcode("temp-qr")
      const res = await reader.scanFile(file, true)
      toast.dismiss("qr")
      handleQrScan(res)
      document.body.removeChild(temp)
    } catch (err) {
      toast.dismiss("qr")
      toast.error("Scan failed")
      setUnrecognizedQrData("No QR code found in image")
      setShowUnrecognizedQrDialog(true)
    }
  }

  useEffect(() => {
    if (scannedAssetId) {
      addAsset(scannedAssetId)
      setScannedAssetId(null)
    }
  }, [scannedAssetId])

  const getDisposalHistory = () => {
    const history: any[] = []
    assets.forEach(asset => {
      const matches = asset.notes?.matchAll(/\[DISPOSE ([^\]]+)\] ([^\[\n]+)/g)
      if (matches) {
        const matchesArray = Array.from(matches)
        matchesArray.forEach((match, index) => {
          const date = match[1]
          const details = match[2]

          const parts = details.split(' | ')
          const method = parts.find(p => p.startsWith('Method:'))?.replace('Method: ', '') || 'Unknown'
          const reason = parts.find(p => p.startsWith('Reason:'))?.replace('Reason: ', '') || 'N/A'
          const valuePart = parts.find(p => p.startsWith('Value:')) || 'Value: ₱0'
          const valueStr = valuePart.replace('Value: ₱', '').replace(/,/g, '')
          const recipient = parts.find(p => p.startsWith('Recipient:'))?.replace('Recipient: ', '') || 'N/A'

          history.push({
            id: asset.id,
            name: asset.name,
            historyDate: date,
            method,
            reason,
            value: parseFloat(valueStr) || 0,
            recipient,
            eventKey: `${asset.id}-${date}-${index}`
          })
        })
      }
    })

    return history
      .filter(item => {
        if (!historySearchTerm) return true
        const s = historySearchTerm.toLowerCase()
        return (
          item.id.toLowerCase().includes(s) ||
          (item.name || "").toLowerCase().includes(s) ||
          item.reason.toLowerCase().includes(s) ||
          item.method.toLowerCase().includes(s) ||
          item.recipient.toLowerCase().includes(s)
        )
      })
      .sort((a, b) => {
        let comp = 0
        if (historySortField === "date") comp = b.historyDate.localeCompare(a.historyDate)
        else if (historySortField === "asset") comp = a.id.localeCompare(b.id)
        else if (historySortField === "value") comp = b.value - a.value
        return historySortOrder === "desc" ? comp : -comp
      })
  }

  const historyData = getDisposalHistory()
  const toggleSort = (field: "date" | "asset" | "value") => {
    if (historySortField === field) {
      setHistorySortOrder(prev => prev === "desc" ? "asc" : "desc")
    } else {
      setHistorySortField(field)
      setHistorySortOrder("desc")
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    form.trigger().then((isValid) => {
      if (isValid && selectedAssetIds.length > 0) {
        setShowConfirmDialog(true)
      }
    })
  }

  const handleConfirmDisposal = async () => {
    const data = form.getValues()
    setShowConfirmDialog(false)
    setIsSubmitting(true)
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      for (const id of data.assetIds) {
        const asset = assets.find(a => a.id === id)
        const receiptInfo = receiptFile ? ` | Receipt: ${receiptFile.name}` : ""
        const historyLine = `[DISPOSE ${today}] Method: ${data.disposalMethod} | Reason: ${data.disposalReason} | Value: ₱${data.disposalValue.toLocaleString()}${data.buyerRecipient ? ` | Recipient: ${data.buyerRecipient}` : ""}${receiptInfo}`
        const updatedNotes = asset?.notes ? `${asset.notes}\n${historyLine}` : historyLine

        await updateAssetMutation.mutateAsync({
          id,
          updates: {
            status: "Disposed",
            notes: updatedNotes
          }
        })
      }
      toast.success(`Successfully disposed ${data.assetIds.length} assets`)
      form.reset({
        assetIds: [],
        disposalDate: new Date(),
        disposalMethod: "scrapped",
        disposalReason: "",
        disposalValue: 0,
        buyerRecipient: "",
        disposalLocation: "",
        disposalCertificate: "",
        notes: "",
      })
      setSelectedAssetIds([])
      setReceiptFile(null)
    } catch (err) {
      toast.error("Failed to dispose assets")
    } finally {
      setIsSubmitting(false)
    }
  }

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
              <BreadcrumbItem><BreadcrumbPage>Dispose Asset</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-10 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Dispose Asset</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-destructive border-destructive bg-destructive/5 uppercase tracking-wider font-bold text-[10px] px-3 h-6">
                Permanent Protocol
              </Badge>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Total Decommissioned</p>
                  <TrendingDown className="h-4 w-4 text-destructive opacity-50" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">{assets.filter(a => a.status === "Disposed").length}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Units</div>
                </div>
                <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-destructive w-[65%]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Salvage Recovered</p>
                  <DollarSign className="h-4 w-4 text-emerald-500 opacity-50" />
                </div>
                <div className="flex items-baseline gap-1">
                  <div className="text-[14px] font-bold text-emerald-500">₱</div>
                  <div className="text-3xl font-bold text-emerald-500">
                    {assets.reduce((sum, a) => {
                      const match = a.notes?.match(/Value: ₱([\d,.]+)/)
                      if (match) {
                        const val = parseFloat(match[1].replace(/,/g, '')) || 0
                        return sum + val
                      }
                      return sum
                    }, 0).toLocaleString()}
                  </div>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">Liquidated asset value</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Selected for Disposal</p>
                  <Trash2 className="h-4 w-4 text-amber-500 opacity-50" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-amber-500">{selectedAssetIds.length}</div>
                  <div className="text-[10px] font-bold text-amber-500/60 uppercase">Pending</div>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">Current queue size</p>
              </CardContent>
            </Card>

            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Protocol Status</p>
                  <Activity className="h-4 w-4 text-primary opacity-50" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-lg font-bold uppercase tracking-tighter">Operational</div>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground/60 mt-1 uppercase tracking-tighter">Authorization server active</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 items-stretch">
            {/* Asset Selection */}
            <Card className="lg:col-span-3 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Select Assets
                </CardTitle>
                <CardDescription>Search or scan the units for disposal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search asset ID or name..."
                      value={assetSearch}
                      onChange={(e) => { setAssetSearch(e.target.value); setShowSuggestions(true) }}
                      onFocus={() => setShowSuggestions(true)}
                      className="pl-10 pr-10 focus-visible:ring-primary/30"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={() => setShowQrOptionsDialog(true)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {showSuggestions && assetSearch.length > 0 && (
                    <div className="absolute z-[60] left-0 top-full w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <ScrollArea className="max-h-60">
                        {filteredAssets.length > 0 ? filteredAssets.map(a => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b last:border-0 transition-colors"
                            onClick={() => addAsset(a.id)}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{a.id}</span>
                              <span className="text-[11px] text-muted-foreground">{a.name} • ₱{a.value?.toLocaleString()}</span>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )) : (
                          <div className="p-4 text-center text-xs text-muted-foreground">No available assets found</div>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center justify-between">
                    To be Disposed ({selectedAssetIds.length})
                    {selectedAssetIds.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAssetIds([])} className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive">
                        Clear all
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {selectedAssetIds.length > 0 ? selectedDetails.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{a.id}</span>
                              <span className="text-xs text-muted-foreground">{a.name} • ₱{a.value?.toLocaleString()}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeAsset(a.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg px-6 py-10">
                          <Trash2 className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-sm">No assets selected</p>
                          <p className="text-xs text-center mt-1">Search or scan assets to dispose</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {selectedAssetIds.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-medium">Total Resource Value:</span>
                        <span className="font-bold text-lg text-destructive">₱{totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Disposal Details */}
            <div className="lg:col-span-4">
              <Form {...form}>
                <form onSubmit={handleFormSubmit} className="h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Disposal Protocol
                      </CardTitle>
                      <CardDescription>Official record of asset decommissioning</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="disposalMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="scrapped">Scrapped</SelectItem>
                                  <SelectItem value="sold">Sold</SelectItem>
                                  <SelectItem value="donated">Donated</SelectItem>
                                  <SelectItem value="recycled">Recycled</SelectItem>
                                  <SelectItem value="destroyed">Destroyed</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="disposalDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Effective Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("pl-3 text-left font-normal h-10", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                          name="disposalValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Settlement Value (₱)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₱</span>
                                  <Input
                                    type="number"
                                    className="pl-7 h-10 font-bold"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="buyerRecipient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Buyer / Recipient</FormLabel>
                              <FormControl>
                                <Input placeholder="Entity name..." className="h-10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="disposalReason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Justification *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain why these assets are being removed..."
                                className="min-h-[120px] resize-none focus-visible:ring-primary/30"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Receipt / Attachment (Optional)</Label>
                        <div
                          className={cn(
                            "relative border-2 border-dashed rounded-lg p-6 transition-all",
                            receiptFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <Input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <div className="flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
                            {receiptFile ? (
                              <>
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-emerald-600 truncate max-w-[250px]">{receiptFile.name}</p>
                                  <p className="text-[10px] text-emerald-600/60 uppercase tracking-widest font-black mt-1">Ready for upload</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Click or drag to upload receipt</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">PDF, JPG, or PNG up to 10MB</p>
                                </div>
                              </>
                            )}
                          </div>
                          {receiptFile && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 z-20 hover:text-destructive transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptFile(null);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto pt-6 flex justify-end gap-3 border-t">
                        <Button type="button" variant="ghost" onClick={() => router.push("/assets")} className="h-10 px-6 font-bold uppercase tracking-widest text-xs">Cancel</Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={isSubmitting || selectedAssetIds.length === 0}
                          className="min-w-[160px] h-10 font-black uppercase tracking-widest text-xs shadow-lg shadow-destructive/20"
                        >
                          {isSubmitting ? "Authorizing..." : `Authorize Disposal (${selectedAssetIds.length})`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
          </div>

          {/* Disposal Tracking Log */}
          <Card className="mt-8 flex flex-col overflow-hidden border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <HistoryIcon className="h-5 w-5 text-rose-500" />
                    Disposal Tracking Log
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">Permanent record of decommissioned assets and recovery values</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-muted/50 border-border text-xs h-8 gap-2 font-bold">
                    <Download className="h-3 w-3" /> Export History
                  </Button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <div className="relative flex-1 min-w-[300px] group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="Search by asset, reason, method or recipient..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground/60 h-10 w-full rounded-md ring-offset-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="h-[450px] w-full border-t border-border shadow-inner">
                <div className="min-w-[1100px]">
                  <Table>
                    <TableHeader className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b">
                      <TableRow className="hover:bg-transparent">
                        <TableHead
                          className="pl-6 text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleSort("asset")}
                        >
                          <div className="flex items-center gap-2">
                            Asset
                            <ArrowUpDown className={cn("h-3 w-3", historySortField === "asset" ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleSort("date")}
                        >
                          <div className="flex items-center gap-2">
                            Disposal Date
                            <ArrowUpDown className={cn("h-3 w-3", historySortField === "date" ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Method</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Recipient / Buyer</TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleSort("value")}
                        >
                          <div className="flex items-center gap-2">
                            Recovery Value
                            <ArrowUpDown className={cn("h-3 w-3", historySortField === "value" ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] pr-6">Justification</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.length > 0 ? (
                        historyData.map((a: any) => (
                          <TableRow key={a.eventKey} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50 group">
                            <TableCell className="pl-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-mono text-muted-foreground text-[13px] font-bold">{a.id}</span>
                                <span className="text-[11px] font-semibold text-foreground truncate max-w-[150px]">{a.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap py-4">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3 opacity-50 text-rose-500" />
                                {a.historyDate}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="bg-muted/50 text-foreground border-border font-bold uppercase text-[9px] px-2">
                                {a.method}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-[13px] font-medium text-foreground/80">
                              {a.recipient}
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-1 font-mono text-[13px] font-black text-emerald-600">
                                ₱{a.value.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell className="pr-6 py-4 text-[13px] text-muted-foreground max-w-[300px] truncate group-hover:whitespace-normal transition-all">
                              {a.reason}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground opacity-30 italic">
                            No disposal records found in system history
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50 bg-muted/5">
                <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  Showing {historyData.length} total decommissioning events
                </p>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Scan Method Selection Dialog */}
        <Dialog open={showQrOptionsDialog} onOpenChange={setShowQrOptionsDialog}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Scan Asset QR Code</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select your preferred method to identify an asset for disposal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => { setShowQrOptionsDialog(false); setIsQrScannerOpen(true); setIsCameraScanning(true) }}
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
                  setShowQrOptionsDialog(false);
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e: any) => handleQrFileUpload(e);
                  input.click()
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
        <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none shadow-2xl">
            <div className="p-6 bg-card/95 backdrop-blur-xl">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-wider">
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
                  onClick={() => setIsQrScannerOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest px-8 border-2 hover:bg-muted"
                >
                  Cancel Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scan Error Dialog */}
        <Dialog open={showUnrecognizedQrDialog} onOpenChange={setShowUnrecognizedQrDialog}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-rose-500">
                <AlertTriangle className="h-5 w-5" />
                Scan Error
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm text-foreground/80 font-medium whitespace-pre-wrap">
                {unrecognizedQrData}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-6 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUnrecognizedQrDialog(false)}
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowUnrecognizedQrDialog(false)
                  setShowQrOptionsDialog(true)
                }}
                className="bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20"
              >
                Try Again
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Disposal Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl sm:max-w-[500px]">
            <AlertDialogHeader className="items-center sm:items-start">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-center sm:text-left">Permanent Decommissioning</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground pt-2 text-center sm:text-left">
                You are about to permanently dispose of <span className="text-foreground font-black underline decoration-destructive/30 decoration-2 underline-offset-4">{selectedAssetIds.length} assets</span> from the active registry.
                <br /><br />
                This action <span className="text-destructive font-bold uppercase tracking-tight">cannot be reversed</span>. All warranty records and active assignments will be terminated.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="bg-muted/30 rounded-lg p-4 my-4 space-y-3 border shadow-inner">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Method</span>
                <Badge variant="outline" className="font-black uppercase text-[10px] bg-background">
                  {form.getValues().disposalMethod}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Total Resource Value</span>
                <span className="font-mono font-black text-rose-500">₱{totalValue.toLocaleString()}</span>
              </div>
              {receiptFile && (
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-3">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Attached Receipt</span>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Paperclip className="h-3 w-3" /> {receiptFile.name}
                  </span>
                </div>
              )}
            </div>

            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="font-bold uppercase tracking-widest text-[10px] h-10 px-6 border-2 transition-all hover:bg-muted">
                Abort Protocol
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDisposal}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold uppercase tracking-widest text-[10px] h-10 px-8 shadow-lg shadow-destructive/20 transition-all active:scale-95"
              >
                Confirm Permanent Disposal
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider >
  )
}
