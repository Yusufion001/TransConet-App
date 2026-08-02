import React, { useState } from 'react';
import { Search, FileText, UserCheck, Shield, AlertTriangle } from 'lucide-react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

export default function AdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading } = useAdminLiveData<any[]>({
    endpoint: '/admin/audit-logs',
    queryKey: 'admin-audit-logs',
    mockData: [
      { id: '1', title: 'Role Elevated', user: 'yusufjimoh969@gmail.com', description: '2348104352733', timestamp: new Date().toISOString(), type: 'SECURITY' },
      { id: '2', title: 'Payout Approved', user: 'admin@transconet.com', description: 'Escrow TX-9921', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'FINANCE' },
      { id: '3', title: 'Vehicle Verified', user: 'yusufjimoh969@gmail.com', description: 'Vehicle KJA-123XD', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'COMPLIANCE' },
    ]
  });

  const logs = data || [];

  const filteredLogs = logs.filter(log => 
    (log.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (log.user || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-slate-600 dark:text-slate-" size={20} /> System Audit Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate- mt-1">Immutable trail of all administrative actions</p>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
          <input 
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-slate-400 w-full md:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 font-bold">
              <th className="pb-3 pr-4">Action</th>
              <th className="pb-3 px-4">Performed By</th>
              <th className="pb-3 px-4">Target / Details</th>
              <th className="pb-3 pl-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.map(log => (
              <tr key={log.id || log?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800 animate-fade-in">
                <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-">
                  <div className="flex items-center gap-2">
                    {log.type === 'SECURITY' && <Shield size={14} className="text-brand-500" />}
                    {log.type === 'FINANCE' && <AlertTriangle size={14} className="text-amber-500" />}
                    {log.type === 'COMPLIANCE' && <UserCheck size={14} className="text-brand-500" />}
                    {(!log.type || log.type === 'SYSTEM' || log.type === 'INFO') && <FileText size={14} className="text-slate-500 dark:text-slate-" />}
                    {log.title}
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate- font-mono text-xs">{log.user || 'System'}</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate- text-xs truncate max-w-[200px]" title={typeof log.description === 'string' ? log.description : JSON.stringify(log.description)}>
                  {typeof log.description === 'string' ? log.description : JSON.stringify(log.description)}
                </td>
                <td className="py-3 pl-4 text-right text-xs text-slate-500 dark:text-slate-">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && filteredLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate- text-sm">
                  No logs found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
