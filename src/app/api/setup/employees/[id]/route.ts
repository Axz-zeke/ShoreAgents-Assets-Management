import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Create a service-role client 
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const employeeUpdateSchema = z.object({
    employee_id: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.any(),
    job_title: z.string().optional().or(z.null()),
    department: z.string().optional().or(z.null()),
    role: z.string().optional(),
    status: z.string().optional(),
})

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        const result = employeeUpdateSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: result.error.issues.map((err: any) => err.message).join(', ')
            }, { status: 400 })
        }

        const { data: employee, error } = await supabaseAdmin
            .from('employees')
            .update(result.data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
            throw error
        }

        return NextResponse.json({ success: true, data: employee })
    } catch (e: any) {
        console.error(`Error updating employee via Supabase:`, e)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // 1. Unassign assets first to maintain data integrity
        const { error: unassignError } = await supabaseAdmin
            .from('assets')
            .update({
                assigned_to_id: null,
                assigned_to: '',
                status: 'Available'
            })
            .eq('assigned_to_id', id)

        if (unassignError) throw unassignError

        // 2. Delete the employee
        const { error: deleteError } = await supabaseAdmin
            .from('employees')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error(`Error deleting employee via Supabase:`, e)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
