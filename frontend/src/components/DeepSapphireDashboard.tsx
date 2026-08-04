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
    <div className="tc-dashboard flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-clip bg-slate-50 pb-24 sm:pb-32">
      <main className="tc-dashboard-main tc-content-container w-full min-w-0 py-3 sm:py-4 md:py-6">
        <PremiumHeader userPhone={userPhone} userRole={userRole} onNavigateToAccount={onNavigateToAccount} onNavigateToSupport={onNavigateToSupport} onNavigateToNetwork={onNavigateToNetwork} />
        <section className="tc-dashboard-grid mt-4 w-full min-w-0 sm:mt-6" aria-label="TransConet dashboard">
          <div className="min-w-0 w-full"><HeroFindLoadsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
          <div className="min-w-0 w-full"><MyShipmentsCard onNavigateToNetwork={onNavigateToNetwork} /></div>
          <div className="min-w-0 w-full"><TrackShipmentCard engineStatus={engineStatus} waybillInput={waybillInput} setWaybillInput={setWaybillInput} handleTrackingRequest={handleTrackingRequest} isTracking={isTracking} trackingError={trackingError} /></div>
          <div className="min-w-0 w-full"><BoostLoadCard onBoostClick={() => setIsBoostModalOpen(true)} /></div>
        </section>
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
