import React, { useState, useEffect } from 'react';
import { Database, HardDrive, Cloud, History, Download, RotateCcw, CheckCircle2, AlertCircle, Clock, PlayCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import api from '../api/client';

interface Backup {
  id: string;
  name: string;
  type: 'AUTOMATED' | 'MANUAL';
  size: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  createdAt: string;
  location: string;
}

export default function AdminBackupRecovery() {
  const { data: backupData, loading } = useAdminLiveData<{backups: Backup[], nextScheduled: string, status: string}>({
    endpoint: '/admin/backup-history',
    queryKey: 'admin-backup-history',
    mockData: { backups: [], nextScheduled: '', status: 'UNKNOWN' }
  });

  const [backups, setBackups] = useState<Backup[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (backupData?.backups) {
      setBackups(backupData.backups);
    }
  }, [backupData]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle2 size={10} /> Completed</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Clock size={10} className="animate-pulse" /> In Progress</span>;
      case 'FAILED': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><AlertCircle size={10} /> Failed</span>;
      default: return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'AUTOMATED': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate- px-2 py-0.5 rounded text-[10px] font-black uppercase">Automated</span>;
      case 'MANUAL': return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Manual</span>;
      default: return null;
    }
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      await api.post('/admin/trigger-backup');
      const newBackup: Backup = {
        id: `BCK-${99013 + Math.floor(Math.random() * 100)}`,
        name: 'Manual Admin Snapshot',
        type: 'MANUAL',
        size: 'Pending',
        status: 'IN_PROGRESS',
        createdAt: 'Just now',
        location: 'AWS S3 (eu-west-1)'
      };
      setBackups([newBackup, ...backups]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading && backups.length === 0) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Database className="text-indigo-600" /> Backup & Recovery
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage database snapshots, system backups, and disaster recovery.</p>
        </div>
        <Button 
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          {isCreating ? <Clock size={16} className="animate-spin" /> : <Plus size={16} />}
          {isCreating ? 'Initiating...' : 'Create Backup'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Last Successful Backup</h3>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-2">Today, 02:00 AM</p>
          <p className="text-xs text-slate-500 dark:text-slate- mt-1">Daily System Snapshot (14.2 GB)</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <HardDrive size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Total Storage Used</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">426.5 GB</p>
          <p className="text-xs text-slate-500 dark:text-slate- mt-1">Across 30 retained snapshots</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Cloud size={20} />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Automated Schedule</h3>
            </div>
            <Button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">Edit</Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-">Daily Snapshot</span>
              <span className="font-bold text-slate-900 dark:text-white">02:00 AM (UTC)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-">Retention</span>
              <span className="font-bold text-slate-900 dark:text-white">30 Days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
          <History size={18} className="text-slate-500 dark:text-slate-" />
          <h3 className="font-bold text-slate-800 dark:text-slate-">Backup History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse animate-fade-in">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Snapshot Name & ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Size & Location</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map(backup => (
                <tr key={backup.id || backup?.id || Math.random()} className="hover:bg-blue-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{backup.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate- font-mono mt-0.5">{backup.id}</div>
                  </td>
                  <td className="p-4">
                    {getTypeBadge(backup.type)}
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-">
                    {backup.createdAt}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-mono text-slate-800 dark:text-slate-">{backup.size}</div>
                    <div className="text-xs text-slate-500 dark:text-slate- mt-0.5">{backup.location}</div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(backup.status)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {backup.status === 'COMPLETED' && (
                        <>
                          <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50" title="Download">
                             <Download size={16} />
                          </Button>
                          <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50" title="Restore from this backup">
                             <RotateCcw size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-">
                    No backups found.
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
