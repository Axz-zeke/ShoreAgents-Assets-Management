import { NextRequest, NextResponse } from "next/server"
import { prismaAssetService } from "@/lib/prisma-asset-service"

// GET /api/prisma/assets - Fetch all assets using Prisma
export async function GET(request: NextRequest) {
  try {
    // Get search params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const department = searchParams.get("department")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")

    // Build options object
    const options = {
      search: search || undefined,
      status: status || undefined,
      category: category || undefined,
      department: department || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    }

    const assets = await prismaAssetService.getAssets(options)

    return NextResponse.json({ 
      success: true, 
      data: assets,
      count: assets.length
    })
  } catch (error) {
    console.error("Error in GET /api/prisma/assets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/prisma/assets - Create new asset using Prisma
export async function POST(request: NextRequest) {
  let assetTagId = ""
  try {
    const body = await request.json()
    assetTagId = body.asset_tag_id

    // Validate required fields
    const requiredFields = ["name", "asset_tag_id"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Prepare asset data
    const assetData = {
      asset_tag_id: body.asset_tag_id,
      name: body.name,
      description: body.description || "",
      category: body.category || "",
      sub_category: body.subCategory || "",
      location: body.location || "",
      site: body.site || "",
      status: body.status || "Available",
      cost: body.value || 0,
      purchase_date: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
      date_acquired: body.dateAcquired ? new Date(body.dateAcquired) : undefined,
      assigned_to: body.assignedTo || "",
      department: body.department || "",
      brand: body.brand || "",
      model: body.model || "",
      serial_number: body.serialNumber || "", 

      
      notes: body.notes || "",
      image_url: body.image_url || body.imageUrl || "",
      image_file_name: body.image_file_name || body.imageFileName || ""
    }

    const asset = await prismaAssetService.createAsset(assetData)

    return NextResponse.json({ 
      success: true, 
      data: asset 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/prisma/assets:", error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: `Asset ID "${assetTagId}" already exists. Please use a different Asset ID.` 
      }, { status: 409 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
