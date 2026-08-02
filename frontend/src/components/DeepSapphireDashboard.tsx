import { HeroFindLoadsCard } from './HeroFindLoadsCard';
import { PremiumHeader } from './PremiumHeader';
import React, { useState, useEffect } from 'react';
import { FindMarketLoadsCard, MyShipmentsCard, BoostLoadCard, TrackShipmentCard } from './DashboardCards';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Search, 
  MapPin, 
  CheckCircle, 
  CheckCircle2,
  Box,
  Truck,
  Leaf,
  Star,
  ChevronRight,
  ArrowRight,
  Rocket,
  LayoutDashboard,
  ShieldCheck,
  Headset,
  UserRound,
  Crosshair,
  Crown,
  ExternalLink
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
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

interface PremiumHeaderProps {
  userPhone: string;
  userRole: string;
  onNavigateToAccount?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToNetwork?: () => void;
}

export default function DeepSapphireDashboard({ 
  onNavigateToNetwork, 
  onNavigateToAccount,
  onNavigateToSupport,
  userPhone = '0803XXXXXXX',
  userRole = 'CUSTOMER',
  activeView
}: DeepSapphireDashboardProps) {
  
  const [waybillInput, setWaybillInput] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [showLiveMap, setShowLiveMap] = useState<string | null>(null);
  
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('Browse 36 States');

  const [engineStatus, setEngineStatus] = useState(NativeTrackingEngine.getStatus());

  const handleTrackingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waybillInput.trim()) {
      setTrackingError('Please enter a valid Waybill or Trip ID.');
      return;
    }
    setIsTracking(true);
    setTrackingError('');
    // Simulate network delay
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
        if (trackingInput) {
          trackingInput.focus();
          trackingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (activeView === 'boost-load') {
      setIsBoostModalOpen(true);
    }
  }, [activeView]);

  useEffect(() => {
    const checkStatus = () => {
      setEngineStatus(NativeTrackingEngine.getStatus());
    };
    // Poll to keep in perfect sync with any background/trip actions
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50  pb-0">
      <main className="p-4 pb-0 md:p-6 md:pb-0 space-y-6 max-w-4xl mx-auto w-full">
        
        <PremiumHeader 
          userPhone={userPhone}
          userRole={userRole}
          onNavigateToAccount={onNavigateToAccount}
          onNavigateToSupport={onNavigateToSupport}
          onNavigateToNetwork={onNavigateToNetwork}
        />

        
        {/* Hero Card: Find Market Loads */}
        <HeroFindLoadsCard onNavigateToNetwork={onNavigateToNetwork} />
        
        {/* Shipments & Fleet Card */}
        <MyShipmentsCard onNavigateToNetwork={onNavigateToNetwork} />
        {/* Track Shipment Card */}
        <TrackShipmentCard 
          engineStatus={engineStatus}
          waybillInput={waybillInput}
          setWaybillInput={setWaybillInput}
          handleTrackingRequest={handleTrackingRequest}
          isTracking={isTracking}
          trackingError={trackingError}
        />
        {/* Boost Load Card */}
        <BoostLoadCard onBoostClick={() => setIsBoostModalOpen(true)} />
      </main>

      <BoostLoadModal isOpen={isBoostModalOpen} onClose={() => setIsBoostModalOpen(false)} />

      {showLiveMap && (
        <TrackingDashboard shipmentId={showLiveMap} onClose={() => setShowLiveMap(null)} />
      )}
      
      <StateFilterOverlay 
        isInline={true}
        isVisible={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onSelectState={(state) => {
          setSelectedState(`Hub: ${state}`); setIsFilterOpen(false);
          setTimeout(() => {
            if (onNavigateToNetwork) {
              onNavigateToNetwork();
            }
          }, 400);
        }}
      />

    </div>
  );
}
