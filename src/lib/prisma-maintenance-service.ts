import { prisma } from '@/lib/prisma'
import { type maintenance_records as MaintenanceRecord, type assets as Asset } from '@prisma/client'

export interface CreateMaintenanceData {
  asset_id: string
  maintenance_title: string
  maintenance_details?: string
  maintenance_due_date: Date
  maintenance_by: string
  status?: string
  maintenance_cost?: number
  is_repeating?: boolean
}

export interface UpdateMaintenanceData extends Partial<CreateMaintenanceData> {
  id: string
}

export class PrismaMaintenanceService {
  // Create a new maintenance record
  async createMaintenance(data: CreateMaintenanceData): Promise<MaintenanceRecord> {
    return await prisma.maintenance_records.create({
      data: {
        ...data,
        maintenance_cost: data.maintenance_cost ? Number(data.maintenance_cost) : undefined,
      } as any
    })
  }

  // Get all maintenance records
  async getMaintenanceRecords(options?: {
    assetId?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<MaintenanceRecord[]> {
    const where: any = {}

    if (options?.assetId) {
      where.asset_id = options.assetId
    }

    if (options?.status) {
      where.status = options.status
    }

    return await prisma.maintenance_records.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    })
  }

  // Get maintenance record by ID
  async getMaintenanceById(id: string): Promise<MaintenanceRecord | null> {
    return await prisma.maintenance_records.findUnique({
      where: { id }
    })
  }

  // Update maintenance record
  async updateMaintenance(data: UpdateMaintenanceData): Promise<MaintenanceRecord> {
    const { id, ...updateData } = data
    return await prisma.maintenance_records.update({
      where: { id },
      data: {
        ...updateData,
        maintenance_cost: updateData.maintenance_cost ? Number(updateData.maintenance_cost) : undefined,
      } as any
    })
  }

  // Delete maintenance record
  async deleteMaintenance(id: string): Promise<MaintenanceRecord> {
    return await prisma.maintenance_records.delete({
      where: { id }
    })
  }

  // Get maintenance records with asset information - simplified for now
  async getMaintenanceWithAssets(): Promise<MaintenanceRecord[]> {
    return await prisma.maintenance_records.findMany({
      orderBy: { created_at: 'desc' }
    })
  }

  // Get overdue maintenance records
  async getOverdueMaintenance(): Promise<MaintenanceRecord[]> {
    const today = new Date()
    return await prisma.maintenance_records.findMany({
      where: {
        maintenance_due_date: {
          lt: today
        },
        status: {
          in: ['scheduled', 'in_progress']
        }
      },
      orderBy: { maintenance_due_date: 'asc' }
    })
  }

  // Get maintenance statistics
  async getMaintenanceStats(): Promise<{
    total: number
    byStatus: Record<string, number>
    overdue: number
    upcoming: number
  }> {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [total, statusCounts, overdue, upcoming] = await Promise.all([
      prisma.maintenance_records.count(),
      prisma.maintenance_records.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.maintenance_records.count({
        where: {
          maintenance_due_date: { lt: today },
          status: { in: ['scheduled', 'in_progress'] }
        }
      }),
      prisma.maintenance_records.count({
        where: {
          maintenance_due_date: {
            gte: today,
            lte: nextWeek
          },
          status: { in: ['scheduled', 'in_progress'] }
        }
      })
    ])

    const byStatus = statusCounts.reduce((acc: any, item: any) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      byStatus,
      overdue,
      upcoming
    }
  }
}

// Export a singleton instance
export const prismaMaintenanceService = new PrismaMaintenanceService()
