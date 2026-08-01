import React, { useState, useEffect } from 'react';
import { Megaphone, Percent, Target, TrendingUp, Users, Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

interface Campaign {
  id: string;
  name: string;
  type: 'PROMOTION' | 'DISCOUNT' | 'REFERRAL' | 'SEASONAL' | 'ACQUISITION';
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'PAUSED';
  startDate?: string;
  endDate?: string;
  budget: number | string;
  spent: number | string;
  conversions: number;
  roas?: string;
}

export default function AdminMarketingCenter() {
  const { data: marketingData, loading } = useAdminLiveData<any>({
    endpoint: '/admin/marketing',
    queryKey: 'admin-marketing',
    mockData: { campaigns: [], totalActive: 0, totalSpent: '$0', acquisitions: 0 }
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (marketingData?.campaigns) {
      setCampaigns(marketingData.campaigns);
    }
  }, [marketingData]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredCampaigns = campaigns.filter(c => filterStatus === 'ALL' || c.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><PlayCircle size={10} /> Active</span>;
      case 'SCHEDULED': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Calendar size={10} /> Scheduled</span>;
      case 'COMPLETED': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate- px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle2 size={10} /> Completed</span>;
      case 'PAUSED': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Clock size={10} /> Paused</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'PROMOTION': return <Megaphone size={16} className="text-indigo-500" />;
      case 'DISCOUNT': return <Percent size={16} className="text-emerald-500" />;
      case 'REFERRAL': return <Users size={16} className="text-blue-500" />;
      case 'SEASONAL': return <Target size={16} className="text-amber-500" />;
      default: return <Megaphone size={16} />;
    }
  };

  if (loading && campaigns.length === 0) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Megaphone className="text-indigo-600" /> Marketing Center
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage campaigns, promotions, referrals, and track marketing ROI.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          <Plus size={16} /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Megaphone size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Active Campaigns</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">3</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Target size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Total Conversions</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">1,757</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Avg. CAC</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">$23.50</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Percent size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Budget Utilized</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">46%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-x-auto hide-scrollbar">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            {['ALL', 'ACTIVE', 'SCHEDULED', 'COMPLETED', 'PAUSED'].map(status => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === status 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Campaigns' : status}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse animate-fade-in">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Campaign</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Budget / Spent</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Conversions</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map(campaign => (
                <tr key={campaign.id || campaign?.id || Math.random()} className="hover:bg-blue-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{campaign.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate- mt-1 flex items-center gap-1">
                      {getTypeIcon(campaign.type)} {campaign.type}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-">
                    <div>{campaign.startDate}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-400">to {campaign.endDate}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm text-slate-800 dark:text-slate- font-bold">${campaign.budget.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 dark:text-slate- mt-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(Number(campaign.spent) / Number(campaign.budget)) * 100}%` }}></div>
                      </div>
                      ${campaign.spent.toLocaleString()} spent
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{campaign.conversions.toLocaleString()}</div>
                    {Number(campaign.spent) > 0 && campaign.conversions > 0 ? (
                      <div className="text-xs text-slate-500 dark:text-slate- mt-0.5">${(Number(campaign.spent) / Number(campaign.conversions)).toFixed(2)} CAC</div>
                    ) : null}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50">
                        <Edit2 size={16} />
                      </Button>
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-">
                    No campaigns found matching your filters.
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
