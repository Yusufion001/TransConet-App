import React, { useState, useEffect } from 'react';
import { Bell, Box, Grid2X2, MapPin, Package, Search, Store, UserRound, Truck, TrendingUp, ArrowRight, Menu } from 'lucide-react';
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="tc-dashboard flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F9FC] text-[#0B1F44] dark:bg-slate-950 dark:text-slate-100">
      <main className="tc-dashboard-main flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-[70px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:h-[76px] sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Menu size={23} />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <Package size={22} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[19px] font-black tracking-[-0.03em] text-[#0B1F44] dark:text-white">TransConet</div>
              <div className="truncate text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Connecting Cargo With Capacity</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={onNavigateToSupport} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Bell size={20} />
              <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </button>
            <button type="button" onClick={onNavigateToAccount} className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <UserRound size={17} />
              <span className="hidden max-w-[105px] truncate text-xs font-semibold sm:block">{userPhone}</span>
              <span className="text-slate-400">⌄</span>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <div className="w-full px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-32 sm:pt-6 md:px-8">
            <section className="relative mb-5 min-h-[265px] overflow-hidden rounded-[26px] bg-white sm:min-h-[290px]" aria-labelledby="operations-hub-title">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(68,104,224,0.10),transparent_35%),linear-gradient(90deg,#ffffff_0%,#ffffff_45%,#f2f6ff_100%)] dark:bg-slate-900" />
              <img src="/images/transconet-global-hero.svg" alt="Global cargo transport by road, sea and air" className="pointer-events-none absolute bottom-0 right-[-5%] h-[95%] w-[68%] object-contain object-right-bottom sm:right-0 sm:w-[61%]" />
              <div className="relative z-10 max-w-[58%] p-5 sm:max-w-[53%] sm:p-8 md:p-9">
                <p className="text-[11px] font-semibold text-slate-500">Welcome back,</p>
                <h1 id="operations-hub-title" className="mt-1 text-[29px] font-black leading-[1.04] tracking-[-0.035em] text-[#0B1F44] sm:text-4xl">Operations Hub</h1>
                <p className="mt-4 max-w-[330px] text-sm leading-6 text-slate-600 sm:text-[15px]">Manage your cargo, shipments, marketplace activity and freight tracking from one focused workspace.</p>
                <button type="button" onClick={() => scrollTo('shipper-operations')} className="mt-5 inline-flex h-10 items-center gap-3 rounded-xl bg-white px-4 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-slate-100 hover:bg-blue-50">
                  <TrendingUp size={16} /> Quick overview <ArrowRight size={16} />
                </button>
              </div>
            </section>

            <section id="shipper-operations" className="grid w-full min-w-0 grid-cols-1 gap-4" aria-label="Shipper operations">
              <section className="relative min-h-[235px] overflow-hidden rounded-[24px] bg-[#0B1F44] text-white shadow-[0_12px_30px_rgba(11,31,68,0.14)]">
                <img src="/images/transconet-fleet-card.svg" alt="Cargo container transport" className="absolute inset-y-0 right-[-3%] h-full w-[58%] object-cover object-right opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F44] via-[#0B1F44]/95 to-[#0B1F44]/10" />
                <div className="relative z-10 max-w-[72%] p-6 sm:max-w-[62%] sm:p-8">
                  <div className="flex items-center gap-2 text-blue-300"><Store size={15} /><span className="text-[11px] font-bold uppercase tracking-[0.14em]">Market Operations</span></div>
                  <h2 className="mt-3 text-[27px] font-black tracking-[-0.03em] sm:text-3xl">Market Operations</h2>
                  <p className="mt-2 max-w-[470px] text-sm leading-6 text-blue-50">Post cargo, find verified transporters and compare shipping rates & bids from one trusted operations hub.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" onClick={onNavigateToNetwork} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-brand-500"><Search size={16} /> Find Transport</button>
                    <button type="button" onClick={onNavigateToNetwork} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 bg-transparent px-5 text-sm font-semibold text-white hover:bg-white/10"><Store size={16} /> Go to Marketplace</button>
                  </div>
                </div>
              </section>

              <div className="grid min-w-0 grid-cols-1 gap-4 min-[520px]:grid-cols-2">
                <div className="min-w-0"><MyShipmentsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
                <div className="min-w-0"><TrackShipmentCard engineStatus={engineStatus} waybillInput={waybillInput} setWaybillInput={setWaybillInput} handleTrackingRequest={handleTrackingRequest} isTracking={isTracking} trackingError={trackingError} /></div>
              </div>

              <div className="min-w-0"><BoostLoadCard onBoostClick={() => setIsBoostModalOpen(true)} /></div>

              <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-label="Shipment overview">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black tracking-tight text-[#0B1F44] dark:text-white">Overview</h2>
                  <button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">This Month⌄</button>
                </div>
                <div className="mt-5 grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0 dark:divide-slate-800">
                  <div className="p-3 sm:px-4"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-brand-700"><Box size={17} /></span><strong className="text-2xl">42</strong></div><p className="mt-1 pl-11 text-[10px] font-semibold text-slate-400">Active Shipments</p></div>
                  <div className="p-3 sm:px-4"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Truck size={17} /></span><strong className="text-2xl">18</strong></div><p className="mt-1 pl-11 text-[10px] font-semibold text-slate-400">In Transit</p></div>
                  <div className="p-3 sm:px-4"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Package size={17} /></span><strong className="text-2xl">9</strong></div><p className="mt-1 pl-11 text-[10px] font-semibold text-slate-400">Delivered</p></div>
                  <div className="p-3 sm:px-4"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-600"><TrendingUp size={17} /></span><strong className="text-2xl">7</strong></div><p className="mt-1 pl-11 text-[10px] font-semibold text-slate-400">Completed Trips</p></div>
                </div>
              </section>
            </section>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95" aria-label="Shipper navigation">
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
          <button type="button" onClick={() => scrollTo('shipper-operations')} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-blue-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"><Grid2X2 size={20} /><span className="text-[10px] font-bold">Dashboard</span></button>
          <button type="button" onClick={onNavigateToNetwork} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400"><Box size={20} /><span className="text-[10px] font-semibold">Shipments</span></button>
          <button type="button" onClick={onNavigateToNetwork} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400"><Store size={20} /><span className="text-[10px] font-semibold">Marketplace</span></button>
          <button type="button" onClick={() => scrollTo('tracking-input')} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400"><MapPin size={20} /><span className="text-[10px] font-semibold">Tracking</span></button>
          <button type="button" onClick={onNavigateToAccount} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400"><UserRound size={20} /><span className="text-[10px] font-semibold">Profile</span></button>
        </div>
      </nav>

      <BoostLoadModal isOpen={isBoostModalOpen} onClose={() => setIsBoostModalOpen(false)} />
      {showLiveMap && <TrackingDashboard shipmentId={showLiveMap} onClose={() => setShowLiveMap(null)} />}
      <StateFilterOverlay isInline isVisible={isFilterOpen} onClose={() => setIsFilterOpen(false)} onSelectState={(state) => { setSelectedState(`Hub: ${state}`); setIsFilterOpen(false); setTimeout(() => onNavigateToNetwork?.(), 400); }} />
    </div>
  );
}
