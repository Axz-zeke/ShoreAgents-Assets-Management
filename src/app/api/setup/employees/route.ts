import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Create a service-role client to bypass RLS for administrative setup
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const employeeSchema = z.object({
    employee_id: z.string().min(1, 'Employee ID is required'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.any(),
    job_title: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    role: z.string().optional().default('Employee'),
})

export async function GET() {
    try {
        // Fetch employees with asset counts using Supabase direct query
        const { data: employees, error } = await supabaseAdmin
            .from('employees')
            .select(`
                *,
                assets:assets(count)
            `)
            .order('last_name', { ascending: true })

        if (error) throw error

        // Map asset count structure to match previous Prisma output format
        const mappedEmployees = employees.map(emp => ({
            ...emp,
            _count: { assets: emp.assets?.[0]?.count || 0 }
        }))

        return NextResponse.json({ success: true, data: mappedEmployees })
    } catch (e: any) {
        console.error('Error fetching employees via Supabase:', e)
        return NextResponse.json({ success: false, error: 'Failed to fetch employees' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('API POST - Received body:', body)

        const result = employeeSchema.safeParse(body)

        if (!result.success) {
            console.error('Validation failed:', result.error.issues)
            return NextResponse.json({
                success: false,
                error: result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
            }, { status: 400 })
        }

        const { data: employee, error } = await supabaseAdmin
            .from('employees')
            .insert({
                ...result.data,
                status: 'Active'
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Duplicate key
                return NextResponse.json({ success: false, error: 'Employee ID already exists' }, { status: 409 })
            }
            throw error
        }

        return NextResponse.json({ success: true, data: employee })
    } catch (e: any) {
        console.error('Error creating employee via Supabase:', e)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
