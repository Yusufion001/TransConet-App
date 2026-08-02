import React from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, MapPin, Box, Crosshair, Crown, Rocket, Star, ExternalLink, Activity } from 'lucide-react';
import { Button } from './ui/Button';

export const FindMarketLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row group"
  >
    <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full text-xs font-bold w-fit mb-6 text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Market
        </div>
        <h2 className="text-3xl font-display font-bold mb-3 text-slate-900 dark:text-white tracking-tight">Find Market Loads</h2>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-8">
          Search verified haulage opportunities across the network. Connect instantly with shippers and negotiate real-time rates.
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => { if (onNavigateToNetwork) onNavigateToNetwork(); }} size="lg" className="shadow-lg shadow-brand-500/20">
          Search Loads <Search size={18} className="ml-2 opacity-80" />
        </Button>
        <Button variant="ghost" onClick={() => { if (onNavigateToNetwork) onNavigateToNetwork(); }} size="lg">
          Advanced Filters <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
    
    {/* Right Split Panel - Enterprise Graphic */}
    <div className="hidden md:block w-[40%] bg-slate-50 dark:bg-slate-800/50 relative border-l border-slate-100 dark:border-slate-800 p-8 flex items-center justify-center">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      <div className="relative w-full max-w-[280px] aspect-square rounded-full border-[20px] border-white/50 dark:border-slate-800 shadow-2xl flex items-center justify-center bg-brand-50 dark:bg-brand-900/20">
        <MapPin size={64} className="text-brand-600 dark:text-brand-400 absolute" />
        {/* Pulsing rings */}
        <div className="absolute inset-0 rounded-full border border-brand-500/30 animate-[ping_3s_ease-out_infinite]"></div>
        <div className="absolute inset-8 rounded-full border border-brand-500/30 animate-[ping_3s_ease-out_infinite] delay-700"></div>
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
    className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row group"
  >
    {/* Left graphic */}
    <div className="hidden md:flex w-[30%] bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 items-center justify-center p-8 relative">
       <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
         <Box size={40} strokeWidth={1.5} className="text-slate-700 dark:text-slate-300" />
       </div>
    </div>
    
    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-bold text-[10px] rounded-md uppercase tracking-wider mb-3 w-fit border border-brand-100 dark:border-brand-800">
        <Activity size={12} /> Active & Verified
      </div>
      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">My Shipments & Fleet</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
        Manage active shipments, track documents, and monitor your verified transport providers.
      </p>
      <div className="flex items-center text-brand-600 font-bold text-sm group-hover:translate-x-1 transition-transform w-fit">
        View Dashboard <ArrowRight size={16} className="ml-1.5" />
      </div>
    </div>
  </motion.div>
);

export const BoostLoadCard = ({ onBoostClick }: { onBoostClick: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    onClick={onBoostClick}
    className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl cursor-pointer group flex flex-col md:flex-row"
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] pointer-events-none"></div>
    
    <div className="flex-1 p-6 md:p-8 relative z-10">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-md uppercase tracking-wider border border-amber-500/30 w-fit mb-4">
        <Crown size={12} /> Premium
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-2">Boost Your Load</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-sm">
        Promote your cargo to top-rated verified transporters for 3x faster matching and priority placement.
      </p>
      <Button variant="glass" className="w-fit">
        Boost Now <Rocket size={16} className="ml-2 text-amber-400" />
      </Button>
    </div>

    {/* Graphic Side */}
    <div className="hidden md:flex w-[30%] bg-slate-800/50 items-center justify-center relative border-l border-white/10">
      <Rocket size={80} className="text-amber-400 opacity-90 drop-shadow-2xl transform group-hover:-translate-y-4 group-hover:scale-110 transition-transform duration-500" />
      <Star size={16} className="absolute top-8 left-8 text-amber-300 animate-pulse" />
      <Star size={12} className="absolute bottom-12 right-12 text-amber-200 animate-pulse delay-300" />
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
    transition={{ delay: 0.3 }}
    className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row"
  >
    {/* Visual Map graphic Side */}
    <div className="hidden md:flex w-[35%] bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'1\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
      <div className="w-20 h-20 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm relative z-10">
        <Crosshair size={32} className="text-brand-600" />
      </div>
    </div>

    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold w-fit uppercase mb-4 border border-slate-200 dark:border-slate-700">
        <MapPin size={12} className="text-brand-600" /> 
        {engineStatus === 'idle' ? 'GPS Active' : 'Locating...'}
      </div>
      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-4">Track Freight</h3>
      
      <form onSubmit={handleTrackingRequest} className="relative max-w-sm">
        <input 
          id="tracking-input"
          type="text" 
          placeholder="Enter Waybill (TRP-502)" 
          className="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 pr-24 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm font-mono shadow-inner"
          value={waybillInput}
          onChange={(e) => setWaybillInput(e.target.value)}
        />
        <Button 
          type="submit" 
          disabled={isTracking}
          className="absolute right-1.5 top-1.5 bottom-1.5 h-9"
        >
          {isTracking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Track'}
        </Button>
      </form>
      
      {trackingError && (
        <p className="text-rose-600 dark:text-rose-400 text-xs mt-3 font-medium flex items-center gap-1">
           <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {trackingError}
        </p>
      )}
    </div>
  </motion.div>
);
