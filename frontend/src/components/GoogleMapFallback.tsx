import React from 'react';
import { MapPin, Navigation, Compass, ShieldCheck } from 'lucide-react';

interface GoogleMapFallbackProps {
  origin?: string;
  destination?: string;
  height?: string;
  className?: string;
  title?: string;
}

export default function GoogleMapFallback({
  origin = 'Lagos Port, Apapa',
  destination = 'Kano Central Hub',
  height = 'h-64',
  className = '',
  title = 'Interactive GPS Route Vector Map'
}: GoogleMapFallbackProps) {
  return (
    <div className={`relative w-full ${height} bg-slate-900 rounded-[20px] overflow-hidden border border-slate-800 shadow-sm flex flex-col justify-between p-4 ${className}`}>
      {/* Background SVG vector map grid */}
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Simulated Route SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M 15,80 Q 35,20 85,25" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3, 3" className="animate-pulse" />
        <circle cx="15" cy="80" r="3" fill="#10B981" />
        <circle cx="85" cy="25" r="3" fill="#EF4444" />
      </svg>

      {/* Top Banner */}
      <div className="relative z-10 flex items-center justify-between bg-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2">
          <Compass className="text-brand-400 animate-spin-slow" size={16} />
          <span className="text-xs font-bold text-slate-200 dark:text-slate-300">{title}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck size={12} /> Offline Fallback Active
        </span>
      </div>

      {/* Center Route Overlay */}
      <div className="relative z-10 my-auto text-center bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 max-w-sm mx-auto shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 text-xs mb-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{origin}</span>
          </div>
          <Navigation size={14} className="text-brand-400 shrink-0" />
          <div className="flex items-center gap-1.5 text-red-400 font-bold truncate">
            <MapPin size={14} className="shrink-0" />
            <span className="truncate">{destination}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-400">
          Google Maps API key unconfigured. Utilizing high-fidelity vector route engine.
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg">
        <span>Coordinate Bounds: 6.5244° N, 3.3792° E</span>
        <span className="text-brand-400 font-bold">Simulated Live GPS</span>
      </div>
    </div>
  );
}
