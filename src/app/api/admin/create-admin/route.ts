import { supabaseAdmin } from "@/lib/supabase/admin"
import { isAdminServer } from "@/lib/user-management-server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // 1. Security check
    const isAdmin = await isAdminServer()
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 })
    }

    const { email, password, first_name, last_name, employee_id } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    let userId: string;

    // 2. Check if user exists or create them
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      userId = existingUser.id
    } else {
      if (!password) {
        return NextResponse.json({ error: "Password is required for new accounts" }, { status: 400 })
      }
      
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          first_name, 
          last_name, 
          employee_id,
          force_password_change: true 
        }
      })

      if (authError) {
        console.error('Error creating admin auth user:', authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
      userId = userData.user.id
    }

    // 3. Ensure the profile is an admin
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({ 
        id: userId, 
        user_type: 'admin',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()

    if (profileError) {
      console.error('Profile setup error:', profileError)
      // Delete the auth user if profile setup fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: `Failed to set administrator role: ${profileError.message}` }, { status: 500 })
    }

    console.log('DEBUG: Admin profile created/updated:', profileData)

    return NextResponse.json({ 
      success: true, 
      message: "Administrator account created successfully",
      user: {
        id: userId,
        email: email
      }
    })

  } catch (error: any) {
    console.error('Unexpected error in create-admin:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
