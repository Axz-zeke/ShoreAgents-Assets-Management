"use client"

import * as React from "react"
import { Asset } from "@/lib/lists-data"
import { useInstantAssets } from "@/hooks/use-instant-assets"
import { useUpdateAsset } from "@/hooks/use-assets-query"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, ArrowUpDown, UserCheck, UserMinus, User, Mail, Phone, MapPin, Briefcase, MoreHorizontal, Package, Move, DollarSign, CheckCircle, Columns, ChevronLeft, ChevronRight, Edit, FileText, Settings, Save, X, Image as ImageIcon, Camera, Trash2, Download, Eye, EyeOff, ShieldCheck, Settings2, GripVertical, ChevronUp, ChevronDown, ChevronDownSquare, ChevronLeftSquare, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DeleteConfirmDialog } from "@/components/lists/delete-confirm-dialog"
import { toast } from "sonner"
import { parseAssetQrCode } from "@/lib/qr-parser"
import { cn } from "@/lib/utils"

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component for Pulse Bar Management
function SortableCategoryItem({
  id,
  name,
  isHidden,
  onToggleVisibility
}: {
  id: string,
  name: string,
  isHidden: boolean,
  onToggleVisibility: (name: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing",
        isHidden
          ? "bg-muted/10 border-border/30 opacity-40"
          : "bg-muted/30 border-border/50 hover:border-primary/30",
        isDragging && "shadow-2xl border-primary bg-background scale-[1.02]"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="p-1.5 rounded-lg bg-background/50 text-muted-foreground/40">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-[11px] font-black uppercase tracking-wider truncate block",
          isHidden ? "text-muted-foreground" : "text-foreground"
        )}>{name}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-background pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(name);
        }}
      >
        {isHidden ? <EyeOff className="h-4 w-4 text-rose-500" /> : <Eye className="h-4 w-4 text-emerald-500" />}
      </Button>
    </div>
  )
}

// Use useAssets hook for Supabase integration

const statusColors = {
  "Available": "bg-emerald-500/10 text-emerald-500 border-none",
  "In Use": "bg-blue-500/10 text-blue-500 border-none",
  "Move": "bg-orange-500/10 text-orange-500 border-none",
  "Reserved": "bg-purple-500/10 text-purple-500 border-none",
  "Disposed": "bg-rose-500/10 text-rose-500 border-none",
  "Maintenance": "bg-amber-500/10 text-amber-500 border-none",
  "Unknown": "bg-muted text-muted-foreground border-none",
}

// Mock person data
const mockPersons = {
  "John Smith": {
    name: "John Smith",
    email: "john.smith@ShoreAgentsAssets.com",
    phone: "+1 (555) 123-4567",
    department: "IT Department",
    position: "Senior Developer",
    location: "New York Office - Floor 2",
    employeeId: "EMP-001",
  },
  "Sarah Johnson": {
    name: "Sarah Johnson",
    email: "sarah.johnson@ShoreAgentsAssets.com",
    phone: "+1 (555) 234-5678",
    department: "Marketing",
    position: "Marketing Manager",
    location: "Remote - Employee Home",
    employeeId: "EMP-002",
  },
  "Mike Wilson": {
    name: "Mike Wilson",
    email: "mike.wilson@ShoreAgentsAssets.com",
    phone: "+1 (555) 345-6789",
    department: "Operations",
    position: "Operations Lead",
    location: "Chicago Office - Main Floor",
    employeeId: "EMP-003",
  },
  "Emily Davis": {
    name: "Emily Davis",
    email: "emily.davis@ShoreAgentsAssets.com",
    phone: "+1 (555) 456-7890",
    department: "Finance",
    position: "Financial Analyst",
    location: "New York Office - Floor 1",
    employeeId: "EMP-004",
  },
  "Fleet Manager": {
    name: "Fleet Manager",
    email: "fleet@ShoreAgentsAssets.com",
    phone: "+1 (555) 567-8901",
    department: "Operations",
    position: "Fleet Manager",
    location: "New York Office - Parking Garage",
    employeeId: "EMP-005",
  },
}

