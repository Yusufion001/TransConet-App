import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaulageNotification } from '../utils/notificationHelper';
import { useDriverTracking, TripStatus } from '../hooks/useDriverTracking';
import { MapPin, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface LoadCardProps { origin: string; destination: string; weight: string; commodity: string; payout: string; truckType: string; isShipperView?: boolean; onAccept: (isEscrowEnabled: boolean) => void; }

export default function LoadResultCard({ origin, destination, weight, commodity, payout, truckType, isShipperView = false, onAccept }: LoadCardProps) {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'ACCEPTED'>('IDLE');
  const [isEscrowEnabled, setIsEscrowEnabled] = useState(false);
  const tripStateMap: Record<string, TripStatus> = { IDLE: 'IDLE', LOADING: 'QUOTE_SUBMITTED', ACCEPTED: 'QUOTE_ACCEPTED' };
  useDriverTracking(tripStateMap[status]);

  const handleAccept = () => {
    setStatus('LOADING');
    setTimeout(() => {
      setStatus('ACCEPTED');
      const driverPhone = localStorage.getItem('userPhone') || '08000000000';
      triggerHaulageNotification(driverPhone, { origin, destination, commodity, payout });
      if (onAccept) onAccept(isEscrowEnabled);
    }, 2000);
  };

  useEffect(() => {
    if (status === 'ACCEPTED') {
      const timer = setTimeout(() => setStatus('IDLE'), 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative mb-4 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.055)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 sm:p-5">
      <AnimatePresence>
        {status === 'ACCEPTED' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-emerald-950/95 p-6 text-center backdrop-blur-sm">
            <CheckCircle2 size={44} className="mb-3 text-emerald-400" />
            <h3 className="text-lg font-black text-white sm:text-xl">Haulage Request Accepted Successfully</h3>
            <p className="mt-2 text-sm font-medium text-emerald-200/80">The shipper has been notified of your commitment.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-lg font-black tracking-tight text-slate-900 dark:text-white">{commodity}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"><span>{weight}</span><span>•</span><span className="rounded-md bg-brand-50 px-2 py-1 font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-950 dark:text-brand-300">{truckType}</span></div>
        </div>
        <div className="w-full shrink-0 rounded-xl bg-emerald-50 px-4 py-2.5 sm:w-auto dark:bg-emerald-950/50"><span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">₦</span> <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{payout}</span></div>
      </div>

      <div className="my-5 space-y-4 border-l-2 border-dashed border-brand-200 pl-5 dark:border-brand-900/60">
        <div className="relative"><span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400 ring-4 ring-brand-50 dark:ring-brand-950" /><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Pickup Origin</span><span className="mt-1 flex items-start gap-1.5 break-words text-sm font-bold text-slate-800 dark:text-slate-200"><MapPin size={14} className="mt-0.5 shrink-0 text-brand-600" />{origin}</span></div>
        <div className="relative"><span className="absolute -left-[22px] bottom-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50 dark:ring-brand-950" /><span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Dropoff Destination</span><span className="mt-1 flex items-start gap-1.5 break-words text-sm font-bold text-slate-800 dark:text-slate-200"><MapPin size={14} className="mt-0.5 shrink-0 text-brand-600" />{destination}</span></div>
      </div>

      {isShipperView && status === 'IDLE' && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/70">
          <div className="min-w-0"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"><ShieldCheck size={14} className="shrink-0 text-brand-600" /> Enable Escrow Payment Protection</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">Secure funds until delivery is confirmed</span></div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center"><input type="checkbox" className="peer sr-only" checked={isEscrowEnabled} onChange={e => setIsEscrowEnabled(e.target.checked)} /><div className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-brand-600 after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:after:translate-x-5" /></label>
        </div>
      )}

      <Button onClick={handleAccept} disabled={status !== 'IDLE'} className="min-h-12 w-full rounded-xl bg-brand-600 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-brand-700 disabled:opacity-70">
        {status === 'LOADING' ? <><Loader2 size={15} className="animate-spin" /><span>Processing...</span></> : <><ShieldCheck size={15} /><span>Accept Haulage Request</span></>}
      </Button>
    </motion.div>
  );
}
