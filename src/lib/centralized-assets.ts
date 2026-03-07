// Centralized Asset Data - Single source of truth for all assets
// Now using imported data as the primary source
import { Asset } from './lists-data'
import { IMPORTED_ASSETS } from './imported-data'

// Legacy interface for backward compatibility
export interface AssetData {
  id: string
  name: string
  category: string
  location: string
  status: "Available" | "In Use" | "Maintenance" | "Disposed" | "Move" | "Reserved"
  value: number
  purchaseDate: string
  assignedTo: string | null
  department: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  notes?: string
  description?: string
  cost?: string
  warrantyExpiry?: string
  lastMaintenance?: string
  currentLocation?: string
}

// Convert imported assets to legacy AssetData format for backward compatibility
function convertImportedAssetToAssetData(asset: Asset): AssetData {
  return {
    id: asset.id,
    name: asset.name || asset.description || 'Unnamed Asset',
    category: asset.category || 'Uncategorized',
    location: asset.location || 'N/A',
    status: (asset.status as any) || 'Available',
    value: asset.value || 0,
    purchaseDate: asset.purchaseDate || '',
    assignedTo: asset.assignedTo || null,
    department: asset.department || 'N/A',
    serialNumber: asset.serialNumber,
    model: asset.model,
    manufacturer: asset.manufacturer,
    notes: asset.notes || '',
    description: asset.description,
    cost: (asset.value || 0).toString(),
    warrantyExpiry: undefined,
    lastMaintenance: undefined,
    currentLocation: asset.location || 'N/A'
  }
}

// Centralized asset data - now using imported data
export const CENTRALIZED_ASSETS: AssetData[] = IMPORTED_ASSETS.map(convertImportedAssetToAssetData)

