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

// Comprehensive Asset interface matching the database structure
export interface Asset {
  id: string
  name?: string
  description?: string
  category?: string
  subCategory?: string
  location?: string
  site?: string
  floor?: string
  status?: string
  value?: number
  purchaseDate?: string
  dateAcquired?: string
  assignedTo?: string | null
  assignedToId?: string | null
  department?: string
  condition?: string
  transferMethod?: string
  authorizedBy?: string
  brand?: string
  model?: string
  serialNumber?: string
  manufacturer?: string
  notes?: string

  // Image fields
  imageUrl?: string
  qrUrl?: string
  imageFileName?: string

  // Timestamp fields
  updatedAt?: string
  createdAt?: string

  // Additional imported fields
  purchasedFrom?: string
  additionalInformation?: string
  xeroAssetNo?: string
  owner?: string
  auditedOctober2019?: string
  pbiNumber?: string
  issuedTo?: string
  auditedApril2021?: string
  poNumber?: string
  paymentVoucherNumber?: string
  auditedMay2021?: string
  assetType?: string
  finalReconAudit2021?: string
  deliveryDate?: string
  unaccounted2021Inventory?: string
  remarks?: string
  qr?: string
  oldAssetTag?: string
  depreciableAsset?: string
  depreciableCost?: string
  salvageValue?: string
  assetLifeMonths?: string
  depreciationMethod?: string
}
