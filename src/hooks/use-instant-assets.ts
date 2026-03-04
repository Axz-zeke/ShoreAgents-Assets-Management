"use client"

import { useAssets } from './use-assets-query'

// Custom hook that provides instant data when available
export function useInstantAssets() {
  const query = useAssets()
  
  // Show loading only if we have no data at all (initial load)
  const isLoading = (!query.data || query.data.length === 0) && query.isLoading
  
  return {
    ...query,
    isLoading,
    // Provide a more descriptive name
    isInitialLoading: query.isLoading && (!query.data || query.data.length === 0),
  }
}
