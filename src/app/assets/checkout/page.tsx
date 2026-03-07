"use client"

import { useState } from "react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useSystemSettings } from "@/contexts/system-settings-context"
import { Asset } from "@/lib/lists-data"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarIcon, ArrowLeft, UserCheck, Plus, X, Package, DollarSign, CheckCircle, Camera, Image as ImageIcon, Building2, Monitor, Home, Users, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { parseAssetQrCode } from "@/lib/qr-parser"

// Get available assets from useAssets hook (exclude maintenance and disposed assets)
const getAvailableAssets = (assets: Asset[]) => {
  return assets.filter(asset => {
    return (
      asset.status === "Available" ||
      asset.status === "Reserved" ||
      asset.status === "Move"
    );
  }).filter(asset => {
    return (
      asset.status !== "Maintenance" &&
      asset.status !== "Disposed"
    );
  });
}

// Mock persons data
const mockPersons = {
  "John Smith": { name: "John Smith", email: "john@company.com", department: "IT" },
  "Sarah Johnson": { name: "Sarah Johnson", email: "sarah@company.com", department: "Marketing" },
  "Mike Wilson": { name: "Mike Wilson", email: "mike@company.com", department: "Sales" },
  "Lisa Brown": { name: "Lisa Brown", email: "lisa@company.com", department: "HR" },
  "David Lee": { name: "David Lee", email: "david@company.com", department: "Finance" },
}

