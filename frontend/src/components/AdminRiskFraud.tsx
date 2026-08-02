import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, Activity, UserX, Search, Lock, Unlock, Eye, Filter, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface FraudAlert {
  id: string;
  entityName: string;
  entityType: 'USER' | 'TRANSACTION' | 'VEHICLE';
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  status: 'INVESTIGATING' | 'BLOCKED' | 'CLEARED';
  detectedAt: string;
}

import { useAdminLiveData } from '../hooks/useAdminLiveData';
import api from '../api/client';

const MOCK_ALERTS: FraudAlert[] = [
  { id: 'FRD-1029', entityName: 'John Doe (Driver)', entityType: 'USER', riskLevel: 'CRITICAL', reason: 'Multiple failed identity verifications with different photos.', status: 'BLOCKED', detectedAt: '10 mins ago' },
  { id: 'FRD-1028', entityName: 'TRX-99210 (₦1.2M)', entityType: 'TRANSACTION', riskLevel: 'HIGH', reason: 'Unusual payout request to a high-risk offshore account.', status: 'INVESTIGATING', detectedAt: '1 hour ago' },
  { id: 'FRD-1027', entityName: 'Global Cargo Logistics', entityType: 'USER', riskLevel: 'MEDIUM', reason: 'Sudden spike in load cancellations after assignment.', status: 'INVESTIGATING', detectedAt: '3 hours ago' },
];

export default function AdminRiskFraud() {
  const { data, loading, mutate } = useAdminLiveData<FraudAlert[]>({
    endpoint: '/admin/risk-alerts',
    queryKey: 'admin-risk-alerts',
    mockData: MOCK_ALERTS
  });
  
  const alerts = data || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(alert => {
    const matchSearch = alert.entityName.toLowerCase().includes(searchTerm.toLowerCase()) || alert.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = filterLevel === 'ALL' || alert.riskLevel === filterLevel;
    return matchSearch && matchLevel;
  });

  const getRiskBadge = (level: string) => {
    switch(level) {
      case 'CRITICAL': return <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[10px] font-black uppercase">Critical</span>;
      case 'HIGH': return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-black uppercase">High</span>;
      case 'MEDIUM': return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-black uppercase">Medium</span>;
      case 'LOW': return <span className="bg-brand-100 text-brand-800 border border-brand-200 px-2 py-0.5 rounded text-[10px] font-black uppercase">Low</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'BLOCKED': return <span className="text-red-700 bg-red-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Lock size={12} /> Blocked</span>;
      case 'INVESTIGATING': return <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Search size={12} /> Investigating</span>;
      case 'CLEARED': return <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Unlock size={12} /> Cleared</span>;
      default: return null;
    }
  };

  const handleAction = async (id: string, action: 'BLOCK' | 'CLEAR') => {
    try {
      const newStatus = action === 'BLOCK' ? 'BLOCKED' : 'CLEARED';
      
      // Optimistic update
      mutate((prev) => prev ? prev.map(a => a.id === id ? { ...a, status: newStatus } : a) : []);

      await api.patch(`/admin/risk-alerts/${id}/status`, { action });
    } catch (err) {
      console.error('Failed to update alert status', err);
      // Let it refresh on next poll or we can trigger refetch
    }
  };

  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL').length;
  const investigatingCount = alerts.filter(a => a.status === 'INVESTIGATING').length;
  const blockedCount = alerts.filter(a => a.status === 'BLOCKED' && a.entityType === 'USER').length;
  const isHealthy = criticalCount === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-red-600" /> Risk & Fraud Operations
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor suspicious activities, flag high-risk transactions, and protect the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertOctagon size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Critical Alerts</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '-' : criticalCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Active Investigations</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '-' : investigatingCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
              <UserX size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Blocked Accounts</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{loading ? '-' : blockedCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">System Health</h3>
          </div>
          <p className={`text-3xl font-black ${isHealthy ? 'text-emerald-600' : 'text-amber-600'}`}>
            {loading ? '-' : (isHealthy ? 'Secure' : 'Review')}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit overflow-x-auto hide-scrollbar">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
              <Button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterLevel === level 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {level === 'ALL' ? 'All Alerts' : level}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search entity or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse animate-fade-in">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alert ID & Time</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entity Flagged</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk Level</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.map(alert => (
                <tr key={alert.id || alert?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-mono text-sm text-slate-700 dark:text-slate-400 font-bold">{alert.id}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{alert.detectedAt}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{alert.entityName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{alert.entityType}</div>
                  </td>
                  <td className="p-4">
                    {getRiskBadge(alert.riskLevel)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-700 dark:text-slate-400 max-w-xs truncate" title={alert.reason}>
                      {alert.reason}
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(alert.status)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {alert.status !== 'BLOCKED' && (
                        <Button 
                          onClick={() => handleAction(alert.id, 'BLOCK')}
                          className="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Block
                        </Button>
                      )}
                      {alert.status !== 'CLEARED' && (
                        <Button 
                          onClick={() => handleAction(alert.id, 'CLEAR')}
                          className="text-emerald-600 hover:text-emerald-800 font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Clear
                        </Button>
                      )}
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-brand-50" title="View Details">
                         <Eye size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No alerts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
