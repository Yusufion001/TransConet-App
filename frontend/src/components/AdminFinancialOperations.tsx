import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { Wallet, DollarSign, ArrowRightLeft, Download, Search, FileText, CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import { Button } from './ui/Button';

interface Transaction {
  id: string;
  type: 'ESCROW_DEPOSIT' | 'PAYOUT' | 'COMMISSION' | 'REFUND';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'HELD';
  date: string;
  user: string;
  reference: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TRX-10029', type: 'ESCROW_DEPOSIT', amount: 450000, status: 'HELD', date: 'Just now', user: 'Global Freight Ltd', reference: 'LD-9021' },
  { id: 'TRX-10028', type: 'PAYOUT', amount: 320000, status: 'PENDING', date: '2 hours ago', user: 'Samuel Ojo (Driver)', reference: 'PO-8821' },
  { id: 'TRX-10027', type: 'COMMISSION', amount: 15000, status: 'COMPLETED', date: '5 hours ago', user: 'System', reference: 'FEE-LD-9020' },
  { id: 'TRX-10026', type: 'REFUND', amount: 50000, status: 'COMPLETED', date: '1 day ago', user: 'Tech Supply Co', reference: 'REF-LD-8890' },
  { id: 'TRX-10025', type: 'PAYOUT', amount: 180000, status: 'FAILED', date: '1 day ago', user: 'Mike Express Trucks', reference: 'PO-8819' },
];

export default function AdminFinancialOperations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ESCROW_DEPOSIT' | 'PAYOUT' | 'COMMISSION' | 'REFUND'>('ALL');

  const { data: transactionsData, loading, error, isOffline, refetch } = useAdminLiveData<Transaction[]>({
    endpoint: '/admin/transactions',
    queryKey: 'admin_transactions',
    autoRefreshInterval: 30000,
    socketEvent: 'transaction_updated',
    mockData: MOCK_TRANSACTIONS
  });

  const transactions = transactionsData || [];


  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.user.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === 'ALL' || t.type === activeTab;
    return matchSearch && matchTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><CheckCircle size={10} /> Completed</span>;
      case 'PENDING': return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Clock size={10} /> Pending</span>;
      case 'FAILED': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><XCircle size={10} /> Failed</span>;
      case 'HELD': return <span className="bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Briefcase size={10} /> In Escrow</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'ESCROW_DEPOSIT': return <Briefcase size={16} className="text-brand-500" />;
      case 'PAYOUT': return <ArrowUpRight size={16} className="text-brand-500" />;
      case 'COMMISSION': return <DollarSign size={16} className="text-emerald-500" />;
      case 'REFUND': return <ArrowDownRight size={16} className="text-amber-500" />;
      default: return <ArrowRightLeft size={16} />;
    }
  };

  const getAmountColor = (type: string) => {
    if (type === 'COMMISSION' || type === 'ESCROW_DEPOSIT') return 'text-emerald-600';
    return 'text-slate-900 dark:text-white';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Wallet className="text-brand-600" /> Financial Operations
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage escrow accounts, approve payouts, and track revenue.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate- hover:bg-brand-50 cursor-pointer hover:shadow-sm px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
            <FileText size={16} /> Invoices
          </Button>
          <Button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
            <Download size={16} /> Export Ledger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-slate-300 dark:text-slate-300">
            <div className="p-2 bg-slate-800 rounded-xl">
              <Briefcase size={20} />
            </div>
            <h3 className="font-bold text-sm">Total in Escrow</h3>
          </div>
          <div>
            <p className="text-3xl font-black">₦145.2M</p>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Across 342 active loads</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign size={20} />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Platform Revenue</h3>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">₦24.8M</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1"><ArrowUpRight size={12} /> +12.5% this month</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Pending Payouts</h3>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">₦12.4M</p>
            <p className="text-xs text-slate-500 dark:text-slate- mt-1 font-medium">45 requests awaiting approval</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                <ArrowRightLeft size={20} />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Processed (24h)</h3>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">₦45.1M</p>
            <p className="text-xs text-slate-500 dark:text-slate- mt-1 font-medium">1,204 transactions</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-x-auto hide-scrollbar flex justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit min-w-max">
            {['ALL', 'ESCROW_DEPOSIT', 'PAYOUT', 'COMMISSION', 'REFUND'].map(tab => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-brand-600 text-white shadow-md border border-transparent' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Transactions' : tab.replace('_', ' ')}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search ref or user..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse animate-fade-in">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Transaction ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Type & User</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Loading live transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : null}
              {filteredTransactions.map(trx => (
                <tr key={trx.id || trx?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-mono text-sm text-slate-700 dark:text-slate- font-bold">{trx.id}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-400 font-mono mt-0.5">Ref: {trx.reference}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(trx.type)}
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-">{trx.type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{trx.user}</div>
                  </td>
                  <td className="p-4">
                    <span className={`font-mono font-bold ${getAmountColor(trx.type)}`}>
                      {trx.type === 'PAYOUT' || trx.type === 'REFUND' ? '-' : '+'}₦{trx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(trx.status)}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-">
                    {trx.date}
                  </td>
                  <td className="p-4 text-right">
                    {trx.status === 'PENDING' && trx.type === 'PAYOUT' ? (
                      <div className="flex justify-end gap-2">
                        <Button className="text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">Approve</Button>
                        <Button className="text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Reject</Button>
                      </div>
                    ) : (
                      <Button aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-brand-50" title="View Details">
                         <FileText size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-">
                    No transactions found matching your filters.
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
