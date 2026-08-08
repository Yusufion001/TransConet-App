import React from 'react';
import { ArrowRight, Box, Crosshair, Crown, Rocket } from 'lucide-react';
import { Button } from './ui/Button';

const cardBase = 'relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900';

export const FindMarketLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-600 text-white shadow-sm dark:border-brand-500/20">
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
    className={`${cardBase} min-h-[190px] cursor-pointer transition-shadow hover:shadow-md`}
  >
    <img
      src="/images/transconet-fleet-card.svg"
      alt="Shipment operations"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/35 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/30" />
    <div className="relative flex min-h-[190px] max-w-xl flex-col justify-center p-5 sm:p-7">
      <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400">
        <Box size={20} />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Shipments</span>
      </div>
      <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">My Shipments</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">Manage your active shipments, documents and delivery activity.</p>
      <div className="mt-4 flex items-center text-sm font-bold text-brand-700 dark:text-brand-400">View shipments <ArrowRight size={16} className="ml-1.5" /></div>
    </div>
  </section>
);

export const TrackShipmentCard = ({ engineStatus, waybillInput, setWaybillInput, handleTrackingRequest, isTracking, trackingError }: any) => (
  <section className={`${cardBase} min-h-[190px]`}>
    <img
      src="/images/transconet-track-card.svg"
      alt="Freight route tracking"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/96 to-white/35 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/30" />
    <div className="relative p-5 sm:p-7">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Crosshair size={20} />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Shipment tracking</span>
        <span className="ml-auto text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{engineStatus === 'idle' ? 'GPS ready' : 'Locating'}</span>
      </div>
      <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-white">Track Freight</h3>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">Follow your shipment using its waybill or trip reference.</p>
      <form onSubmit={handleTrackingRequest} className="mt-4 grid grid-cols-1 gap-2 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          id="tracking-input"
          type="text"
          placeholder="Waybill or Trip ID"
          className="h-12 min-w-0 w-full rounded-xl border border-slate-200 bg-white/95 px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/95 dark:text-white"
          value={waybillInput}
          onChange={(e) => setWaybillInput(e.target.value)}
        />
        <Button type="submit" disabled={isTracking} className="h-12 w-full rounded-xl px-5 sm:w-auto">
          {isTracking ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Track'}
        </Button>
      </form>
      {trackingError && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{trackingError}</p>}
    </div>
  </section>
);

export const BoostLoadCard = ({ onBoostClick }: { onBoostClick: () => void }) => (
  <section
    onClick={onBoostClick}
    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700"
  >
    <div className="relative grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-7">
      <div>
        <div className="flex items-center gap-2 text-amber-300"><Crown size={15} /><span className="text-[10px] font-bold uppercase tracking-[0.14em]">Premium service</span></div>
        <h3 className="mt-3 text-xl font-black tracking-tight">Boost Your Load</h3>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-300">Promote cargo to top-rated verified transporters for faster matching and priority placement.</p>
      </div>
      <Button variant="glass" className="w-full shrink-0 rounded-xl bg-white text-slate-900 hover:bg-slate-100 sm:w-auto">
        <Rocket size={16} className="mr-2" /> Boost Now
      </Button>
    </div>
  </section>
);