export default function AssetsPage() {
  const { data: assets = [], isLoading, error } = useInstantAssets()
  const updateAssetMutation = useUpdateAsset()
  const { formatCurrency, formatDate, formatDateTime } = useSystemSettings()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sortField, setSortField] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [selectedPerson, setSelectedPerson] = React.useState<string | null>(null)
  const [isPersonModalOpen, setIsPersonModalOpen] = React.useState(false)
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null)
  const [isAssetDetailsOpen, setIsAssetDetailsOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedAsset, setEditedAsset] = React.useState<Asset | null>(null)
  const [showSaveConfirmation, setShowSaveConfirmation] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingAsset, setDeletingAsset] = React.useState<Asset | null>(null)
  const [visibleFields, setVisibleFields] = React.useState<string[]>([
    "id", "name", "category", "status", "assignedTo", "location", "value"
  ])
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  // QR Scanner states
  const [isQrScannerOpen, setIsQrScannerOpen] = React.useState(false)
  const [scannedAssetId, setScannedAssetId] = React.useState<string | null>(null)
  const [showQrOptionsDialog, setShowQrOptionsDialog] = React.useState(false)
  const [isCameraScanning, setIsCameraScanning] = React.useState(false)
  const [showUnrecognizedQrDialog, setShowUnrecognizedQrDialog] = React.useState(false)
  const [unrecognizedQrData, setUnrecognizedQrData] = React.useState<string>('')

  // QR display for selected asset in the details dialog
  const [assetQrUrl, setAssetQrUrl] = React.useState<string | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = React.useState(false)

  // Pulse Card Management States
  const [pulseOrder, setPulseOrder] = React.useState<string[]>([])
  const [hiddenCategories, setHiddenCategories] = React.useState<Set<string>>(new Set())
  const [isManagePulseOpen, setIsManagePulseOpen] = React.useState(false)
  const [isPulseVisible, setIsPulseVisible] = React.useState(true)

  const DEFAULT_PULSE_ORDER = [
    'IT EQUIPMENT',
    'NETWORK EQUIPMENT',
    'FURNITURE',
    'ELECTRONICS',
    'APPLIANCES',
    'SMOKE ALARMS'
  ]

  // Initialize Pulse settings from localStorage
  React.useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('pulse_order')
      const savedHidden = localStorage.getItem('pulse_hidden')
      const savedVisibility = localStorage.getItem('pulse_is_visible')

      if (savedOrder) setPulseOrder(JSON.parse(savedOrder))
      if (savedHidden) setHiddenCategories(new Set(JSON.parse(savedHidden)))
      if (savedVisibility !== null) setIsPulseVisible(JSON.parse(savedVisibility))
    } catch (e) {
      console.warn('Failed to load pulse settings', e)
    }
  }, [])

  // Save Pulse settings to localStorage
  React.useEffect(() => {
    if (pulseOrder.length > 0) {
      localStorage.setItem('pulse_order', JSON.stringify(pulseOrder))
    }
    localStorage.setItem('pulse_hidden', JSON.stringify(Array.from(hiddenCategories)))
    localStorage.setItem('pulse_is_visible', JSON.stringify(isPulseVisible))
  }, [pulseOrder, hiddenCategories, isPulseVisible])

  // Handle authentication errors gracefully
  React.useEffect(() => {
    if (error) {
      console.error('Assets page error:', error)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('auth')) {
        console.log('Authentication error detected, redirecting to login...')
      }
    }
  }, [error])

  // Fetch / generate QR code when asset details dialog opens
  React.useEffect(() => {
    if (!selectedAsset || !isAssetDetailsOpen) {
      setAssetQrUrl(null)
      return
    }
    const assetTagId = selectedAsset.id

    // If QR URL is already in the asset data, use it immediately
    if (selectedAsset.qrUrl) {
      setAssetQrUrl(selectedAsset.qrUrl)
      setIsGeneratingQr(false)
      return
    }

    setAssetQrUrl(null)
    setIsGeneratingQr(true)
    // Try GET first (returns existing QR); if not stored, POST generates it
    fetch(`/api/assets/${encodeURIComponent(assetTagId)}/qr`)
      .then(res => res.json())
      .then(json => {
        if (json.qrUrl) {
          setAssetQrUrl(json.qrUrl)
          setIsGeneratingQr(false)
        } else {
          // No QR stored yet — generate one now
          return fetch(`/api/assets/${encodeURIComponent(assetTagId)}/qr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          }).then(r => r.json()).then(j => {
            setAssetQrUrl(j.qrUrl || null)
            setIsGeneratingQr(false)
          })
        }
      })
      .catch(err => {
        console.warn('Failed to load QR for asset:', err)
        setIsGeneratingQr(false)
      })
  }, [selectedAsset, isAssetDetailsOpen])

  // Available field options
  const fieldOptions = [
    { key: "id", label: "Asset ID" },
    { key: "name", label: "Asset Name" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "location", label: "Location" },
    { key: "value", label: "Value" },
    { key: "purchaseDate", label: "Purchase Date" },
    { key: "serialNumber", label: "Serial Number" },
    { key: "model", label: "Model" },
    { key: "brand", label: "Brand" },
    { key: "department", label: "Department" },
    { key: "site", label: "Site" },
    { key: "subCategory", label: "Sub Category" },
    { key: "purchasedFrom", label: "Purchased From" },
    { key: "manufacturer", label: "Manufacturer" }
  ]

  // Toggle field visibility
  const toggleField = (fieldKey: string) => {
    setVisibleFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    )
  }


  // Assets are now loaded via useAssets hook

  // Get unique categories for filters, filtering out empty values
  const categories = Array.from(new Set(assets.map(asset => asset.category).filter(category => category && category.trim() !== '')))

  // Define all possible statuses
  const allStatuses = ['Available', 'In Use', 'Move', 'Reserved', 'Disposed', 'Maintenance']

  // Get unique statuses from assets, but include all possible statuses in the filter
  const statuses = Array.from(new Set(assets.map(asset => asset.status).filter(status => status && status.trim() !== '')))

  // Filter and sort assets
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { total: number, available: number }> = {}
    assets.forEach(asset => {
      if (!asset.category) return
      const cat = asset.category.toUpperCase().trim()
      if (cat === '') return

      if (!stats[cat]) {
        stats[cat] = { total: 0, available: 0 }
      }
      stats[cat].total++
      if (asset.status === 'Available') {
        stats[cat].available++
      }
    })

    // Sort by default order first, then by total count for anything not in default
    return Object.entries(stats).sort((a, b) => {
      const indexA = DEFAULT_PULSE_ORDER.indexOf(a[0])
      const indexB = DEFAULT_PULSE_ORDER.indexOf(b[0])

      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1

      return b[1].total - a[1].total
    })
  }, [assets])

  // Derived list of stats based on user ordering and visibility
  const displayedCategoryStats = React.useMemo(() => {
    const statsMap = Object.fromEntries(categoryStats)
    const allCategoriesFromData = categoryStats.map(([name]) => name)

    // Use pulseOrder if available, otherwise use categoryStats (which is already sorted by defaults)
    const baseOrder = pulseOrder.length > 0
      ? pulseOrder.filter(cat => allCategoriesFromData.includes(cat))
      : allCategoriesFromData

    // Add any categories from data that weren't in the saved order
    const mergedOrder = [...baseOrder]
    allCategoriesFromData.forEach(cat => {
      if (!mergedOrder.includes(cat)) {
        mergedOrder.push(cat)
      }
    })

    // Filter out hidden categories
    return mergedOrder
      .filter(name => statsMap[name] && !hiddenCategories.has(name))
      .map(name => [name, statsMap[name]] as [string, { total: number, available: number }])
  }, [categoryStats, pulseOrder, hiddenCategories])

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const allConfigCategories = categoryStats.map(([name]) => name)
    let currentOrder = pulseOrder.length > 0 ? [...pulseOrder] : allConfigCategories

    // Ensure currentOrder has everything
    allConfigCategories.forEach(cat => {
      if (!currentOrder.includes(cat)) currentOrder.push(cat)
    })
    // And remove things not in data
    currentOrder = currentOrder.filter(cat => allConfigCategories.includes(cat))

    const oldIndex = currentOrder.indexOf(active.id as string)
    const newIndex = currentOrder.indexOf(over.id as string)

    if (oldIndex !== -1 && newIndex !== -1) {
      setPulseOrder(arrayMove(currentOrder, oldIndex, newIndex))
    }
  }


  const toggleCategoryVisibility = (name: string) => {
    setHiddenCategories(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const resetPulseSettings = () => {
    setPulseOrder([])
    setHiddenCategories(new Set())
    toast.success("Pulse layout reset to default")
  }

  const filteredAssets = React.useMemo(() => {
    const filtered = assets.filter(asset => {
      const matchesSearch =
        (asset.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))

      const assetCategory = (asset.category || '').toUpperCase().trim()
      const matchesCategory = categoryFilter === "all" || assetCategory === categoryFilter.toUpperCase().trim()

      const matchesStatus = statusFilter === "all" || (asset.status && asset.status.trim() !== '' && asset.status === statusFilter)

      return matchesSearch && matchesCategory && matchesStatus
    })

    // Sort if a field is selected
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a]
        let bValue = b[sortField as keyof typeof b]

        // Handle null values
        if (aValue === null) aValue = ""
        if (bValue === null) bValue = ""

        // Convert to string for comparison
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    }

    return filtered
  }, [assets, searchTerm, categoryFilter, statusFilter, sortField, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex)

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, rowsPerPage])

  // Handle page navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handlePersonClick = (personName: string) => {
    setSelectedPerson(personName)
    setIsPersonModalOpen(true)
  }

  const handleAssetClick = (asset: Asset) => {
    console.log('Selected Asset Data:', JSON.stringify(asset, null, 2))
    setSelectedAsset(asset)
    setIsAssetDetailsOpen(true)
    setIsEditing(false)
  }

  const handleEditClick = () => {
    if (selectedAsset) {
      setEditedAsset({ ...selectedAsset })
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    setShowSaveConfirmation(true)
  }

  const confirmSaveEdit = async () => {
    if (editedAsset) {
      try {
        // Update the asset in Supabase
        await updateAssetMutation.mutateAsync({ id: editedAsset.id, updates: editedAsset })

        // Update the selected asset
        setSelectedAsset(editedAsset)
        setIsEditing(false)
        setShowSaveConfirmation(false)
      } catch (error) {
        console.error('Failed to update asset:', error)
        // You could add a toast notification here
      }
    }
  }

  const cancelSaveEdit = () => {
    setShowSaveConfirmation(false)
  }

  const handleCancelEdit = () => {
    setEditedAsset(null)
    setIsEditing(false)
  }

  const handleFieldChange = (field: keyof Asset, value: string | number) => {
    if (editedAsset) {
      setEditedAsset(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  const handleDeleteAsset = (asset: Asset, event: React.MouseEvent) => {
    event.stopPropagation()
    setDeletingAsset(asset)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return

    try {
      // Call your delete API here
      const response = await fetch(`/api/assets/${deletingAsset.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete asset')

      toast.success(`Asset "${deletingAsset.id || deletingAsset.name}" deleted successfully!`)

      // Reload assets
      window.location.reload()
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error('Failed to delete asset. Please try again.')
    } finally {
      setIsDeleteOpen(false)
      setDeletingAsset(null)
    }
  }

  // QR Scanner functionality
  const handleQrScan = (result: string) => {
    // Parse the QR payload – handles JSON (our format), URL, or plain asset tag
    const assetTagId = parseAssetQrCode(result)

    if (!assetTagId) {
      setUnrecognizedQrData(result)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
      return
    }

    // Look up by asset tag ID (the 'id' field on Asset objects = asset_tag_id)
    const foundAsset = assets.find(
      asset => asset.id === assetTagId || asset.id.toLowerCase() === assetTagId.toLowerCase()
    )

    if (foundAsset) {
      setScannedAssetId(foundAsset.id)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    } else {
      setUnrecognizedQrData(result)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
      setShowQrOptionsDialog(false)
    }
  }

  const handleQrScannerError = (error: any) => {
    console.error('QR Scanner error:', error)

    // Check if it's a decoding error (no QR code found)
    if (error instanceof Error && error.message.includes('No MultiFormat Readers were able to detect the code')) {
      // Show unrecognized QR dialog for decode failures
      setUnrecognizedQrData('Unable to decode QR code from camera')
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
    } else {
      // Show unrecognized QR dialog for other errors
      setUnrecognizedQrData(`Camera Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowUnrecognizedQrDialog(true)
      setIsQrScannerOpen(false)
    }
  }

  // Handle QR image file upload
  const handleQrFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('=== QR SCAN DEBUG ===')
    console.log('File uploaded:', file.name)
    console.log('File type:', file.type)
    console.log('File size:', file.size)
    console.log('====================')

    // Show loading toast
    toast.loading('Scanning QR code...', { id: 'qr-scan' })

    try {
      // Dynamically import html5-qrcode to avoid SSR issues
      const Html5Qrcode = await import('html5-qrcode')

      // Create a temporary container for file scanning
      const tempContainer = document.createElement('div')
      tempContainer.id = 'temp-qr-reader'
      tempContainer.style.display = 'none'
      document.body.appendChild(tempContainer)

      try {
        const html5QrCode = new Html5Qrcode.Html5Qrcode("temp-qr-reader")

        // Try scanning with showImage=true for better debugging
        console.log('Attempting to scan QR code from file...')
        const result = await html5QrCode.scanFile(file, true)

        console.log('QR scan successful! Result:', result)
        toast.dismiss('qr-scan')
        toast.success('QR code scanned successfully!')

        handleQrScan(result)
      } finally {
        // Clean up the temporary container
        document.body.removeChild(tempContainer)
      }
    } catch (error) {
      console.error('Failed to scan QR from file:', error)
      toast.dismiss('qr-scan')

      // Check if it's a decoding error (no QR code found)
      if (error instanceof Error && error.message.includes('No MultiFormat Readers were able to detect the code')) {
        // Show more helpful error message
        toast.error('Cannot read QR code', {
          description: 'The image quality might be too low or the QR code is damaged. Please try downloading and uploading a higher quality image.',
          duration: 5000
        })

        setUnrecognizedQrData('Unable to decode QR code. The image might be compressed or low quality. Try using a higher resolution image (at least 500x500px).')
        setShowUnrecognizedQrDialog(true)
      } else {
        // Show unrecognized QR dialog for other errors
        toast.error('QR scan failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
          duration: 5000
        })

        setUnrecognizedQrData(`Error scanning QR code: ${error instanceof Error ? error.message : 'Unknown error'}. Please try uploading a clearer image.`)
        setShowUnrecognizedQrDialog(true)
      }
    }
  }

  // Handle camera scanning option
  const handleCameraScan = () => {
    setShowQrOptionsDialog(false)
    setIsCameraScanning(true)
    setIsQrScannerOpen(true)
  }

  // Handle file upload option
  const handleFileUploadScan = () => {
    setShowQrOptionsDialog(false)
    setIsCameraScanning(false)
    // Trigger file input
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

  // Handle scanned asset ID
  React.useEffect(() => {
    if (scannedAssetId) {
      // Find the asset by ID
      const foundAsset = assets.find(asset => asset.id === scannedAssetId)
      if (foundAsset) {
        setSelectedAsset(foundAsset)
        setIsAssetDetailsOpen(true)
        setIsEditing(false)
        setScannedAssetId(null) // Reset after showing
      } else {
        // Asset not found - you could show a toast notification here
        console.log('Asset not found:', scannedAssetId)
        setScannedAssetId(null) // Reset
      }
    }
  }, [scannedAssetId, assets])

  // QR Scanner setup
  React.useEffect(() => {
    if (isQrScannerOpen && isCameraScanning) {
      // Dynamically import html5-qrcode to avoid SSR issues
      import('html5-qrcode').then((Html5QrcodeScanner) => {
        const html5QrCode = new Html5QrcodeScanner.Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        )

        html5QrCode.render(
          (decodedText: string) => {
            handleQrScan(decodedText)
            html5QrCode.clear()
          },
          (errorMessage: string) => {
            // Handle scan error
            console.log('QR scan error:', errorMessage)
          }
        )
      }).catch((error) => {
        console.error('Failed to load QR scanner:', error)
      })
    }
  }, [isQrScannerOpen, isCameraScanning])




  // Get assets assigned to the selected person
  const getPersonAssets = (personName: string) => {
    return assets.filter(asset => asset.assignedTo === personName)
  }

  const selectedPersonData = selectedPerson ? mockPersons[selectedPerson as keyof typeof mockPersons] : null
  const personAssets = selectedPerson ? getPersonAssets(selectedPerson) : []

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
              <BreadcrumbItem><BreadcrumbPage>Assets</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assets from database...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 mb-4 text-4xl">⚠️</div>
                <p className="text-red-600 font-medium">Failed to load assets</p>
                <p className="text-muted-foreground text-sm mt-2">{error instanceof Error ? error.message : "An error occurred"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 p-8 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Asset Inventory</h2>
                  <p className="text-muted-foreground font-medium">
                    Manage and track your corporate assets and their lifecycle.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => setShowQrOptionsDialog(true)}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/assets/add" className="flex items-center w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Add Asset</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/assets/checkout" className="flex items-center w-full">
                          <UserCheck className="mr-2 h-4 w-4" />
                          <span>Check Out</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/assets/checkin" className="flex items-center w-full">
                          <UserMinus className="mr-2 h-4 w-4" />
                          <span>Check In</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/assets/move" className="flex items-center w-full">
                          <Move className="mr-2 h-4 w-4" />
                          <span>Move Asset</span>
                        </Link>
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem asChild>
                        <Link href="/assets/maintenance" className="flex items-center w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Maintenance</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Inventory Pulse Bar */}
              <div className="pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPulseVisible(!isPulseVisible)}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      {isPulseVisible ? (
                        <ChevronDown className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                      ) : (
                        <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
                      )}
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80 group-hover:text-foreground transition-colors">Live Inventory Pulse</h3>
                      <div className={cn("h-2 w-2 rounded-full bg-emerald-500 animate-pulse", !isPulseVisible && "hidden")} />
                    </button>
                  </div>

                  {/* Manage Pulse Button/Dialog */}
                  <Dialog open={isManagePulseOpen} onOpenChange={setIsManagePulseOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Manage Pulse Bar</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                          Drag categories to reorder or use the visibility toggle to customize your layout.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={(() => {
                                const allConfigCategories = categoryStats.map(([name]) => name)
                                let listOrder = pulseOrder.length > 0 ? [...pulseOrder] : allConfigCategories
                                allConfigCategories.forEach(cat => {
                                  if (!listOrder.includes(cat)) listOrder.push(cat)
                                })
                                return listOrder.filter(cat => allConfigCategories.includes(cat))
                              })()}
                              strategy={verticalListSortingStrategy}
                            >
                              {(() => {
                                const allConfigCategories = categoryStats.map(([name]) => name)
                                let listOrder = pulseOrder.length > 0 ? [...pulseOrder] : allConfigCategories
                                allConfigCategories.forEach(cat => {
                                  if (!listOrder.includes(cat)) listOrder.push(cat)
                                })
                                listOrder = listOrder.filter(cat => allConfigCategories.includes(cat))

                                return listOrder.map((cat) => (
                                  <SortableCategoryItem
                                    key={cat}
                                    id={cat}
                                    name={cat}
                                    isHidden={hiddenCategories.has(cat)}
                                    onToggleVisibility={toggleCategoryVisibility}
                                  />
                                ))
                              })()}
                            </SortableContext>
                          </DndContext>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <Button variant="ghost" size="sm" onClick={resetPulseSettings} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500">
                            Reset to Default
                          </Button>
                          <Button size="sm" onClick={() => setIsManagePulseOpen(false)} className="text-[10px] font-black uppercase tracking-widest px-6 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            Done
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {isPulseVisible && (
                  <ScrollArea className="w-full whitespace-nowrap rounded-lg border-t border-border/5 pt-2">
                    <div className="flex w-max space-x-4 p-4 pb-8">
                      {displayedCategoryStats.map(([cat, stat]) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                          className={cn(
                            "group relative flex flex-col p-4 min-w-[200px] rounded-xl border transition-all duration-300",
                            categoryFilter === cat
                              ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)] scale-[1.02]"
                              : "bg-card hover:bg-muted/50 border-border hover:border-muted-foreground/30"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{cat}</span>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              stat.available > 0 ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black tabular-nums text-foreground">{stat.total}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Inventory</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex flex-col flex-1">
                              <span className="text-[10px] font-black uppercase text-emerald-500/80">{stat.available} Available</span>
                              <div className="h-1 w-full bg-muted rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-500"
                                  style={{ width: `${(stat.available / stat.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{assets.length}</div>
                    <p className="text-xs text-muted-foreground">Total registry items</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{assets.filter(a => a.status === "Available").length}</div>
                    <p className="text-xs text-muted-foreground">Ready for use</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Use</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {assets.filter(a => a.status === "In Use").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {assets.length > 0 ? Math.round((assets.filter(a => a.status === "In Use").length / assets.length) * 100) : 0}% utilization
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(assets.filter(asset => asset.status !== 'Disposed').reduce((sum, asset) => sum + asset.value, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">Active portfolio value</p>
                  </CardContent>
                </Card>
              </div>

              {/* Asset List - New UI Style */}
              <Card className="mt-8 overflow-hidden border">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Asset List</CardTitle>
                      <CardDescription>
                        Filter, search, and sort through all your assets
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
                        <SelectTrigger className="w-full sm:w-[140px] h-10 text-sm">
                          <span className="text-muted-foreground">Rows:</span>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 rows</SelectItem>
                          <SelectItem value="20">20 rows</SelectItem>
                          <SelectItem value="30">30 rows</SelectItem>
                          <SelectItem value="50">50 rows</SelectItem>
                          <SelectItem value="100">100 rows</SelectItem>
                        </SelectContent>
                      </Select>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto h-10 text-sm">
                            <Columns className="mr-2 h-4 w-4" />
                            Add Fields ({visibleFields.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          <div className="p-2">
                            <p className="text-sm font-medium mb-2">Select fields to display:</p>
                            <div className="space-y-1">
                              {fieldOptions.map((field) => (
                                <label key={field.key} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={visibleFields.includes(field.key)}
                                    onChange={() => toggleField(field.key)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm">{field.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6 pb-0 space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="Search assets by name, ID, location, or assigned to..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
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
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {allStatuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Mobile Card View (Visible on small screens) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {paginatedAssets.map((asset, index) => (
                        <Card
                          key={`mobile-${asset.id}-${index}`}
                          className="overflow-hidden border-muted-foreground/20"
                          onClick={() => handleAssetClick(asset)}
                        >
                          <CardHeader className="p-4 pb-2 bg-muted/30">
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className="text-xs font-mono text-muted-foreground">{asset.id}</span>
                                <CardTitle className="text-base font-bold line-clamp-1">{asset.name}</CardTitle>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0 border-none",
                                  statusColors[asset.status as keyof typeof statusColors] || "bg-muted text-muted-foreground"
                                )}
                              >
                                {asset.status || 'Unknown'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-3 text-sm space-y-2">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Category</p>
                                <p className="truncate">{asset.category || 'Uncategorized'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</p>
                                <p className="truncate">{asset.location || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Assigned To</p>
                                <p className="truncate">{asset.assignedTo || 'Unassigned'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Value</p>
                                <p className="font-medium">{formatCurrency(asset.value)}</p>
                              </div>
                            </div>
                          </CardContent>
                          <div className="flex border-t divide-x">
                            <Button
                              variant="ghost"
                              className="flex-1 rounded-none h-10 text-xs gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAssetClick(asset)
                              }}
                            >
                              <Eye className="h-3 w-3" />
                              Details
                            </Button>
                            <Button
                              variant="ghost"
                              className="flex-1 rounded-none h-10 text-xs gap-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAssetClick(asset)
                                setIsEditing(true)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Assets Table (Hidden on small screens) */}
                    <div className="hidden md:block overflow-x-auto border-t border-border mt-6">
                      <Table>
                        <TableHeader className="sticky top-0 z-30 bg-card">
                          <TableRow className="hover:bg-transparent border-b border-border">
                            <TableHead className="pl-6 w-[80px] text-muted-foreground font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                            {visibleFields.map((fieldKey) => {
                              const field = fieldOptions.find(f => f.key === fieldKey)
                              if (!field) return null

                              return (
                                <TableHead
                                  key={fieldKey}
                                  className={cn(
                                    "cursor-pointer text-muted-foreground font-bold text-xs uppercase tracking-wider",
                                    fieldKey === 'value' ? 'text-right pr-6' : ''
                                  )}
                                  onClick={() => handleSort(fieldKey)}
                                >
                                  <div className={cn(
                                    "flex items-center gap-2",
                                    fieldKey === 'value' ? 'justify-end' : ''
                                  )}>
                                    {field.label}
                                    <ArrowUpDown className="h-3 w-3" />
                                  </div>
                                </TableHead>
                              )
                            })}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAssets.map((asset, index) => (
                            <TableRow
                              key={`${asset.id}-${index}`}
                              className="hover:bg-muted/30 cursor-pointer border-b border-border"
                              onClick={() => handleAssetClick(asset)}
                            >
                              <TableCell className="pl-6 py-4" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleAssetClick(asset)
                                        setIsEditing(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Asset
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteAsset(asset, e)
                                      }}
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Asset
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                              {visibleFields.map((fieldKey) => {
                                const field = fieldOptions.find(f => f.key === fieldKey)
                                if (!field) return null

                                const getCellContent = () => {
                                  switch (fieldKey) {
                                    case 'id':
                                      return <span className="font-mono text-muted-foreground text-sm">{asset.id}</span>
                                    case 'assignedTo':
                                      return asset.assignedTo && mockPersons[asset.assignedTo as keyof typeof mockPersons] ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handlePersonClick(asset.assignedTo!)
                                          }}
                                          className="text-blue-500 font-medium hover:underline"
                                        >
                                          {asset.assignedTo}
                                        </button>
                                      ) : (
                                        <span className="text-blue-500 font-medium hover:underline">
                                          {asset.assignedTo || "Unassigned"}
                                        </span>
                                      )
                                    case 'status':
                                      return (
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border-none",
                                            statusColors[asset.status as keyof typeof statusColors]
                                          )}
                                        >
                                          {asset.status || 'Unknown'}
                                        </Badge>
                                      )
                                    case 'value':
                                      return <span className="text-foreground font-mono text-sm">{formatCurrency(asset.value)}</span>
                                    case 'name':
                                      return <span className="text-foreground font-medium">{asset.name}</span>
                                    default:
                                      return <span className="text-muted-foreground text-sm">{String(asset[fieldKey as keyof Asset] || 'N/A')}</span>
                                  }
                                }

                                return (
                                  <TableCell
                                    key={fieldKey}
                                    className={cn(
                                      "py-4",
                                      fieldKey === 'value' ? 'text-right pr-6' : ''
                                    )}
                                  >
                                    {getCellContent()}
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredAssets.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No assets found matching your criteria.
                      </div>
                    )}

                    {/* Footer / Pagination style */}
                    <div className="flex items-center justify-between px-6 py-4 bg-card border-t border-border mt-auto">
                      <p className="text-xs text-muted-foreground">
                        Showing <span className="text-foreground font-bold">{startIndex + 1}-{Math.min(endIndex, filteredAssets.length)}</span> of <span className="text-foreground font-bold">{filteredAssets.length}</span> assets
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5 rounded"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 text-xs bg-primary text-white border-none rounded">{currentPage}</Button>
                        {currentPage < totalPages && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-xs text-muted-foreground hover:text-foreground rounded"
                            onClick={() => goToPage(currentPage + 1)}
                          >
                            {currentPage + 1}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5 rounded"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarInset>

      {/* Person Details Sheet */}
      < Sheet open={isPersonModalOpen} onOpenChange={setIsPersonModalOpen} >
        <SheetContent className="w-full sm:w-[500px] md:w-[700px] lg:w-[800px] xl:w-[900px] p-0 sm:p-6">
          <div className="flex flex-col h-full">
            <SheetHeader className="flex-shrink-0 p-3 sm:p-4 md:p-6 pb-3 sm:pb-4">
              <SheetTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl lg:text-2xl font-bold truncate">
                <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0" />
                <span className="truncate">{selectedPersonData?.name}</span>
              </SheetTitle>
              <SheetDescription className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
                Employee information and assigned assets
              </SheetDescription>
            </SheetHeader>

            {selectedPersonData && (
              <ScrollArea className="flex-1 p-3 sm:p-4 md:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Person Information */}
                  <Card className="transition-all duration-300 ease-in-out">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 pt-0">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base sm:text-lg break-words">{selectedPersonData?.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Employee ID: {selectedPersonData?.employeeId}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 font-medium text-xs sm:text-sm lg:text-base break-all">{selectedPersonData?.email}</div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Department</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.department}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">Location</p>
                          <p className="text-xs sm:text-sm text-muted-foreground break-words">{selectedPersonData.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assigned Assets */}
                  <Card className="flex flex-col hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                    <CardHeader className="flex-shrink-0 pb-4 sm:pb-6">
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold">
                        Assigned Assets ({personAssets.length})
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base md:text-lg text-muted-foreground">
                        Assets currently assigned to this person
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                      {personAssets.length > 0 ? (
                        <>
                          {/* Scrollable Assets List */}
                          <ScrollArea className="flex-1 pr-1 sm:pr-2 max-h-[300px] sm:max-h-[400px]">
                            <div className="space-y-2 sm:space-y-3">
                              {personAssets.map((asset, index) => (
                                <div key={`${asset.id}-${index}`} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-in-out">
                                  <div className="space-y-2 sm:space-y-3">
                                    {/* Asset Header */}
                                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                                          <h4 className="font-semibold text-sm sm:text-base break-words">{asset.name}</h4>
                                          <Badge
                                            variant="outline"
                                            className={`${statusColors[asset.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"} text-xs px-1.5 py-0.5 sm:px-2 sm:py-1`}
                                          >
                                            {asset.status || 'Unknown'}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0 text-right">
                                        <p className="font-bold text-sm sm:text-base md:text-lg">{formatCurrency(asset.value)}</p>
                                      </div>
                                    </div>

                                    {/* Asset Details */}
                                    <div className="space-y-1 sm:space-y-2">
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px]">Asset ID:</span>
                                        <span className="text-xs sm:text-sm break-all">{asset.id}</span>
                                      </div>
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px]">Category:</span>
                                        <span className="text-xs sm:text-sm break-words">{asset.category || 'Uncategorized'}</span>
                                      </div>
                                      <div className="flex items-start gap-1 sm:gap-2">
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground min-w-[50px] sm:min-w-[60px] mt-0.5">Location:</span>
                                        <span className="text-xs sm:text-sm flex-1 break-words">{asset.location}</span>
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                    {asset.status === "In Use" && (
                                      <div className="flex justify-end pt-1 sm:pt-2">
                                        <Link href={`/assets/checkin/${asset.id}`}>
                                          <Button size="sm" variant="outline" onClick={() => setIsPersonModalOpen(false)} className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                                            <UserMinus className="h-3 w-3 mr-1" />
                                            Check In
                                          </Button>
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>

                          {/* Fixed Total Section */}
                          <div className="flex-shrink-0 pt-2 sm:pt-3 mt-2 sm:mt-3 border-t bg-background">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-sm sm:text-base">Total Value:</span>
                              <span className="font-bold text-sm sm:text-base md:text-lg text-primary">
                                {formatCurrency(personAssets.reduce((sum, asset) => sum + asset.value, 0))}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-6 sm:py-8">
                          <User className="h-8 w-8 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                          <p className="text-xs sm:text-sm text-center px-4">No assets currently assigned to this person.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet >

      {/* Asset Details Dialog */}
      < Dialog open={isAssetDetailsOpen} onOpenChange={setIsAssetDetailsOpen} >
        <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    {isEditing ? "Edit Asset Details" : "Asset Details"}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium">
                    {selectedAsset?.id} • {selectedAsset?.name}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSaveEdit} size="sm" className="h-9">
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" size="sm" className="h-9">
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEditClick} size="sm" className="h-9">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedAsset && (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4 pb-4">
                  {/* Asset Image */}
                  <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        Asset Image
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-center">
                        {selectedAsset?.imageUrl ? (
                          <img
                            src={selectedAsset.imageUrl}
                            alt={selectedAsset.name}
                            className="max-w-full max-h-64 object-contain rounded-lg border shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                    <div class="flex flex-col items-center justify-center p-8 text-muted-foreground">
                                      <ImageIcon class="h-12 w-12 mb-2 opacity-50" />
                                      <p class="text-sm">Image not available</p>
                                    </div>
                                  `;
                              }
                            }}
                          />
                        ) : selectedAsset.imageFileName ? (
                          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                            <p className="text-sm font-medium">{selectedAsset.imageFileName}</p>
                            <p className="text-xs text-muted-foreground mt-1">Image file uploaded</p>
                            <p className="text-xs text-muted-foreground mt-2">Click Edit to add image URL</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                            <p className="text-sm">No image data found</p>
                            <p className="text-xs text-muted-foreground mt-1">Add image during asset creation or edit</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information */}
                  <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Asset Tag ID</p>
                          <p className="text-sm font-mono font-semibold">{selectedAsset.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Asset Name</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.name || ''}
                              onChange={(e) => handleFieldChange('name', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm font-medium">{selectedAsset.name || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Category</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.category || ''}
                              onChange={(e) => handleFieldChange('category', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.category || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Sub Category</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.subCategory || ''}
                              onChange={(e) => handleFieldChange('subCategory', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.subCategory || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Status</p>
                          {isEditing ? (
                            <Select value={editedAsset?.status || ''} onValueChange={(value) => handleFieldChange('status', value)}>
                              <SelectTrigger className="text-sm h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Check Out">Check Out</SelectItem>
                                <SelectItem value="Move">Move</SelectItem>
                                <SelectItem value="Reserved">Reserved</SelectItem>
                                <SelectItem value="Disposed">Disposed</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant="outline"
                              className={`${statusColors[selectedAsset.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"} text-xs px-2 py-0.5`}
                            >
                              {selectedAsset.status || 'Unknown'}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Asset Type</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.assetType || ''}
                              onChange={(e) => handleFieldChange('assetType', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.assetType || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location & Assignment */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-green-100 rounded">
                          <MapPin className="h-3 w-3 text-green-600" />
                        </div>
                        Location & Assignment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Location</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.location || ''}
                              onChange={(e) => handleFieldChange('location', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.location || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Site</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.site || ''}
                              onChange={(e) => handleFieldChange('site', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.site || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Department</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.department || ''}
                              onChange={(e) => handleFieldChange('department', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.department || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Assigned To</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.assignedTo || ''}
                              onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter assigned person"
                            />
                          ) : selectedAsset.assignedTo ? (
                            <button
                              onClick={() => {
                                setIsAssetDetailsOpen(false)
                                handlePersonClick(selectedAsset.assignedTo!)
                              }}
                              className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm transition-colors text-left"
                            >
                              {selectedAsset.assignedTo}
                            </button>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Unassigned</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical Specifications */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-purple-100 rounded">
                          <Settings className="h-3 w-3 text-purple-600" />
                        </div>
                        Technical Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Brand</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.brand || ''}
                              onChange={(e) => handleFieldChange('brand', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter brand"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.brand || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Model</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.model || ''}
                              onChange={(e) => handleFieldChange('model', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter model"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.model || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Manufacturer</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.manufacturer || ''}
                              onChange={(e) => handleFieldChange('manufacturer', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter manufacturer"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.manufacturer || 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Serial Number</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.serialNumber || ''}
                              onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                              className="text-sm h-8 font-mono"
                              placeholder="Enter serial number"
                            />
                          ) : (
                            <p className="text-sm font-mono">{selectedAsset.serialNumber || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-yellow-100 rounded">
                          <DollarSign className="h-3 w-3 text-yellow-600" />
                        </div>
                        Financial Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Cost / Value</p>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedAsset?.value || 0}
                              onChange={(e) => handleFieldChange('value', parseFloat(e.target.value) || 0)}
                              className="text-sm h-8"
                              placeholder="0.00"
                            />
                          ) : (
                            <p className="text-sm font-bold text-green-600">{formatCurrency(selectedAsset.value)}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Purchase Date</p>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editedAsset?.purchaseDate || ''}
                              onChange={(e) => handleFieldChange('purchaseDate', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.purchaseDate ? formatDate(selectedAsset.purchaseDate) : 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Date Acquired</p>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={editedAsset?.dateAcquired || ''}
                              onChange={(e) => handleFieldChange('dateAcquired', e.target.value)}
                              className="text-sm h-8"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.dateAcquired ? formatDate(selectedAsset.dateAcquired) : 'N/A'}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Purchased From</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.purchasedFrom || ''}
                              onChange={(e) => handleFieldChange('purchasedFrom', e.target.value)}
                              className="text-sm h-8"
                              placeholder="Enter supplier/vendor"
                            />
                          ) : (
                            <p className="text-sm">{selectedAsset.purchasedFrom || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Information */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-muted rounded">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                        </div>
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Created At</p>
                          <p className="text-sm text-muted-foreground">{selectedAsset.createdAt ? formatDateTime(selectedAsset.createdAt) : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                          <p className="text-sm text-muted-foreground">{selectedAsset.updatedAt ? formatDateTime(selectedAsset.updatedAt) : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Image URL</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.imageUrl || ''}
                              onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                              className="text-sm h-8"
                              placeholder="https://..."
                            />
                          ) : selectedAsset.imageUrl ? (
                            <a
                              href={selectedAsset.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block"
                            >
                              View Image
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">N/A</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Image File Name</p>
                          {isEditing ? (
                            <Input
                              value={editedAsset?.imageFileName || ''}
                              onChange={(e) => handleFieldChange('imageFileName', e.target.value)}
                              className="text-sm h-8"
                              placeholder="filename.jpg"
                            />
                          ) : (
                            <p className="text-sm font-mono text-xs">{selectedAsset.imageFileName || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description & Notes */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-orange-100 rounded">
                          <FileText className="h-3 w-3 text-orange-600" />
                        </div>
                        Description & Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Description</p>
                        {isEditing ? (
                          <textarea
                            value={editedAsset?.description || ''}
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            className="w-full min-h-[80px] p-3 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Enter asset description..."
                          />
                        ) : (
                          <div className="bg-muted/30 p-3 rounded-md border">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {selectedAsset.description || 'No description provided'}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Additional Notes</p>
                        {isEditing ? (
                          <textarea
                            value={editedAsset?.notes || ''}
                            onChange={(e) => handleFieldChange('notes', e.target.value)}
                            className="w-full min-h-[80px] p-3 text-sm border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Enter additional notes..."
                          />
                        ) : (
                          <div className="bg-muted/30 p-3 rounded-md border">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {selectedAsset.notes || 'No additional notes'}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* QR Code Card */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <div className="p-1 bg-purple-100 rounded">
                          <svg className="h-3 w-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </div>
                        Asset QR Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {isGeneratingQr ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                          <p className="text-xs">Generating QR code…</p>
                        </div>
                      ) : assetQrUrl ? (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={assetQrUrl}
                            alt={`QR Code for ${selectedAsset.id}`}
                            className="w-36 h-36 object-contain border rounded-lg shadow-sm"
                          />
                          <p className="text-xs text-muted-foreground text-center">
                            Scan to access&nbsp;
                            <span className="font-mono font-semibold">{selectedAsset.id}</span>
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={async () => {
                              try {
                                const response = await fetch(assetQrUrl)
                                const blob = await response.blob()
                                const url = window.URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = `${selectedAsset.id}-qr.png`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                                window.URL.revokeObjectURL(url)
                              } catch {
                                window.open(assetQrUrl, '_blank')
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download QR Code
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
                          <p className="text-xs">No QR code available</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsGeneratingQr(true)
                              fetch(`/api/assets/${encodeURIComponent(selectedAsset.id)}/qr`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({}),
                              })
                                .then(r => r.json())
                                .then(j => { setAssetQrUrl(j.qrUrl || null); setIsGeneratingQr(false) })
                                .catch(() => setIsGeneratingQr(false))
                            }}
                          >
                            Generate QR Code
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog >

      {/* Save Confirmation Dialog */}
      < Dialog open={showSaveConfirmation} onOpenChange={setShowSaveConfirmation} >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Confirm Save Changes
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to save the changes to this asset? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={cancelSaveEdit}>
              Cancel
            </Button>
            <Button onClick={confirmSaveEdit}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog >

      {/* Scan Method Selection Dialog */}
      <Dialog open={showQrOptionsDialog} onOpenChange={setShowQrOptionsDialog}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Scan Asset QR Code</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select your preferred method to identify an asset.
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

      {/* Unrecognized QR Code Dialog */}
      <Dialog open={showUnrecognizedQrDialog} onOpenChange={setShowUnrecognizedQrDialog}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              Scan Error
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm text-foreground/80 font-medium">
              {unrecognizedQrData.includes('Unable to decode')
                ? "The image quality is too low or it doesn't contain a clear QR code."
                : "This QR code doesn't match any registered assets in our database."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Technical Details:</div>
              <div className="text-xs font-mono break-words bg-background/50 p-2 rounded-lg border border-border/30 text-rose-400">
                {unrecognizedQrData}
              </div>
            </div>

            <div className="flex justify-end pt-2 gap-2">
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
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Asset"
        description="Are you sure you want to delete this asset? This action cannot be undone and will permanently remove the asset from your inventory."
        itemName={deletingAsset?.id || deletingAsset?.name}
      />
    </SidebarProvider>
  )
}

