import React from 'react';
import { ArrowRight, Box, Crosshair, Crown, Rocket, Truck } from 'lucide-react';
import { Button } from './ui/Button';

const cardBase = 'relative overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900';

export const FindMarketLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <section className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-brand-950 text-white shadow-sm dark:border-brand-500/20">
    <div className="relative p-5 sm:p-7">
      <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Market Operations</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-50 sm:text-base">
        Post cargo, discover verified transport capacity and compare live shipping opportunities across the TransConet network.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-[auto_auto]">
        <Button onClick={onNavigateToNetwork} size="lg" className="w-full rounded-xl bg-white font-bold text-brand-700 hover:bg-blue-50 sm:w-auto">
          Go to Marketplace <ArrowRight size={17} className="ml-2" />
        </Button>
        <Button variant="ghost" onClick={onNavigateToNetwork} size="lg" className="w-full rounded-xl border border-white/25 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto">
          Browse loads
        </Button>
      </div>
    </div>
  </section>
);

export const MyShipmentsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <section
    onClick={onNavigateToNetwork}
    className={`${cardBase} min-h-[235px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[210px]`}
  >
    <img
      src="/images/transconet-fleet-card.svg"
      alt="Cargo truck and shipment operations"
      className="absolute bottom-0 right-[-2%] h-[54%] w-[68%] object-contain object-right-bottom opacity-90"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/96 to-blue-50/35 dark:from-slate-900 dark:via-slate-900/96 dark:to-brand-950/30" />
    <div className="relative flex min-h-[235px] flex-col p-5 sm:min-h-[210px] sm:p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
        <Box size={19} />
      </div>
      <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">My Shipments</h3>
      <p className="mt-1.5 max-w-[80%] text-sm leading-relaxed text-slate-600 dark:text-slate-300">Manage your active shipments, documents and delivery activity.</p>
      <div className="mt-auto flex items-center text-sm font-bold text-brand-700 dark:text-brand-400">View shipments <ArrowRight size={16} className="ml-1.5" /></div>
    </div>
  </section>
);

export const TrackShipmentCard = ({ engineStatus, waybillInput, setWaybillInput, handleTrackingRequest, isTracking, trackingError }: any) => (
  <section className={`${cardBase} min-h-[235px] sm:min-h-[210px]`}>
    <img
      src="/images/transconet-track-card.svg"
      alt="Global freight route tracking"
      className="absolute bottom-0 right-[-2%] h-[43%] w-[72%] object-contain object-right-bottom opacity-85"
    />
    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/96 to-emerald-50/35 dark:from-slate-900 dark:via-slate-900/96 dark:to-emerald-950/25" />
    <div className="relative flex min-h-[235px] flex-col p-5 sm:min-h-[210px] sm:p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
          <Crosshair size={19} />
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
          {engineStatus === 'idle' ? 'GPS ready' : 'Locating'}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-black tracking-tight text-slate-900 dark:text-white">Track Freight</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Follow your shipment using its waybill or trip reference.</p>
      <form onSubmit={handleTrackingRequest} className="relative z-10 mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-4">
        <input
          id="tracking-input"
          type="text"
          placeholder="Waybill or Trip ID"
          className="h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-white/95 px-3 text-xs font-mono text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/95 dark:text-white"
          value={waybillInput}
          onChange={(e) => setWaybillInput(e.target.value)}
        />
        <Button type="submit" disabled={isTracking} className="h-11 rounded-xl px-4">
          {isTracking ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Track'}
        </Button>
      </form>
      {trackingError && <p className="relative z-10 mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{trackingError}</p>}
    </div>
  </section>
);

export const BoostLoadCard = ({ onBoostClick }: { onBoostClick: () => void }) => (
  <section
    onClick={onBoostClick}
    className="relative min-h-[180px] overflow-hidden rounded-[20px] border border-brand-800 bg-brand-950 text-white shadow-[0_8px_28px_rgba(11,31,68,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
  >
    <img src="/images/transconet-boost-card.svg" alt="Premium cargo transport" className="absolute inset-y-0 right-0 h-full w-[65%] object-cover object-left opacity-70 sm:w-[58%]" />
    <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/95 to-brand-950/25" />
    <div className="relative flex min-h-[180px] flex-col justify-center p-5 sm:p-7">
      <div className="flex items-center gap-2 text-amber-300"><Crown size={15} /><span className="text-[10px] font-bold uppercase tracking-[0.14em]">Premium service</span></div>
      <h3 className="mt-2 text-2xl font-black tracking-tight">Boost Your Load</h3>
      <p className="mt-1.5 max-w-[62%] text-sm leading-relaxed text-blue-100 sm:max-w-xl">Promote cargo to top-rated verified transporters for faster matching and priority placement.</p>
      <Button variant="glass" className="mt-4 h-11 w-fit rounded-xl bg-white px-5 text-slate-900 hover:bg-slate-100">
        <Truck size={16} className="mr-2" /> Boost Now <Rocket size={15} className="ml-2" />
      </Button>
    </div>
  </section>
);
