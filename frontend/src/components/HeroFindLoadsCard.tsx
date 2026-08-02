import React from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

export const HeroFindLoadsCard = ({ onNavigateToNetwork }: { onNavigateToNetwork?: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px] bg-brand-600 text-white shadow-xl min-h-[220px] flex flex-col justify-between group"
    >
      {/* Background Image / SVG Illustration */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-brand-600 to-brand-700 overflow-hidden">
         {/* City Skyline */}
         <svg className="absolute bottom-0 w-full h-32 opacity-20" viewBox="0 0 400 100" preserveAspectRatio="none">
           <path d="M0,100 L0,50 L20,50 L20,30 L40,30 L40,60 L60,60 L60,20 L80,20 L80,45 L100,45 L100,10 L120,10 L120,55 L150,55 L150,25 L180,25 L180,60 L200,60 L200,15 L230,15 L230,40 L260,40 L260,30 L290,30 L290,70 L320,70 L320,20 L350,20 L350,50 L380,50 L380,35 L400,35 L400,100 Z" fill="#94A3B8" />
         </svg>
         {/* Road / Path */}
         <svg className="absolute bottom-0 w-full h-40" viewBox="0 0 400 150" preserveAspectRatio="none">
           <path d="M-50,150 Q150,150 200,100 T450,50" fill="none" stroke="#334155" strokeWidth="40" strokeLinecap="round" />
           <path d="M-50,150 Q150,150 200,100 T450,50" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="15 15" strokeLinecap="round" className="opacity-50" />
         </svg>
         
         {/* Truck Illustration */}
         <div className="absolute bottom-6 right-[30%] transform translate-x-1/2 drop-shadow-2xl group-hover:-translate-y-1 transition-transform duration-75">
           <svg width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
             {/* Cab Shadow */}
             <ellipse cx="60" cy="65" rx="50" ry="5" fill="#000000" opacity="0.4" />
             {/* Trailer */}
             <rect x="2" y="10" width="80" height="45" rx="2" fill="#2563EB" />
             <rect x="2" y="10" width="80" height="45" rx="2" fill="url(#trailer-grad)" />
             {/* Lines on trailer */}
             <line x1="20" y1="15" x2="20" y2="50" stroke="#2563EB" strokeWidth="1.5" />
             <line x1="40" y1="15" x2="40" y2="50" stroke="#2563EB" strokeWidth="1.5" />
             <line x1="60" y1="15" x2="60" y2="50" stroke="#2563EB" strokeWidth="1.5" />
             {/* Cab */}
             <path d="M84 25H105C108.314 25 111.455 26.5415 113.5 29L118 35V55H84V25Z" fill="#F8FAFC" />
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
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Market Operations</h2>
          <ul className="text-sm text-brand-100 max-w-[320px] leading-relaxed mb-6 space-y-2">
            <li><strong>Post Cargo:</strong> Initiate new shipment requests to the marketplace.</li>
            <li><strong>Find Transporters:</strong> Browse and connect with trusted transport providers.</li>
            <li><strong>Quote Comparison:</strong> View and compare real-time shipping rates and bids.</li>
          </ul>
        </div>
        
        <div className="flex items-center gap-4 mt-auto">
          <Button onClick={() => { if (onNavigateToNetwork) onNavigateToNetwork(); }} className="flex items-center gap-2 bg-white dark:bg-slate-900 text-brand-700 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-white/10 hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors">
            Find Transport <div className="bg-brand-600 text-white p-1 rounded-full"><Search size={14} /></div>
          </Button>
          <Button onClick={() => { if (onNavigateToNetwork) onNavigateToNetwork(); }} className="flex items-center gap-1 text-sm font-semibold text-brand-100 hover:text-white transition-colors">
            Go to Marketplace <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      
      {/* Map pin */}
      <div className="absolute right-6 md:right-12 top-6 z-10 flex flex-col items-center">
         <div className="w-14 h-14 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-brand-900 animate-bounce border-4 border-[#1F2937]">
            <MapPin size={28} className="fill-white text-brand-600" />
         </div>
      </div>
    </motion.div>
  );
};
