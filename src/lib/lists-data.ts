import { CENTRALIZED_ASSETS, AssetData } from './centralized-assets'
import { Asset } from './imported-asset'
import { IMPORTED_ASSETS } from './imported-data'

// Re-export the comprehensive Asset interface from imported-asset
export type { Asset } from './imported-asset'

export interface Maintenance {
  id: string
  assetId: string
  assetName: string
  type: "Preventive" | "Repair" | "Emergency"
  status: "Scheduled" | "In Progress" | "Completed" | "Overdue"
  scheduledDate: string
  completedDate: string | null
  technician: string
  cost: number
  description: string
  nextDue?: string | null
  priority?: "Low" | "Medium" | "High"
  notes?: string
}

export interface Warranty {
  id: string
  assetId: string
  assetName: string
  vendor: string
  type: "Manufacturer" | "Extended" | "Service"
  startDate: string
  endDate: string
  status: "Active" | "Expired" | "Expiring Soon"
  coverage: string
  contactInfo: string
  referenceNumber: string
  notes?: string
  cost?: number
}

// Data management utilities
export class DataManager {
  private static instance: DataManager
  private assets: Asset[] = []
  private maintenances: Maintenance[] = []
  private warranties: Warranty[] = []

  private constructor() {
    this.loadInitialData()
  }

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  private loadInitialData() {
    // Clear all localStorage data for Supabase migration
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('shoreagents-assets-maintenances')
        localStorage.removeItem('shoreagents-assets-warranties')
        localStorage.removeItem('shoreagents-assets-additional-assets')
        localStorage.removeItem('asset-fields-config')
        localStorage.removeItem('dashboard-widgets')
        console.log('Cleared all localStorage data for Supabase migration')
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
    
    // Initialize with empty arrays - data will come from Supabase
    this.assets = []
    this.maintenances = []
    this.warranties = []
  }

  private convertCentralizedAssets(): Asset[] {
    return CENTRALIZED_ASSETS.map(assetData => ({
      id: assetData.id,
      name: assetData.name,
      description: assetData.name || '',
      category: assetData.category,
      subCategory: '',
      location: assetData.location,
      site: '',
      status: assetData.status,
      value: assetData.value,
      purchaseDate: assetData.purchaseDate,
      dateAcquired: assetData.purchaseDate,
      assignedTo: assetData.assignedTo,
      department: assetData.department,
      brand: '',
      model: assetData.model || '',
      serialNumber: assetData.serialNumber || '',
      manufacturer: assetData.manufacturer,
      notes: assetData.notes
    }))
  }

