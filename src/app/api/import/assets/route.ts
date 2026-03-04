import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Helper to parse CSV
function parseCSV(text: string): Record<string, any>[] {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1)

  return rows.map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const obj: Record<string, any> = {}
    headers.forEach((header, index) => {
      obj[header] = values[index] || ''
    })
    return obj
  })
}

// Map CSV fields to database fields
function mapToDatabase(row: Record<string, any>) {
  return {
    asset_tag_id: row['Asset Tag ID'] || row['asset_tag_id'] || '',
    name: row['Asset Name'] || row['name'] || '',
    description: row['Description'] || row['description'] || '',
    serial_number: row['Serial Number'] || row['serial_number'] || '',
    brand: row['Brand'] || row['brand'] || '',
    model: row['Model'] || row['model'] || '',
    cost: parseFloat(row['Cost'] || row['cost'] || '0') || 0,
    purchase_date: row['Purchase Date'] || row['purchase_date'] || null,
    date_acquired: row['Date Acquired'] || row['date_acquired'] || null,
    category: row['Category'] || row['category'] || '',
    sub_category: row['Sub Category'] || row['sub_category'] || '',
    location: row['Location'] || row['location'] || '',
    site: row['Site'] || row['site'] || '',
    department: row['Department'] || row['department'] || '',
    status: row['Status'] || row['status'] || 'Available',
    assigned_to: row['Assigned To'] || row['assigned_to'] || '',
    asset_type: row['Asset Type'] || row['asset_type'] || '',
    notes: row['Notes'] || row['notes'] || '',
    manufacturer: row['Manufacturer'] || row['manufacturer'] || '',
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()

    // Parse CSV (for now, only CSV is supported, Excel would need additional library)
    let rows: Record<string, any>[]
    try {
      rows = parseCSV(text)
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse CSV file. Please check the format.' },
        { status: 400 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No data found in file' },
        { status: 400 }
      )
    }

    // Process each row
    const results = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // +2 because of header row and 1-indexed

      try {
        const assetData = mapToDatabase(row)

        // Validate required fields
        if (!assetData.asset_tag_id || !assetData.name) {
          results.push({
            row: rowNumber,
            data: row,
            status: 'error',
            error: 'Missing required fields: Asset Tag ID and Asset Name are required'
          })
          continue
        }

        // Check if asset already exists
        const { data: existing } = await supabase
          .from('assets')
          .select('id')
          .eq('asset_tag_id', assetData.asset_tag_id)
          .single()

        if (existing) {
          results.push({
            row: rowNumber,
            data: row,
            status: 'error',
            error: `Asset with ID ${assetData.asset_tag_id} already exists`
          })
          continue
        }

        // Insert asset
        const { error: insertError } = await supabase
          .from('assets')
          .insert(assetData)

        if (insertError) {
          results.push({
            row: rowNumber,
            data: row,
            status: 'error',
            error: insertError.message
          })
        } else {
          results.push({
            row: rowNumber,
            data: row,
            status: 'success'
          })
        }
      } catch (error: any) {
        results.push({
          row: rowNumber,
          data: row,
          status: 'error',
          error: error.message || 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      message: `Processed ${rows.length} rows: ${successCount} successful, ${errorCount} failed`,
      results,
      summary: {
        total: rows.length,
        success: successCount,
        failed: errorCount
      }
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import assets' },
      { status: 500 }
    )
  }
}




