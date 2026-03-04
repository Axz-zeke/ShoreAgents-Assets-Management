import { createClient } from "@/lib/supabase/client"

export type UserType = 'admin' | 'user'

export interface UserProfile {
  id: string
  user_type: UserType
  created_at: string
  updated_at: string
}

/**
 * Client-side: Get the current user's profile including user_type
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  
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
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile()
  return profile?.user_type === 'admin'
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  
  return data || []
}

/**
 * Update a user's type (admin only)
 */
export async function updateUserType(userId: string, userType: UserType): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('users')
    .update({ user_type: userType })
    .eq('id', userId)
  
  if (error) {
    console.error('Error updating user type:', error)
    return false
  }
  
  return true
}

/**
 * Create a new user profile (admin only)
 */
export async function createUserProfile(userId: string, userType: UserType = 'user'): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('users')
    .insert({ id: userId, user_type: userType })
  
  if (error) {
    console.error('Error creating user profile:', error)
    return false
  }
  
  return true
}

/**
 * Delete a user profile (admin only)
 */
export async function deleteUserProfile(userId: string): Promise<boolean> {
  console.log('Attempting to delete user:', userId)
  
  try {
    // Call the API route that uses service role to delete both profile and auth user
    const response = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('API delete error:', errorData)
      return false
    }
    
    const result = await response.json()
    console.log('Successfully deleted user:', result.message)
    return true
  } catch (error) {
    console.error('Error calling delete API:', error)
    return false
  }
}