// Legacy asset data (kept for reference)
const LEGACY_ASSETS: AssetData[] = [
  {
    id: "AST-001",
    name: "MacBook Pro 16\"",
    category: "IT Equipment",
    location: "IT Storage Room",
    status: "Available",
    value: 2500,
    purchaseDate: "2022-01-15",
    assignedTo: "John Doe",
    department: "IT",
    serialNumber: "MBP2022001",
    model: "MacBook Pro 16-inch",
    manufacturer: "Apple Inc.",
    description: "High-performance laptop for development work"
  },
  {
    id: "AST-002",
    name: "Dell Monitor 27\"",
    category: "IT Equipment",
    location: "IT Storage Room",
    status: "In Use",
    value: 300,
    purchaseDate: "2022-03-20",
    assignedTo: "Jane Smith",
    department: "IT",
    serialNumber: "DELL2022002",
    model: "Dell UltraSharp 27",
    manufacturer: "Dell Technologies",
    description: "4K monitor for design work"
  },
  {
    id: "AST-003",
    name: "Office Chair",
    category: "Furniture",
    location: "Storage Room",
    status: "Available",
    value: 200,
    purchaseDate: "2021-11-10",
    assignedTo: null,
    department: "Operations",
    serialNumber: "CHAIR2021003",
    model: "Ergonomic Office Chair",
    manufacturer: "OfficeMax",
    description: "Ergonomic office chair with lumbar support"
  },
  {
    id: "AST-004",
    name: "Toyota Camry",
    category: "Vehicle",
    location: "Parking Garage",
    status: "In Use",
    value: 28000,
    purchaseDate: "2020-05-15",
    assignedTo: "Mike Johnson",
    department: "Sales",
    serialNumber: "VIN123456789",
    model: "Camry LE",
    manufacturer: "Toyota Motor Corporation",
    description: "Company vehicle for sales team"
  },
  {
    id: "AST-005",
    name: "Projector",
    category: "IT Equipment",
    location: "Conference Room",
    status: "Maintenance",
    value: 800,
    purchaseDate: "2021-08-30",
    assignedTo: null,
    department: "IT",
    serialNumber: "PROJ2021005",
    model: "Epson PowerLite 1781W",
    manufacturer: "Epson America",
    description: "HD projector for presentations",
    lastMaintenance: "2024-01-05"
  },
  {
    id: "AST-006",
    name: "Conference Table",
    category: "Furniture",
    location: "Conference Room",
    status: "Available",
    value: 1200,
    purchaseDate: "2021-12-05",
    assignedTo: null,
    department: "Operations",
    serialNumber: "TABLE2021006",
    model: "Executive Conference Table",
    manufacturer: "Furniture Plus",
    description: "Large conference table for meetings"
  },
  {
    id: "AST-007",
    name: "Laptop Dell XPS",
    category: "IT Equipment",
    location: "IT Storage Room",
    status: "Available",
    value: 1500,
    purchaseDate: "2023-02-14",
    assignedTo: null,
    department: "IT",
    serialNumber: "XPS2023007",
    model: "Dell XPS 13",
    manufacturer: "Dell Technologies",
    description: "Ultrabook for mobile work"
  },
  {
    id: "AST-008",
    name: "Printer HP LaserJet",
    category: "IT Equipment",
    location: "Office Floor 2",
    status: "In Use",
    value: 400,
    purchaseDate: "2022-06-10",
    assignedTo: "Admin Team",
    department: "Administration",
    serialNumber: "HP2022008",
    model: "HP LaserJet Pro",
    manufacturer: "HP Inc.",
    description: "Network printer for office use"
  },
  {
    id: "AST-009",
    name: "Standing Desk",
    category: "Furniture",
    location: "Office Floor 1",
    status: "Available",
    value: 600,
    purchaseDate: "2023-03-20",
    assignedTo: null,
    department: "Operations",
    serialNumber: "DESK2023009",
    model: "Adjustable Standing Desk",
    manufacturer: "DeskPro",
    description: "Electric adjustable standing desk"
  },
  {
    id: "AST-010",
    name: "Security Camera System",
    category: "Security Equipment",
    location: "Main Entrance",
    status: "In Use",
    value: 1200,
    purchaseDate: "2021-09-15",
    assignedTo: "Security Team",
    department: "Security",
    serialNumber: "CAM2021010",
    model: "IP Camera System",
    manufacturer: "SecurityPro",
    description: "4K IP camera system for building security"
  },
  {
    id: "AST-011",
    name: "Air Conditioning Unit",
    category: "HVAC Equipment",
    location: "Server Room",
    status: "In Use",
    value: 3500,
    purchaseDate: "2020-07-01",
    assignedTo: "Facilities Team",
    department: "Facilities",
    serialNumber: "HVAC2020011",
    model: "Commercial AC Unit",
    manufacturer: "CoolAir Systems",
    description: "Industrial AC unit for server room cooling"
  },
  {
    id: "AST-012",
    name: "Fire Extinguisher",
    category: "Safety Equipment",
    location: "Office Floor 1",
    status: "Available",
    value: 50,
    purchaseDate: "2023-01-15",
    assignedTo: null,
    department: "Safety",
    serialNumber: "FIRE2023012",
    model: "ABC Fire Extinguisher",
    manufacturer: "SafetyFirst",
    description: "Multi-purpose fire extinguisher"
  },
  {
    id: "AST-013",
    name: "Coffee Machine",
    category: "Office Equipment",
    location: "Break Room",
    status: "In Use",
    value: 800,
    purchaseDate: "2022-11-20",
    assignedTo: "Office Manager",
    department: "Administration",
    serialNumber: "COFFEE2022013",
    model: "Commercial Coffee Machine",
    manufacturer: "CoffeePro",
    description: "Commercial-grade coffee machine"
  },
  {
    id: "AST-014",
    name: "Whiteboard",
    category: "Office Equipment",
    location: "Conference Room",
    status: "Available",
    value: 150,
    purchaseDate: "2023-04-10",
    assignedTo: null,
    department: "Operations",
    serialNumber: "BOARD2023014",
    model: "Magnetic Whiteboard",
    manufacturer: "OfficeSupplies",
    description: "Large magnetic whiteboard for meetings"
  },
  {
    id: "AST-015",
    name: "UPS Battery Backup",
    category: "IT Equipment",
    location: "Server Room",
    status: "In Use",
    value: 600,
    purchaseDate: "2022-08-15",
    assignedTo: "IT Team",
    department: "IT",
    serialNumber: "UPS2022015",
    model: "APC Smart-UPS",
    manufacturer: "APC",
    description: "Uninterruptible power supply for servers"
  }
]

// Helper functions for asset management
export const getAssetById = (id: string): AssetData | undefined => {
  return CENTRALIZED_ASSETS.find(asset => asset.id === id)
}

export const getAssetsByStatus = (status: AssetData['status']): AssetData[] => {
  return CENTRALIZED_ASSETS.filter(asset => asset.status === status)
}

export const getAssetsByCategory = (category: string): AssetData[] => {
  return CENTRALIZED_ASSETS.filter(asset => asset.category === category)
}

export const getAvailableAssets = (): AssetData[] => {
  return getAssetsByStatus('Available')
}

export const getAssetsInUse = (): AssetData[] => {
  return getAssetsByStatus('In Use')
}

export const getAssetsInMaintenance = (): AssetData[] => {
  return getAssetsByStatus('Maintenance')
}

export const getAllAssets = (): AssetData[] => {
  return [...CENTRALIZED_ASSETS]
}

// Generate next unique asset ID
export const generateNextAssetId = (): string => {
  const existingIds = CENTRALIZED_ASSETS.map(asset => asset.id)
  let counter = CENTRALIZED_ASSETS.length + 1

  let newId: string
  do {
    newId = `AST-${counter.toString().padStart(3, '0')}`
    counter++
  } while (existingIds.includes(newId))

  return newId
}

// Validate asset ID uniqueness
export const isAssetIdUnique = (id: string): boolean => {
  return !CENTRALIZED_ASSETS.some(asset => asset.id === id)
}
