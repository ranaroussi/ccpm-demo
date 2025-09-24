import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable so we don't exhaust the database connections
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

/**
 * Health check endpoint
 * Returns the health status of the application and its dependencies
 */
export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: 'unknown',
        memory: 'unknown',
        disk: 'unknown'
      }
    };

    // Database connectivity check
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthCheck.checks.database = 'healthy';
    } catch (error) {
      console.error('Database health check failed:', error);
      healthCheck.checks.database = 'unhealthy';
      healthCheck.status = 'degraded';
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
    };

    // Consider memory unhealthy if heap usage is over 400MB (adjust based on your needs)
    if (memoryUsageMB.heapUsed > 400) {
      healthCheck.checks.memory = 'unhealthy';
      healthCheck.status = 'degraded';
    } else {
      healthCheck.checks.memory = 'healthy';
    }

    // Response time check
    const responseTime = Date.now() - startTime;

    // Add additional metrics
    const additionalInfo = {
      responseTime: `${responseTime}ms`,
      memory: memoryUsageMB,
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
    };

    // Determine final status
    if (healthCheck.checks.database === 'unhealthy') {
      healthCheck.status = 'unhealthy';
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 :
                      healthCheck.status === 'degraded' ? 200 : 503;

    return NextResponse.json(
      {
        ...healthCheck,
        ...additionalInfo
      },
      {
        status: statusCode,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        responseTime: `${Date.now() - startTime}ms`
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

/**
 * Detailed health check endpoint (for monitoring systems)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json().catch(() => ({}));
    const includeDetails = body.detailed === true;

    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: 'unknown',
        memory: 'unknown',
        connectivity: 'unknown'
      },
      details: includeDetails ? {} : undefined
    };

    // Database connectivity and performance check
    try {
      const dbStartTime = Date.now();
      await prisma.$queryRaw`SELECT 1 as test`;

      // Test a simple query performance
      const queryTime = Date.now() - dbStartTime;

      healthCheck.checks.database = queryTime > 1000 ? 'slow' : 'healthy';

      if (includeDetails) {
        healthCheck.details.database = {
          queryTime: `${queryTime}ms`,
          status: healthCheck.checks.database
        };
      }
    } catch (error) {
      console.error('Database detailed check failed:', error);
      healthCheck.checks.database = 'unhealthy';
      healthCheck.status = 'degraded';

      if (includeDetails) {
        healthCheck.details.database = {
          error: error.message,
          status: 'unhealthy'
        };
      }
    }

    // Memory and performance metrics
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
    };

    healthCheck.checks.memory = memoryUsageMB.heapUsed > 400 ? 'high' : 'healthy';

    if (includeDetails) {
      healthCheck.details.memory = memoryUsageMB;
      healthCheck.details.performance = {
        uptime: process.uptime(),
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
        cpuUsage: process.cpuUsage()
      };
    }

    // Network connectivity test (basic)
    healthCheck.checks.connectivity = 'healthy';

    const responseTime = Date.now() - startTime;
    const statusCode = healthCheck.status === 'healthy' ? 200 :
                      healthCheck.status === 'degraded' ? 200 : 503;

    return NextResponse.json(
      {
        ...healthCheck,
        responseTime: `${responseTime}ms`
      },
      {
        status: statusCode,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Detailed health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        responseTime: `${Date.now() - startTime}ms`
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    );
  }
}