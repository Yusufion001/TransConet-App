import React from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, MapPin, Box, Crosshair, Crown, Rocket, Star, Activity, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

const cardBase = 'relative overflow-hidden rounded-[24px] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.05)]';

export const FindMarketLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${cardBase} bg-slate-950 text-white dark:bg-slate-900`}
  >
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.20),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_55%)]" />
    <div className="relative p-5 sm:p-7 md:p-9">
      <div className="flex items-center justify-between gap-3 mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live network
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200"><MapPin size={17} /></span>
      </div>
      <div className="max-w-2xl">
        <h2 className="text-[27px] sm:text-3xl md:text-4xl font-black tracking-tight">Market Operations</h2>
        <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">Post cargo, discover verified transport capacity and compare live shipping opportunities across the TransConet network.</p>
      </div>
      <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
        <Button onClick={onNavigateToNetwork} size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold shadow-none">
          Go to Marketplace <ArrowRight size={17} className="ml-2" />
        </Button>
        <Button variant="ghost" onClick={onNavigateToNetwork} size="lg" className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          <Search size={17} className="mr-2" /> Browse loads
        </Button>
      </div>
    </div>
  </motion.section>
);

export const MyShipmentsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08 }}
    onClick={onNavigateToNetwork}
    className={`${cardBase} cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md`}
  >
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><Box size={23} strokeWidth={1.8} /></div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"><ShieldCheck size={11} /> Active</span>
      </div>
      <div className="mt-5">
        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">My Shipments & Fleet</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Manage active shipments, documents and verified transport providers.</p>
      </div>
      <div className="mt-5 flex items-center text-sm font-bold text-brand-600 dark:text-brand-400">Open operations <ArrowRight size={16} className="ml-1.5" /></div>
    </div>
  </motion.section>
);

export const TrackShipmentCard = ({ engineStatus, waybillInput, setWaybillInput, handleTrackingRequest, isTracking, trackingError }: any) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.16 }}
    className={cardBase}
  >
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Crosshair size={22} /></div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><MapPin size={11} className="text-brand-600" /> {engineStatus === 'idle' ? 'GPS ready' : 'Locating'}</span>
      </div>
      <div className="mt-5">
        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Track Freight</h3>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Follow a shipment using its waybill or trip reference.</p>
      </div>
      <form onSubmit={handleTrackingRequest} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          id="tracking-input"
          type="text"
          placeholder="Waybill or Trip ID"
          className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={waybillInput}
          onChange={(e) => setWaybillInput(e.target.value)}
        />
        <Button type="submit" disabled={isTracking} className="h-12 w-full rounded-xl px-5 sm:w-auto">
          {isTracking ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Track'}
        </Button>
      </form>
      {trackingError && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{trackingError}</p>}
    </div>
  </motion.section>
);

export const BoostLoadCard = ({ onBoostClick }: { onBoostClick: () => void }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.24 }}
    onClick={onBoostClick}
    className="relative overflow-hidden rounded-[24px] border border-brand-500/20 bg-brand-600 text-white shadow-[0_10px_35px_rgba(37,99,235,0.18)] cursor-pointer"
  >
    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(135deg,transparent,rgba(15,23,42,0.20))]" />
    <div className="relative p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white"><Crown size={11} /> Premium</span>
        <Rocket size={25} className="text-amber-300" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight">Boost Your Load</h3>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-blue-100">Promote cargo to top-rated verified transporters for faster matching and priority placement.</p>
      <Button variant="glass" className="mt-5 rounded-xl bg-white/15 text-white hover:bg-white/25">Boost Now <ArrowRight size={16} className="ml-2" /></Button>
      <Star size={12} className="absolute bottom-5 right-7 text-amber-200/70" />
    </div>
  </motion.section>
);
