import React, { useState, useEffect } from 'react';
import { Handshake, Link as LinkIcon, Shield, CreditCard, Activity, CheckCircle2, AlertTriangle, Settings, RefreshCw, Key, Power, Search, MessageSquare, MapPin, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

interface Partner {
  id: string;
  name: string;
  type: 'INSURANCE' | 'PAYMENT' | 'TRACKING' | 'IDENTITY' | 'SMS';
  status: 'ACTIVE' | 'DEGRADED' | 'MAINTENANCE' | 'INACTIVE';
  uptime: string;
  apiCalls: string;
  lastSync: string;
}

export default function AdminPartnerManagement() {
  const { data: partnerData, loading, mutate } = useAdminLiveData<any>({
    endpoint: '/admin/partners',
    queryKey: 'admin-partners',
    mockData: { partners: [], totalActive: 0, totalDegraded: 0, totalMaintenance: 0 }
  });

  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    if (partnerData?.partners) {
      setPartners(partnerData.partners);
    }
  }, [partnerData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredPartners = partners.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' || p.type === filterType;
    return matchSearch && matchType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Active</span>;
      case 'DEGRADED': return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><AlertTriangle size={12} /> Degraded</span>;
      case 'MAINTENANCE': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Settings size={12} className="animate-spin" /> Maintenance</span>;
      case 'INACTIVE': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate- px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Power size={12} /> Inactive</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT': return <CreditCard size={18} className="text-emerald-500" />;
      case 'IDENTITY': return <Shield size={18} className="text-indigo-500" />;
      case 'INSURANCE': return <Handshake size={18} className="text-blue-500" />;
      case 'SMS': return <MessageSquare size={18} className="text-amber-500" />;
      case 'TRACKING': return <MapPin size={18} className="text-pink-500" />;
      default: return <LinkIcon size={18} />;
    }
  };

  if (loading && partners.length === 0) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Handshake className="text-indigo-600" /> Partner Management
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage 3rd-party integrations, API health, and vendor configurations.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          <LinkIcon size={16} /> Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <LinkIcon size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Active Integrations</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">14</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Avg. API Uptime</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">99.8%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <RefreshCw size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">API Calls (24h)</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">6.8M</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Degraded Services</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">1</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit overflow-x-auto hide-scrollbar">
            {['ALL', 'PAYMENT', 'IDENTITY', 'INSURANCE', 'SMS', 'TRACKING'].map(type => (
              <Button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === type 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Partners' : type}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search integrations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse animate-fade-in">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Partner & Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Uptime (30d)</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">API Volume</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Last Sync</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.map(partner => (
                <tr key={partner.id || partner?.id || Math.random()} className="hover:bg-blue-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        {getTypeIcon(partner.type)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{partner.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate- mt-0.5">{partner.type} Integration</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(partner.status)}
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate- font-bold">
                    {partner.uptime}
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-">
                    {partner.apiCalls} <span className="text-xs font-sans font-normal text-slate-400 dark:text-slate-400">calls</span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-">
                    {partner.lastSync}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50" title="API Keys">
                        <Key size={16} />
                      </Button>
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50" title="Settings">
                        <Settings size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-">
                    No partner integrations found matching your criteria.
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
