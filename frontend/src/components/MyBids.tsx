import React, { useEffect, useState } from 'react';
import { Handshake, Loader2, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { Button } from './ui/Button';

interface Bid {
  id: string;
  amount: number;
  notes?: string | null;
  status: string;
  createdAt: string;
  load?: {
    title?: string;
    origin?: string;
    destination?: string;
    weightKg?: number;
    suggestedBudget?: number | null;
  };
}

export default function MyBids() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBids = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/bids/my-bids');
      setBids(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to retrieve your bids.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBids();
  }, []);

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Handshake size={22} className="text-brand-600" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">My Bids</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">View and monitor every bid you have submitted.</p>
        </div>
        <Button type="button" onClick={() => void loadBids()} disabled={loading} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 dark:border-slate-700 dark:bg-slate-900">
          <Loader2 className="animate-spin text-brand-600" size={24} />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>
      ) : bids.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <Handshake className="mx-auto mb-3 text-slate-400" size={30} />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No bids submitted yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Find an available load and submit your first bid.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map((bid) => (
            <article key={bid.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-slate-900 dark:text-white">{bid.load?.title || 'Load'}</h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{bid.load?.origin || 'Origin'} → {bid.load?.destination || 'Destination'}</p>
                  {bid.load?.weightKg != null && <p className="mt-1 text-[11px] text-slate-500">{Number(bid.load.weightKg).toLocaleString()} kg</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${bid.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : bid.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{bid.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your bid</div>
                  <div className="text-lg font-black text-brand-600">₦{Number(bid.amount).toLocaleString()}</div>
                </div>
                {bid.load?.suggestedBudget != null && <div className="text-right"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggested budget</div><div className="text-sm font-bold text-slate-700 dark:text-slate-200">₦{Number(bid.load.suggestedBudget).toLocaleString()}</div></div>}
              </div>
              {bid.notes && <p className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{bid.notes}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
