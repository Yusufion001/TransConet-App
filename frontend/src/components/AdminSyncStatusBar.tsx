import React from 'react';
import { Radio, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

export const AdminSyncStatusBar = ({ 
  lastSyncedTime, 
  isSyncing, 
  onSync 
}: { 
  lastSyncedTime: string; 
  isSyncing: boolean; 
  onSync: () => void 
}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
        <Radio size={18} className="animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">Real-Time Data Engine Active</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            10s Auto-Poll
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Last synchronized: <span className="font-bold text-slate-700 dark:text-slate-400">{lastSyncedTime}</span> • Live PostgreSQL & Supabase Feed
        </p>
      </div>
    </div>
    <Button
      onClick={onSync}
      disabled={isSyncing}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
    >
      <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
      {isSyncing ? "Syncing Network..." : "Force Sync Data"}
    </Button>
  </div>
);
