import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { UserProfile } from "./user-management"

/**
 * Server-side: Get the current user's profile including user_type
 * Uses supabaseAdmin to avoid infinite recursion in RLS policies
 */
export async function getCurrentUserProfileServer(): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Use supabaseAdmin to fetch the profile to bypass RLS policies
  // that might otherwise cause infinite recursion during authorization checks
  const { data, error } = await supabaseAdmin
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



