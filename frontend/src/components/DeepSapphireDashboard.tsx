import { HeroFindLoadsCard } from './HeroFindLoadsCard';
import { PremiumHeader } from './PremiumHeader';
import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, MapPinned, PackageSearch } from 'lucide-react';
import { Button } from './ui/Button';
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
    <div className="tc-dashboard flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#F6F8FB] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="tc-dashboard-main flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <PremiumHeader
          userPhone={userPhone}
          userRole={userRole}
          onNavigateToAccount={onNavigateToAccount}
          onNavigateToSupport={onNavigateToSupport}
          onNavigateToNetwork={onNavigateToNetwork}
        />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <div className="mx-auto w-full max-w-[1180px] px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 sm:pt-5 md:px-7 md:pb-24 lg:px-8">
            <section className="tc-shipper-hero relative overflow-hidden border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-slate-900" aria-labelledby="operations-hub-title">
              <div className="absolute inset-y-0 right-0 w-[62%] bg-[#EEF4FF] dark:bg-brand-950/40" />
              <img src="/images/transconet-global-hero.svg" alt="Global cargo network by road, sea and air" className="pointer-events-none absolute bottom-0 right-[-8%] h-[90%] w-[68%] object-contain object-right-bottom sm:right-[-2%] sm:h-full sm:w-[58%]" />
              <div className="relative z-10 min-h-[236px] w-[72%] p-5 sm:min-h-[260px] sm:w-[58%] sm:p-7 md:min-h-[280px] md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">Shipper workspace</p>
                <h1 id="operations-hub-title" className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-[#0B1F44] dark:text-white sm:text-4xl">Operations Hub</h1>
                <p className="mt-3 max-w-xl text-[15px] leading-6 text-slate-600 dark:text-slate-300 sm:text-base">A focused command center for cargo, shipments, transport matching and freight tracking.</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <MapPinned size={16} className="text-brand-600" /> Global logistics workspace <ArrowRight size={15} className="text-slate-400" />
                </div>
              </div>
            </section>

            <section className="mt-5" aria-label="Quick actions">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">Quick actions</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#0B1F44] dark:text-white">Move cargo forward</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5 min-[430px]:grid-cols-3">
                <Button onClick={onNavigateToNetwork} className="min-h-12 justify-start rounded-xl bg-brand-600 px-4 text-left text-sm font-bold text-white hover:bg-brand-700"><PackageSearch size={18} className="mr-2.5" />Find Transport</Button>
                <Button onClick={onNavigateToNetwork} variant="ghost" className="min-h-12 justify-start rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><FileText size={18} className="mr-2.5 text-brand-600" />Post / manage cargo</Button>
                <Button onClick={() => document.getElementById('tracking-input')?.focus()} variant="ghost" className="min-h-12 justify-start rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><MapPinned size={18} className="mr-2.5 text-emerald-600" />Track shipment</Button>
              </div>
            </section>

            <section className="mt-5" aria-label="Cargo operations">
              <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                <div className="min-w-0 md:col-span-2"><HeroFindLoadsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
                <div className="min-w-0"><MyShipmentsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
                <div className="min-w-0"><TrackShipmentCard engineStatus={engineStatus} waybillInput={waybillInput} setWaybillInput={setWaybillInput} handleTrackingRequest={handleTrackingRequest} isTracking={isTracking} trackingError={trackingError} /></div>
                <div className="min-w-0 md:col-span-2"><BoostLoadCard onBoostClick={() => setIsBoostModalOpen(true)} /></div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <BoostLoadModal isOpen={isBoostModalOpen} onClose={() => setIsBoostModalOpen(false)} />
      {showLiveMap && <TrackingDashboard shipmentId={showLiveMap} onClose={() => setShowLiveMap(null)} />}
      <StateFilterOverlay isInline isVisible={isFilterOpen} onClose={() => setIsFilterOpen(false)} onSelectState={(state) => { setSelectedState(`Hub: ${state}`); setIsFilterOpen(false); setTimeout(() => onNavigateToNetwork?.(), 400); }} />
    </div>
  );
}
