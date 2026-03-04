"use client"

import { useState, useEffect } from 'react'
import { Asset } from '@/lib/lists-data'

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAssets = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Loading assets from API...')
      
      const response = await fetch('/api/assets')
      const result = await response.json()

      if (!response.ok) {
        console.error('Error loading assets:', result.error)
        setError(result.error)
        return
      }

      if (!result.success) {
        console.error('API returned unsuccessful response:', result)
        setError('Failed to load assets')
        return
      }

      // Transform API data to Asset format
      const transformedAssets: Asset[] = (result.data || []).map((item: any) => ({
        id: item.asset_tag_id || item.id,
        name: item.name || 'Unnamed Asset',
        description: item.description || '',
        category: item.category || '',
        subCategory: item.sub_category || '',
        location: item.location || '',
        site: item.site || '',
        status: item.status || 'Available',
        value: item.cost || 0,
        purchaseDate: item.purchase_date || item.date_acquired || '',
        dateAcquired: item.date_acquired || item.purchase_date || '',
        assignedTo: item.assigned_to || '',
        department: item.department || '',
        brand: item.brand || '',
        model: item.model || '',
        serialNumber: item.serial_number || '',
        manufacturer: item.manufacturer || '',
        notes: item.notes || '',
        imageUrl: item.image_url || '',
        imageFileName: item.image_file_name || '',
        updatedAt: item.updated_at || '',
        createdAt: item.created_at || ''
      }))

      setAssets(transformedAssets)
    } catch (err) {
      console.error('Failed to load assets:', err)
      setError('Failed to load assets')
    } finally {
      setIsLoading(false)
    }
  }

  const addAsset = async (assetData: Omit<Asset, 'id'>) => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...assetData,
          asset_tag_id: `AST-${Date.now()}`
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error adding asset:', result.error)
        throw new Error(result.error)
      }

      // Reload assets to get the updated list
      await loadAssets()
      return result.data
    } catch (err) {
      console.error('Failed to add asset:', err)
      throw err
    }
  }

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      console.log('updateAsset called with:', { id, updates })
      
      // Validate required fields
      if (!id || id.trim() === '') {
        console.error('Invalid asset ID:', id)
        return { success: false, error: 'Invalid asset ID provided' }
      }
      
      const response = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error updating asset:', result.error)
        return { success: false, error: result.error }
      }

      console.log('Asset updated successfully:', result.data)
      
      // Reload assets to get the updated list
      await loadAssets()
      return { success: true, data: result.data }
    } catch (err) {
      console.error('Failed to update asset:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: errorMessage }
    }
  }

  const deleteAsset = async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error deleting asset:', result.error)
        throw new Error(result.error)
      }

      // Reload assets to get the updated list
      await loadAssets()
    } catch (err) {
      console.error('Failed to delete asset:', err)
      throw err
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  return {
    assets,
    isLoading,
    error,
    loadAssets,
    addAsset,
    updateAsset,
    deleteAsset
  }
}

