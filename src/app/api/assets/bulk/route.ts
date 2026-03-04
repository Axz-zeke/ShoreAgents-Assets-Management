import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// POST /api/assets/bulk - Bulk operations (checkout, checkin, reserve, etc.)
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const body = await request.json()

    const { operation, assetIds, updateData } = body

    if (!operation || !assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({
        error: "Missing required fields: operation, assetIds"
      }, { status: 400 })
    }

    if (!updateData) {
      return NextResponse.json({
        error: "Missing required field: updateData"
      }, { status: 400 })
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process each asset
    for (const assetId of assetIds) {
      try {
        // Prepare update data for database
        const dbUpdateData = {
          name: updateData.name,
          description: updateData.description,
          category: updateData.category,
          sub_category: updateData.subCategory,
          location: updateData.location,
          site: updateData.site,
          status: updateData.status,
          cost: updateData.cost || updateData.value,
          purchase_date: updateData.purchaseDate,
          date_acquired: updateData.dateAcquired,
          assigned_to: updateData.assignedTo,
          department: updateData.department,
          brand: updateData.brand,
          model: updateData.model,
          serial_number: updateData.serialNumber,
          manufacturer: updateData.manufacturer,
          notes: updateData.notes,
          image_url: updateData.imageUrl,
          image_file_name: updateData.imageFileName
        }

        // Remove undefined/null values
        Object.keys(dbUpdateData).forEach(key => {
          if ((dbUpdateData as any)[key] === undefined || (dbUpdateData as any)[key] === null) {
            delete (dbUpdateData as any)[key]
          }
        })

        const { data, error } = await supabase
          .from("assets")
          .update(dbUpdateData)
          .eq("asset_tag_id", assetId)
          .select()
          .single()

        if (error) {
          failedCount++
          errors.push(`Asset ${assetId}: ${error.message}`)
          console.error(`Error updating asset ${assetId}:`, error)
        } else {
          successCount++
        }
      } catch (error) {
        failedCount++
        errors.push(`Asset ${assetId}: ${error}`)
        console.error(`Error processing asset ${assetId}:`, error)
      }
    }

    // Return results
    const result = {
      success: successCount > 0,
      successCount,
      failedCount,
      totalProcessed: assetIds.length,
      ...(errors.length > 0 && { errors })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in POST /api/assets/bulk:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
