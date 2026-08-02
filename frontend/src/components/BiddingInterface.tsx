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

export default function BiddingInterface({
  activeMatch,
  negotiationStatus,
  isNegotiating,
  setIsNegotiating,
  counterPrice,
  setCounterPrice,
  handleAcceptBid,
  handleCounterOffer
}: BiddingInterfaceProps) {
  if (!activeMatch) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-[20px] p-6 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-100 text-brand-600 rounded-xl shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeMatch.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeMatch.subtitle}</p>
            {negotiationStatus && (
              <p className="text-xs font-bold text-amber-400 mt-2 bg-amber-950/40 border border-amber-900/50 px-2 py-1 rounded w-fit">
                ⚠️ {negotiationStatus}
              </p>
            )}
          </div>
        </div>

        <div className="bg-brand-600 border border-brand-500 rounded-xl p-4 flex items-center gap-4 text-white">
          <div>
            <p className="text-[10px] text-brand-100 uppercase font-black tracking-wider">Suggested Fare</p>
            <p className="text-white text-xl font-black">₦{activeMatch.price?.toLocaleString()}</p>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Button 
              onClick={() => handleAcceptBid(true, String(activeMatch.id))}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Accept Deal
            </Button>
            <a 
              href={`tel:${activeMatch.phone || '+2348000000000'}`}
              className="bg-white dark:bg-slate-900 hover:bg-slate-100 text-brand-600 font-black text-xs px-4 py-2 rounded-lg transition text-center uppercase tracking-wider shadow-sm"
            >
              Call to Deal
            </a>
            <Button 
              onClick={() => setIsNegotiating(!isNegotiating)}
              className="bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Counter Offer
            </Button>
          </div>
        </div>
      </div>

      {isNegotiating && (
        <form onSubmit={handleCounterOffer} className="bg-brand-600 border border-brand-500 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-75 text-white">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <DollarSign size={14} className="text-amber-400" /> Propose Your Price (₦)
          </div>
          <div className="flex gap-2">
            <input 
              type="number" 
              required 
              placeholder="e.g., 360000" 
              value={counterPrice} 
              onChange={e => setCounterPrice(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500" 
            />
            <Button type="submit" className="bg-white dark:bg-slate-900 hover:bg-slate-100 text-brand-600 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center justify-center">
              Send Offer
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
