
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaulageNotification } from '../utils/notificationHelper';
import { useDriverTracking, TripStatus } from '../hooks/useDriverTracking';


import { MapPin, ShieldCheck, ArrowRight, DollarSign, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface LoadCardProps {
  origin: string;
  destination: string;
  weight: string;
  commodity: string;
  payout: string;
  truckType: string;
  isShipperView?: boolean;
  onAccept: (isEscrowEnabled: boolean) => void;
}

export default function LoadResultCard({ 
  origin, 
  destination, 
  weight, 
  commodity, 
  payout, 
  truckType, 
  isShipperView = false,
  onAccept 
}: LoadCardProps) {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'ACCEPTED'>('IDLE');
  const [isEscrowEnabled, setIsEscrowEnabled] = useState(false);

  const tripStateMap: Record<string, TripStatus> = {
    IDLE: 'IDLE',
    LOADING: 'QUOTE_SUBMITTED',
    ACCEPTED: 'QUOTE_ACCEPTED'
  };

  const trackingStatus = useDriverTracking(tripStateMap[status]);


  const handleAccept = () => {
    setStatus('LOADING');
    setTimeout(() => {
      
      setStatus('ACCEPTED');
      const driverPhone = localStorage.getItem('userPhone') || '08000000000';
      triggerHaulageNotification(driverPhone, { origin, destination, commodity, payout });
      if (onAccept) {
        onAccept(isEscrowEnabled);
      }
    }, 2000);
  };


  useEffect(() => {
    if (status === 'ACCEPTED') {
      const timer = setTimeout(() => {
        setStatus('IDLE');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (

    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-2xl p-5 md:p-6 mb-4 shadow-xl  shadow-black/40 hover:border-brand-500/40 transition-all duration-75 overflow-hidden relative"
    >
      <AnimatePresence>
        {status === 'ACCEPTED' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border border-emerald-500/50 rounded-2xl"
          >
            <CheckCircle2 size={48} className="text-emerald-600 mb-4" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white  uppercase tracking-tight mb-2">Haulage Request Accepted Successfully</h3>
            <p className="text-emerald-200/80 text-sm font-medium">The shipper has been notified of your commitment.</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* TOP ROW: COMMODITY & PAYOUT */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div>
          <h4 className="text-slate-900 dark:text-white  font-black text-lg tracking-tight">{commodity}</h4>
          <p className="text-slate-500 dark:text-slate-  text-xs font-semibold mt-1 flex items-center gap-2">
            <span>{weight}</span>
            <span className="text-slate-600 dark:text-slate- ">•</span>
            <span className="text-brand-600 uppercase tracking-wider text-[10px] bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-md font-mono">{truckType}</span>
          </p>
        </div>
        <div className="bg-emerald-100 border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-1 self-start sm:self-center">
          <span className="text-emerald-600 text-xs font-bold font-mono">₦</span>
          <span className="text-emerald-600 font-black text-base md:text-lg font-mono">{payout}</span>
        </div>
      </div>

      {/* ROUTE WAYPOINTS */}
      <div className="my-4 border-l-2 border-dashed border-brand-500/30 pl-5 ml-2.5 relative space-y-4">
        {/* Origin dot */}
        <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-brand-400 ring-4 ring-brand-400/20" />
        <div className="space-y-0.5">
          <span className="text-slate-500 dark:text-slate-  text-[10px] uppercase font-bold tracking-widest block">Pickup Origin</span>
          <span className="text-slate-800 dark:text-slate-  text-sm font-bold flex items-center gap-1">
            <MapPin size={12} className="text-brand-600" />
            {origin}
          </span>
        </div>
        
        {/* Destination dot */}
        <div className="absolute left-[-5px] bottom-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-500/20" />
        <div className="space-y-0.5">
          <span className="text-slate-500 dark:text-slate-  text-[10px] uppercase font-bold tracking-widest block">Dropoff Destination</span>
          <span className="text-slate-800 dark:text-slate-  text-sm font-bold flex items-center gap-1">
            <MapPin size={12} className="text-brand-600" />
            {destination}
          </span>
        </div>
      </div>

      {/* ESCROW PAYMENT OPTION */}
      {isShipperView && status === 'IDLE' && (
        <div className="mb-4 bg-slate-100 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  p-3 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-  flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-brand-600" />
              Enable Escrow Payment Protection
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-  block mt-0.5">Secure funds until delivery is confirmed</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isEscrowEnabled}
              onChange={(e) => setIsEscrowEnabled(e.target.checked)}
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900  after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
          </label>
        </div>
      )}

      {/* INTERACTIVE ACTION BUTTON */}
      <Button 
        onClick={handleAccept}
        disabled={status !== 'IDLE'}
        className="w-full bg-brand-600 hover:bg-brand-50 cursor-pointer hover:shadow-sm0 disabled:bg-brand-800 disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all duration-75 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border border-brand-500/20 shadow-lg  hover:scale-[1.01]"
      >
        {status === 'LOADING' ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={14} />
            <span>Accept Haulage Request</span>
          </>
        )}
      </Button>
    </motion.div>
  );
}
