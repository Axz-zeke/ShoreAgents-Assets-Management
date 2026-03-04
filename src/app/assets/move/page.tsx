"use client"

import { useState, useEffect, useMemo } from "react"
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
  Move,
  Plus,
  X,
  Package,
  CheckCircle,
  ChevronDown,
  Camera,
  MapPin,
  User,
  Building2,
  Image as ImageIcon,
  History,
  AlertTriangle,
  Search,
  ChevronUp,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUp
} from "lucide-react"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { setupDataManager } from "@/lib/setup-data"
import { parseAssetQrCode } from "@/lib/qr-parser"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Asset } from "@/lib/lists-data"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const getAvailableAssets = (assets: Asset[]) => {
  return assets.filter(asset => {
    const status = (asset.status || "").toLowerCase();
    return (
      status === "available" ||
      status === "In Use" ||
      status === "Reserved" ||
      status === "Leased" ||
      status === "Move" ||
      status === "In Check-in Queue" ||
      status === "Returned Lease"
    );
  }).filter(asset => {
    const status = (asset.status || "").toLowerCase();
    return (
      status !== "maintenance" &&
      status !== "disposed"
    );
  });
}

// Get real data from setup manager
const getLocations = () => {
  const locations = setupDataManager.getLocations()
  const sites = setupDataManager.getSites()
  return [
    ...locations.map(loc => loc.name),
    ...sites.map(site => site.name)
  ]
}

