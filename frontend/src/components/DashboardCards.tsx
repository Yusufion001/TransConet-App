import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, MapPin, Box, Crosshair, Crown, Rocket, Star } from 'lucide-react';
import { Button } from './ui/Button';

export const FindMarketLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-10 shadow-2xl min-h-[300px] flex flex-col justify-end group"
  >
    {/* Truck Illustration */}
    <div className="absolute right-[-5%] bottom-[-10%] w-[65%] md:w-[50%] h-[120%] opacity-90 transition-transform duration-700 group-hover:scale-105 group-hover:-translate-x-2">
       <div className="relative w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-10 right-0">
             {/* Shadow */}
             <ellipse cx="75" cy="65" rx="50" ry="8" fill="#000000" opacity="0.3" />
             {/* Trailer */}
             <path d="M10 20H85V55H10V20Z" fill="url(#trailer-grad)" />
             {/* Container Lines */}
             <rect x="20" y="25" width="2" height="25" fill="#F8FAFC" opacity="0.2" />
             <rect x="40" y="25" width="2" height="25" fill="#F8FAFC" opacity="0.2" />
             <rect x="60" y="25" width="2" height="25" fill="#F8FAFC" opacity="0.2" />
             {/* Logo text mock */}
             <rect x="25" y="40" width="30" height="5" rx="2" fill="#F8FAFC" />
             <path d="M84 25H105C108.314 25 111.455 26.5415 113.5 29L118 35V55H84V25Z" fill="url(#cab-grad)" />
             {/* Window */}
             <path d="M88 28H103C105.209 28 107.288 29.136 108.5 31L111 35H88V28Z" fill="#1F2937" />
             {/* Grill */}
             <rect x="115" y="40" width="3" height="10" fill="#94A3B8" />
             <rect x="115" y="43" width="4" height="2" fill="#F59E0B" />
             {/* Connector */}
             <rect x="80" y="45" width="4" height="4" fill="#334155" />
             {/* Wheels */}
             <circle cx="20" cy="55" r="8" fill="#1F2937" />
             <circle cx="20" cy="55" r="4" fill="#94A3B8" />
             <circle cx="40" cy="55" r="8" fill="#1F2937" />
             <circle cx="40" cy="55" r="4" fill="#94A3B8" />
             <circle cx="95" cy="55" r="8" fill="#1F2937" />
             <circle cx="95" cy="55" r="4" fill="#94A3B8" />
             <circle cx="110" cy="55" r="8" fill="#1F2937" />
             <circle cx="110" cy="55" r="4" fill="#94A3B8" />
             <defs>
               <linearGradient id="trailer-grad" x1="0" y1="0" x2="0" y2="45" gradientUnits="userSpaceOnUse">
                 <stop stopColor="#2563EB" />
                 <stop offset="1" stopColor="#1E3A8A" />
               </linearGradient>
               <linearGradient id="cab-grad" x1="84" y1="25" x2="84" y2="55" gradientUnits="userSpaceOnUse">
                 <stop stopColor="#FFFFFF" />
                 <stop offset="1" stopColor="#CBD5E1" />
               </linearGradient>
             </defs>
          </svg>
       </div>
    </div>
    
    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900/10 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold w-fit mb-4 uppercase text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Live
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">Find Market Loads</h2>
        <p className="text-sm text-blue-100 max-w-[240px] leading-relaxed mb-6">
          Search verified haulage opportunities across Nigeria.
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 mt-auto">
        <Button onClick={() => { if (onNavigateToNetwork) onNavigateToNetwork(); }} className="flex items-center gap-2 bg-white dark:bg-slate-900 text-blue-700 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-white/10 hover:bg-blue-50 cursor-pointer hover:shadow-sm transition-colors">
          Search Loads <div className="bg-blue-600 text-white p-1 rounded-full"><Search size={14} /></div>
        </Button>
        <Button onClick={() => { if (onNavigateToNetwork) onNavigateToNetwork(); }} className="flex items-center gap-1 text-sm font-semibold text-blue-100 hover:text-white transition-colors">
          Advanced Search <ArrowRight size={16} />
        </Button>
      </div>
    </div>
    
    <div className="absolute right-6 md:right-12 top-6 z-10 flex flex-col items-center">
       <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-900 animate-bounce border-4 border-[#1F2937]">
          <MapPin size={28} className="fill-white text-blue-600" />
       </div>
    </div>
  </motion.div>
);

