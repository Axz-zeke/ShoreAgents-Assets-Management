import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdminServer } from '@/lib/user-management-server'

export async function GET() {
    try {
        const supabaseSession = await createClient()
        const { data: { user } } = await supabaseSession.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { data, error } = await supabaseAdmin
            .from('setup_departments')
            .select('*')
            .order('name', { ascending: true })
        if (error) {
            console.warn('setup_departments table error:', error.message)
            return NextResponse.json({ success: true, data: [] })
        }
        return NextResponse.json({ success: true, data: data || [] })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const isAdmin = await isAdminServer()
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 })
        }
        const body = await req.json()
        const { name, description, manager, budget_code } = body
        if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
        const { data, error } = await supabaseAdmin
            .from('setup_departments')
            .insert([{ name, description, manager, budget_code, is_active: true }])
            .select()
            .single()
        if (error) throw error
        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
