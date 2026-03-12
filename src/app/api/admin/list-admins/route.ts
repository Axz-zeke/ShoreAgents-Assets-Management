import { createClient } from "@supabase/supabase-js"
import { isAdminServer } from "@/lib/user-management-server"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const isAdmin = await isAdminServer()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Get all admin IDs from public.users
    const { data: adminProfiles, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_type', 'admin')

    if (profileError) throw profileError

    // 2. Get all auth users to match emails and metadata
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    // 3. Merge data
    const admins = adminProfiles.map(profile => {
      const authUser = authUsers.find(u => u.id === profile.id)
      return {
        id: profile.id,
        user_type: profile.user_type,
        created_at: profile.created_at,
        email: authUser?.email || 'N/A',
        first_name: authUser?.user_metadata?.first_name || '',
        last_name: authUser?.user_metadata?.last_name || '',
        employee_id: authUser?.user_metadata?.employee_id || ''
      }
    })

    return NextResponse.json({ success: true, data: admins })
  } catch (error: any) {
    console.error('List admins error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
