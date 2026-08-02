import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// AsyncLocalStorage tracks the current request's user context across asynchronous boundaries (Express routes)
export const rlsContext = new AsyncLocalStorage<{ userId: string; role: string }>();

const rawConnectionString = process.env.DATABASE_URL || '';
const connectionString = rawConnectionString.replace(/[?&]sslmode=[^&]+/g, '').replace(/&/, (match, offset, str) => str.indexOf('?') === -1 ? '?' : '&');
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);

// Global Prisma singleton to prevent connection pool exhaustion during hot reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// Standard client bypass (no RLS overhead)
export const prismaBypass = prisma;

// Helper for tenant isolation query
export const getTenantQuery = (tenantId: string) => ({
  where: { tenantId }
});

if (process.env.NODE_ENV !== 'production' && prisma) globalForPrisma.prisma = prisma;

/**
 * Prisma Client Extension that automatically injects PostgreSQL Session Variables
 * for true Database-Level Row Security (RLS).
 * 
 * It wraps every query in a transaction that first configures the DB session.
 */
export const prismaRLS = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const store = rlsContext.getStore();
        
        // If there's an authenticated user in the current execution context, inject variables
        if (store?.userId) {
          const [, result] = await prisma!.$transaction([
            prisma!.$executeRaw`
              SELECT 
                set_config('app.current_user_id', ${store.userId}, TRUE), 
                set_config('app.current_role', ${store.role}, TRUE)
            `,
            query(args),
          ]);
          return result;
        }
        
        // Unauthenticated execution (system-level access)
        return query(args);
      },
    },
  },
});
