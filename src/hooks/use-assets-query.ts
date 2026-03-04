"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Asset } from '@/lib/lists-data'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Query keys
export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...assetKeys.lists(), { filters }] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
}

// API functions
const fetchAssets = async (): Promise<Asset[]> => {
  const response = await fetch(`/api/assets?t=${Date.now()}`)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch assets')
  }

  if (!result.success) {
    throw new Error('Failed to fetch assets')
  }

  // Transform API data to Asset format
  return (result.data || []).map((item: any) => ({
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
    floor: item.floor || '',
    condition: item.condition || '',
    transferMethod: item.transfer_method || '',
    authorizedBy: item.authorized_by || '',
    imageUrl: item.image_url || '',
    qrUrl: item.qr_url || '',
    imageFileName: item.image_file_name || '',
    updatedAt: item.updated_at || '',
    createdAt: item.created_at || ''
  }))
}

const addAsset = async (assetData: Omit<Asset, 'id'>): Promise<any> => {
  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...assetData,
      asset_tag_id: (assetData as any).id || (assetData as any).asset_tag_id || `AST-${Date.now()}`
    })
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to add asset')
  }

  return result.data
}

const updateAsset = async ({ id, updates }: { id: string; updates: Partial<Asset> }): Promise<{ success: boolean; error?: string }> => {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  })

  const result = await response.json()

  if (!response.ok) {
    return { success: false, error: result.error }
  }

  if (!result.success) {
    return { success: false, error: 'Failed to update asset' }
  }

  return { success: true }
}

const deleteAsset = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'DELETE',
  })

  const result = await response.json()

  if (!response.ok) {
    return { success: false, error: result.error }
  }

  if (!result.success) {
    return { success: false, error: 'Failed to delete asset' }
  }

  return { success: true }
}

// Hooks
export function useAssets() {
  const queryClient = useQueryClient()

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient()

    // Subscribe to all changes on the assets table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'assets'
        },
        () => {
          // Invalidate the cache when any change occurs
          queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: assetKeys.lists(),
    queryFn: fetchAssets,
    // Data is considered fresh for only 10 seconds to allow for more reactive UI
    staleTime: 10 * 1000,
    // Keep data in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Use cached data as placeholder
    placeholderData: (previousData: Asset[] | undefined) => previousData || [],
    // Refresh data when the user focuses the window or component mounts
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export function useAddAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addAsset,
    onSuccess: () => {
      // Invalidate and refetch assets
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      toast.success('Asset added successfully!')
    },
    onError: (error: Error) => {
      toast.error('Failed to add asset', {
        description: error.message,
      })
    },
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAsset,
    onSuccess: (data, variables) => {
      if (data.success) {
        // Update the cache optimistically
        queryClient.setQueryData(assetKeys.lists(), (oldData: Asset[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(asset =>
            asset.id === variables.id ? { ...asset, ...variables.updates } : asset
          )
        })
        // Invalidate to ensure consistency
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      } else {
        toast.error('Failed to update asset', {
          description: data.error,
        })
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to update asset', {
        description: error.message,
      })
    },
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: (data, assetId) => {
      if (data.success) {
        // Remove from cache optimistically
        queryClient.setQueryData(assetKeys.lists(), (oldData: Asset[] | undefined) => {
          if (!oldData) return oldData
          return oldData.filter(asset => asset.id !== assetId)
        })
        // Invalidate to ensure consistency
        queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
        toast.success('Asset deleted successfully!')
      } else {
        toast.error('Failed to delete asset', {
          description: data.error,
        })
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to delete asset', {
        description: error.message,
      })
    },
  })
}
