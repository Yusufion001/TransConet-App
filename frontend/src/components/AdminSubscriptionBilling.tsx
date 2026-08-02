import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { CreditCard, TrendingUp, Users, Activity, Search, Filter, Download, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface Subscriber {
  id: string;
  name: string;
  type: 'SHIPPER' | 'TRANSPORTER';
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  amount: number;
  nextBilling: string;
}

const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 'SUB-1092', name: 'Global Freight Ltd', type: 'SHIPPER', plan: 'ENTERPRISE', status: 'ACTIVE', amount: 499.00, nextBilling: 'Nov 1, 2023' },
  { id: 'SUB-1093', name: 'Mike Express Trucks', type: 'TRANSPORTER', plan: 'PRO', status: 'ACTIVE', amount: 49.00, nextBilling: 'Oct 28, 2023' },
  { id: 'SUB-1094', name: 'Swift Delivery Co.', type: 'TRANSPORTER', plan: 'BASIC', status: 'PAST_DUE', amount: 19.00, nextBilling: 'Oct 15, 2023' },
  { id: 'SUB-1095', name: 'Mega Supply Chain', type: 'SHIPPER', plan: 'ENTERPRISE', status: 'CANCELED', amount: 499.00, nextBilling: '-' },
  { id: 'SUB-1096', name: 'City Movers', type: 'TRANSPORTER', plan: 'PRO', status: 'ACTIVE', amount: 49.00, nextBilling: 'Nov 5, 2023' },
];

export default function AdminSubscriptionBilling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'ALL' | 'BASIC' | 'PRO' | 'ENTERPRISE'>('ALL');

  const { data: subscribersData, loading, error, isOffline, refetch } = useAdminLiveData<Subscriber[]>({
    endpoint: '/admin/subscriptions',
    queryKey: 'admin_subscriptions',
    autoRefreshInterval: 30000,
    socketEvent: 'subscription_updated',
    mockData: MOCK_SUBSCRIBERS
  });

  const subscribers = subscribersData || [];


  const filteredSubscribers = subscribers.filter(sub => {
    const matchSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = filterPlan === 'ALL' || sub.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle2 size={10} /> Active</span>;
      case 'PAST_DUE': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><AlertCircle size={10} /> Past Due</span>;
      case 'CANCELED': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate- px-2 py-0.5 rounded-full text-[10px] font-black uppercase w-fit">Canceled</span>;
      default: return null;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Enterprise</span>;
      case 'PRO': return <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-md text-[10px] font-bold">Pro</span>;
      case 'BASIC': return <span className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate- border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">Basic</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="text-brand-600" /> Subscription & Billing
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage recurring revenue, subscriber plans, and billing issues.</p>
        </div>
        <Button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate- hover:bg-brand-50 cursor-pointer hover:shadow-sm px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          <Download size={16} /> Export Report
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} className="mr-1" /> +12.5%
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-500 dark:text-slate- text-sm">Monthly Recurring Revenue</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">$124,500</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Users size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} className="mr-1" /> +4.2%
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-500 dark:text-slate- text-sm">Active Subscribers</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">3,492</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} className="mr-1" /> +1.1%
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-500 dark:text-slate- text-sm">Past Due Accounts</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">142</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Activity size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <ArrowDownRight size={14} className="mr-1" /> -0.4%
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-500 dark:text-slate- text-sm">Churn Rate (30d)</h3>
            <p className="text-3xl font-black text-slate-900 dark:text-white">2.1%</p>
          </div>
        </div>
      </div>

      {/* Subscriber List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            {['ALL', 'BASIC', 'PRO', 'ENTERPRISE'].map(plan => (
              <Button
                key={plan}
                onClick={() => setFilterPlan(plan as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterPlan === plan 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {plan === 'ALL' ? 'All Plans' : plan}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search subscribers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Subscriber</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Plan</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Next Billing</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscribers.map(sub => (
                <tr key={sub.id || sub?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{sub.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate- mt-0.5">{sub.type} • {sub.id}</div>
                  </td>
                  <td className="p-4">
                    {getPlanBadge(sub.plan)}
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-700 dark:text-slate-">
                    ${sub.amount.toFixed(2)}<span className="text-xs text-slate-400 dark:text-slate-400">/mo</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(sub.status)}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-">
                    {sub.nextBilling}
                  </td>
                  <td className="p-4 text-right">
                    <Button className="text-brand-600 hover:text-brand-800 font-bold text-xs bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate- bg-white dark:bg-slate-900">
                    No subscribers found matching your criteria.
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
