import React, { useState } from 'react';
import { ToggleRight, Search, Zap, CheckCircle2, XCircle, Users, Activity, Settings, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  audience: 'ALL' | 'BETA_USERS' | 'INTERNAL_ONLY' | 'PREMIUM_ONLY';
  lastUpdated: string;
}

const MOCK_FEATURES: FeatureFlag[] = [
  { id: 'FF-001', name: 'AI Load Matching v2', description: 'Upgraded algorithm for matching loads with transporters.', enabled: true, rolloutPercentage: 100, audience: 'ALL', lastUpdated: '2 days ago' },
  { id: 'FF-002', name: 'Dark Mode UI', description: 'Experimental dark mode theme for the transporter mobile app.', enabled: true, rolloutPercentage: 25, audience: 'BETA_USERS', lastUpdated: '5 hours ago' },
  { id: 'FF-003', name: 'Crypto Escrow Payments', description: 'Allow payments and payouts using stablecoins.', enabled: false, rolloutPercentage: 0, audience: 'INTERNAL_ONLY', lastUpdated: '1 week ago' },
  { id: 'FF-004', name: 'Advanced Fleet Analytics', description: 'Deep insights into fleet performance and fuel consumption.', enabled: true, rolloutPercentage: 100, audience: 'PREMIUM_ONLY', lastUpdated: '3 days ago' },
  { id: 'FF-005', name: 'In-App Voice Calls', description: 'VoIP calling between shippers and drivers without exposing phone numbers.', enabled: false, rolloutPercentage: 10, audience: 'BETA_USERS', lastUpdated: '1 month ago' },
];

export default function AdminFeatureManagement() {
  const [features, setFeatures] = useState<FeatureFlag[]>(MOCK_FEATURES);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL_FILTERS');

  const filteredFeatures = features.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAudience = audienceFilter === 'ALL_FILTERS' || f.audience === audienceFilter;
    return matchSearch && matchAudience;
  });

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'ALL': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">All Users</span>;
      case 'BETA_USERS': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Beta Users</span>;
      case 'INTERNAL_ONLY': return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Internal Only</span>;
      case 'PREMIUM_ONLY': return <span className="bg-brand-100 text-brand-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Premium Only</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ToggleRight className="text-brand-600" /> Feature Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Control feature flags, manage phased rollouts, and enable beta programs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <ToggleRight size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Total Features</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{features.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Active Flags</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{features.filter(f => f.enabled).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Beta Features</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{features.filter(f => f.audience === 'BETA_USERS').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">A/B Tests</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">2</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit overflow-x-auto hide-scrollbar">
            {['ALL_FILTERS', 'ALL', 'BETA_USERS', 'INTERNAL_ONLY', 'PREMIUM_ONLY'].map(aud => (
              <Button
                key={aud}
                onClick={() => setAudienceFilter(aud)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  audienceFilter === aud 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {aud === 'ALL_FILTERS' ? 'All Features' : aud.replace('_', ' ')}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search features..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse animate-fade-in">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feature</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rollout</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Audience</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFeatures.map(feature => (
                <tr key={feature.id || feature?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{feature.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">{feature.description}</div>
                    <div className="font-mono text-[10px] text-slate-400 dark:text-slate-400 mt-1">{feature.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${feature.enabled ? 'bg-brand-500' : 'bg-slate-300'}`} style={{ width: `${feature.rolloutPercentage}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-400">{feature.rolloutPercentage}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getAudienceBadge(feature.audience)}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {feature.lastUpdated}
                  </td>
                  <td className="p-4">
                    <Button 
                      onClick={() => toggleFeature(feature.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${feature.enabled ? 'bg-brand-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${feature.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </Button>
                  </td>
                  <td className="p-4 text-right">
                    <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-brand-50">
                      <Settings size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredFeatures.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No features found matching your criteria.
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
