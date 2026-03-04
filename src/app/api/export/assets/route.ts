import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Helper to convert data to CSV
function convertToCSV(data: any[], fields: string[]): string {
  if (data.length === 0) return ''

  // Create header row
  const header = fields.join(',')

  // Create data rows
  const rows = data.map(item => {
    return fields.map(field => {
      const value = item[field] || ''
      // Escape commas and quotes
      const stringValue = String(value).replace(/"/g, '""')
      return stringValue.includes(',') ? `"${stringValue}"` : stringValue
    }).join(',')
  })

  return [header, ...rows].join('\n')
}

// Helper to get field list based on options
function getFields(params: URLSearchParams) {
  const fields = []

  // Basic fields
  if (params.get('basic') === 'true') {
    fields.push('asset_tag_id', 'name', 'description', 'serial_number')
  }

  // Financial fields
  if (params.get('financial') === 'true') {
    fields.push('cost', 'purchase_date')
  }

  // Location fields
  if (params.get('location') === 'true') {
    fields.push('location', 'site', 'department')
  }

  // Assignment fields
  if (params.get('assignment') === 'true') {
    fields.push('assigned_to', 'status', 'asset_type')
  }

  // Date fields
  if (params.get('dates') === 'true') {
    fields.push('date_acquired', 'created_at', 'updated_at')
  }

  // Custom fields
  if (params.get('custom') === 'true') {
    fields.push('brand', 'model', 'manufacturer', 'notes', 'category', 'sub_category')
  }

  // If no fields selected, return all
  if (fields.length === 0) {
    return [
      'asset_tag_id', 'name', 'description', 'serial_number', 'brand', 'model',
      'cost', 'purchase_date', 'date_acquired', 'category', 'sub_category',
      'location', 'site', 'department', 'status', 'assigned_to', 'asset_type',
      'notes', 'manufacturer', 'created_at', 'updated_at'
    ]
  }

  return fields
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || 'all'

    const supabase = supabaseAdmin

    // Build query
    let query = supabase.from('assets').select('*')

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (category !== 'all') {
      query = query.eq('category', category)
    }

    // Order by created date
    query = query.order('created_at', { ascending: false })

    const { data: assets, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json(
        { error: 'No assets found' },
        { status: 404 }
      )
    }

    // Get selected fields
    const fields = getFields(searchParams)

    // Convert to CSV
    if (format === 'csv') {
      const csv = convertToCSV(assets, fields)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="assets_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // For Excel format, we'll generate a CSV for now
    // A proper Excel implementation would use a library like 'exceljs' or 'xlsx'
    if (format === 'xlsx') {
      const csv = convertToCSV(assets, fields)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="assets_export_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid format' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export assets' },
      { status: 500 }
    )
  }
}




