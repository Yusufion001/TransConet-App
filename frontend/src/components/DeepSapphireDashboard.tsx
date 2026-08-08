import { HeroFindLoadsCard } from './HeroFindLoadsCard';
import { PremiumHeader } from './PremiumHeader';
import React, { useState, useEffect } from 'react';
import { MyShipmentsCard, BoostLoadCard, TrackShipmentCard } from './DashboardCards';
import StateFilterOverlay from './StateFilterOverlay';
import TrackingDashboard from './TrackingDashboard';
import BoostLoadModal from './BoostLoadModal';
import { NativeTrackingEngine } from '../utils/nativeTrackingEngine';
import { Activity, ShieldCheck, Truck } from 'lucide-react';

interface DeepSapphireDashboardProps {
  onNavigateToNetwork?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToSupport?: () => void;
  userPhone?: string;
  userRole?: string;
  activeView?: string;
}

export default function DeepSapphireDashboard({ onNavigateToNetwork, onNavigateToAccount, onNavigateToSupport, userPhone = '0803XXXXXXX', userRole = 'CUSTOMER', activeView }: DeepSapphireDashboardProps) {
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
    <div className="tc-dashboard flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-clip bg-[#f6f8fb] text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-24 sm:pb-28">
      <main className="tc-dashboard-main w-full min-w-0">
        <PremiumHeader userPhone={userPhone} userRole={userRole} onNavigateToAccount={onNavigateToAccount} onNavigateToSupport={onNavigateToSupport} onNavigateToNetwork={onNavigateToNetwork} />

        <div className="w-full px-3 pb-6 pt-2 sm:px-5 sm:pb-8 sm:pt-3 md:px-7">
          <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-labelledby="operation-hub-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <Activity size={11} className="text-brand-600" /> Operations Hub
                </div>
                <h1 id="operation-hub-title" className="text-[26px] font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Good to see you.</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">A clear command center for freight, shipments, tracking and marketplace activity.</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Truck size={15} /></span>
                <span>Transport network</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-xl">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Network</p><p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">Live marketplace</p></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Verification</p><p className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400"><ShieldCheck size={12} /> Verified operations</p></div>
            </div>
          </section>

          <section className="mt-4 grid w-full min-w-0 gap-3 sm:mt-5 sm:gap-4" aria-label="Operation Hub tools">
            <div className="min-w-0 w-full"><HeroFindLoadsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="min-w-0"><MyShipmentsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
              <div className="min-w-0"><TrackShipmentCard engineStatus={engineStatus} waybillInput={waybillInput} setWaybillInput={setWaybillInput} handleTrackingRequest={handleTrackingRequest} isTracking={isTracking} trackingError={trackingError} /></div>
            </div>
            <div className="min-w-0"><BoostLoadCard onBoostClick={() => setIsBoostModalOpen(true)} /></div>
          </section>
        </div>
      </main>

      <BoostLoadModal isOpen={isBoostModalOpen} onClose={() => setIsBoostModalOpen(false)} />
      {showLiveMap && <TrackingDashboard shipmentId={showLiveMap} onClose={() => setShowLiveMap(null)} />}
      <StateFilterOverlay isInline isVisible={isFilterOpen} onClose={() => setIsFilterOpen(false)} onSelectState={(state) => {
        setSelectedState(`Hub: ${state}`);
        setIsFilterOpen(false);
        setTimeout(() => onNavigateToNetwork?.(), 400);
      }} />
    </div>
  );
}
