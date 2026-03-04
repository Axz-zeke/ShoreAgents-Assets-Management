"use client"

import { useState, useEffect } from 'react'

export interface MaintenanceRecord {
  id: string
  asset_id: string
  asset_ids?: string[] // For batch support if needed
  maintenance_title: string
  maintenance_details?: string
  maintenance_due_date: string
  maintenance_by: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'urgent' | 'high' | 'medium' | 'low'
  service_type?: 'preventive' | 'corrective' | 'emergency' | 'routine'
  date_completed?: string
  maintenance_cost: number
  is_repeating: boolean
  created_at: string
  updated_at: string
  assets?: {
    asset_tag_id: string
    name: string
    description?: string
    category?: string
    location?: string
    site?: string
    status: string
  }
}

export function useMaintenance() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMaintenanceRecords = async (filters?: {
    assetId?: string
    status?: string
    limit?: number
    offset?: number
  }) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Loading maintenance records from API...')

      const params = new URLSearchParams()
      if (filters?.assetId) params.append('asset_id', filters.assetId)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/maintenance?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        console.error('Error loading maintenance records:', result.error)
        setError(result.error)
        return
      }

      if (!result.success) {
        console.error('API returned unsuccessful response:', result)
        setError('Failed to load maintenance records')
        return
      }

      setMaintenanceRecords(result.data || [])
    } catch (err) {
      console.error('Failed to load maintenance records:', err)
      setError('Failed to load maintenance records')
    } finally {
      setIsLoading(false)
    }
  }

  const createMaintenanceRecord = async (maintenanceData: {
    asset_ids: string[]
    maintenance_title: string
    maintenance_details?: string
    maintenance_due_date: string
    maintenance_by: string
    maintenance_status?: string
    date_completed?: string
    maintenance_cost?: number
    is_repeating?: string
  }) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error creating maintenance record:', result.error)
        throw new Error(result.error)
      }

      // Reload maintenance records to get the updated list
      await loadMaintenanceRecords()
      return result
    } catch (err) {
      console.error('Failed to create maintenance record:', err)
      throw err
    }
  }

  const updateMaintenanceRecord = async (id: string, updates: Partial<MaintenanceRecord>) => {
    try {
      console.log('updateMaintenanceRecord called with:', { id, updates })

      // Validate required fields
      if (!id || id.trim() === '') {
        console.error('Invalid maintenance record ID:', id)
        return { success: false, error: 'Invalid maintenance record ID provided' }
      }

      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error updating maintenance record:', result.error)
        return { success: false, error: result.error }
      }

      console.log('Maintenance record updated successfully:', result.data)

      // Reload maintenance records to get the updated list
      await loadMaintenanceRecords()
      return { success: true, data: result.data }
    } catch (err) {
      console.error('Failed to update maintenance record:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: errorMessage }
    }
  }

  const deleteMaintenanceRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error deleting maintenance record:', result.error)
        throw new Error(result.error)
      }

      // Reload maintenance records to get the updated list
      await loadMaintenanceRecords()
    } catch (err) {
      console.error('Failed to delete maintenance record:', err)
      throw err
    }
  }

  useEffect(() => {
    loadMaintenanceRecords()
  }, [])

  return {
    maintenanceRecords,
    isLoading,
    error,
    loadMaintenanceRecords,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord
  }
}
