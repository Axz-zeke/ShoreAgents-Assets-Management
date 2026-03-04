import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [assets, users, maintenance] = await Promise.all([
      prisma.assets.findMany({
        orderBy: { created_at: 'desc' }
      }),
      prisma.public_users.findMany({
        orderBy: { created_at: 'desc' }
      }),
      prisma.maintenance_records.findMany({
        orderBy: { created_at: 'desc' }
      })
    ]);

    return NextResponse.json({
      assets,
      users,
      maintenance
    });
  } catch (error) {
    console.error('Database viewer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

