"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MaintenanceRecord } from '@/hooks/use-maintenance'

interface MaintenanceContextType {
  maintenanceRecords: MaintenanceRecord[]
  isLoading: boolean
  isInitialLoading: boolean
  error: string | null
  loadMaintenanceRecords: (filters?: any) => Promise<void>
  createMaintenanceRecord: (data: any) => Promise<any>
  updateMaintenanceRecord: (id: string, updates: any) => Promise<any>
  deleteMaintenanceRecord: (id: string) => Promise<any>
  refreshMaintenanceRecords: () => Promise<void>
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined)

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true) // Only true on very first load
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const loadMaintenanceRecords = async (filters?: any, forceRefresh = false) => {
    const now = Date.now()
    
    // Skip loading if data is fresh and not forcing refresh
    if (!forceRefresh && isInitialized && (now - lastFetch) < CACHE_DURATION) {
      console.log('Using cached maintenance records data')
      return
    }

    try {
      // Only show loading if we don't have any data yet
      if (!isInitialized || maintenanceRecords.length === 0) {
        setIsLoading(true)
      }
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
      setLastFetch(now)
      setIsInitialized(true)
    } catch (err) {
      console.error('Failed to load maintenance records:', err)
      setError('Failed to load maintenance records')
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }

  const createMaintenanceRecord = async (data: any) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error creating maintenance record:', result.error)
        throw new Error(result.error)
      }

      if (!result.success) {
        console.error('API returned unsuccessful response:', result)
        throw new Error('Failed to create maintenance record')
      }

      // Refresh maintenance records to get the updated list
      await loadMaintenanceRecords(undefined, true)
      return result
    } catch (err) {
      console.error('Failed to create maintenance record:', err)
      throw err
    }
  }

  const updateMaintenanceRecord = async (id: string, updates: any) => {
    try {
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
        throw new Error(result.error)
      }

      if (!result.success) {
        console.error('API returned unsuccessful response:', result)
        throw new Error('Failed to update maintenance record')
      }

      // Update local state immediately
      setMaintenanceRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === id ? { ...record, ...updates } : record
        )
      )

      return result
    } catch (err) {
      console.error('Failed to update maintenance record:', err)
      throw err
    }
  }

  const deleteMaintenanceRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error deleting maintenance record:', result.error)
        throw new Error(result.error)
      }

      if (!result.success) {
        console.error('API returned unsuccessful response:', result)
        throw new Error('Failed to delete maintenance record')
      }

      // Update local state immediately
      setMaintenanceRecords(prevRecords => prevRecords.filter(record => record.id !== id))

      return result
    } catch (err) {
      console.error('Failed to delete maintenance record:', err)
      throw err
    }
  }

  const refreshMaintenanceRecords = async () => {
    await loadMaintenanceRecords(undefined, true)
  }

  // Load maintenance records on mount
  useEffect(() => {
    loadMaintenanceRecords()
  }, [])

  const value: MaintenanceContextType = {
    maintenanceRecords,
    isLoading,
    isInitialLoading,
    error,
    loadMaintenanceRecords,
    createMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    refreshMaintenanceRecords
  }

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  )
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext)
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider')
  }
  return context
}
