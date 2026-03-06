import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { z } from "zod"

const assetUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  sub_category: z.string().optional().nullable(),
  subCategory: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  site: z.string().optional().nullable(),
  status: z.string().optional(),
  cost: z.number().optional().nullable(),
  value: z.number().optional().nullable(),
  purchase_date: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  date_acquired: z.string().optional().nullable(),
  dateAcquired: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  assigned_to_id: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serial_number: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  condition: z.string().optional().nullable(),
  transfer_method: z.string().optional().nullable(),
  transferMethod: z.string().optional().nullable(),
  authorized_by: z.string().optional().nullable(),
  authorizedBy: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  image_file_name: z.string().optional().nullable(),
  imageFileName: z.string().optional().nullable(),
})

// GET /api/assets/[id] - Fetch single asset
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = supabaseAdmin
    const { id: assetId } = await params

    const { data: asset, error } = await supabase
      .from("assets")
      .select("*")
      .eq("asset_tag_id", assetId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }
      console.error("Error fetching asset:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: asset
    })
  } catch (error) {
    console.error("Error in GET /api/assets/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/assets/[id] - Update asset
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = supabaseAdmin
    const { id: assetId } = await params
    const body = await request.json()
    console.log('API PUT - Received body for asset', assetId, ':', JSON.stringify(body, null, 2))

    // Validate with Zod
    const result = assetUpdateSchema.safeParse(body)
    if (!result.success) {
      console.error('Asset Update Validation failed for', assetId, ':', JSON.stringify(result.error.issues, null, 2))
      return NextResponse.json({
        error: "Validation error",
        details: result.error.issues.map(i => i.message).join(", ")
      }, { status: 400 })
    }

    const validatedData = result.data

    // Prepare update data with mapping for camelCase to snake_case
    const updateData: any = {}

    // Helper to add if present (handles both naming conventions)
    const setField = (snake: string, camel?: string) => {
      const value = (validatedData as any)[snake] !== undefined ? (validatedData as any)[snake] : (camel ? (validatedData as any)[camel] : undefined)
      if (value !== undefined) updateData[snake] = value
    }

    setField('name')
    setField('description')
    setField('category')
    setField('sub_category', 'subCategory')
    setField('location')
    setField('site')
    setField('status')
    setField('cost', 'value')
    setField('purchase_date', 'purchaseDate')
    setField('date_acquired', 'dateAcquired')
    setField('assigned_to', 'assignedTo')
    setField('assigned_to_id', 'assignedToId')
    setField('department')
    setField('brand')
    setField('model')
    setField('serial_number', 'serialNumber')
    setField('manufacturer')
    setField('notes')
    setField('floor')
    setField('condition')
    setField('transfer_method', 'transferMethod')
    setField('authorized_by', 'authorizedBy')
    setField('image_url', 'imageUrl')
    setField('image_file_name', 'imageFileName')

    // Remove undefined/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined || updateData[key as keyof typeof updateData] === null) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    // Track assignment change if assigned_to_id is being updated
    if (updateData.assigned_to_id !== undefined) {
      const { data: currentAsset } = await supabase
        .from("assets")
        .select("id, assigned_to_id")
        .eq("asset_tag_id", assetId)
        .single()

      if (currentAsset && currentAsset.assigned_to_id !== updateData.assigned_to_id) {
        // If it was previously assigned, mark as returned
        if (currentAsset.assigned_to_id) {
          await supabase
            .from("employee_assignments")
            .update({ returned_at: new Date().toISOString(), status: 'Returned' })
            .eq('asset_id', currentAsset.id)
            .eq('employee_id', currentAsset.assigned_to_id)
            .is('returned_at', null)
        }

        // If newly assigned, create new record
        if (updateData.assigned_to_id) {
          await supabase
            .from("employee_assignments")
            .insert({
              employee_id: updateData.assigned_to_id,
              asset_id: currentAsset.id,
              status: 'Active'
            })
        }
      }
    }

    const { data: asset, error } = await supabase
      .from("assets")
      .update(updateData)
      .eq("asset_tag_id", assetId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }
      console.error("Error updating asset:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: asset
    })
  } catch (error) {
    console.error("Error in PUT /api/assets/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = supabaseAdmin
    const { id: assetId } = await params

    const { data: asset, error } = await supabase
      .from("assets")
      .delete()
      .eq("asset_tag_id", assetId)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 })
      }
      console.error("Error deleting asset:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
      data: asset
    })
  } catch (error) {
    console.error("Error in DELETE /api/assets/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
