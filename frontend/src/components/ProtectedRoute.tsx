import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: Array<'owner' | 'admin' | 'shipper' | 'transporter'>;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { session, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-800">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  // If there's no session or their role isn't in the allowedRoles array
  if (!session || !role || !allowedRoles.includes(role)) {
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
