// src/db/prismaRLS.ts
import { AsyncLocalStorage } from 'async_hooks';
import { prismaBypass } from './prisma';

// Assuming you set this in a middleware based on the JWT
export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

export const prismaRLS = prismaBypass.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        // 1. Identify if this is a mutation (Write)
        const isMutation = ['create', 'update', 'delete', 'upsert'].includes(operation);
        
        // 2. Fetch the session state
        const session = tenantContext.getStore();

        // 3. Only pay the Transaction Tax if it's a mutation AND we have a tenant
        if (isMutation && session?.tenantId) {
          return prismaBypass.$transaction(async (tx) => {
            // Inject Supabase/Postgres RLS context safely
            await tx.$executeRaw`SELECT set_config('app.current_tenant', ${session.tenantId}, TRUE)`;
            return query(args);
          });
        }

        // 4. Fallback for reads (Ensure you still pass tenantId in the args elsewhere!)
        return query(args);
      }
    }
  }
});
