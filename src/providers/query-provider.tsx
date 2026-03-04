"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// Create a single QueryClient instance that persists across the entire app
let globalQueryClient: QueryClient | undefined = undefined

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Cache data for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Don't refetch on window focus to prevent unnecessary requests
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect to prevent loading states
        refetchOnReconnect: false,
        // Don't refetch on mount to prevent infinite loops
        refetchOnMount: false,
        // Use cached data as placeholder to prevent loading states
        placeholderData: (previousData: any) => previousData || undefined,
        // Show data and error changes
        notifyOnChangeProps: ['data', 'error'],
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  })
}

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: use singleton pattern
    if (!globalQueryClient) {
      globalQueryClient = createQueryClient()
    }
    return globalQueryClient
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use a stable reference to the QueryClient
  const [queryClient] = useState(() => {
    const client = getQueryClient()
    return client
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
