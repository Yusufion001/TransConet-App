import React from 'react';
import { ArrowRight, Box, Crosshair, Crown, Rocket, Truck } from 'lucide-react';
import { Button } from './ui/Button';

const cardBase = 'relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)] dark:border-slate-700 dark:bg-slate-900';

export const MyShipmentsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <section
    onClick={onNavigateToNetwork}
    className={`${cardBase} min-h-[220px] cursor-pointer transition-shadow duration-200 hover:shadow-md`}
  >
    <img src="/images/transconet-fleet-card.svg" alt="Global shipment and cargo operations" className="absolute bottom-0 right-0 h-[58%] w-[66%] object-contain object-right-bottom opacity-90" />
    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-blue-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-brand-950/30" />
    <div className="relative flex min-h-[220px] flex-col p-5 sm:p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"><Box size={19} /></div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-[#0B1F44] dark:text-white">My Shipments</h3>
      <p className="mt-1.5 max-w-[76%] text-[14px] leading-6 text-slate-600 dark:text-slate-300">Manage active cargo, documents and delivery activity.</p>
      <div className="mt-auto flex items-center text-sm font-bold text-brand-700 dark:text-brand-400">View shipments <ArrowRight size={16} className="ml-1.5" /></div>
    </div>
  </section>
);

export const TrackShipmentCard = ({ engineStatus, waybillInput, setWaybillInput, handleTrackingRequest, isTracking, trackingError }: any) => (
  <section className={`${cardBase} min-h-[220px]`}>
    <img src="/images/transconet-track-card.svg" alt="Global freight route tracking" className="absolute bottom-0 right-0 h-[48%] w-[70%] object-contain object-right-bottom opacity-75" />
    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/96 to-emerald-50/45 dark:from-slate-900 dark:via-slate-900/96 dark:to-emerald-950/25" />
    <div className="relative flex min-h-[220px] flex-col p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"><Crosshair size={19} /></div>
        <span className="ml-auto rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400">{engineStatus === 'idle' ? 'Ready' : 'Locating'}</span>
      </div>
      <h3 className="mt-4 text-xl font-bold tracking-tight text-[#0B1F44] dark:text-white">Track Freight</h3>
      <p className="mt-1.5 text-[14px] leading-6 text-slate-600 dark:text-slate-300">Follow a shipment with its waybill or trip reference.</p>
      <form onSubmit={handleTrackingRequest} className="relative z-10 mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-4">
        <input id="tracking-input" type="text" placeholder="Waybill or Trip ID" aria-label="Waybill or Trip ID" className="h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-mono text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={waybillInput} onChange={(e) => setWaybillInput(e.target.value)} />
        <Button type="submit" disabled={isTracking} className="h-11 rounded-xl px-4 text-sm font-bold">{isTracking ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Track'}</Button>
      </form>
      {trackingError && <p className="relative z-10 mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{trackingError}</p>}
    </div>
  </section>
);

export const BoostLoadCard = ({ onBoostClick }: { onBoostClick: () => void }) => (
  <section onClick={onBoostClick} className="relative min-h-[170px] cursor-pointer overflow-hidden rounded-2xl border border-[#16335F] bg-[#0B1F44] text-white shadow-[0_6px_22px_rgba(11,31,68,0.12)] transition-shadow duration-200 hover:shadow-lg">
    <img src="/images/transconet-boost-card.svg" alt="Premium global cargo promotion" className="absolute inset-y-0 right-0 h-full w-[58%] object-cover object-left opacity-65" />
    <div className="absolute inset-y-0 left-0 w-[68%] bg-gradient-to-r from-[#0B1F44] via-[#0B1F44]/95 to-transparent" />
    <div className="relative flex min-h-[170px] flex-col justify-center p-5 sm:p-7">
      <div className="flex items-center gap-2 text-amber-300"><Crown size={15} /><span className="text-xs font-semibold uppercase tracking-[0.13em]">Premium service</span></div>
      <h3 className="mt-2 text-2xl font-extrabold tracking-tight">Boost Your Load</h3>
      <p className="mt-1.5 max-w-[64%] text-[14px] leading-6 text-blue-100 sm:max-w-xl">Promote cargo to verified transporters for faster matching and priority placement.</p>
      <Button variant="glass" className="mt-4 h-11 w-fit rounded-xl bg-white px-5 text-sm font-bold text-[#0B1F44] hover:bg-slate-100"><Truck size={16} className="mr-2" /> Boost Now <Rocket size={15} className="ml-2" /></Button>
    </div>
  </section>
);