export const MyShipmentsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    onClick={onNavigateToNetwork}
    className="relative overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row gap-6 items-center group"
  >
    <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden relative bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
       <div className="relative w-[80%] h-[80%] flex items-end justify-center group-hover:scale-105 transition-transform duration-75">
          <svg width="100%" height="100%" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-2">
             <ellipse cx="100" cy="140" rx="80" ry="10" fill="#000000" opacity="0.1" />
             <path d="M40 130V70L100 40V100L40 130Z" fill="#94A3B8" />
             <path d="M40 70L100 40L160 70V130L100 160V100L40 70Z" fill="#CBD5E1" />
             <path d="M100 40L160 70V130L100 100V40Z" fill="#E2E8F0" />
             <path d="M30 70L100 35L110 40L40 75L30 70Z" fill="#475569" />
             <path d="M100 35L170 70L160 75L90 40L100 35Z" fill="#64748B" />
             <path d="M70 115V85L90 75V105L70 115Z" fill="#334155" />
             
             <path d="M20 130V110L40 100V120L20 130Z" fill="#2563EB" />
             <path d="M40 100L55 95V115L40 120V100Z" fill="#2563EB" />
             <path d="M20 110L35 105L55 95L40 100L20 110Z" fill="#2563EB" />
             
             <path d="M30 115V95L50 85V105L30 115Z" fill="#B91C1C" />
             <path d="M50 85L65 80V100L50 105V85Z" fill="#DC2626" />
             <path d="M30 95L45 90L65 80L50 85L30 95Z" fill="#EF4444" />
             
             <g transform="translate(110, 100)">
               <path d="M10 25H30C32.7614 25 35 22.7614 35 20V15L25 10H10V25Z" fill="#F59E0B" />
               <path d="M15 10H25V0H15V10Z" fill="#1F2937" opacity="0.8" />
               <path d="M12 0H28V2H12V0Z" fill="#334155" />
               <path d="M35 12H40V25H48V28H35V12Z" fill="#334155" />
               <circle cx="15" cy="25" r="4" fill="#1F2937" />
               <circle cx="30" cy="25" r="4" fill="#1F2937" />
             </g>
          </svg>
       </div>
    </div>
    
    <div className="flex-1 space-y-3 text-center md:text-left">
      <div className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md uppercase tracking-wider mb-1">
        Active & Verified
      </div>
      <h3 className="text-xl font-bold text-[#1F2937]">My Shipments & Fleet</h3>
      <p className="text-sm text-[#64748B] leading-relaxed max-w-sm mx-auto md:mx-0">
        Manage active shipments and monitor verified transport providers.
      </p>
      <div className="pt-2 flex items-center justify-center md:justify-start gap-1.5 text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
        View Dashboard <ArrowRight size={16} />
      </div>
    </div>
    <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex w-14 h-14 bg-blue-600 text-white rounded-full items-center justify-center shadow-lg shadow-blue-500/30">
       <Box size={24} />
    </div>
  </motion.div>
);

