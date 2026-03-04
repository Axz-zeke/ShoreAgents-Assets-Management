"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { setupDataManager } from "@/lib/setup-data"
import { Asset } from "@/lib/lists-data"
import { parseAssetQrCode } from "@/lib/qr-parser"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  History,
  Building2,
  MapPin,
  User,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  Users,
  CheckCircle2,
  Ticket,
  Calendar as CalendarIcon,
  ArrowLeft,
  Plus,
  X,
  Package,
  Search,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  Filter,
  Eye,
  ArrowUp
} from "lucide-react"

// Helper for setup data
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

// Get available assets from useAssets hook (exclude maintenance and disposed assets)
const getAvailableAssets = (assets: Asset[]) => {
  return assets.filter(asset => {
    const status = (asset.status || "").toLowerCase();
    return (
      status === "available" ||
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

const persons = getPersons()
const departments = getDepartments()

// Form validation schema
const reserveFormSchema = z.object({
  assetIds: z.array(z.string()).min(1, "At least one asset must be selected"),
  reservedFor: z.string().min(1, "Reserved for is required"),
  reservedForType: z.enum(["employee", "department"], {
    message: "Please select reservation type",
  }),
  reservationDate: z.date({
    message: "Reservation date is required",
  }),
  expectedReturnDate: z.date({
    message: "Expected return date is required",
  }),
  purpose: z.string().min(1, "Purpose is required"),
  ticketNumber: z.string().optional(),
  notes: z.string().optional(),
})

type ReserveFormValues = z.infer<typeof reserveFormSchema>

export default function ReserveAssetPage() {
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [assetSearch, setAssetSearch] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [availableAssets, setAvailableAssets] = useState<any[]>([])
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, any>>({})
  const [showPersonSuggestions, setShowPersonSuggestions] = useState(false)
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([])
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false)

  // QR Scanner states
  const [showQrOptions, setShowQrOptions] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [unrecognizedData, setUnrecognizedData] = useState('')
  const [scannedId, setScannedId] = useState<string | null>(null)

  // Recent Reservations functionality
  const [reservationFilter, setReservationFilter] = useState("All")
  const [viewAllDialogOpen, setViewAllDialogOpen] = useState(false)
  const [historySearchTerm, setHistorySearchTerm] = useState("")
  const [historySortField, setHistorySortField] = useState<"date" | "asset" | "for">("date")
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("desc")

  const form = useForm<ReserveFormValues>({
    resolver: zodResolver(reserveFormSchema),
    defaultValues: {
      assetIds: [],
      reservedFor: "",
      reservedForType: "employee",
      reservationDate: new Date(),
      expectedReturnDate: new Date(),
      purpose: "",
      ticketNumber: "",
      notes: "",
    },
  })

  const assetSearchRef = useRef<HTMLDivElement>(null)
  const identitySearchRef = useRef<HTMLDivElement>(null)

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assetSearchRef.current && !assetSearchRef.current.contains(event.target as Node)) {
        setShowAssetSuggestions(false)
      }
      if (identitySearchRef.current && !identitySearchRef.current.contains(event.target as Node)) {
        setShowPersonSuggestions(false)
        setShowDepartmentSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Helper functions for reservations
  const getRecentReservations = () => {
    const reservedAssets = assets.filter(asset =>
      asset.status === "Reserved" || asset.notes?.includes("[RESERVED")
    )

    return reservedAssets
      .map(asset => {
        const match = asset.notes?.match(/\[RESERVED ([^\]]+)]/)
        if (match) {
          const reservationData = match[1]
          const parts = reservationData.split(' | ')
          const reservedFor = parts.find(p => p.startsWith('For:'))?.replace('For: ', '') || 'Unknown'
          const reservedDate = parts.find(p => p.match(/^\d{4}-\d{2}-\d{2}/))
          const department = asset.department || 'Unknown'

          return {
            id: asset.id,
            name: asset.name || asset.id,
            person: reservedFor,
            department: department,
            time: getTimeAgo(asset.updatedAt),
            reservedDate: reservedDate ? new Date(reservedDate) : new Date()
          }
        }
        return null
      })
      .filter(Boolean)
      .map(r => ({
        ...r!,
        updatedAt: (r as any)?.reservedDate.toISOString() || new Date().toISOString()
      }))
      .sort((a, b) => {
        return new Date((b as any).updatedAt).getTime() - new Date((a as any).updatedAt).getTime()
      })
      .slice(0, 10)
      .filter(r => {
        if (reservationFilter === "All") return true
        return (r as any)?.department === reservationFilter
      })
  }

  const getAllReservations = () => {
    const reservedAssets = assets.filter(asset =>
      asset.status === "Reserved" || asset.notes?.includes("[RESERVED")
    )

    return reservedAssets
      .map(asset => {
        const match = asset.notes?.match(/\[RESERVED ([^\]]+)]/)
        if (match) {
          const reservationData = match[1]
          const parts = reservationData.split(' | ')
          const reservedFor = parts.find(p => p.startsWith('For:'))?.replace('For: ', '') || 'Unknown'
          const reservedDate = parts.find(p => p.match(/^\d{4}-\d{2}-\d{2}/))
          const department = asset.department || 'Unknown'

          return {
            id: asset.id,
            name: asset.name || asset.id,
            person: reservedFor,
            department: department,
            time: getTimeAgo(asset.updatedAt),
            reservedDate: reservedDate ? new Date(reservedDate) : new Date()
          }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => {
        return new Date((b as any).reservedDate || 0).getTime() - new Date((a as any).reservedDate || 0).getTime()
      })
  }

  const getTimeAgo = (updatedAt?: string) => {
    if (!updatedAt) return "Unknown time"

    const now = new Date()
    const updated = new Date(updatedAt)
    const diffInMs = now.getTime() - updated.getTime()

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInYears > 0) return `${diffInYears}y ago`
    if (diffInMonths > 0) return `${diffInMonths}mo ago`
    if (diffInWeeks > 0) return `${diffInWeeks}w ago`
    if (diffInDays > 0) return `${diffInDays}d ago`
    if (diffInHours > 0) {
      const remainingMinutes = diffInMinutes % 60
      if (diffInHours < 6 && remainingMinutes > 0) {
        return `${diffInHours}h ${remainingMinutes}m ago`
      }
      return `${diffInHours}h ago`
    }
    if (diffInMinutes > 0) return `${diffInMinutes}m ago`
    return "Just now"
  }

  const recentReservations = getRecentReservations()
  const allReservations = getAllReservations()

  const handleCancelReservation = async (assetId: string) => {
    try {
      const asset = assets.find(a => a.id === assetId)
      if (!asset) return

      const cancelLine = `[CANCELLED RESERVATION ${format(new Date(), "yyyy-MM-dd")}] Reservation stopped.`
      const updatedNotes = asset.notes ? `${asset.notes}\n${cancelLine}` : cancelLine

      const result = await updateAssetMutation.mutateAsync({
        id: assetId,
        updates: {
          status: "Available",
          assignedTo: undefined,
          department: undefined,
          notes: updatedNotes
        }
      })

      if (result.success) {
        toast.success("Reservation cancelled", {
          description: `Asset ${assetId} is now available.`
        })
      }
    } catch (error) {
      toast.error("Failed to cancel reservation")
    }
  }

  // Process history data for display (filter and sort) - similar to Move page
  const historyData = useMemo(() => {
    const allEvents: any[] = []

    assets.forEach(a => {
      if (!a.notes) return

      const lines = a.notes.split('\n')
      lines.forEach((line, lineIndex) => {
        // [RESERVED 2024-03-20] For: Name | Expected Return: 2024-03-25 | Purpose: ...
        const match = line.match(/\[RESERVED ([^\]]+)\](.*)/)
        if (match) {
          const resDate = match[1].trim()
          const content = match[2].trim()

          const parts = content.split(' | ')
          const reservedFor = parts.find(p => p.startsWith('For:'))?.replace('For: ', '') || 'Unknown'
          const expectedReturn = parts.find(p => p.startsWith('Expected Return:'))?.replace('Expected Return: ', '') || 'Unknown'
          const purpose = parts.find(p => p.startsWith('Purpose:'))?.replace('Purpose: ', '') || 'Unknown'
          const ticket = parts.find(p => p.startsWith('Ticket:'))?.replace('Ticket: ', '') || 'N/A'

          allEvents.push({
            id: a.id,
            name: a.name || a.id,
            status: a.status,
            site: a.site,
            location: a.location,
            department: a.department,
            historyDate: resDate,
            historyFor: reservedFor,
            historyReturn: expectedReturn,
            historyPurpose: purpose,
            historyTicket: ticket,
            isCurrentReservation: a.status === "Reserved",
            sortTimestamp: `${resDate}-${lineIndex}`,
            eventKey: `${a.id}-${resDate}-${lineIndex}`
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
          item.name.toLowerCase().includes(search) ||
          item.historyFor.toLowerCase().includes(search) ||
          item.historyPurpose.toLowerCase().includes(search) ||
          item.historyTicket.toLowerCase().includes(search)
        )
      })
      .sort((a, b) => {
        let comparison = 0
        if (historySortField === "date") {
          comparison = b.sortTimestamp.localeCompare(a.sortTimestamp)
        } else if (historySortField === "asset") {
          comparison = a.id.localeCompare(b.id)
        } else if (historySortField === "for") {
          comparison = a.historyFor.localeCompare(b.historyFor)
        }
        return historySortOrder === "desc" ? comparison : -comparison
      })
  }, [assets, historySearchTerm, historySortField, historySortOrder])

  const toggleSort = (field: "date" | "asset" | "for") => {
    if (historySortField === field) {
      setHistorySortOrder(prev => prev === "desc" ? "asc" : "desc")
    } else {
      setHistorySortField(field)
      setHistorySortOrder("desc")
    }
  }

  // Initialize available assets
  React.useEffect(() => {
    const avAssets = getAvailableAssets(assets)
    setAvailableAssets(avAssets)
  }, [assets])

  // Filter assets for search
  const handleAssetSearch = (value: string) => {
    setAssetSearch(value)

    if (value.length > 0) {
      const filtered = availableAssets.filter(asset =>
        asset.id.toLowerCase().includes(value.toLowerCase()) ||
        (asset.name || '').toLowerCase().includes(value.toLowerCase()) ||
        (asset.category || '').toLowerCase().includes(value.toLowerCase())
      )
      setFilteredAssets(filtered)
      setShowAssetSuggestions(true)
    } else {
      setFilteredAssets([])
      setShowAssetSuggestions(false)
    }
  }

  const selectAsset = (asset: any) => {
    if (selectedAssets.includes(asset.id)) {
      toast.error("Asset already added", {
        description: `Asset ${asset.id} is already in the reservation list`,
      })
      return
    }

    setSelectedAssets(prev => [...prev, asset.id])
    setAssetSearch("")
    setShowAssetSuggestions(false)
    setFilteredAssets([])

    // Update form values
    const currentAssetIds = form.getValues("assetIds")
    form.setValue("assetIds", [...currentAssetIds, asset.id])

    toast.success("Asset added", {
      description: `${asset.name || asset.id} has been added to the reservation list`,
    })
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
      setUnrecognizedData(`Asset ${id} is not available for reservation.`)
      setIsScannerOpen(false)
      setShowQrOptions(false)
    }
  }

  React.useEffect(() => {
    if (scannedId) {
      const asset = availableAssets.find(a => a.id === scannedId)
      if (asset) selectAsset(asset)
      setScannedId(null)
    }
  }, [scannedId])

  const handleQrFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    toast.loading('Scanning QR code...', { id: 'qr-scan' })
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const tempContainer = document.createElement('div')
      tempContainer.id = 'temp-qr-reader-reserve'
      tempContainer.style.display = 'none'
      document.body.appendChild(tempContainer)
      try {
        const html5QrCode = new Html5Qrcode("temp-qr-reader-reserve")
        const result = await html5QrCode.scanFile(file, true)
        toast.dismiss('qr-scan')
        handleQrScan(result)
      } finally {
        document.body.removeChild(tempContainer)
      }
    } catch (error) {
      toast.dismiss('qr-scan')
      toast.error('Cannot read QR code')
    }
  }

  const removeAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(id => id !== assetId))

    // Update form values
    const currentAssetIds = form.getValues("assetIds")
    form.setValue("assetIds", currentAssetIds.filter(id => id !== assetId))
  }

  // Filter persons based on search input
  const handlePersonSearch = (value: string) => {
    setEmployeeSearch(value)
    form.setValue("reservedFor", value)

    if (value.length > 0) {
      const filtered = Object.entries(persons).filter(([name, person]) =>
        name.toLowerCase().includes(value.toLowerCase()) ||
        person.email.toLowerCase().includes(value.toLowerCase()) ||
        person.department.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredPersons(Object.fromEntries(filtered))
      setShowPersonSuggestions(true)
    } else {
      setFilteredPersons({})
      setShowPersonSuggestions(false)
    }
  }

  const selectPerson = (personName: string) => {
    setEmployeeSearch(personName)
    form.setValue("reservedFor", personName)
    setShowPersonSuggestions(false)
  }

  // Filter departments based on search input
  const handleDepartmentSearch = (value: string) => {
    setDepartmentSearch(value)
    form.setValue("reservedFor", value)

    if (value.length > 0) {
      const filtered = departments.filter(department =>
        department.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredDepartments(filtered)
      setShowDepartmentSuggestions(true)
    } else {
      setFilteredDepartments([])
      setShowDepartmentSuggestions(false)
    }
  }

  const selectDepartment = (department: string) => {
    setDepartmentSearch(department)
    form.setValue("reservedFor", department)
    setShowDepartmentSuggestions(false)
  }

  const onSubmit = async (data: ReserveFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected", {
        description: "Please select at least one asset to reserve",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let successCount = 0
      let failedCount = 0

      // Update each selected asset
      for (const assetId of selectedAssets) {
        try {
          // Get current asset for notes preserving
          const asset = assets.find(a => a.id === assetId)

          const reservationDetails =
            `[RESERVED ${format(data.reservationDate, "yyyy-MM-dd")}] For: ${data.reservedFor} | Expected Return: ${format(data.expectedReturnDate, "yyyy-MM-dd")} | Purpose: ${data.purpose}${data.ticketNumber ? ` | Ticket: ${data.ticketNumber}` : ''}${data.notes ? ` | Notes: ${data.notes}` : ''}`

          const updatedNotes = asset?.notes ? `${asset.notes}\n${reservationDetails}` : reservationDetails

          const updateData = {
            status: "Reserved" as const,
            assignedTo: data.reservedForType === "employee" ? data.reservedFor : undefined,
            department: data.reservedForType === "department" ? data.reservedFor : undefined,
            notes: updatedNotes
          }

          const result = await updateAssetMutation.mutateAsync({ id: assetId, updates: updateData })
          if (result.success) {
            successCount++
            console.log('Successfully reserved asset', assetId)
          } else {
            failedCount++
            console.error('Asset reservation failed:', result.error)
          }
        } catch (error) {
          console.error(`Failed to reserve asset ${assetId}:`, error)
          failedCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully reserved ${successCount} asset${successCount !== 1 ? 's' : ''}`, {
          description: `Assets reserved for ${data.reservedForType === "employee" ? data.reservedFor : data.reservedFor + " department"}${failedCount > 0 ? ` (${failedCount} failed)` : ''
            }`,
        })

        // Reset form and selected assets
        setSelectedAssets([])
        form.reset()

        // Reload assets to reflect changes
        // Assets will be automatically refetched by the useInstantAssets hook
      } else {
        toast.error("Failed to reserve assets", {
          description: "No assets could be reserved. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error reserving assets:", error)
      toast.error("Failed to reserve assets", {
        description: "Please try again or contact support if the issue persists.",
        duration: 4000,
      })
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
              <BreadcrumbItem><BreadcrumbPage>Reserve Asset</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-10 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Reserve Asset</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary bg-primary/5 uppercase tracking-wider font-bold text-[10px] px-3">
                {assets.filter(a => a.status === "Reserved").length} Active Reservations
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 items-stretch">
            {/* Left Column: Tracking & Forms */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Reservation Details
                  </CardTitle>
                  <CardDescription>Setup a new asset reservation for a user or department</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-6">
                        <div className="relative">
                          <label className="text-sm font-medium mb-2 block">Select Assets *</label>
                          <div className="relative group" ref={assetSearchRef}>
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                              placeholder="Search asset ID or name..."
                              value={assetSearch}
                              onChange={(e) => handleAssetSearch(e.target.value)}
                              onFocus={() => assetSearch.length > 0 && setShowAssetSuggestions(true)}
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
                              <div className="absolute z-50 w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <ScrollArea className="max-h-60">
                                  <div className="p-1">
                                    {filteredAssets.length > 0 ? (
                                      <div className="space-y-0.5">
                                        {filteredAssets.map(a => (
                                          <div
                                            key={a.id}
                                            className="flex items-center justify-between p-3 hover:bg-primary/10 cursor-pointer transition-colors rounded-lg group/item"
                                            onClick={() => selectAsset(a)}
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-bold text-sm group-hover/item:text-primary transition-colors">{a.id}</span>
                                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{a.name} • ₱{a.value?.toLocaleString()}</span>
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

                          <div className="mt-3 space-y-2">
                            {selectedAssets.length > 0 ? (
                              selectedAssets.map(id => {
                                const asset = assets.find(a => a.id === id)
                                return (
                                  <div key={id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">{asset?.name || id}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeAsset(id)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              })
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No assets selected yet</p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="reservedForType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reservation For</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="department">Department</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="reservedFor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{form.watch("reservedForType") === "employee" ? "Employee" : "Department"} *</FormLabel>
                                <div className="relative" ref={identitySearchRef}>
                                  <FormControl>
                                    <Input
                                      placeholder={`Search ${form.watch("reservedForType")}...`}
                                      value={form.watch("reservedForType") === "employee" ? employeeSearch : departmentSearch}
                                      onChange={(e) => form.watch("reservedForType") === "employee" ? handlePersonSearch(e.target.value) : handleDepartmentSearch(e.target.value)}
                                      className="font-bold focus-visible:ring-primary/30"
                                    />
                                  </FormControl>
                                  {((form.watch("reservedForType") === "employee" && showPersonSuggestions) || (form.watch("reservedForType") === "department" && showDepartmentSuggestions)) && (
                                    <div className="absolute z-50 w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                      <ScrollArea className="max-h-60">
                                        <div className="p-1">
                                          {form.watch("reservedForType") === "employee" ? (
                                            Object.entries(filteredPersons).length > 0 ? (
                                              <div className="space-y-0.5">
                                                {Object.entries(filteredPersons).map(([name, p]) => (
                                                  <div key={name} className="flex flex-col p-3 hover:bg-primary/10 cursor-pointer rounded-lg transition-colors group/item" onClick={() => selectPerson(name)}>
                                                    <div className="font-bold text-sm text-foreground group-hover/item:text-primary transition-colors">{p.name}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{p.department}</div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="p-4 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60">No matching employees</div>
                                            )
                                          ) : (
                                            filteredDepartments.length > 0 ? (
                                              <div className="space-y-0.5">
                                                {filteredDepartments.map(d => (
                                                  <div key={d} className="p-3 text-sm font-bold uppercase tracking-wider hover:bg-primary/10 cursor-pointer rounded-lg transition-colors group/item" onClick={() => selectDepartment(d)}>
                                                    <span className="group-hover/item:text-primary transition-colors">{d}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="p-4 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60">No matching departments</div>
                                            )
                                          )}
                                        </div>
                                      </ScrollArea>
                                    </div>
                                  )}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="reservationDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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

                          <FormField
                            control={form.control}
                            name="expectedReturnDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Expected End Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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

                        <FormField
                          control={form.control}
                          name="ticketNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ticket Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. TKT-123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="purpose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Purpose *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Project 'Alpha' deployment..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any extra information..." className="resize-none" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => router.push("/assets")}>Cancel</Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || selectedAssets.length === 0}
                          className="min-w-[120px]"
                        >
                          {isSubmitting ? "Processing..." : `Reserve (${selectedAssets.length})`}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Recent Activity */}
            <div className="lg:col-span-3 flex flex-col space-y-4">
              <Card className="flex-1 flex flex-col overflow-hidden h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                    <Select value={reservationFilter} onValueChange={setReservationFilter}>
                      <SelectTrigger className="h-8 w-[100px] text-xs">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Items</SelectItem>
                        {Array.from(new Set(allReservations.map(r => (r as any).department).filter(Boolean))).map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <CardDescription>Track latest asset reservation status</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4 pt-2 overflow-hidden">
                  <ScrollArea className="flex-1 w-full">
                    <div className="space-y-4 pr-4">
                      {recentReservations.length > 0 ? (
                        <div className="space-y-3">
                          {recentReservations.map((r: any) => (
                            <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-200 group">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                  <Package className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-sm truncate text-foreground/90">{r.name}</div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                                    <Users className="h-3 w-3 opacity-60" />
                                    <span>{r.person}</span>
                                    <span className="opacity-30">•</span>
                                    <Building2 className="h-3 w-3 opacity-60" />
                                    <span>{r.department}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 ml-4 flex-shrink-0">
                                <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 opacity-70">
                                  <Clock className="h-2.5 w-2.5" />
                                  {r.time}
                                </div>
                                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[9px] h-4 px-1 leading-none">RESERVED</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground opacity-20">
                          <Package className="h-12 w-12 mb-2" />
                          <p>No recent activity found</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Quick Stats Section to fill space and provide value */}
                  <div className="mt-auto pt-6 border-t border-border/50 bg-gradient-to-t from-muted/5 to-transparent p-4 -mx-4 -mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 flex items-center gap-2">
                      <History className="h-3 w-3" />
                      Reservation Insights
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-colors cursor-default">
                        <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold opacity-60">Total Active</div>
                        <div className="text-2xl font-black text-primary flex items-baseline gap-1">
                          {assets.filter(a => a.status === "Reserved").length}
                          <span className="text-[10px] font-bold text-primary/40">Units</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 group hover:bg-amber-500/10 transition-colors cursor-default">
                        <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-bold opacity-60">Due Soon</div>
                        <div className="text-2xl font-black text-amber-500 flex items-baseline gap-1">
                          {assets.filter(a => {
                            if (a.status !== "Reserved") return false
                            const match = a.notes?.match(/Return: (\d{4}-\d{2}-\d{2})/)
                            if (!match) return false
                            const dueDate = new Date(match[1])
                            const now = new Date()
                            const diff = dueDate.getTime() - now.getTime()
                            return diff > 0 && diff < (1000 * 60 * 60 * 24 * 3) // Within 3 days
                          }).length}
                          <span className="text-[10px] font-bold text-amber-500/40">Next 72h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>

          {/* Active Reservations Table */}
          <Card className="flex flex-col overflow-hidden border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <History className="h-5 w-5 text-amber-500" />
                    Reservation Tracking Log
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">Full history of asset reservations and scheduling</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-muted/50 border-border text-xs h-8 gap-2">
                    <Download className="h-3 w-3" /> Export Log
                  </Button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <div className="relative flex-1 min-w-[300px] group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    placeholder="Search by asset, person, ticket or purpose..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground/60 h-10 w-full rounded-md ring-offset-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="h-[400px] w-full border-t border-border shadow-inner">
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
                            Reservation Date
                            <ArrowUpDown className={cn("h-3 w-3", historySortField === "date" ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleSort("for")}
                        >
                          <div className="flex items-center gap-2">
                            Reserved For
                            <ArrowUpDown className={cn("h-3 w-3", historySortField === "for" ? "text-primary" : "opacity-30")} />
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Return Date</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Ticket #</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em]">Purpose</TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.15em] text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.length > 0 ? (
                        historyData.map((a: any) => (
                          <TableRow key={a.eventKey} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50 group">
                            <TableCell className="pl-6 py-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-muted-foreground/80 text-[13px]">{a.id}</span>
                                  {a.isCurrentReservation && (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500/20 text-[9px] h-4 px-1 whitespace-nowrap">ACTIVE</Badge>
                                  )}
                                </div>
                                <span className="text-[11px] font-semibold text-foreground truncate max-w-[150px]">{a.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap py-4">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3 opacity-50" />
                                {a.historyDate}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-semibold text-blue-500/80">{a.historyFor}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{a.department || "General"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 text-[13px] text-rose-500 font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {a.historyReturn}
                              </div>
                            </TableCell>
                            <TableCell className="text-[13px] font-mono text-muted-foreground/80 py-4">
                              {a.historyTicket !== "N/A" ? (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono text-[10px] px-2 h-5">
                                  {a.historyTicket}
                                </Badge>
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-[13px] text-muted-foreground max-w-[250px] py-4 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                              {a.historyPurpose}
                            </TableCell>
                            <TableCell className="pr-6 py-4 text-right">
                              {a.isCurrentReservation && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                  onClick={() => handleCancelReservation(a.id)}
                                >
                                  Return Asset
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                            No reservation logs found matching criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t border-border/50 bg-muted/5 flex justify-between items-center">
                <div className="text-[12px] text-muted-foreground">
                  Showing <span className="font-bold text-foreground">1-{historyData.length}</span> of <span className="font-bold text-foreground">{historyData.length}</span> Reservation records
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground/50 cursor-not-allowed" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary/10 text-primary border-primary/20 font-bold text-xs">
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
        {/* Scan Method Selection Dialog */}
        <Dialog open={showQrOptions} onOpenChange={setShowQrOptions}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Scan Asset QR Code</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select your preferred method to identify an asset for reservation.
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
                <span className="text-[10px] font-black uppercase tracking-widest">Use Live Camera</span>
              </Button>
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                onClick={() => {
                  setShowQrOptions(false);
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => handleQrFileUpload(e as any)
                  input.click()
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
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
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
                  onClick={() => setIsScannerOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest px-8 border-2 hover:bg-muted"
                >
                  Cancel Scan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scan Error Dialog */}
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
