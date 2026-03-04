import { NextRequest, NextResponse } from "next/server"
import { prismaAssetService } from "@/lib/prisma-asset-service"

// GET /api/prisma/assets/stats - Get asset statistics using Prisma
export async function GET(request: NextRequest) {
  try {
    const stats = await prismaAssetService.getAssetStats()

    return NextResponse.json({ 
      success: true, 
      data: stats
    })
  } catch (error) {
    console.error("Error in GET /api/prisma/assets/stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