export const BoostLoadCard = ({ onBoostClick }: { onBoostClick: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    onClick={onBoostClick}
    className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-slate-200 to-slate-300 p-6 shadow-xl shadow-slate-500/20 cursor-pointer group"
  >
    <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-200 to-slate-300">
       <div className="absolute inset-0 bg-gradient-to-tr from-slate-400 via-transparent to-white/40 mix-blend-overlay"></div>
       
       <Star className="absolute top-4 left-[20%] text-amber-400 opacity-60 w-5 h-5 fill-amber-400 animate-pulse" style={{ animationDelay: '0ms' }} />
       <Star className="absolute bottom-6 left-[40%] text-yellow-500 opacity-40 w-3 h-3 fill-yellow-500 animate-pulse" style={{ animationDelay: '300ms' }} />
       <Star className="absolute top-1/3 left-[60%] text-amber-500 opacity-50 w-4 h-4 fill-amber-500 animate-pulse" style={{ animationDelay: '600ms' }} />
       
       <svg className="absolute right-0 bottom-0 w-[60%] h-full opacity-30 mix-blend-overlay" viewBox="0 0 200 100" preserveAspectRatio="none">
         <rect x="20" y="60" width="15" height="40" rx="2" fill="#FFFFFF" />
         <rect x="50" y="40" width="15" height="60" rx="2" fill="#FFFFFF" />
         <rect x="80" y="20" width="15" height="80" rx="2" fill="#FFFFFF" />
         <rect x="110" y="50" width="15" height="50" rx="2" fill="#FFFFFF" />
         <rect x="140" y="30" width="15" height="70" rx="2" fill="#FFFFFF" />
         <rect x="170" y="10" width="15" height="90" rx="2" fill="#FFFFFF" />
       </svg>
    </div>
    
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-3 w-full">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate- font-bold text-[10px] rounded-md uppercase tracking-wider backdrop-blur-sm border border-white/40 w-fit shadow-sm">
          <Crown size={12} /> Premium
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-">Boost Load</h3>
        <p className="text-sm text-slate-600 dark:text-slate- max-w-[280px]">
          Promote your cargo to verified transporters for faster matching.
        </p>
        <Button className="inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-slate-700 transition-colors mt-2 group-hover:shadow-slate-800/30">
          Boost Now <Rocket size={16} />
        </Button>
      </div>
      
      <div className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 transition-transform duration-75 group-hover:-translate-y-3 group-hover:scale-110">
         <Rocket size={120} className="text-white drop-shadow-2xl" />
      </div>
    </div>
  </motion.div>
);

export const TrackShipmentCard = ({ 
  engineStatus, 
  waybillInput, 
  setWaybillInput, 
  handleTrackingRequest,
  isTracking,
  trackingError 
}: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="relative overflow-hidden rounded-[24px] bg-blue-600 border border-blue-500 p-6 shadow-xl group"
  >
    <div className="absolute inset-0 z-0">
       <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
          <path d="M0 50L400 50" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M0 100L400 100" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M0 150L400 150" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M100 0L100 200" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M200 0L200 200" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
          <path d="M300 0L300 200" stroke="white" strokeWidth="1" strokeDasharray="5 5" />
       </svg>
       
       <svg className="absolute inset-0 w-full h-full opacity-20 group-hover:opacity-40 transition-opacity" viewBox="0 0 100 100" preserveAspectRatio="none">
         <path d="M10 80 Q 40 10 90 20" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="2 2" className="animate-pulse" />
       </svg>
    </div>
    
    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
      <div className="w-full md:w-1/2 space-y-4">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/50 backdrop-blur-sm border border-blue-400 rounded-md text-[10px] font-bold w-fit uppercase text-white shadow-sm">
          <Crosshair size={12} /> {engineStatus === 'idle' ? 'GPS Active' : 'Locating...'}
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Track your freight</h3>
        
        <form onSubmit={handleTrackingRequest} className="relative mt-2">
          <input 
            id="tracking-input"
            type="text" 
            placeholder="Enter Waybill or Trip ID (e.g. TRP-502)" 
            className="w-full bg-blue-700/50 border border-blue-500 rounded-xl px-4 py-3.5 text-white placeholder:text-blue-300 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-inner text-sm"
            value={waybillInput}
            onChange={(e) => setWaybillInput(e.target.value)}
          />
          <Button 
            type="submit" 
            disabled={isTracking}
            className="absolute right-2 top-2 bottom-2 bg-white dark:bg-slate-900 text-blue-600 px-4 rounded-lg font-bold text-sm shadow-md hover:bg-blue-50 cursor-pointer hover:shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isTracking ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : 'Track'}
          </Button>
        </form>
        {trackingError && (
          <p className="text-rose-200 text-xs mt-2 bg-rose-900/40 p-2 rounded border border-rose-500/30">
            {trackingError}
          </p>
        )}
      </div>
      
      <div className="hidden md:flex w-full md:w-1/2 justify-end relative h-32">
         <div className="relative w-32 h-32 group-hover:scale-105 transition-transform duration-500">
             <svg viewBox="0 0 40 40" className="w-full h-full absolute inset-0 text-white opacity-20 animate-spin-slow" style={{ animationDuration: '8s' }}>
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
             </svg>
             
             <svg viewBox="0 0 40 40" className="w-full h-full absolute inset-0">
               <g transform="translate(5, 5)">
                 <path d="M15 0L30 10V20L15 30L0 20V10L15 0Z" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1" />
                 <path d="M15 0L15 15L30 10M15 15L0 10M15 15V30" stroke="#FFFFFF" strokeWidth="1" />
                 
                 <circle cx="15" cy="0" r="1.5" fill="#FFFFFF" className="animate-ping" style={{ animationDuration: '2s' }} />
                 <circle cx="0" cy="10" r="1.5" fill="#FFFFFF" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                 <circle cx="30" cy="20" r="1.5" fill="#FFFFFF" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
               </g>
             </svg>
             <div className="absolute right-4 bottom-4 w-12 h-12 bg-transparent text-emerald-600 flex items-center justify-center z-20">
               <Crosshair size={24} className="text-emerald-600" />
             </div>
          </div>
      </div>
    </div>
  </motion.div>
);
