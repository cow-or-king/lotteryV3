/**
 * Health Check Endpoint
 * Pour monitoring et load balancers
 */

import { prisma } from '@/infrastructure/database/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '3.0.0',
      database: 'connected',
      environment: process.env.NODE_ENV || 'production',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}
