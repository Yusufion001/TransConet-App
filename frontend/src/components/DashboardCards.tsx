import React from 'react';
import { ArrowRight, Box, Crosshair, Crown, Rocket, Truck } from 'lucide-react';
import { Button } from './ui/Button';

const cardBase = 'tc-dashboard-card relative overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.07)] dark:bg-slate-900';

export const MyShipmentsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <section onClick={onNavigateToNetwork} className={`${cardBase} tc-my-shipments-card min-h-[205px] cursor-pointer active:scale-[0.99] transition-transform duration-150`}>
    <img src="/images/transconet-fleet-card.svg" alt="Shipment operations" className="tc-dashboard-card-art absolute bottom-0 right-0 h-[55%] w-[58%] object-contain object-right-bottom opacity-80" />
    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/96 to-blue-50/60 dark:from-slate-900 dark:via-slate-900/96 dark:to-brand-950/40" />
    <div className="tc-dashboard-card-content relative flex min-h-[205px] flex-col p-5 sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><Box size={20} /></div>
      <h3 className="mt-4 text-[20px] font-extrabold tracking-tight text-[#0B1F44] dark:text-white">My Shipments</h3>
      <p className="mt-1.5 max-w-[72%] text-[14px] leading-6 text-slate-600 dark:text-slate-300">Manage active cargo, documents and delivery activity.</p>
      <div className="mt-auto flex items-center text-[14px] font-extrabold text-brand-700 dark:text-brand-400">View shipments <ArrowRight size={17} className="ml-1.5" /></div>
    </div>
  </section>
);

export const TrackShipmentCard = ({ engineStatus, waybillInput, setWaybillInput, handleTrackingRequest, isTracking, trackingError }: any) => (
  <section className={`${cardBase} tc-track-shipment-card min-h-[205px]`}>
    <img src="/images/transconet-track-card.svg" alt="Freight route tracking" className="tc-dashboard-card-art absolute bottom-0 right-0 h-[42%] w-[62%] object-contain object-right-bottom opacity-65" />
    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/97 to-emerald-50/55 dark:from-slate-900 dark:via-slate-900/97 dark:to-emerald-950/30" />
    <div className="tc-dashboard-card-content relative flex min-h-[205px] flex-col p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"><Crosshair size={20} /></div>
        <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">{engineStatus === 'idle' ? 'READY' : 'LOCATING'}</span>
      </div>
      <h3 className="mt-4 text-[20px] font-extrabold tracking-tight text-[#0B1F44] dark:text-white">Track Freight</h3>
      <p className="mt-1.5 text-[14px] leading-6 text-slate-600 dark:text-slate-300">Follow a shipment with its waybill or trip reference.</p>
      <form onSubmit={handleTrackingRequest} className="tc-tracking-form relative z-10 mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-4">
        <input id="tracking-input" type="text" placeholder="Waybill or Trip ID" aria-label="Waybill or Trip ID" className="tc-tracking-input h-12 min-w-0 w-full rounded-2xl border-0 bg-slate-100 px-3.5 text-base font-medium text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700" value={waybillInput} onChange={(e) => setWaybillInput(e.target.value)} />
        <Button type="submit" disabled={isTracking} className="tc-tracking-button h-12 rounded-2xl px-4 text-sm font-extrabold shadow-sm">{isTracking ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Track'}</Button>
      </form>
      {trackingError && <p className="relative z-10 mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{trackingError}</p>}
    </div>
  </section>
);

export const BoostLoadCard = ({ onBoostClick }: { onBoostClick: () => void }) => (
  <section onClick={onBoostClick} className={`${cardBase} tc-boost-load-card min-h-[165px] cursor-pointer bg-[#0B1F44] text-white shadow-[0_12px_32px_rgba(11,31,68,0.16)] active:scale-[0.99] transition-transform duration-150`}>
    <img src="/images/transconet-boost-card.svg" alt="Premium cargo promotion" className="tc-dashboard-card-art absolute inset-y-0 right-0 h-full w-[55%] object-cover object-left opacity-60" />
    <div className="absolute inset-y-0 left-0 w-[76%] bg-gradient-to-r from-[#0B1F44] via-[#0B1F44]/96 to-transparent" />
    <div className="tc-dashboard-card-content relative flex min-h-[165px] flex-col justify-center p-5 sm:p-7">
      <div className="flex items-center gap-2 text-amber-300"><Crown size={15} /><span className="text-[11px] font-extrabold uppercase tracking-[0.13em]">Premium service</span></div>
      <h3 className="mt-2 text-[22px] font-extrabold tracking-tight">Boost Your Load</h3>
      <p className="mt-1.5 max-w-[66%] text-[14px] leading-6 text-blue-100">Promote cargo to verified transporters for faster matching.</p>
      <Button variant="glass" className="mt-4 h-11 w-fit rounded-2xl bg-white px-5 text-sm font-extrabold text-[#0B1F44] hover:bg-slate-100"><Truck size={16} className="mr-2" /> Boost Now <Rocket size={15} className="ml-2" /></Button>
    </div>
  </section>
);
