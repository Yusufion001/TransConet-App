import { PremiumHeader } from './PremiumHeader';
import React, { useState, useEffect } from 'react';
import { FileText, MapPinned, PackageSearch } from 'lucide-react';
import { Button } from './ui/Button';
import { MyShipmentsCard, BoostLoadCard, TrackShipmentCard } from './DashboardCards';
import StateFilterOverlay from './StateFilterOverlay';
import TrackingDashboard from './TrackingDashboard';
import BoostLoadModal from './BoostLoadModal';
import { NativeTrackingEngine } from '../utils/nativeTrackingEngine';

interface DeepSapphireDashboardProps {
  onNavigateToNetwork?: () => void;
  onNavigateToPostCargo?: () => void;
  onNavigateToAccount?: () => void;
  onNavigateToSupport?: () => void;
  userPhone?: string;
  userRole?: string;
  activeView?: string;
}

export default function DeepSapphireDashboard({
  onNavigateToNetwork,
  onNavigateToPostCargo,
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
    if (!waybillInput.trim()) { setTrackingError('Please enter a valid Waybill or Trip ID.'); return; }
    setIsTracking(true); setTrackingError('');
    setTimeout(() => { setIsTracking(false); setShowLiveMap(waybillInput); setWaybillInput(''); }, 1500);
  };

  useEffect(() => {
    if (activeView === 'track-shipments') setTimeout(() => { const input = document.getElementById('tracking-input'); input?.focus(); input?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    else if (activeView === 'boost-load') setIsBoostModalOpen(true);
  }, [activeView]);

  useEffect(() => { const interval = setInterval(() => setEngineStatus(NativeTrackingEngine.getStatus()), 15000); return () => clearInterval(interval); }, []);

  return (
    <div className="tc-dashboard flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F6F8FB] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="tc-dashboard-main flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <PremiumHeader userPhone={userPhone} userRole={userRole} onNavigateToAccount={onNavigateToAccount} onNavigateToSupport={onNavigateToSupport} onNavigateToNetwork={onNavigateToNetwork} />

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
          <div className="mx-auto w-full max-w-[1180px] px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pt-5 md:px-7 lg:px-8">
            <section className="tc-operations-hub relative min-h-[205px] overflow-hidden rounded-[26px] bg-[#0B1F44] text-white shadow-[0_14px_35px_rgba(11,31,68,0.14)]" aria-labelledby="operations-hub-title">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F44] via-[#123567] to-[#0B1F44]" />
              <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-brand-400/20 blur-3xl" />
              <div className="absolute -bottom-20 right-10 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative z-10 flex min-h-[205px] flex-col justify-end p-5 sm:p-7 md:p-8">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-200">Shipper workspace</p>
                <h1 id="operations-hub-title" className="mt-2 text-[30px] font-black leading-none tracking-[-0.035em] sm:text-4xl">Operations Hub</h1>
                <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-blue-100 sm:text-base">Everything you need to post cargo, find verified transport, manage shipments and track deliveries.</p>
              </div>
            </section>

            <section className="mt-7" aria-label="Quick actions">
              <div className="mb-3 px-1"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Quick actions</p><h2 className="mt-1 text-[21px] font-black tracking-tight text-[#0B1F44] dark:text-white">Move cargo forward</h2></div>
              <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
                <Button onClick={onNavigateToNetwork} className="min-h-[28px] h-[28px] w-fit justify-start rounded-[10px] bg-[#F5F5F2] px-3 text-left text-[12px] font-extrabold text-black shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:bg-[#ECECE8] active:scale-[0.99]">Find Transport</Button>
                <Button onClick={onNavigateToPostCargo} variant="ghost" className="min-h-[28px] h-[28px] w-fit justify-start rounded-[10px] border-0 bg-[#F5F5F2] px-3 text-left text-[12px] font-extrabold text-black shadow-[0_4px_12px_rgba(15,23,42,0.05)] hover:bg-[#ECECE8]">Post Cargo</Button>
              </div>
            </section>

            <section className="mt-7" aria-label="Cargo operations">
              <div className="mb-3 px-1"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Cargo operations</p><h2 className="mt-1 text-[21px] font-black tracking-tight text-[#0B1F44] dark:text-white">Your logistics at a glance</h2></div>
              <div className="grid w-full min-w-0 grid-cols-1 gap-4">
                <div className="min-w-0"><TrackShipmentCard engineStatus={engineStatus} waybillInput={waybillInput} setWaybillInput={setWaybillInput} handleTrackingRequest={handleTrackingRequest} isTracking={isTracking} trackingError={trackingError} /></div>
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
