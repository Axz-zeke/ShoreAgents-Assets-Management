"use client"

import { useQuery } from '@tanstack/react-query'

export interface Employee {
    id: string
    employee_id: string
    first_name: string
    middle_name: string | null
    last_name: string
    email: string | null
    job_title: string | null
    department: string | null
    role: string
    status: string
    image_url: string | null
    _count?: {
        assets: number
    }
}

export const employeeKeys = {
    all: ['employees'] as const,
    lists: () => [...employeeKeys.all, 'list'] as const,
}

const fetchEmployees = async (): Promise<Employee[]> => {
    const response = await fetch('/api/setup/employees')
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch employees')
    }

    if (!result.success) {
        throw new Error('Failed to fetch employees')
    }

    return result.data || []
}

export function useEmployees() {
    return useQuery({
        queryKey: employeeKeys.lists(),
        queryFn: fetchEmployees,
        staleTime: 60 * 1000, // 1 minute
    })
}
