import React, { useState } from 'react';
import { Database, RefreshCw, Plus, Radio, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { Button } from './ui/Button';

export default function AdminOverviewTab({
  currentRole,
  addLog,
  metrics,
  dashboardError
}: {
  currentRole: string;
  addLog: (msg: string, type: 'info' | 'success' | 'warn' | 'error') => void;
  metrics: any;
  dashboardError?: string | null;
}) {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState('ALL');

  const handleCreateBroadcast = async () => {
    if (!broadcastTitle) {
      addLog('Broadcast title is required', 'warn');
      return;
    }
    try {
      addLog('Broadcasting notification to live network...', 'info');
      await api.post('/announcements/broadcast', {
        title: broadcastTitle,
        category: broadcastCategory,
        severity: broadcastCategory === 'Security Notice' ? 'HIGH' : 'NORMAL'
      });
      addLog(`Broadcast successfully distributed across node clusters.`, 'success');
      setBroadcastTitle('');
    } catch (error: any) {
      addLog((typeof error.response?.data?.error === 'object' ? JSON.stringify(error.response?.data?.error) : error.response?.data?.error) || 'Failed to dispatch broadcast', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {dashboardError && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-4 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-bold text-sm">Data Unavailable</h3>
            <p className="text-xs">{dashboardError}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Total System Revenue</p>
              <h2 className="text-3xl font-black">₦{(metrics.totalRevenue || metrics.escrowTotal || 0).toLocaleString()}</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 dark:text-slate-400">Escrow Held Funds</span>
                <span className="font-bold">₦{((metrics.totalRevenue || metrics.escrowTotal || 0) * 0.4).toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 w-[40%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 dark:text-slate-400">Available Payouts</span>
                <span className="font-bold">₦{((metrics.totalRevenue || metrics.escrowTotal || 0) * 0.6).toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[60%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-">Database Engine</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Supabase PG
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-">AI Logic Layer</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Gemini Pro
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-">Location Services</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {currentRole === 'ADMIN' && (
          <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-md space-y-4 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <Radio className="text-emerald-500" size={20} /> Broadcast Announcements
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate- mb-6">Instantly push live network-wide notifications to all customer and transporter dashboards.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-">Broadcast Title</label>
                    <input 
                      type="text" 
                      value={broadcastTitle}
                      onChange={e => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Traffic Bottleneck Alert" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 text-slate-900 dark:text-white placeholder:text-slate-600 dark:text-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-">Category Tag</label>
                    <select 
                      value={broadcastCategory}
                      onChange={e => setBroadcastCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 text-slate-900 dark:text-white"
                    >
                      <option value="ALL">General Broadcast</option>
                      <option value="Route Disruption">Route Disruption</option>
                      <option value="Port Delay">Port Delay</option>
                      <option value="Security Notice">Security Notice</option>
                      <option value="System Update">System Update</option>
                    </select>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateBroadcast} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Radio size={16} /> Broadcast to Network
                </Button>
              </div>
            </div>
          </>
        )}
          </div>
    </div>
    </div>
  );
}
