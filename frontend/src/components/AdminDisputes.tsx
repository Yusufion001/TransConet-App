import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, FileText, ArrowRight, Wallet } from 'lucide-react';
import { Button } from './ui/Button';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([
    { id: 'DSP-091', trip: 'TR-1020', reporter: 'Customer', issue: 'Cargo damaged upon arrival', amount: 85000, status: 'OPEN' },
    { id: 'DSP-092', trip: 'TR-1011', reporter: 'Transporter', issue: 'Customer refusing to release escrow after delivery', amount: 120000, status: 'INVESTIGATING' }
  ]);

  const handleResolve = (id: string, action: 'REFUND_CUSTOMER' | 'RELEASE_TRANSPORTER') => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: 'RESOLVED' } : d));
    alert(`Dispute ${id} resolved: ${action === 'REFUND_CUSTOMER' ? 'Escrow refunded to customer.' : 'Escrow released to transporter.'}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="text-rose-500" /> Dispute & Escrow Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review tickets, manage escrow holds, and issue resolutions.</p>
        </div>
      </div>

      <div className="space-y-4">
        {disputes.map(dispute => (
          <div key={dispute.id} className={`border p-4 rounded-2xl ${dispute.status === 'RESOLVED' ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50/30'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {dispute.id} <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Trip: {dispute.trip}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1"><span className="font-bold">Reported by:</span> {dispute.reporter}</p>
                <p className="text-sm text-slate-800 dark:text-slate-400 font-medium mt-1">"{dispute.issue}"</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Escrow Value</p>
                <p className="font-black text-lg text-slate-900 dark:text-white">₦{dispute.amount.toLocaleString()}</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${dispute.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {dispute.status}
                </span>
              </div>
            </div>

            {dispute.status !== 'RESOLVED' && (
              <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700/50 mt-3">
                <Button onClick={() => handleResolve(dispute.id, 'REFUND_CUSTOMER')} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-400 hover:bg-brand-50 cursor-pointer hover:shadow-sm flex items-center justify-center gap-1">
                  <ArrowRight size={14} className="text-rose-500" /> Refund Customer
                </Button>
                <Button onClick={() => handleResolve(dispute.id, 'RELEASE_TRANSPORTER')} className="flex-1 bg-brand-600 border border-brand-600 py-2 rounded-xl text-xs font-bold text-white hover:bg-brand-700 flex items-center justify-center gap-1">
                  Release to Transporter <Wallet size={14} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
