import { HeroFindLoadsCard } from './HeroFindLoadsCard';
import { PremiumHeader } from './PremiumHeader';
import React, { useState, useEffect } from 'react';
import { Box, MapPinned, PackageSearch, Rocket, Truck, Activity } from 'lucide-react';
import { MyShipmentsCard, BoostLoadCard, TrackShipmentCard } from './DashboardCards';
import StateFilterOverlay from './StateFilterOverlay';
import TrackingDashboard from './TrackingDashboard';
import BoostLoadModal from './BoostLoadModal';
import { NativeTrackingEngine } from '../utils/nativeTrackingEngine';

interface DeepSapphireDashboardProps {
  onNavigateToNetwork?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToSupport?: () => void;
  userPhone?: string;
  userRole?: string;
  activeView?: string;
}

export default function DeepSapphireDashboard({
  onNavigateToNetwork,
  onNavigateToAccount,
  onNavigateToSupport,
  userPhone = '0803XXXXXXX',
  userRole = 'CUSTOMER',
  activeView,
}: DeepSapphireDashboardProps) {
  const [waybillInput, setWaybillInput] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [showLiveMap, setShowLiveMap] = useState<string | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [, setSelectedState] = useState('Browse 36 States');
  const [engineStatus, setEngineStatus] = useState(NativeTrackingEngine.getStatus());

  const handleTrackingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waybillInput.trim()) {
      setTrackingError('Please enter a valid Waybill or Trip ID.');
      return;
    }
    setIsTracking(true);
    setTrackingError('');
    setTimeout(() => {
      setIsTracking(false);
      setShowLiveMap(waybillInput);
      setWaybillInput('');
    }, 1500);
  };

  useEffect(() => {
    if (activeView === 'track-shipments') {
      setTimeout(() => {
        const trackingInput = document.getElementById('tracking-input');
        trackingInput?.focus();
        trackingInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else if (activeView === 'boost-load') {
      setIsBoostModalOpen(true);
    }
  }, [activeView]);

  useEffect(() => {
    const interval = setInterval(() => setEngineStatus(NativeTrackingEngine.getStatus()), 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-[#f7f8fa] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PremiumHeader
        userPhone={userPhone}
        userRole={userRole}
        onNavigateToAccount={onNavigateToAccount}
        onNavigateToSupport={onNavigateToSupport}
        onNavigateToNetwork={onNavigateToNetwork}
      />

      <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto w-full max-w-7xl px-4 pb-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <Box size={16} />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Shipper workspace
                </span>
              </div>
              <h1 className="text-[25px] font-black tracking-[-0.03em] text-slate-950 dark:text-white sm:text-3xl">
                Operations Hub
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                Manage cargo, verified transporters, active shipments and live freight tracking from one clear command centre.
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <span className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Activity size={13} className="text-emerald-500" /> Live workspace
              </span>
            </div>
          </div>

          <nav aria-label="Shipper workspace sections" className="mt-4 -mx-1 overflow-x-auto hide-scrollbar">
            <div className="flex min-w-max gap-1 px-1">
              <button
                type="button"
                onClick={onNavigateToNetwork}
                className="flex h-10 items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <PackageSearch size={15} /> Marketplace
              </button>
              <button
                type="button"
                onClick={onNavigateToNetwork}
                className="flex h-10 items-center gap-2 rounded-lg border border-transparent px-3.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Truck size={15} /> Transporters
              </button>
              <button
                type="button"
                onClick={() => setIsBoostModalOpen(true)}
                className="flex h-10 items-center gap-2 rounded-lg border border-transparent px-3.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Rocket size={15} /> Priority matching
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('tracking-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="flex h-10 items-center gap-2 rounded-lg border border-transparent px-3.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <MapPinned size={15} /> Tracking
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 pb-28 sm:px-6 sm:py-6 lg:px-8">
          <section className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">Today</p>
              <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-xl">Freight operations</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Everything you need to move and monitor cargo.</p>
            </div>
            <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Network available
            </div>
          </section>

          <section className="grid w-full min-w-0 gap-3 sm:gap-4" aria-label="Shipper operations">
            <div className="min-w-0 w-full">
              <HeroFindLoadsCard onNavigateToNetwork={onNavigateToNetwork} />
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="min-w-0">
                <MyShipmentsCard onNavigateToNetwork={onNavigateToNetwork} />
              </div>
              <div className="min-w-0">
                <TrackShipmentCard
                  engineStatus={engineStatus}
                  waybillInput={waybillInput}
                  setWaybillInput={setWaybillInput}
                  handleTrackingRequest={handleTrackingRequest}
                  isTracking={isTracking}
                  trackingError={trackingError}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipment visibility</p><p className="mt-2 text-xl font-black">Live</p></div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><MapPinned size={16} /></span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Track active freight from one reference.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified capacity</p><p className="mt-2 text-xl font-black">Network</p></div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><Truck size={16} /></span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Connect with transport providers through the marketplace.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority service</p><p className="mt-2 text-xl font-black">Boost</p></div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"><Rocket size={16} /></span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Promote urgent cargo for faster matching.</p>
              </div>
            </div>

            <div className="min-w-0">
              <BoostLoadCard onBoostClick={() => setIsBoostModalOpen(true)} />
            </div>
          </section>
        </div>
      </main>

      <BoostLoadModal isOpen={isBoostModalOpen} onClose={() => setIsBoostModalOpen(false)} />
      {showLiveMap && <TrackingDashboard shipmentId={showLiveMap} onClose={() => setShowLiveMap(null)} />}
      <StateFilterOverlay
        isInline
        isVisible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSelectState={(state) => {
          setSelectedState(`Hub: ${state}`);
          setIsFilterOpen(false);
          setTimeout(() => onNavigateToNetwork?.(), 400);
        }}
      />
    </div>
  );
}
