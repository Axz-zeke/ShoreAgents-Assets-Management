import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isAdminServer } from '@/lib/user-management-server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminServer()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user ID to delete from request body
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent deleting own account
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Use the shared supabaseAdmin for admin operations

    // Delete from users table first
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete user profile' },
        { status: 500 }
      )
    }

    // Delete from auth.users using service role
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to delete auth user' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'User deleted successfully from both tables' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

