import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAdminServer } from '@/lib/user-management-server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabaseSession = await createClient()
        const { data: { user } } = await supabaseSession.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await params
        const { data, error } = await supabaseAdmin
            .from('setup_sub_categories')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await isAdminServer()
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 })
        }
        const { id } = await params
        const body = await req.json()
        const { name, description, category, is_active } = body

        const { data, error } = await supabaseAdmin
            .from('setup_sub_categories')
            .update({ name, description, category, is_active, updated_at: new Date() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ success: true, data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await isAdminServer()
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 })
        }
        const { id } = await params
        const { error } = await supabaseAdmin
            .from('setup_sub_categories')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
