// Imported Asset Interface - Comprehensive structure matching the exported CSV
export interface ImportedAssetData {
  // Basic Information
  assetTagId: string
  description: string
  purchasedFrom: string
  purchaseDate: string
  brand: string
  cost: string
  model: string
  serialNo: string
  additionalInformation: string
  xeroAssetNo: string
  owner: string

  // Audit Information
  auditedOctober2019: string
  subCategory: string
  pbiNumber: string
  status: string
  issuedTo: string
  auditedApril2021: string
  poNumber: string
  paymentVoucherNumber: string
  auditedMay2021: string
  assetType: string
  finalReconAudit2021: string
  deliveryDate: string
  unaccounted2021Inventory: string
  remarks: string
  qr: string
  oldAssetTag: string

  // Depreciation Information
  depreciableAsset: string
  depreciableCost: string
  salvageValue: string
  assetLifeMonths: string
  depreciationMethod: string
  dateAcquired: string

  // Classification
  category: string
  department: string
  site: string
  location: string
}

// Convert imported data to our internal Asset format
export interface Asset {
  id: string
  name?: string
  description: string
  category: string
  subCategory: string
  location: string
  site: string
  floor?: string
  status: "Available" | "In Use" | "Move" | "Reserved" | "Disposed" | "Maintenance"
  value: number
  purchaseDate: string
  dateAcquired: string
  assignedTo: string | null
  assignedToId?: string | null
  department: string
  condition?: string
  transferMethod?: string
  authorizedBy?: string
  brand: string
  model: string
  serialNumber: string
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

// Helper function to convert imported CSV row to Asset object
export function convertImportedDataToAsset(row: string[]): Asset {
  const [
    assetTagId,
    description,
    purchasedFrom,
    purchaseDate,
    brand,
    cost,
    model,
    serialNo,
    additionalInformation,
    xeroAssetNo,
    owner,
    auditedOctober2019,
    subCategory,
    pbiNumber,
    status,
    issuedTo,
    auditedApril2021,
    poNumber,
    paymentVoucherNumber,
    auditedMay2021,
    assetType,
    finalReconAudit2021,
    deliveryDate,
    unaccounted2021Inventory,
    remarks,
    qr,
    oldAssetTag,
    depreciableAsset,
    depreciableCost,
    salvageValue,
    assetLifeMonths,
    depreciationMethod,
    dateAcquired,
    category,
    department,
    site,
    location
  ] = row

  // Clean and convert cost to number
  const cleanCost = cost.replace(/[",]/g, '') || '0'
  const numericCost = parseFloat(cleanCost) || 0

  // Map status to our internal status
  const mapStatus = (status: string): "Available" | "In Use" | "Move" | "Reserved" | "Disposed" | "Maintenance" => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'check in':
        return 'Available'
      case 'in use':
      case 'issued':
      case 'check out':
        return 'In Use'
      case 'move':
        return 'Move'
      case 'reserve':
      case 'reserved':
        return 'Reserved'
      case 'lease':
      case 'leased':
      case 'lease asset':
      case 'returned lease':
      case 'lease return':
        return 'Available'
      case 'disposed':
      case 'dispose':
      case 'dispose asset':
        return 'Disposed'
      case 'maintenance':
      case 'under maintenance':
        return 'Maintenance'
      default:
        return 'Available'
    }
  }

  return {
    id: assetTagId || '',
    name: description || subCategory || 'Unnamed Asset',
    description: description || '',
    category: category || 'Uncategorized',
    subCategory: subCategory || '',
    location: location || '',
    site: site || '',
    status: mapStatus(status),
    value: numericCost,
    purchaseDate: purchaseDate || '',
    dateAcquired: dateAcquired || purchaseDate || '',
    assignedTo: issuedTo || null,
    department: department || '',
    brand: brand || '',
    model: model || '',
    serialNumber: serialNo || '',
    manufacturer: brand || undefined,
    notes: additionalInformation || remarks || undefined,

    // Additional imported fields
    purchasedFrom: purchasedFrom || undefined,
    additionalInformation: additionalInformation || undefined,
    xeroAssetNo: xeroAssetNo || undefined,
    owner: owner || undefined,
    auditedOctober2019: auditedOctober2019 || undefined,
    pbiNumber: pbiNumber || undefined,
    issuedTo: issuedTo || undefined,
    auditedApril2021: auditedApril2021 || undefined,
    poNumber: poNumber || undefined,
    paymentVoucherNumber: paymentVoucherNumber || undefined,
    auditedMay2021: auditedMay2021 || undefined,
    assetType: assetType || undefined,
    finalReconAudit2021: finalReconAudit2021 || undefined,
    deliveryDate: deliveryDate || undefined,
    unaccounted2021Inventory: unaccounted2021Inventory || undefined,
    remarks: remarks || undefined,
    qr: qr || undefined,
    oldAssetTag: oldAssetTag || undefined,
    depreciableAsset: depreciableAsset || undefined,
    depreciableCost: depreciableCost || undefined,
    salvageValue: salvageValue || undefined,
    assetLifeMonths: assetLifeMonths || undefined,
    depreciationMethod: depreciationMethod || undefined
  }
}

