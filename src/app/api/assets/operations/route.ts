import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// POST /api/assets/operations - Asset operations (checkout, checkin, reserve, etc.)
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()

    const { operation, assetIds, data } = body

    if (!operation || !assetIds || !Array.isArray(assetIds)) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: operation, assetIds"
      }, { status: 400 })
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process each asset
    for (const assetId of assetIds) {
      try {
        let dbUpdateData: any = {}

        // Operation-specific data preparation
        switch (operation) {
          case 'checkout':
            dbUpdateData = {
              status: 'Check Out',
              assigned_to: data?.assignedTo || '',
              location: data?.location || '',
              department: data?.department || '',
              site: data?.site || '',
              notes: data?.notes || ''
            }
            break

          case 'checkin':
            dbUpdateData = {
              status: 'Available',
              assigned_to: null,
              notes: data?.notes || ''
            }
            break

          case 'reserve':
            dbUpdateData = {
              status: 'Reserve',
              assigned_to: data?.reservedForType === 'employee' ? data?.reservedFor : '',
              department: data?.reservedForType === 'department' ? data?.reservedFor : '',
              notes: data?.notes || ''
            }
            break

          case 'lease':
            dbUpdateData = {
              status: 'Lease',
              notes: data?.notes || ''
            }
            break

          case 'dispose':
            dbUpdateData = {
              status: 'Dispose',
              notes: data?.notes || ''
            }
            break

          case 'maintenance':
            dbUpdateData = {
              status: 'Maintenance',
              notes: data?.notes || ''
            }
            break

          case 'move':
            dbUpdateData = {
              location: data?.newLocation || '',
              status: data?.moveType === 'person' ? 'Check Out' : '',
              assigned_to: data?.moveType === 'person' ? data?.assignedTo : '',
              department: data?.moveType === 'department' ? data?.departmentTransfer : '',
              notes: data?.notes || ''
            }
            break

          default:
            throw new Error(`Unknown operation: ${operation}`)
        }

        // Add operation timestamp to notes
        const timestamp = new Date().toISOString().split('T')[0]
        if (dbUpdateData.notes && !dbUpdateData.notes.includes(`[${operation.toUpperCase()}`)) {
          dbUpdateData.notes = `[${operation.toUpperCase()} ${timestamp}] ${dbUpdateData.notes}`
        }

        // Remove undefined values
        Object.keys(dbUpdateData).forEach(key => {
          if (dbUpdateData[key] === undefined) {
            delete dbUpdateData[key]
          }
        })

        const { data: result, error } = await supabase
          .from("assets")
          .update(dbUpdateData)
          .eq("asset_tag_id", assetId)
          .select()
          .single()

        if (error) {
          failedCount++
          const errorMsg = `Asset ${assetId}: ${error.message}`
          errors.push(errorMsg)
          console.error(`Error ${operation} asset ${assetId}:`, error)
        } else {
          successCount++
          console.log(`Successfully ${operation}ed asset ${assetId}`)
        }
      } catch (error) {
        failedCount++
        const errorMsg = `Asset ${assetId}: ${error instanceof Error ? error.message : error}`
        errors.push(errorMsg)
        console.error(`Error ${operation} asset ${assetId}:`, error)
      }
    }

    // Return results
    const response = {
      success: successCount > 0,
      operation,
      successCount,
      failedCount,
      totalProcessed: assetIds.length
    }

    if (errors.length > 0) {
      (response as any).errors = errors
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in asset operation:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 })
  }
}
