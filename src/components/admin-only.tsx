"use client"

import { useUserProfile } from "@/hooks/use-user-profile"
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showAlert?: boolean
}

/**
 * Component that only renders its children if the user is an admin
 * 
 * @example
 * <AdminOnly>
 *   <button>Delete All Data</button>
 * </AdminOnly>
 * 
 * @example
 * <AdminOnly fallback={<p>You must be an admin to view this</p>}>
 *   <AdminPanel />
 * </AdminOnly>
 */
export function AdminOnly({ children, fallback, showAlert = false }: AdminOnlyProps) {
  const { isAdmin, loading } = useUserProfile()

  if (loading) {
    return null // or a loading skeleton
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showAlert) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be an administrator to access this feature.
          </AlertDescription>
        </Alert>
      )
    }
    
    return null
  }

  return <>{children}</>
}

/**
 * Badge component that displays the user's role
 */
export function UserRoleBadge() {
  const { profile, loading, isAdmin } = useUserProfile()

  if (loading) {
    return null
  }

  if (!profile) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      <Shield className="h-3 w-3" />
      {isAdmin ? 'Administrator' : 'User'}
    </div>
  )
}



