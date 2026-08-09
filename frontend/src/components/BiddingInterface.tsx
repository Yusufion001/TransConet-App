import { Button } from './ui/Button';
import React from 'react';
import { ShieldCheck, DollarSign } from 'lucide-react';

interface BiddingInterfaceProps {
  activeMatch: any;
  negotiationStatus: string;
  isNegotiating: boolean;
  setIsNegotiating: (val: boolean) => void;
  counterPrice: string;
  setCounterPrice: (val: string) => void;
  handleAcceptBid: (isEscrowEnabled: boolean, bidId: string) => void;
  handleCounterOffer: (e: React.FormEvent) => void;
}

export default function BiddingInterface({ activeMatch, negotiationStatus, isNegotiating, setIsNegotiating, counterPrice, setCounterPrice, handleAcceptBid, handleCounterOffer }: BiddingInterfaceProps) {
  if (!activeMatch) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.055)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950"><ShieldCheck size={23} /></div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">{activeMatch.title}</h3>
            <p className="mt-0.5 break-words text-xs leading-5 text-slate-500 dark:text-slate-400">{activeMatch.subtitle}</p>
            {negotiationStatus && <p className="mt-2 w-fit rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">⚠️ {negotiationStatus}</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-brand-600 p-4 text-white shadow-sm sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-brand-100">Suggested Fare</p>
          <p className="mt-1 text-2xl font-black">₦{activeMatch.price?.toLocaleString()}</p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button onClick={() => handleAcceptBid(true, String(activeMatch.id))} className="min-h-11 rounded-xl bg-emerald-500 px-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-400">Accept Deal</Button>
            <a href={`tel:${activeMatch.phone || '+2348000000000'}`} className="flex min-h-11 items-center justify-center rounded-xl bg-white px-3 text-center text-xs font-black uppercase tracking-wider text-brand-700 shadow-sm hover:bg-slate-50">Call to Deal</a>
            <Button onClick={() => setIsNegotiating(!isNegotiating)} className="min-h-11 rounded-xl bg-brand-500 px-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-400">Counter Offer</Button>
          </div>
        </div>
      </div>

      {isNegotiating && (
        <form onSubmit={handleCounterOffer} className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 animate-in slide-in-from-top-2 dark:bg-slate-800/70 dark:ring-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"><DollarSign size={14} className="text-brand-600" /> Propose Your Price (₦)</div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input type="number" required placeholder="e.g., 360000" value={counterPrice} onChange={e => setCounterPrice(e.target.value)} className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            <Button type="submit" className="min-h-12 rounded-xl bg-brand-600 px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-700">Send Offer</Button>
          </div>
        </form>
      )}
    </div>
  );
}
