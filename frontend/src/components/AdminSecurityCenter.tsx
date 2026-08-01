import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, Key, Users, History, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

export default function AdminSecurityCenter() {
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const { data: events, loading } = useAdminLiveData<any[]>({
    endpoint: '/admin/security-events',
    queryKey: 'admin-security-events',
    mockData: [
      { email: 'admin@system.local', ip: '127.0.0.1', time: new Date().toISOString(), status: 'Success' }
    ]
  });

  const recentLogins = events || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security Policies</h2>
              <p className="text-xs text-slate-500 dark:text-slate-">Configure global authentication and access limits</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-slate-500 dark:text-slate-" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate- text-sm">Require MFA for Admins</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-">Enforce Multi-Factor Authentication</p>
                </div>
              </div>
              <Button 
                onClick={() => setMfaEnforced(!mfaEnforced)}
                className={`w-12 h-6 rounded-full transition-colors relative ${mfaEnforced ? 'bg-purple-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 bg-white dark:bg-slate-900 w-4 h-4 rounded-full transition-transform ${mfaEnforced ? 'left-7' : 'left-1'}`} />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Key size={18} className="text-slate-500 dark:text-slate-" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate- text-sm">Session Timeout</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-">Auto-logout idle sessions</p>
                </div>
              </div>
              <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate- focus:outline-none focus:border-purple-500">
                <option>15 Minutes</option>
                <option>30 Minutes</option>
                <option>1 Hour</option>
                <option>4 Hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Admin Logins</h2>
              <p className="text-xs text-slate-500 dark:text-slate-">Monitor super-admin access records</p>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
               <div className="p-4 text-center text-sm text-slate-500">Loading security events...</div>
            ) : recentLogins.map((log, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 animate-fade-in">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate- text-xs">{log.email}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate- font-mono mt-0.5">{log.ip} &bull; {new Date(log.time).toLocaleString()}</p>
                </div>
                {log.status === 'Success' ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase">{log.status}</span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded uppercase">{log.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
