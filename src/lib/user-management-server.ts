import { createClient } from "@/lib/supabase/server"
import type { UserType, UserProfile } from "./user-management"

/**
 * Server-side: Get the current user's profile including user_type
 */
export async function getCurrentUserProfileServer(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data
}

/**
 * Server-side: Check if the current user is an admin
 */
export async function isAdminServer(): Promise<boolean> {
  const profile = await getCurrentUserProfileServer()
  return profile?.user_type === 'admin'
}