const getPersons = () => {
  const employees = setupDataManager.getEmployees()
  const persons: Record<string, { name: string; email: string; department: string }> = {}
  employees.forEach(emp => {
    persons[emp.name] = {
      name: emp.name,
      email: emp.email || `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
      department: emp.department || 'General'
    }
  })
  return persons
}

const getDepartments = () => {
  return setupDataManager.getDepartments().map(dept => dept.name)
}

const moveSchema = z.object({
  status: z.string().optional(),
  site: z.string().optional(),
  newLocation: z.string().optional(),
  floor: z.string().optional(),
  assignedTo: z.string().optional(),
  departmentTransfer: z.string().optional(),
  condition: z.string().optional(),
  transferMethod: z.string().optional(),
  ticketNumber: z.string().optional(),
  moveDate: z.date({
    message: "Date is required",
  }).optional(),
  reason: z.string().min(1, "Please provide a reason or notes for this update"),
})

type MoveFormValues = z.infer<typeof moveSchema>

export default function MoveAssetPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [assetIdInput, setAssetIdInput] = useState("")

  // Dropdown/Suggestion states
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])

  const [locationInput, setLocationInput] = useState("")
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState<string[]>([])

  const [personInput, setPersonInput] = useState("")
  const [showPersonSuggestions, setShowPersonSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, { name: string; email: string; department: string }>>({})

  const [departmentInput, setDepartmentInput] = useState("")
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([])

  const [selectedDashboardDept, setSelectedDashboardDept] = useState("All Departments")

  // QR Scanner states
  const [showQrOptionsDialog, setShowQrOptionsDialog] = useState(false)
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const [isCameraScanning, setIsCameraScanning] = useState(false)
  const [showUnrecognizedQrDialog, setShowUnrecognizedQrDialog] = useState(false)
  const [unrecognizedQrData, setUnrecognizedQrData] = useState('')
  const [scannedAssetId, setScannedAssetId] = useState<string | null>(null)

  // Confirmation state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // History Table States
  const [historySearchTerm, setHistorySearchTerm] = useState("")
  const [historySortField, setHistorySortField] = useState<string>("date")
  const [historySortDirection, setHistorySortDirection] = useState<"asc" | "desc">("desc")
  const [historyFilter, setHistoryFilter] = useState("All")

  // Get real data
  const locations = getLocations()
  const persons = getPersons()
  const departments = getDepartments()
  const availableAssets = getAvailableAssets(assets)

  const form = useForm<MoveFormValues>({
    resolver: zodResolver(moveSchema),
    defaultValues: {
      status: "",
      site: "",
      newLocation: "",
      floor: "",
      assignedTo: "",
      departmentTransfer: "",
      condition: "",
      transferMethod: "",
      ticketNumber: "",
      reason: "",
    },
  })

  // Suggestions logic
  const handleAssetSearch = (value: string) => {
    setAssetIdInput(value)
    if (value.length > 0) {
      const filtered = availableAssets.filter(asset =>
        asset.id.toLowerCase().includes(value.toLowerCase()) ||
        (asset.name || '').toLowerCase().includes(value.toLowerCase())
      )
      setFilteredAssets(filtered)
      setShowAssetSuggestions(true)
    } else {
      setShowAssetSuggestions(false)
    }
  }

  const handleLocationSearch = (value: string) => {
    setLocationInput(value)
    form.setValue("newLocation", value)
    const filtered = locations.filter(loc => loc.toLowerCase().includes(value.toLowerCase()))
    setFilteredLocations(filtered)
    setShowLocationSuggestions(true)
  }

  const handlePersonSearch = (value: string) => {
    setPersonInput(value)
    form.setValue("assignedTo", value)
    const filtered = Object.entries(persons).filter(([name, p]) =>
      name.toLowerCase().includes(value.toLowerCase()) || p.email.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredPersons(Object.fromEntries(filtered))
    setShowPersonSuggestions(true)
  }

  const handleDepartmentSearch = (value: string) => {
    setDepartmentInput(value)
    form.setValue("departmentTransfer", value)
    const filtered = departments.filter(d => d.toLowerCase().includes(value.toLowerCase()))
    setFilteredDepartments(filtered)
    setShowDepartmentSuggestions(true)
  }

  // Process history data for display (filter and sort) - now extracts ALL history lines from notes
  const historyData = useMemo(() => {
    const allEvents: any[] = []

    assets.forEach((a) => {
      const lines = a.notes?.split('\n') || []
      lines.forEach((line, lineIndex) => {
        // Match [UPDATE YYYY-MM-DD HH:mm:ss] or just [UPDATE YYYY-MM-DD]
        const match = line.match(/\[(?:MOVE|UPDATE) (\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}:\d{2}))?\] (.*)$/)
        if (match) {
          const dateStr = match[1].trim()
          const timeStr = match[2] || "00:00:00"
          let content = match[3].trim()
          let displayAuthorizer = a.authorizedBy || "Not Recorded"

          let displayTicket = "No Ticket"

          // Try to extract Ticket from note first
          const ticketMatch = content.match(/\(Ticket: (.*)\)$/)
          if (ticketMatch) {
            displayTicket = ticketMatch[1].trim()
            content = content.replace(ticketMatch[0], "").trim()
          }

          allEvents.push({
            ...a,
            id: a.id,
            name: a.name,
            historyDate: dateStr,
            historyReason: content,
            historyTicket: displayTicket,
            // Full timestamp for precise sorting
            sortTimestamp: `${dateStr} ${timeStr}-${lineIndex}`,
            eventKey: `${a.id}-${dateStr}-${timeStr}-${lineIndex}`
          })
        }
      })
    })

    return allEvents
      .filter(item => {
        if (!historySearchTerm) return true
        const search = historySearchTerm.toLowerCase()
        return (
          item.id.toLowerCase().includes(search) ||
          (item.name || "").toLowerCase().includes(search) ||
          item.historyReason.toLowerCase().includes(search) ||
          item.historyTicket.toLowerCase().includes(search) ||
          item.site?.toLowerCase().includes(search) ||
          item.location?.toLowerCase().includes(search) ||
          item.assignedTo?.toLowerCase().includes(search)
        )
      })
      .sort((a, b) => {
        let comparison = 0
        if (historySortField === "date") {
          // Absolute chronological sort
          comparison = b.sortTimestamp.localeCompare(a.sortTimestamp)
        } else if (historySortField === "asset") {
          comparison = a.id.localeCompare(b.id)
        } else if (historySortField === "status") {
          comparison = (a.status || "").localeCompare(b.status || "")
        }

        return historySortDirection === "desc" ? comparison : -comparison
      })
  }, [assets, historySearchTerm, historySortField, historySortDirection])

  const toggleSort = (field: string) => {
    if (historySortField === field) {
      setHistorySortDirection(historySortDirection === "desc" ? "asc" : "desc")
    } else {
      setHistorySortField(field)
      setHistorySortDirection("desc")
    }
  }

  const addAssetById = () => {
    if (!assetIdInput.trim()) return
    const asset = availableAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (asset) {
      if (!selectedAssets.find(s => s.id === asset.id)) {
        setSelectedAssets([...selectedAssets, asset])
        setAssetIdInput("")
        setShowAssetSuggestions(false)
        toast.success("Asset added to move list")
      } else {
        toast.error("Asset already in list")
      }
    } else {
      toast.error("Asset not found or unavailable")
    }
  }

  const removeAsset = (id: string) => {
    setSelectedAssets(selectedAssets.filter(a => a.id !== id))
  }

  // QR Logic
  const handleQrScan = (result: string) => {
    const assetId = parseAssetQrCode(result)
    if (!assetId) {
      setUnrecognizedQrData(result)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
      return
    }

    const found = availableAssets.find(a => a.id.toLowerCase() === assetId.toLowerCase())
    if (found) {
      setScannedAssetId(found.id)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    } else {
      setUnrecognizedQrData(`Asset ID: ${assetId} (Not found or unavailable)`)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    }
  }

  useEffect(() => {
    if (scannedAssetId) {
      const asset = availableAssets.find(a => a.id === scannedAssetId)
      if (asset) {
        if (!selectedAssets.find(s => s.id === asset.id)) {
          setSelectedAssets(prev => [...prev, asset])
          toast.success(`Asset ${asset.id} added`)
        } else {
          toast.info("Asset already in list")
        }
      }
      setScannedAssetId(null)
    }
  }, [scannedAssetId, availableAssets, selectedAssets])

  const handleQrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    toast.loading("Scanning...", { id: "qr" })
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const temp = document.createElement("div")
      temp.id = "temp-qr"; temp.style.display = "none"; document.body.appendChild(temp)
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

  const onSubmit = async (data: MoveFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("Select at least one asset")
      return
    }
    setIsSubmitting(true)
    try {
      const now = new Date()
      const today = format(now, "yyyy-MM-dd")
      const time = format(now, "HH:mm:ss")
      for (const selected of selectedAssets) {
        // Get the most up-to-date asset info to avoid losing existing notes
        const asset = assets.find(a => a.id === selected.id) || selected

        const historyLine = `[UPDATE ${today} ${time}] ${data.reason}${data.ticketNumber ? ` (Ticket: ${data.ticketNumber})` : ''}`
        const updatedNotes = asset.notes ? `${asset.notes}\n${historyLine}` : historyLine

        let updates: any = {
          notes: updatedNotes
        }

        if (data.status) updates.status = data.status
        if (data.site) updates.site = data.site
        if (data.newLocation) updates.location = data.newLocation
        if (data.floor) updates.floor = data.floor
        if (data.assignedTo) updates.assignedTo = data.assignedTo
        if (data.departmentTransfer) updates.department = data.departmentTransfer
        if (data.condition) updates.condition = data.condition
        if (data.transferMethod) updates.transferMethod = data.transferMethod
        if (data.ticketNumber) updates.ticketNumber = data.ticketNumber
        if (data.moveDate) updates.lastUpdateDate = data.moveDate.toISOString()

        await updateAssetMutation.mutateAsync({ id: asset.id, updates })
      }
      toast.success("Assets updated successfully")
      // Clear selection and form for next update instead of redirecting
      setSelectedAssets([])
      form.reset({
        status: "",
        site: "",
        newLocation: "",
        floor: "",
        assignedTo: "",
        departmentTransfer: "",
        condition: "",
        transferMethod: "",
        ticketNumber: "",
        reason: "",
      })
      setLocationInput("")
      setPersonInput("")
      setDepartmentInput("")
    } catch (err) {
      toast.error("Failed to update assets")
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
              <BreadcrumbItem><BreadcrumbPage>Move Asset</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Move Assets</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{availableAssets.length} Assets Available</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Asset Selection */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Select Assets
                </CardTitle>
                <CardDescription>Search or scan the units you want to transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search asset ID or name..."
                    value={assetIdInput}
                    onChange={(e) => handleAssetSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAssetById())}
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

                  {showAssetSuggestions && assetIdInput.length > 0 && (
                    <div className="absolute z-[60] left-0 top-full w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="max-h-60 overflow-y-auto">
                        {filteredAssets.length > 0 ? filteredAssets.map(asset => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-0"
                            onClick={() => {
                              setSelectedAssets(prev => {
                                if (prev.find(s => s.id === asset.id)) return prev
                                return [...prev, asset]
                              })
                              setAssetIdInput("")
                              setShowAssetSuggestions(false)
                              toast.success(`Asset ${asset.id} added`)
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-foreground">{asset.id}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-medium">{asset.name} • {asset.location}</span>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <Plus className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                        )) : (
                          <div className="p-6 text-sm text-center text-muted-foreground italic">No matches found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center justify-between">
                    Selected Units ({selectedAssets.length})
                    {selectedAssets.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAssets([])} className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive">
                        Clear all
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {selectedAssets.length > 0 ? selectedAssets.map(asset => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{asset.id}</span>
                              <span className="text-xs text-muted-foreground">{asset.name || "No name"}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeAsset(asset.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg px-6 py-10">
                          <Move className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-sm">No assets selected</p>
                          <p className="text-xs text-center mt-1">Search or scan assets to move</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Config & Update Logic */}
            <div className="lg:col-span-4 h-full flex flex-col">
              <Form {...form}>
                <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(() => setShowConfirmDialog(true))(e); }} className="flex-1 flex flex-col">
                  <Card className="flex-1 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl">Asset Update Details</CardTitle>
                      <CardDescription>Enter the new details for the selected assets</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 overflow-y-auto max-h-[700px]">
                      <div className="space-y-6">
                        {/* Core Transfer Info */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Destination & Hierarchy</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="site"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Building / Site</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select target building..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Main Headquarters">Main Headquarters</SelectItem>
                                      <SelectItem value="North Annex">North Annex</SelectItem>
                                      <SelectItem value="South Warehouse">South Warehouse</SelectItem>
                                      <SelectItem value="Research Center">Research Center</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <div className="relative">
                              <FormLabel>Update Location</FormLabel>
                              <Input
                                placeholder="Target room or area..."
                                value={locationInput}
                                onChange={(e) => handleLocationSearch(e.target.value)}
                                onFocus={() => {
                                  if (locationInput.length > 0) setShowLocationSuggestions(true)
                                }}
                                className="mt-1"
                              />
                              {showLocationSuggestions && locationInput.length > 0 && (
                                <div className="absolute z-[60] left-0 top-full w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                  <div className="max-h-60 overflow-y-auto p-1">
                                    {filteredLocations.length > 0 ? filteredLocations.map(loc => (
                                      <div
                                        key={loc}
                                        className="p-3 text-sm hover:bg-muted cursor-pointer transition-colors rounded-sm border-b last:border-0"
                                        onClick={() => {
                                          setLocationInput(loc)
                                          form.setValue("newLocation", loc)
                                          setShowLocationSuggestions(false)
                                        }}
                                      >
                                        {loc}
                                      </div>
                                    )) : (
                                      <div className="p-4 text-xs text-center text-muted-foreground italic">No locations found</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            <FormField
                              control={form.control}
                              name="floor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Floor / Level</FormLabel>
                                  <FormControl>
                                    <Input className="mt-1" placeholder="e.g. 2nd Floor" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="relative">
                              <FormLabel>Update Department</FormLabel>
                              <Input
                                placeholder="Target department..."
                                value={departmentInput}
                                onChange={(e) => handleDepartmentSearch(e.target.value)}
                                onFocus={() => {
                                  if (departmentInput.length > 0) setShowDepartmentSuggestions(true)
                                }}
                                className="mt-1"
                              />
                              {showDepartmentSuggestions && departmentInput.length > 0 && (
                                <div className="absolute z-[60] left-0 top-full w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                  <div className="max-h-60 overflow-y-auto p-1 text-foreground">
                                    {filteredDepartments.length > 0 ? filteredDepartments.map(d => (
                                      <div
                                        key={d}
                                        className="p-3 text-sm hover:bg-muted cursor-pointer transition-colors rounded-sm border-b last:border-0"
                                        onClick={() => {
                                          setDepartmentInput(d)
                                          form.setValue("departmentTransfer", d)
                                          setShowDepartmentSuggestions(false)
                                        }}
                                      >
                                        {d}
                                      </div>
                                    )) : (
                                      <div className="p-4 text-xs text-center text-muted-foreground italic">No departments found</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Ownership */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Status & Ownership</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Update Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Keep current status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Available">Available</SelectItem>
                                      <SelectItem value="In Use">In Use</SelectItem>
                                      <SelectItem value="Reserved">Reserved</SelectItem>
                                      <SelectItem value="Leased">Leased</SelectItem>
                                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                                      <SelectItem value="Disposed">Disposed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <div className="relative">
                              <FormLabel>Assign to User</FormLabel>
                              <Input
                                placeholder="Assign unit to..."
                                value={personInput}
                                onChange={(e) => handlePersonSearch(e.target.value)}
                                onFocus={() => {
                                  if (personInput.length > 0) setShowPersonSuggestions(true)
                                }}
                                className="mt-1"
                              />
                              {showPersonSuggestions && personInput.length > 0 && (
                                <div className="absolute z-[60] left-0 top-full w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                  <div className="max-h-60 overflow-y-auto p-1 text-foreground">
                                    {Object.keys(filteredPersons).length > 0 ? Object.entries(filteredPersons).map(([name, p]) => (
                                      <div
                                        key={name}
                                        className="p-3 hover:bg-muted cursor-pointer flex flex-col gap-0.5 transition-colors rounded-sm border-b last:border-0"
                                        onClick={() => {
                                          setPersonInput(name)
                                          form.setValue("assignedTo", name)
                                          setShowPersonSuggestions(false)
                                        }}
                                      >
                                        <span className="text-sm font-bold text-foreground">{name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.department}</span>
                                      </div>
                                    )) : (
                                      <div className="p-4 text-xs text-center text-muted-foreground italic">No users found</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Logistics & Audit */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Logistics & Audit</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="condition"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Update Condition</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Keep current condition" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Excellent">Excellent (Like New)</SelectItem>
                                      <SelectItem value="Good">Good (Minor wear)</SelectItem>
                                      <SelectItem value="Fair">Fair (Operational)</SelectItem>
                                      <SelectItem value="Poor">Poor (Needs repair)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="transferMethod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Transfer Method</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select method..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="In-house Team">In-house IT/Facilities</SelectItem>
                                      <SelectItem value="Personal Carry">Personal Carry</SelectItem>
                                      <SelectItem value="External Courier">External Courier</SelectItem>
                                      <SelectItem value="Postal Service">Postal Service</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="ticketNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Ticket Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      className="mt-1"
                                      placeholder="e.g. TKT-12345"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Audit Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50 shadow-inner rounded-b-lg p-3 bg-muted/10">
                        <FormField
                          control={form.control}
                          name="moveDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Update Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn("mt-1 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Update Reason / Notes</FormLabel>
                              <FormControl>
                                <Textarea className="mt-1 min-h-[40px] resize-none" placeholder="Required: Why is this update happening?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="pt-4 flex justify-end gap-2 border-t mt-auto sticky bottom-0 bg-card pb-2">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || selectedAssets.length === 0}
                          className="min-w-[150px] shadow-sm"
                        >
                          {isSubmitting ? "Processing..." : `Process Bulk Update (${selectedAssets.length})`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
          </div>

          {/* Movement History Table */}
          <Card className="mt-8 flex flex-col overflow-hidden border">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <History className="h-5 w-5 text-amber-500" />
                    Asset Movement History
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">Recently moved assets and their transfer details</CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
                    placeholder="Search movement history..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground/60 h-10 w-full rounded-md ring-offset-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="h-[500px] w-full border-t border-border shadow-inner">
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
                            Date
                            <ArrowUpDown className={cn("h-3 w-3", historySortField === "date" ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleSort("status")}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            <ArrowUpDown className={cn("h-3 w-3", historySortField === "status" ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Site & Location</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Assignment</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Ticket #</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.length > 0 ? (
                        historyData.map((a: any) => {
                          return (
                            <TableRow key={a.eventKey} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50 group">
                              <TableCell className="pl-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-mono text-muted-foreground/80 text-[13px]">{a.id}</span>
                                  <span className="text-[11px] font-semibold text-foreground truncate max-w-[150px]">{a.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap py-4">{a.historyDate}</TableCell>
                              <TableCell className="py-4">
                                <Badge variant="outline" className="font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border-none bg-primary/10 text-primary">
                                  {a.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 text-[13px] font-medium">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                    {a.site || "N/A"}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <MapPin className="h-3 w-3 opacity-40 group-hover:text-primary transition-colors" />
                                    {a.location || "No Room"} {a.floor ? `(Floor ${a.floor})` : ""}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-semibold text-blue-500/80">{a.assignedTo || "Unassigned"}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{a.department || "General"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-[13px] font-mono text-muted-foreground/80 py-4">{a.historyTicket}</TableCell>
                              <TableCell className="text-[13px] text-muted-foreground max-w-[200px] py-4">{a.historyReason}</TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            No movement history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
              <div className="px-6 py-4 border-t border-border/50 bg-muted/5 flex justify-between items-center">
                <div className="text-[12px] text-muted-foreground">
                  Showing <span className="font-bold text-foreground">1-{historyData.length}</span> of <span className="font-bold text-foreground">{historyData.length}</span> Movement records
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground/50 cursor-not-allowed" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-bold text-xs">
                    1
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground/50 cursor-not-allowed" disabled>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Dialogs */}
        {/* Scan Method Selection Dialog */}
        <Dialog open={showQrOptionsDialog} onOpenChange={setShowQrOptionsDialog}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Scan Asset QR Code</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select your preferred method to identify an asset for transfer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => { setShowQrOptionsDialog(false); setIsCameraScanning(true); setIsQrScannerOpen(true) }}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Use Live Camera</span>
              </Button>
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                onClick={() => {
                  setShowQrOptionsDialog(false);
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
                <span className="text-[10px] font-black uppercase tracking-widest">Upload QR Image</span>
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
        {/* Move Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Confirm Asset Movement
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Please review the transfer details below before proceeding.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] -mx-6 px-6">
              <div className="space-y-6 py-4">
                {/* Assets List Summary */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Selected Assets ({selectedAssets.length})</h4>
                  <div className="space-y-2 pr-2">
                    {selectedAssets.map(asset => (
                      <div key={asset.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/40 border border-border/50">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{asset.id}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{asset.name || "No Name"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Updates to Apply</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
                    {form.getValues("status") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Status</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <CheckCircle className="h-3 w-3" /> {form.getValues("status")}
                        </div>
                      </div>
                    )}
                    {form.getValues("site") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Building</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">
                          <Building2 className="h-3 w-3" /> {form.getValues("site")}
                        </div>
                      </div>
                    )}
                    {form.getValues("newLocation") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Room/Area</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-primary/10 text-primary border border-primary/20">
                          <MapPin className="h-3 w-3" /> {form.getValues("newLocation")}
                        </div>
                      </div>
                    )}
                    {form.getValues("floor") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Floor</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                          <Move className="h-3 w-3" /> {form.getValues("floor")}
                        </div>
                      </div>
                    )}
                    {form.getValues("assignedTo") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">User</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <User className="h-3 w-3" /> {form.getValues("assignedTo")}
                        </div>
                      </div>
                    )}
                    {form.getValues("departmentTransfer") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Department</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                          <Building2 className="h-3 w-3" /> {form.getValues("departmentTransfer")}
                        </div>
                      </div>
                    )}
                    {form.getValues("condition") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Condition</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <Package className="h-3 w-3" /> {form.getValues("condition")}
                        </div>
                      </div>
                    )}
                    {form.getValues("transferMethod") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Method</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <Move className="h-3 w-3" /> {form.getValues("transferMethod")}
                        </div>
                      </div>
                    )}
                    {form.getValues("ticketNumber") && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold">Ticket #</span>
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold p-1.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <History className="h-3 w-3" /> {form.getValues("ticketNumber")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Update Reason / Notes</h4>
                  <div className="p-3 rounded-md bg-muted/30 border border-border/50 text-sm italic text-foreground/80 leading-relaxed">
                    "{form.getValues("reason") || "No reason provided"}"
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmDialog(false)}
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                Go Back
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmDialog(false);
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest px-8 shadow-lg shadow-primary/20 h-10"
              >
                {isSubmitting ? "Processing..." : "Confirm & Move Assets"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
