import { prisma } from '@/lib/prisma'
import { type public_users as User } from '@prisma/client'

export interface CreateUserData {
  id: string
  user_type: string
}

export interface UpdateUserData {
  id: string
  user_type?: string
}

export class PrismaUserService {
  // Create a new user
  async createUser(data: CreateUserData): Promise<User> {
    return await prisma.public_users.create({
      data
    })
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    return await prisma.public_users.findMany({
      orderBy: { created_at: 'desc' }
    })
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    return await prisma.public_users.findUnique({
      where: { id }
    })
  }

  // Update user
  async updateUser(data: UpdateUserData): Promise<User> {
    const { id, ...updateData } = data
    return await prisma.public_users.update({
      where: { id },
      data: updateData
    })
  }

  // Delete user
  async deleteUser(id: string): Promise<User> {
    return await prisma.public_users.delete({
      where: { id }
    })
  }

  // Get user statistics
  async getUserStats(): Promise<{
    total: number
    admins: number
    users: number
  }> {
    const [total, admins, users] = await Promise.all([
      prisma.public_users.count(),
      prisma.public_users.count({ where: { user_type: 'admin' } }),
      prisma.public_users.count({ where: { user_type: 'user' } })
    ])

    return {
      total,
      admins,
      users
    }
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.public_users.findUnique({
      where: { id: userId },
      select: { user_type: true }
    })

    return user?.user_type === 'admin'
  }
}

// Export a singleton instance
export const prismaUserService = new PrismaUserService()
