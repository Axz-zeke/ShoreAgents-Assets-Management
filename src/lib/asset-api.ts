// Asset API Utility Functions
import { Asset } from './lists-data'

export interface BulkOperationResult {
  success: boolean
  successCount: number
  failedCount: number
  totalProcessed: number
  errors?: string[]
}

// Bulk asset operations (checkout, checkin, reserve, etc.)
export async function bulkUpdateAssets(
  operation: string,
  assetIds: string[],
  updateData: Partial<Asset>
): Promise<BulkOperationResult> {
  try {
    const response = await fetch('/api/assets/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        assetIds,
        updateData
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Bulk operation failed:', result.error)
      return {
        success: false,
        successCount: 0,
        failedCount: assetIds.length,
        totalProcessed: assetIds.length,
        errors: [result.error]
      }
    }

    return result
  } catch (error) {
    console.error('Failed to perform bulk operation:', error)
    return {
      success: false,
      successCount: 0,
      failedCount: assetIds.length,
      totalProcessed: assetIds.length,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }
  }
}

// Fetch assets with filtering
export async function fetchAssets(params?: {
  search?: string
  status?: string
  category?: string
  department?: string
  limit?: number
  offset?: number
}) {
  try {
    const url = new URL('/api/assets', window.location.origin)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(url.toString())
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch assets')
    }

    return result
  } catch (error) {
    console.error('Failed to fetch assets:', error)
    throw error
  }
}

// Get single asset by ID
export async function fetchAssetById(assetId: string) {
  try {
    const response = await fetch(`/api/assets/${assetId}`)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch asset')
    }

    return result
  } catch (error) {
    console.error('Failed to fetch asset:', error)
    throw error
  }
}

// Create new asset
export async function createAsset(assetData: Partial<Asset>) {
  try {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create asset')
    }

    return result
  } catch (error) {
    console.error('Failed to create asset:', error)
    throw error
  }
}

// Update asset
export async function updateAsset(assetId: string, updateData: Partial<Asset>) {
  try {
    const response = await fetch(`/api/assets/${assetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update asset')
    }

    return result
  } catch (error) {
    console.error('Failed to update asset:', error)
    throw error
  }
}

// Delete asset
export async function deleteAsset(assetId: string) {
  try {
    const response = await fetch(`/api/assets/${assetId}`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete asset')
    }

    return result
  } catch (error) {
    console.error('Failed to delete asset:', error)
    throw error
  }
}