  private saveData() {
    // Only save to localStorage if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    try {
      // Only save maintenances and warranties - assets come from centralized source
      localStorage.setItem('shoreagents-assets-maintenances', JSON.stringify(this.maintenances))
      localStorage.setItem('shoreagents-assets-warranties', JSON.stringify(this.warranties))
    } catch (error) {
      console.warn('Failed to save data to localStorage:', error)
    }
  }

  private correctAssetData(asset: Asset): Asset {
    let correctedStatus = asset.status
    let correctedName = asset.name
    
    // If asset is assigned to someone but status is Available, change to In Use
    if (asset.assignedTo && asset.assignedTo.trim() !== '' && asset.assignedTo !== '0' && asset.status === 'Available') {
      correctedStatus = 'In Use'
    }
    
    // If name is "SEE SUB-CATEGORY", use subCategory or model/brand instead
    if (asset.name === 'SEE SUB-CATEGORY') {
      if (asset.subCategory && asset.subCategory.trim() !== '') {
        correctedName = asset.subCategory
      } else if (asset.model && asset.model.trim() !== '') {
        correctedName = asset.model
      } else if (asset.brand && asset.brand.trim() !== '') {
        correctedName = asset.brand
      } else if (asset.description && asset.description !== 'SEE SUB-CATEGORY') {
        correctedName = asset.description
      }
    }
    
    return {
      ...asset,
      name: correctedName,
      status: correctedStatus as "Available" | "In Use" | "Maintenance" | "Disposed"
    }
  }

  // Asset methods - now using Supabase instead of localStorage
  getAssets(): Asset[] {
    // Return empty array - assets will be loaded from Supabase
    console.log('getAssets called - returning empty array (Supabase migration)')
    return []
  }

  getAsset(id: string): Asset | undefined {
    // Return undefined - assets will be loaded from Supabase
    console.log('getAsset called - returning undefined (Supabase migration)')
    return undefined
  }

  addAsset(asset: Omit<Asset, 'id'>): Asset {
    // Return asset with generated ID - will be saved to Supabase
    const newAsset: Asset = {
      ...asset,
      id: this.generateId()
    }
    
    console.log('addAsset called - asset will be saved to Supabase:', newAsset)
    return newAsset
  }

  updateAsset(id: string, updates: Partial<Asset>): Asset | null {
    // Asset updates will be handled by Supabase
    console.log('updateAsset called - will be handled by Supabase:', { id, updates })
    return null
  }

  deleteAsset(id: string): boolean {
    // Asset deletion will be handled by Supabase
    console.log('deleteAsset called - will be handled by Supabase:', id)
    return false
  }

  // Maintenance methods - now using Supabase
  getMaintenances(): Maintenance[] {
    console.log('getMaintenances called - returning empty array (Supabase migration)')
    return []
  }

  getMaintenance(id: string): Maintenance | undefined {
    console.log('getMaintenance called - returning undefined (Supabase migration)')
    return undefined
  }

  addMaintenance(maintenance: Omit<Maintenance, 'id'>): Maintenance {
    const newMaintenance: Maintenance = {
      ...maintenance,
      id: this.generateId()
    }
    console.log('addMaintenance called - will be saved to Supabase:', newMaintenance)
    return newMaintenance
  }

  updateMaintenance(id: string, updates: Partial<Maintenance>): Maintenance | null {
    console.log('updateMaintenance called - will be handled by Supabase:', { id, updates })
    return null
  }

  deleteMaintenance(id: string): boolean {
    console.log('deleteMaintenance called - will be handled by Supabase:', id)
    return false
  }

  // Warranty methods - now using Supabase
  getWarranties(): Warranty[] {
    console.log('getWarranties called - returning empty array (Supabase migration)')
    return []
  }

  getWarranty(id: string): Warranty | undefined {
    console.log('getWarranty called - returning undefined (Supabase migration)')
    return undefined
  }

  addWarranty(warranty: Omit<Warranty, 'id'>): Warranty {
    const newWarranty: Warranty = {
      ...warranty,
      id: this.generateId()
    }
    console.log('addWarranty called - will be saved to Supabase:', newWarranty)
    return newWarranty
  }

  updateWarranty(id: string, updates: Partial<Warranty>): Warranty | null {
    console.log('updateWarranty called - will be handled by Supabase:', { id, updates })
    return null
  }

  deleteWarranty(id: string): boolean {
    console.log('deleteWarranty called - will be handled by Supabase:', id)
    return false
  }

  // Utility methods
  private generateId(): string {
    // For Lists feature, always use AST prefix for all records
    const existingIds = [
      ...this.assets.map(a => a.id),
      ...this.maintenances.map(m => m.id),
      ...this.warranties.map(w => w.id)
    ]
    
    let counter = Math.max(
      ...existingIds.map(id => {
        const match = id.match(/AST-(\d+)/)
        return match ? parseInt(match[1]) : 0
      }),
      15 // Start from AST-016 since we have assets up to AST-015
    ) + 1
    
    let newId: string
    
    do {
      newId = `AST-${counter.toString().padStart(3, '0')}`
      counter++
    } while (existingIds.includes(newId))
    
    return newId
  }

  private getDefaultMaintenances(): Maintenance[] {
    return [
      {
        id: "AST-016",
        assetId: "AST-001",
        assetName: "MacBook Pro 16\"",
        type: "Preventive",
        status: "Completed",
        scheduledDate: "2024-01-15",
        completedDate: "2024-01-15",
        technician: "Tech Solutions Inc.",
        cost: 150,
        description: "Regular maintenance and cleaning",
        nextDue: "2024-04-15",
        priority: "Medium"
      },
      {
        id: "AST-017",
        assetId: "AST-005",
        assetName: "Projector",
        type: "Repair",
        status: "In Progress",
        scheduledDate: "2024-01-20",
        completedDate: null,
        technician: "AV Repair Co.",
        cost: 0,
        description: "Bulb replacement and calibration",
        nextDue: null,
        priority: "High"
      },
      {
        id: "AST-018",
        assetId: "AST-004",
        assetName: "Toyota Camry",
        type: "Preventive",
        status: "Scheduled",
        scheduledDate: "2024-02-01",
        completedDate: null,
        technician: "AutoCare Center",
        cost: 0,
        description: "Oil change and tire rotation",
        nextDue: "2024-05-01",
        priority: "Medium"
      },
      {
        id: "AST-019",
        assetId: "AST-002",
        assetName: "Dell Monitor 27\"",
        type: "Repair",
        status: "Completed",
        scheduledDate: "2024-01-10",
        completedDate: "2024-01-10",
        technician: "Monitor Repair Services",
        cost: 75,
        description: "Screen calibration and cable replacement",
        nextDue: null,
        priority: "Low"
      },
      {
        id: "AST-020",
        assetId: "AST-007",
        assetName: "Laptop Dell XPS",
        type: "Preventive",
        status: "Overdue",
        scheduledDate: "2024-01-05",
        completedDate: null,
        technician: "IT Support Team",
        cost: 0,
        description: "System update and hardware check",
        nextDue: "2024-04-05",
        priority: "High"
      },
    ]
  }

  private getDefaultWarranties(): Warranty[] {
    return [
      {
        id: "AST-021",
        assetId: "AST-001",
        assetName: "MacBook Pro 16\"",
        vendor: "Apple Inc.",
        type: "Manufacturer",
        startDate: "2022-01-15",
        endDate: "2025-01-15",
        status: "Active",
        coverage: "Hardware defects and manufacturing issues",
        contactInfo: "support@apple.com",
        referenceNumber: "APP-2022-001234",
        notes: "Includes AppleCare+ coverage",
        cost: 299
      },
      {
        id: "AST-022",
        assetId: "AST-002",
        assetName: "Dell Monitor 27\"",
        vendor: "Dell Technologies",
        type: "Manufacturer",
        startDate: "2022-03-20",
        endDate: "2024-03-20",
        status: "Expired",
        coverage: "Hardware defects and dead pixels",
        contactInfo: "warranty@dell.com",
        referenceNumber: "DELL-2022-567890",
        notes: "Standard 2-year warranty",
        cost: 0
      },
      {
        id: "AST-023",
        assetId: "AST-004",
        assetName: "Toyota Camry",
        vendor: "Toyota Motor Corporation",
        type: "Manufacturer",
        startDate: "2020-05-15",
        endDate: "2025-05-15",
        status: "Active",
        coverage: "Powertrain and basic warranty",
        contactInfo: "warranty@toyota.com",
        referenceNumber: "TOY-2020-789012",
        notes: "5-year powertrain warranty",
        cost: 0
      },
      {
        id: "AST-024",
        assetId: "AST-005",
        assetName: "Projector",
        vendor: "Epson America",
        type: "Extended",
        startDate: "2021-08-30",
        endDate: "2024-08-30",
        status: "Active",
        coverage: "Extended warranty for lamp and electronics",
        contactInfo: "support@epson.com",
        referenceNumber: "EPS-2021-345678",
        notes: "Extended warranty purchased separately",
        cost: 199
      },
      {
        id: "AST-025",
        assetId: "AST-007",
        assetName: "Laptop Dell XPS",
        vendor: "Dell Technologies",
        type: "Manufacturer",
        startDate: "2023-02-14",
        endDate: "2026-02-14",
        status: "Active",
        coverage: "Hardware defects and accidental damage",
        contactInfo: "premium@dell.com",
        referenceNumber: "DELL-2023-901234",
        notes: "Premium support with accidental damage protection",
        cost: 0
      },
    ]
  }

  // Export functionality
  exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (typeof window === 'undefined') {
      console.warn('CSV export is only available in the browser')
      return
    }

    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
