"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MaintenanceRecord } from '@/hooks/use-maintenance'
import { toast } from 'sonner'

// Query keys
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  lists: () => [...maintenanceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...maintenanceKeys.lists(), { filters }] as const,
  details: () => [...maintenanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
}

// API functions
const fetchMaintenanceRecords = async (filters?: {
  assetId?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<MaintenanceRecord[]> => {
  const params = new URLSearchParams()
  if (filters?.assetId) params.append('asset_id', filters.assetId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.offset) params.append('offset', filters.offset.toString())
  
  const response = await fetch(`/api/maintenance?${params.toString()}`)
  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch maintenance records')
  }

  if (!result.success) {
    throw new Error('Failed to fetch maintenance records')
  }

  return result.data || []
}

const createMaintenanceRecord = async (data: any): Promise<any> => {
  const response = await fetch('/api/maintenance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create maintenance record')
  }

  if (!result.success) {
    throw new Error('Failed to create maintenance record')
  }

  return result
}

const updateMaintenanceRecord = async ({ id, updates }: { id: string; updates: any }): Promise<any> => {
  const response = await fetch(`/api/maintenance/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update maintenance record')
  }

  if (!result.success) {
    throw new Error('Failed to update maintenance record')
  }

  return result
}

const deleteMaintenanceRecord = async (id: string): Promise<any> => {
  const response = await fetch(`/api/maintenance/${id}`, {
    method: 'DELETE',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete maintenance record')
  }

  if (!result.success) {
    throw new Error('Failed to delete maintenance record')
  }

  return result
}

// Hooks
export function useMaintenance(filters?: {
  assetId?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: maintenanceKeys.list(filters || {}),
    queryFn: () => fetchMaintenanceRecords(filters),
    // Data is fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache data for 10 minutes
    gcTime: 10 * 60 * 1000,
    // Use cached data as placeholder to prevent loading states
    placeholderData: (previousData: MaintenanceRecord[] | undefined) => previousData || [],
    // Show data and error changes
    notifyOnChangeProps: ['data', 'error'],
    // Don't refetch on mount to prevent infinite loops
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMaintenanceRecord,
    onSuccess: (data) => {
      // Invalidate and refetch maintenance records
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      // Also invalidate assets since maintenance affects asset status
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      
      const successCount = data.created || 1
      toast.success(`Successfully scheduled maintenance for ${successCount} asset${successCount !== 1 ? 's' : ''}`)
    },
    onError: (error: Error) => {
      toast.error('Failed to schedule maintenance', {
        description: error.message,
      })
    },
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMaintenanceRecord,
    onSuccess: (data, variables) => {
      // Update the cache optimistically
      queryClient.setQueryData(maintenanceKeys.lists(), (oldData: MaintenanceRecord[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(record =>
          record.id === variables.id ? { ...record, ...variables.updates } : record
        )
      })
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      // Also invalidate assets since maintenance affects asset status
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      
      toast.success('Maintenance record updated successfully!')
    },
    onError: (error: Error) => {
      toast.error('Failed to update maintenance record', {
        description: error.message,
      })
    },
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMaintenanceRecord,
    onSuccess: (data, maintenanceId) => {
      // Remove from cache optimistically
      queryClient.setQueryData(maintenanceKeys.lists(), (oldData: MaintenanceRecord[] | undefined) => {
        if (!oldData) return oldData
        return oldData.filter(record => record.id !== maintenanceId)
      })
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      // Also invalidate assets since maintenance affects asset status
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      
      toast.success('Maintenance record deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete maintenance record', {
        description: error.message,
      })
    },
  })
}
