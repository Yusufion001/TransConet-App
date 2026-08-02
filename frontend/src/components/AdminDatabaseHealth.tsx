import React from 'react';
import { Database, Activity, Server, RefreshCw, AlertCircle, CheckCircle2, Shield, Cloud, CreditCard, Mail, MessageSquare, Bot, Map, Cpu, FileBox, Archive, HardDrive } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

export default function AdminDatabaseHealth() {
  const { data: health, loading, mutate: fetchHealth } = useAdminLiveData<any>({
    endpoint: '/admin/health',
    queryKey: 'admin-health-metrics',
    mockData: null,
    autoRefreshInterval: 30000
  });

  const getIconForService = (name: string) => {
    switch (name) {
      case 'PostgreSQL': return <Database size={16} className="text-slate-500" />;
      case 'Redis': return <HardDrive size={16} className="text-slate-500" />;
      case 'Supabase': return <Cloud size={16} className="text-slate-500" />;
      case 'Backend API': return <Server size={16} className="text-slate-500" />;
      case 'Authentication Service': return <Shield size={16} className="text-slate-500" />;
      case 'Payment Gateway': return <CreditCard size={16} className="text-slate-500" />;
      case 'Email Service': return <Mail size={16} className="text-slate-500" />;
      case 'SMS Service': return <MessageSquare size={16} className="text-slate-500" />;
      case 'AI Services': return <Bot size={16} className="text-slate-500" />;
      case 'Maps/GPS': return <Map size={16} className="text-slate-500" />;
      case 'WebSocket Server': return <Activity size={16} className="text-slate-500" />;
      case 'Background Workers': return <Cpu size={16} className="text-slate-500" />;
      case 'File Storage': return <FileBox size={16} className="text-slate-500" />;
      case 'Backup Service': return <Archive size={16} className="text-slate-500" />;
      default: return <Server size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="text-emerald-600" size={20} /> System Health Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Live monitoring of all core infrastructure and third-party services
            </p>
          </div>
          <div className="flex items-center gap-4">
            {health && (
              <span className="text-xs text-slate-500 font-mono">
                Uptime: {Math.floor((health.uptime || 0) / 86400)}d {Math.floor(((health.uptime || 0) % 86400) / 3600)}h
              </span>
            )}
            <Button aria-label="Refresh Health" onClick={fetchHealth} disabled={loading} className="text-slate-500 hover:text-emerald-600 transition-colors">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {!health ? (
          <div className="h-40 flex items-center justify-center">
            <RefreshCw className="animate-spin text-slate-400" size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {health.services?.map((svc: any) => (
              <div key={svc.name} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getIconForService(svc.name)}
                    <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{svc.name}</h4>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Status</span>
                    {svc.status === 'online' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 size={12} /> ONLINE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                        <AlertCircle size={12} /> OFFLINE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Latency</span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {svc.latency}ms
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
