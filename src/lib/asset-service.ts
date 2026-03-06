"use client"

import { createClient } from '@/lib/supabase/client'

export interface Asset {
  id?: string
  asset_tag_id: string
  name?: string
  description?: string
  serial_number?: string
  brand?: string
  model?: string
  cost?: number
  purchase_date?: string
  date_acquired?: string
  category?: string
  sub_category?: string
  location?: string
  site?: string
  department?: string
  status?: 'Available' | 'Check Out' | 'Move' | 'Reserve' | 'Dispose' | 'Maintenance'
  assigned_to?: string
  assigned_to_id?: string
  asset_type?: string
  notes?: string
  image_url?: string
  image_file_name?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

export interface CreateAssetData {
  asset_tag_id: string
  name?: string
  description?: string
  serialNumber?: string
  brand?: string
  model?: string
  cost?: number
  purchaseDate?: string
  dateAcquired?: string
  category?: string
  subCategory?: string
  location?: string
  site?: string
  department?: string
  status?: 'Available' | 'Check Out' | 'Move' | 'Reserve' | 'Dispose' | 'Maintenance'
  assignedTo?: string
  assignedToId?: string
  assetType?: string
  notes?: string
  imageUrl?: string
  imageFileName?: string
  manufacturer?: string
}

class AssetService {
  private supabase = createClient()

  // Test API connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing API connection...')
      const response = await fetch('/api/assets?limit=1')
      const result = await response.json()

      if (!response.ok) {
        console.error('API connection test failed:', result.error)
        return { success: false, error: result.error }
      }

      console.log('API connection test successful')
      return { success: true }
    } catch (error) {
      console.error('API connection test error:', error)
      return { success: false, error: 'Connection test failed' }
    }
  }

  // Create a new asset
  async createAsset(assetData: CreateAssetData): Promise<{ success: boolean; data?: Asset; error?: string }> {
    try {
      console.log('=== ASSET SERVICE DEBUG ===')
      console.log('Creating asset with data:', assetData)

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData)
      })

      const result = await response.json()
      console.log('API response - result:', result)

      if (!response.ok) {
        console.error('Error creating asset:', result.error)
        return { success: false, error: result.error }
      }

      console.log('Asset created successfully:', result.data)
      console.log('=== END ASSET SERVICE DEBUG ===')
      return { success: true, data: result.data }
    } catch (error) {
      console.error('Unexpected error creating asset:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get all assets
  async getAllAssets(): Promise<{ success: boolean; data?: Asset[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching assets:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error fetching assets:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Upload image to Supabase Storage
  async uploadImage(file: File, filePath: string, bucket: string = 'asset-images'): Promise<{ data?: { publicUrl: string }; error?: any }> {
    try {

      // Use API endpoint for server-side upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('filePath', filePath)
      formData.append('bucket', bucket)

      console.log('=== ASSET SERVICE UPLOAD DEBUG ===')
      console.log('File:', file.name, file.type, file.size)
      console.log('File path:', filePath)
      console.log('Bucket:', bucket)
      console.log('==================================')

      const response = await fetch('/api/assets/image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API upload error:', result.error)
        return { error: result.error }
      }

      console.log('Image uploaded successfully via API:', result.data)

      return result
    } catch (error) {
      console.error('Unexpected error uploading image:', error)
      return { error }
    }
  }

  // Get asset by ID
  async getAssetById(id: string): Promise<{ success: boolean; data?: Asset; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching asset:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error fetching asset:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Update asset
  async updateAsset(id: string, updates: Partial<CreateAssetData>): Promise<{ success: boolean; data?: Asset; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating asset:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error updating asset:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Delete asset
  async deleteAsset(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('assets')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting asset:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Unexpected error deleting asset:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Search assets
  async searchAssets(query: string): Promise<{ success: boolean; data?: Asset[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('assets')
        .select('*')
        .or(`asset_tag_id.ilike.%${query}%,name.ilike.%${query}%,description.ilike.%${query}%,serial_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching assets:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error searching assets:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get assets by status
  async getAssetsByStatus(status: string): Promise<{ success: boolean; data?: Asset[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('assets')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching assets by status:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error fetching assets by status:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get assets by category
  async getAssetsByCategory(category: string): Promise<{ success: boolean; data?: Asset[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('assets')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching assets by category:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Unexpected error fetching assets by category:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

// Export singleton instance
export const assetService = new AssetService()
