import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: Array<'owner' | 'admin' | 'shipper' | 'transporter' | 'customer'>;
};

const normalizeRole = (role: string | null | undefined) =>
  String(role || '').trim().toLowerCase();

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, activeRole } = useAuthStore();
  const role = normalizeRole(activeRole);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4 bg-white dark:bg-slate-900 rounded-[20px] p-8 shadow-sm h-full w-full overflow-hidden">
        <div className="bg-red-500/10 p-5 rounded-full mb-2">
          <ShieldAlert size={56} className="text-red-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black">Authentication Required</h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          Please sign in to access this protected area.
        </p>
      </div>
    );
  }

  if (!allowedRoles.map(normalizeRole).includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4 bg-white dark:bg-slate-900 rounded-[20px] p-8 shadow-sm h-full w-full overflow-hidden">
        <div className="bg-red-500/10 p-5 rounded-full mb-2">
          <ShieldAlert size={56} className="text-red-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          You do not possess the required security credentials to access this protected area.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