const checkoutSchema = z.object({
  assignedTo: z.string().min(1, "Please select who to assign to"),
  checkoutDate: z.date({
    message: "Checkout date is required",
  }),
  dueDate: z.date().optional(),
  workSetup: z.enum(["Onsite", "Temp WFH", "Perma WFH"]),
  checkoutType: z.enum(["person", "site"]),
  site: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  checkoutNotes: z.string().optional(),
  emailAddress: z.string().optional(),
}).refine((data) => {
  if (data.workSetup === "Temp WFH" && !data.dueDate) {
    return false
  }
  return true
}, {
  message: "Return date is required for Temp WFH",
  path: ["dueDate"],
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { formatCurrency } = useSystemSettings()
  const router = useRouter()
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])
  const [assetIdInput, setAssetIdInput] = useState("")
  const [assignToInput, setAssignToInput] = useState("")
  const [showAssignToSuggestions, setShowAssignToSuggestions] = useState(false)
  const [filteredPersons, setFilteredPersons] = useState<Record<string, { name: string; email: string; department: string }>>({})
  const [showAssetSuggestions, setShowAssetSuggestions] = useState(false)
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])

  // QR Scanner states
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
  const [scannedAssetId, setScannedAssetId] = useState<string | null>(null)
  const [showQrOptionsDialog, setShowQrOptionsDialog] = useState(false)
  const [isCameraScanning, setIsCameraScanning] = useState(false)
  const [showUnrecognizedQrDialog, setShowUnrecognizedQrDialog] = useState(false)
  const [unrecognizedQrData, setUnrecognizedQrData] = useState<string>('')
  const [activeSetupTab, setActiveSetupTab] = useState<"All" | "Onsite" | "Perma WFH" | "Temp WFH">("All")

  // Get available assets from the loaded assets
  const availableAssets = getAvailableAssets(assets)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      assignedTo: "",
      checkoutType: "person",
      workSetup: "Onsite",
      site: "",
      location: "",
      department: "",
      checkoutNotes: "",
      emailAddress: "",
      checkoutDate: new Date(),
    },
  })

  const workSetup = form.watch("workSetup")

  // Parse all assets to find current setups
  const currentSetups = React.useMemo(() => {
    return assets
      .filter(a => a.assignedTo)
      .map(a => {
        const notes = a.notes || ""
        const setupMatch = notes.match(/Setup: (Onsite|Temp WFH|Perma WFH)/)
        const workSetup = setupMatch ? setupMatch[1] : "N/A"
        const dateMatch = notes.match(/\[(?:CHECKOUT|RESERVED|MOVE) ([^\]]+)\]/)

        return {
          id: a.id,
          name: a.name || "Unnamed Asset",
          person: a.assignedTo as string,
          assetStatus: a.status || "Unknown",
          workSetup: workSetup as "Onsite" | "Temp WFH" | "Perma WFH" | "N/A",
          category: a.category || "IT Equipment",
          department: a.department || "No Department",
          date: dateMatch ? dateMatch[1] : "N/A",
          location: a.location || "Office",
          value: a.value || 0
        }
      })
  }, [assets])

  // Get unique persons from all assets for suggestions
  const allPersons = React.useMemo(() => {
    const persons: Record<string, { name: string; email: string; department: string }> = { ...mockPersons }

    // Add people from current asset assignments
    assets.forEach(asset => {
      if (asset.assignedTo && !persons[asset.assignedTo]) {
        persons[asset.assignedTo] = {
          name: asset.assignedTo,
          email: "",
          department: asset.department || "No Department"
        }
      }
    })

    return persons
  }, [assets, mockPersons])

  const [tableSearch, setTableSearch] = useState("")

  const filteredSetups = currentSetups.filter(s => {
    const matchesTab = activeSetupTab === "All" || s.workSetup === activeSetupTab
    const matchesSearch = s.person.toLowerCase().includes(tableSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(tableSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(tableSearch.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Filter persons based on search input
  const handleAssignToSearch = (value: string) => {
    setAssignToInput(value)
    form.setValue("assignedTo", value)

    if (value.length > 0) {
      const filtered = Object.entries(allPersons).filter(([name, person]) => {
        const p = person as { name: string; email: string; department: string }
        return name.toLowerCase().includes(value.toLowerCase()) ||
          p.email.toLowerCase().includes(value.toLowerCase()) ||
          p.department.toLowerCase().includes(value.toLowerCase())
      })
      setFilteredPersons(Object.fromEntries(filtered))
      setShowAssignToSuggestions(true)
    } else {
      setFilteredPersons({})
      setShowAssignToSuggestions(false)
    }
  }

  const selectPerson = (personName: string) => {
    setAssignToInput(personName)
    form.setValue("assignedTo", personName)

    // Auto-fill department if available
    const person = allPersons[personName]
    if (person && person.department) {
      form.setValue("department", person.department)
    }

    setShowAssignToSuggestions(false)
  }

  // Handle asset ID input with autocomplete
  const handleAssetIdInput = (value: string) => {
    setAssetIdInput(value)

    if (value.trim().length > 0) {
      const searchStr = value.toLowerCase()
      const filtered = availableAssets.filter(asset =>
        asset.id.toLowerCase().includes(searchStr) ||
        (asset.name || '').toLowerCase().includes(searchStr) ||
        (asset.model || '').toLowerCase().includes(searchStr) ||
        (asset.serialNumber || '').toLowerCase().includes(searchStr)
      )
      setFilteredAssets(filtered)
      setShowAssetSuggestions(true)
    } else {
      setFilteredAssets([])
      setShowAssetSuggestions(false)
    }
  }

  const selectAsset = (asset: Asset) => {
    if (selectedAssets.find(a => a.id === asset.id)) {
      toast.error("Asset already added", {
        description: `Asset ${asset.id} is already in the list`,
      })
      return
    }

    setSelectedAssets(prev => [...prev, asset])
    setAssetIdInput("")
    setShowAssetSuggestions(false)
    setFilteredAssets([])
    toast.success("Asset added", {
      description: `${asset.name} has been added to the checkout list`,
    })
  }

  const addAssetById = () => {
    if (!assetIdInput.trim()) return

    const asset = availableAssets.find(a => a.id.toLowerCase() === assetIdInput.toLowerCase())
    if (!asset) {
      toast.error("Asset not found", {
        description: `No available asset found with ID: ${assetIdInput}`,
      })
      return
    }

    selectAsset(asset)
  }

  const removeAsset = (assetId: string) => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId))
  }

  // QR Scanner functionality
  const handleQrScan = (result: string) => {
    const assetTagId = parseAssetQrCode(result)

    if (!assetTagId) {
      setUnrecognizedQrData(result)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
      return
    }

    // Use full assets list for QR scanning to be more robust
    const foundAsset = assets.find(
      asset => asset.id.toLowerCase() === assetTagId.toLowerCase()
    )

    if (foundAsset) {
      // Check if the asset is allowed for checkout
      const isAvailable = getAvailableAssets([foundAsset]).length > 0
      if (!isAvailable) {
        setUnrecognizedQrData(`Asset found (${foundAsset.id}) but its current status is "${foundAsset.status}", which cannot be checked out.`)
        setShowUnrecognizedQrDialog(true)
      } else {
        setScannedAssetId(foundAsset.id)
        setIsQrScannerOpen(false)
        setShowQrOptionsDialog(false)
      }
    } else {
      setUnrecognizedQrData(`Asset ID "${assetTagId}" not found in system registry.`)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    }
  }

  const handleQrScannerError = (error: any) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || ''
    if (errorMessage.includes('No MultiFormat Readers were able to detect the code') ||
      errorMessage.includes('NotFoundException')) {
      return
    }
    console.error('QR Scanner error:', error)
    setUnrecognizedQrData(`Camera Error: ${errorMessage || 'Unknown error'}`)
    setShowUnrecognizedQrDialog(true)
    setIsQrScannerOpen(false)
  }

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
      console.error('Failed to scan QR from file:', error)
      toast.dismiss('qr-scan')
      if (error instanceof Error && error.message.includes('No MultiFormat Readers were able to detect the code')) {
        toast.error('Cannot read QR code', {
          description: 'The image quality might be too low or the QR code is damaged.',
          duration: 5000
        })
        setUnrecognizedQrData('Unable to decode QR code. Please try using a higher resolution image.')
        setShowUnrecognizedQrDialog(true)
      } else {
        toast.error('QR scan failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
          duration: 5000
        })
        setUnrecognizedQrData(`Error scanning QR code: ${error instanceof Error ? error.message : 'Unknown error'}.`)
        setShowUnrecognizedQrDialog(true)
      }
    }
  }

  const handleCameraScan = () => {
    setShowQrOptionsDialog(false)
    setIsCameraScanning(true)
    setIsQrScannerOpen(true)
  }

  const handleFileUploadScan = () => {
    setShowQrOptionsDialog(false)
    setIsCameraScanning(false)
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement
      if (target.files?.[0]) {
        handleQrFileUpload({ target } as React.ChangeEvent<HTMLInputElement>)
      }
    }
    fileInput.click()
  }

  React.useEffect(() => {
    if (scannedAssetId) {
      const foundAsset = availableAssets.find(asset => asset.id === scannedAssetId)
      if (foundAsset) {
        selectAsset(foundAsset)
        setScannedAssetId(null)
      } else {
        setScannedAssetId(null)
      }
    }
  }, [scannedAssetId, availableAssets])

  React.useEffect(() => {
    let scanner: any = null;

    if (isQrScannerOpen && isCameraScanning) {
      // Use a small delay to ensure the DOM element is rendered
      const timer = setTimeout(() => {
        import('html5-qrcode').then(({ Html5Qrcode }) => {
          const element = document.getElementById("qr-reader");
          if (!element) return;

          scanner = new Html5Qrcode("qr-reader");
          scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
              scanner.stop().then(() => {
                handleQrScan(decodedText);
              }).catch(console.error);
            },
            (error: any) => {
              // Ignore frequent "No QR code found" errors
              const msg = typeof error === 'string' ? error : error?.message || '';
              if (!msg.includes('No MultiFormat Readers')) {
                console.log('Scan error:', error);
              }
            }
          ).catch((err: any) => {
            console.error("Failed to start QR scanner:", err);
            toast.error("Camera access denied or device error");
            setIsQrScannerOpen(false);
          });
        }).catch(console.error);
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scanner && scanner.isScanning) {
          scanner.stop().catch(console.error);
        }
      };
    }
  }, [isQrScannerOpen, isCameraScanning])

  const onSubmit = async (data: CheckoutFormValues) => {
    if (selectedAssets.length === 0) {
      toast.error("No assets selected")
      return
    }
    setIsSubmitting(true)
    try {
      let successCount = 0
      let failedCount = 0
      const today = format(data.checkoutDate || new Date(), "yyyy-MM-dd")
      const dueStr = data.dueDate ? format(data.dueDate, "yyyy-MM-dd") : "N/A"
      const checkoutInfo = `[CHECKOUT ${today}] Setup: ${data.workSetup} | Due: ${dueStr}${data.checkoutNotes ? ` | Notes: ${data.checkoutNotes}` : ""}`

      for (const asset of selectedAssets) {
        try {
          await updateAssetMutation.mutateAsync({
            id: asset.id, updates: {
              status: "In Use",
              assignedTo: data.assignedTo,
              location: data.location || asset.location,
              department: data.department || asset.department,
              notes: checkoutInfo
            }
          })
          successCount++
        } catch (error) {
          failedCount++
        }
      }
      if (successCount > 0) {
        toast.success("Assets checked out successfully!")
        router.push("/assets")
      } else {
        toast.error("Failed to check out assets")
      }
    } catch (error) {
      toast.error("Failed to checkout assets")
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
              <BreadcrumbItem><BreadcrumbPage>Check Out</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">Check Out Asset</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Loading assets...</span>
                </div>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span>{availableAssets.length} Available</span>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Asset Selection */}
            <Card className="lg:col-span-3 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Select Assets
                </CardTitle>
                <CardDescription>Search or scan the units to check out</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search asset ID or name..."
                    value={assetIdInput}
                    onChange={(e) => handleAssetIdInput(e.target.value)}
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
                      <ScrollArea className="max-h-60 overflow-y-auto">
                        {filteredAssets.map(a => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => selectAsset(a)}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{a.id}</span>
                              <span className="text-xs text-muted-foreground">{a.name}</span>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1 flex flex-col min-h-0">
                  <div className="text-sm font-medium flex items-center justify-between">
                    Selected Units ({selectedAssets.length})
                    {selectedAssets.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAssets([])} className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive">
                        Clear all
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="flex-1 min-h-[300px]">
                    <div className="space-y-2">
                      {selectedAssets.length > 0 ? selectedAssets.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group">
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{a.id}</span>
                              <span className="text-xs text-muted-foreground">{a.name || 'Agile Unit'}</span>
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
                          <Package className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-sm">No assets selected</p>
                          <p className="text-xs text-center mt-1">Search or scan assets to check out</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Details */}
            <div className="lg:col-span-4 h-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
                  <Card className="flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="text-xl">Assignment Details</CardTitle>
                      <CardDescription>Configure where and who the assets are going to</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <FormField
                        control={form.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem className="relative">
                            <FormLabel>Assign to *</FormLabel>
                            <div className="relative">
                              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search user..."
                                value={assignToInput}
                                className="pl-10"
                                onChange={(e) => handleAssignToSearch(e.target.value)}
                                onFocus={() => assignToInput.length > 0 && setShowAssignToSuggestions(true)}
                              />
                              {showAssignToSuggestions && Object.keys(filteredPersons).length > 0 && (
                                <div className="absolute z-[60] left-0 top-full w-full mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                  <ScrollArea className="max-h-40 overflow-y-auto">
                                    {Object.entries(filteredPersons).map(([name, person]) => (
                                      <div
                                        key={name}
                                        className="p-2 text-sm hover:bg-muted cursor-pointer"
                                        onClick={() => selectPerson(name)}
                                      >
                                        <div className="font-medium">{person.name}</div>
                                        <div className="text-xs text-muted-foreground">{person.department}</div>
                                      </div>
                                    ))}
                                  </ScrollArea>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. IT, Sales" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Floor 2, Room 101" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="workSetup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Setup</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select setup" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Onsite">
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4" />
                                      <span>Onsite</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Temp WFH">
                                    <div className="flex items-center gap-2">
                                      <Monitor className="h-4 w-4" />
                                      <span>Temp WFH</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Perma WFH">
                                    <div className="flex items-center gap-2">
                                      <Home className="h-4 w-4" />
                                      <span>Perma WFH</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="checkoutDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Checkout Date</FormLabel>
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

                      {workSetup === "Temp WFH" && (
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Due Date (Return Date)</FormLabel>
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
                      )}

                      <FormField
                        control={form.control}
                        name="checkoutNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Optional notes about this checkout..." className="min-h-[100px] resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-auto pt-4 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => router.push("/assets")}>Cancel</Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || selectedAssets.length === 0}
                          className="min-w-[120px]"
                        >
                          {isSubmitting ? "Processing..." : `Check Out (${selectedAssets.length})`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
          </div>

          {/* Set Up Table Card - Exactly match top cards */}
          <Card className="mt-8 flex flex-col overflow-hidden border">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight">Assignment History</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mt-1">Filter, search, and track all active assignments</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-muted p-1 rounded-md border border-border">
                    <span className="text-[10px] text-muted-foreground px-2 py-1 font-bold">Rows: 10 row</span>
                  </div>
                  <Button variant="outline" size="sm" className="bg-muted/50 border-border text-xs h-8 gap-2">
                    <Filter className="h-3 w-3" /> Add Fields (7)
                  </Button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, or asset..."
                    className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 h-10 w-full rounded-md ring-offset-transparent focus-visible:ring-1 focus-visible:ring-primary/50"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                  />
                </div>

                {/* Tabs for Work Setup */}
                <div className="flex bg-muted p-1 rounded-md border border-border">
                  {(["All", "Onsite", "Temp WFH", "Perma WFH"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSetupTab(tab)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded transition-all duration-200",
                        activeSetupTab === tab ? "bg-background text-primary shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 flex flex-col">
              <ScrollArea className="h-[550px] w-full border-t border-border">
                <div className="min-w-[1000px]">
                  <Table>
                    <TableHeader className="sticky top-0 z-30 bg-card">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="pl-6 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">Asset ID <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">Asset Name <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">Work Setup <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">Category <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">Assigned To <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">Location <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="pr-6 text-muted-foreground font-bold text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2 justify-end">Value <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSetups.length > 0 ? (
                        filteredSetups.map((s, idx) => (
                          <TableRow key={`${s.id}-${idx}`} className="hover:bg-muted/30 border-b border-border">
                            <TableCell className="pl-6 font-mono text-muted-foreground text-sm py-4">{s.id}</TableCell>
                            <TableCell className="text-foreground font-medium py-4">{s.name}</TableCell>
                            <TableCell className="py-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border-none",
                                  s.workSetup === "Onsite" && "bg-blue-500/10 text-blue-400",
                                  s.workSetup === "Temp WFH" && "bg-amber-500/10 text-amber-400",
                                  s.workSetup === "Perma WFH" && "bg-emerald-500/10 text-emerald-400",
                                  s.workSetup === "N/A" && "bg-slate-500/10 text-slate-400"
                                )}
                              >
                                {s.workSetup}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm py-4">{s.category}</TableCell>
                            <TableCell className="py-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border-none",
                                  s.assetStatus === "Available" && "bg-emerald-500/10 text-emerald-500",
                                  s.assetStatus === "In Use" && "bg-blue-500/10 text-blue-500",
                                  s.assetStatus === "Maintenance" && "bg-amber-500/10 text-amber-500",
                                  s.assetStatus === "Disposed" && "bg-rose-500/10 text-rose-500",
                                  s.assetStatus === "Reserved" && "bg-purple-500/10 text-purple-500",
                                  s.assetStatus === "Move" && "bg-orange-500/10 text-orange-500"
                                )}
                              >
                                {s.assetStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-blue-500 font-medium py-4 hover:underline cursor-pointer">
                              {s.person}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm py-4">{s.location}</TableCell>
                            <TableCell className="pr-6 text-foreground font-mono text-sm py-4 text-right">
                              ${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-40 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                              <Users className="h-10 w-10 opacity-20" />
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">No assignments found</p>
                              <p className="text-xs opacity-70">Try adjusting your search or filters</p>
                            </div>
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
                  Showing <span className="text-foreground font-bold">1-{Math.min(filteredSetups.length, 10)}</span> of <span className="text-foreground font-bold">{filteredSetups.length}</span> assignments
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 text-xs bg-primary text-white border-none rounded">1</Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 text-xs text-muted-foreground hover:text-foreground rounded">2</Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 text-xs text-muted-foreground hover:text-foreground rounded">3</Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <Dialog open={showQrOptionsDialog} onOpenChange={setShowQrOptionsDialog}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Scan Asset QR Code</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select your preferred method to identify an asset for checkout.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={handleCameraScan}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Use Live Camera</span>
              </Button>
              <Button
                variant="outline"
                className="h-28 flex-col gap-3 border-2 border-dashed hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                onClick={handleFileUploadScan}
              >
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Upload QR Image</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
              <div id="qr-reader" className="w-full aspect-square overflow-hidden rounded-xl bg-black border border-white/10 shadow-inner" />
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
      </SidebarInset>
    </SidebarProvider >
  )
}
