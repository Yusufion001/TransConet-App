import { HeroFindLoadsCard } from './HeroFindLoadsCard';
import { PremiumHeader } from './PremiumHeader';
import React, { useState, useEffect } from 'react';
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
    <div className="tc-dashboard flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="tc-dashboard-main flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <PremiumHeader
          userPhone={userPhone}
          userRole={userRole}
          onNavigateToAccount={onNavigateToAccount}
          onNavigateToSupport={onNavigateToSupport}
          onNavigateToNetwork={onNavigateToNetwork}
        />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <div className="w-full px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 sm:pb-32 sm:pt-5 md:px-7">
            <section className="relative mb-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-slate-900 sm:mb-6" aria-labelledby="operations-hub-title">
              <div className="absolute inset-y-0 right-0 w-[66%] bg-gradient-to-l from-blue-50 via-blue-50/35 to-transparent dark:from-brand-900/60 dark:via-brand-900/15 dark:to-transparent" />
              <img src="/images/transconet-global-hero.svg" alt="Global cargo transport by road, sea and air" className="pointer-events-none absolute bottom-0 right-[-5%] h-[92%] w-[62%] object-contain object-right-bottom opacity-95 sm:right-0 sm:h-full sm:w-[56%]" />
              <div className="relative z-10 min-h-[245px] max-w-[72%] p-5 sm:min-h-[270px] sm:max-w-[58%] sm:p-7 md:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">Shipper Operations</p>
                <h1 id="operations-hub-title" className="mt-2 text-[29px] font-black leading-tight tracking-[-0.025em] text-slate-950 dark:text-white sm:text-4xl">Operations Hub</h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">Manage your cargo, shipments, marketplace activity and freight tracking from one focused workspace.</p>
              </div>
            </section>

            <section className="grid w-full min-w-0 grid-cols-1 gap-4" aria-label="Shipper operations">
              <div className="min-w-0 w-full"><HeroFindLoadsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
              <div className="grid min-w-0 grid-cols-1 gap-4 min-[390px]:grid-cols-2">
                <div className="min-w-0"><MyShipmentsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
                <div className="min-w-0">
                  <TrackShipmentCard engineStatus={engineStatus} waybillInput={waybillInput} setWaybillInput={setWaybillInput} handleTrackingRequest={handleTrackingRequest} isTracking={isTracking} trackingError={trackingError} />
                </div>
              </div>
              <div className="min-w-0"><BoostLoadCard onBoostClick={() => setIsBoostModalOpen(true)} /></div>
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
