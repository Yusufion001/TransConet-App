import React, { useState } from 'react';
import { Users, CheckCircle2, XCircle, ShieldCheck, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

export default function AdminUserManagement() {
  const [autoVerifyToggle, setAutoVerifyToggle] = useState(true);

  const { data: usersData, loading, error, isOffline, refetch, mutate } = useAdminLiveData<any[]>({
    endpoint: '/admin/users',
    queryKey: 'admin_users',
    autoRefreshInterval: 30000,
    socketEvent: 'user_updated',
  });

  const users = usersData || [];


  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      let newStatus = 'ACTIVE';
      if (currentStatus === 'ACTIVE') newStatus = 'SUSPENDED';
      else if (currentStatus === 'SUSPENDED') newStatus = 'ACTIVE';
      else if (currentStatus === 'PENDING') newStatus = 'ACTIVE';

      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      
      mutate(prev => (prev || []).map(u => {
        if (u.id === id) {
          return { ...u, status: newStatus, docs: newStatus === 'ACTIVE' && u.status === 'PENDING' ? 'Verified' : u.docs };
        }
        return u;
      }));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Error updating user status.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="text-brand-500" /> User & Compliance Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage user accounts, KYC verification statuses, and automated document verifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Auto-Approve KYC Complete</span>
          <Button 
            onClick={() => setAutoVerifyToggle(!autoVerifyToggle)} 
            className={`w-12 h-6 rounded-full relative transition-colors ${autoVerifyToggle ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 left-1 bg-white dark:bg-slate-900 w-4 h-4 rounded-full transition-transform ${autoVerifyToggle ? 'translate-x-6' : ''}`}></span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-xs flex items-center gap-2">
          <AlertTriangle size={14} /> {error?.message || error.toString()}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">Loading compliance profiles...</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">User</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">KYC Level</th>
                  <th className="py-3 px-4 font-bold">Documents</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id || user?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'SHIPPER' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold tracking-widest ${
                        user.verificationLevel === 'LEVEL_3' ? 'bg-brand-100 text-brand-700' :
                        user.verificationLevel === 'LEVEL_2' ? 'bg-brand-100 text-brand-700' :
                        'bg-slate-100 text-slate-600 dark:text-slate-300'
                      }`}>
                        {user.verificationLevel || 'LEVEL_1'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-xs">
                        {user.docs === 'Verified' ? <ShieldCheck size={14} className="text-emerald-500"/> : <Zap size={14} className="text-amber-500"/>}
                        {user.docs}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                        user.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' : 
                        'bg-slate-100 text-slate-700 dark:text-slate-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      {user.status === 'PENDING' ? (
                        <Button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Approve">
                          <CheckCircle2 size={16} />
                        </Button>
                      ) : user.status === 'ACTIVE' ? (
                        <Button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Suspend">
                          <XCircle size={16} />
                        </Button>
                      ) : (
                        <Button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Unsuspend">
                          <CheckCircle2 size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {users.map(user => (
              <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-[20px] shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role === 'SHIPPER' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block mb-1 text-[10px] uppercase">KYC Level</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest ${
                      user.verificationLevel === 'LEVEL_3' ? 'bg-brand-100 text-brand-700' :
                      user.verificationLevel === 'LEVEL_2' ? 'bg-brand-100 text-brand-700' :
                      'bg-slate-100 text-slate-600 dark:text-slate-300'
                    }`}>
                      {user.verificationLevel || 'LEVEL_1'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block mb-1 text-[10px] uppercase">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                      user.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' : 
                      'bg-slate-100 text-slate-700 dark:text-slate-200'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-400">
                    {user.docs === 'Verified' ? <ShieldCheck size={14} className="text-emerald-500"/> : <Zap size={14} className="text-amber-500"/>}
                    {user.docs}
                  </span>
                  <div className="flex gap-2">
                    {user.status === 'PENDING' ? (
                      <Button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Approve">
                        <CheckCircle2 size={16} />
                      </Button>
                    ) : user.status === 'ACTIVE' ? (
                      <Button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Suspend">
                        <XCircle size={16} />
                      </Button>
                    ) : (
                      <Button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Unsuspend">
                        <CheckCircle2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
