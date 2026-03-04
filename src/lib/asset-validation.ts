// Asset validation utilities

// Check if an Asset ID already exists
export async function checkAssetIdExists(assetTagId: string): Promise<{ exists: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/assets/${assetTagId}`)
    
    if (response.ok) {
      return { exists: true }
    } else if (response.status === 404) {
      return { exists: false }
    } else {
      const result = await response.json()
      return { exists: false, error: result.error }
    }
  } catch (error) {
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Generate a unique Asset ID with format: ASSET-XXXXX
export function generateUniqueAssetId(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ASSET-${timestamp}-${random}`
}

// Validate Asset ID format
export function validateAssetIdFormat(assetTagId: string): { isValid: boolean; error?: string } {
  if (!assetTagId || assetTagId.trim() === '') {
    return { isValid: false, error: 'Asset ID is required' }
  }
  
  if (assetTagId.length < 3) {
    return { isValid: false, error: 'Asset ID must be at least 3 characters long' }
  }
  
  if (assetTagId.length > 50) {
    return { isValid: false, error: 'Asset ID must be less than 50 characters' }
  }
  
  // Allow letters, numbers, hyphens, underscores
  const validFormat = /^[A-Za-z0-9\-_]+$/
  if (!validFormat.test(assetTagId)) {
    return { isValid: false, error: 'Asset ID can only contain letters, numbers, hyphens, and underscores' }
  }
  
  return { isValid: true }
}

// Suggest alternative Asset ID if there's a conflict
export function suggestAssetId(baseAssetId: string): string {
  const timestamp = Date.now().toString().slice(-6)
  
  // If it ends with a number, increment it
  if (/\d$/.test(baseAssetId)) {
    const match = baseAssetId.match(/^(.+?)(\d+)$/)
    if (match) {
      const [, prefix, number] = match
      const newNumber = parseInt(number, 10) + 1
      return `${prefix}${newNumber.toString().padStart(number.length, '0')}`
    }
  }
  
  // Otherwise, append timestamp
  return `${baseAssetId}-${timestamp}`
}
