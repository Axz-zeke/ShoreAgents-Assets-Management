"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Asset } from '@/lib/lists-data'

interface AssetContextType {
  assets: Asset[]
  isLoading: boolean
  isInitialLoading: boolean
  error: string | null
  loadAssets: () => Promise<void>
  addAsset: (assetData: Omit<Asset, 'id'>) => Promise<any>
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<{ success: boolean; error?: string }>
  deleteAsset: (id: string) => Promise<{ success: boolean; error?: string }>
  refreshAssets: () => Promise<void>
}

const AssetContext = createContext<AssetContextType | undefined>(undefined)

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true) // Only true on very first load
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const loadAssets = async (forceRefresh = false) => {
    const now = Date.now()
    
    // Skip loading if data is fresh and not forcing refresh
    if (!forceRefresh && isInitialized && (now - lastFetch) < CACHE_DURATION) {
      console.log('Using cached assets data')
      return
    }

    try {
      // Only show loading if we don't have any data yet
      if (!isInitialized || assets.length === 0) {
        setIsLoading(true)
      }
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
      setLastFetch(now)
      setIsInitialized(true)
    } catch (err) {
      console.error('Failed to load assets:', err)
      setError('Failed to load assets')
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
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

      // Refresh assets to get the updated list
      await loadAssets(true)
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

      if (!result.success) {
        console.error('API returned unsuccessful response:', result)
        return { success: false, error: 'Failed to update asset' }
      }

      // Update local state immediately for better UX
      setAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === id ? { ...asset, ...updates } : asset
        )
      )

      // Also refresh from server to ensure consistency
      setTimeout(() => loadAssets(true), 1000)

      return { success: true }
    } catch (err) {
      console.error('Failed to update asset:', err)
      return { success: false, error: 'Failed to update asset' }
    }
  }

  const deleteAsset = async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error deleting asset:', result.error)
        return { success: false, error: result.error }
      }

      if (!result.success) {
        console.error('API returned unsuccessful response:', result)
        return { success: false, error: 'Failed to delete asset' }
      }

      // Update local state immediately
      setAssets(prevAssets => prevAssets.filter(asset => asset.id !== id))

      return { success: true }
    } catch (err) {
      console.error('Failed to delete asset:', err)
      return { success: false, error: 'Failed to delete asset' }
    }
  }

  const refreshAssets = async () => {
    await loadAssets(true)
  }

  // Load assets on mount
  useEffect(() => {
    loadAssets()
  }, [])

  const value: AssetContextType = {
    assets,
    isLoading,
    isInitialLoading,
    error,
    loadAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    refreshAssets
  }

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  )
}

export function useAssets() {
  const context = useContext(AssetContext)
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider')
  }
  return context
}
