import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, UserRound, Crosshair, Headset, LogOut, Settings, ChevronDown, Package } from 'lucide-react';
import { Button } from './ui/Button';

interface PremiumHeaderProps {
  userPhone: string;
  userRole: string;
  onNavigateToAccount?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToNetwork?: () => void;
}

export const PremiumHeader = ({ userPhone, userRole, onNavigateToAccount, onNavigateToSupport, onNavigateToNetwork }: PremiumHeaderProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = 3;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setShowProfile(false);
    };
    if (showProfile) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  return (
    <header className="sticky top-0 z-40 flex h-[68px] w-full min-w-0 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:h-[74px] sm:px-5 md:px-6">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 sm:h-10 sm:w-10">
          <Package size={21} strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-[18px] font-bold tracking-[-0.02em] text-[#0B1F44] dark:text-white sm:text-[20px]">TransConet</h1>
          <p className="truncate text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[9px]">{userRole.replace('_', ' ')} Portal</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <Button variant="ghost" size="icon" onClick={() => onNavigateToSupport?.()} className="relative h-10 w-10 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:h-11 sm:w-11" title="Notifications" aria-label="Notifications">
          <Bell size={19} strokeWidth={2} />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-950" />}
        </Button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowProfile(!showProfile)} aria-expanded={showProfile} aria-haspopup="menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:h-11 sm:w-auto sm:gap-2 sm:px-2.5 sm:pr-3">
            <span className="flex items-center justify-center"><UserRound size={18} strokeWidth={2} /></span>
            <span className="hidden max-w-[140px] truncate text-[13px] font-semibold md:block">{userPhone}</span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block md:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.15, ease: 'easeOut' }} role="menu" className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-32px))] max-w-[calc(100vw-32px)] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/30 sm:px-5 sm:py-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Signed in as</p>
                  <p className="truncate text-[13px] font-bold text-slate-900 dark:text-white sm:text-sm md:text-base">{userPhone}</p>
                </div>
                <div className="flex flex-col gap-1 p-2">
                  <button onClick={() => { setShowProfile(false); onNavigateToAccount?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"><Settings size={18} className="shrink-0 text-slate-400" />Account Settings</button>
                  <button onClick={() => { setShowProfile(false); onNavigateToNetwork?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"><Crosshair size={18} className="shrink-0 text-slate-400" />Freight Network</button>
                  <button onClick={() => { setShowProfile(false); onNavigateToSupport?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"><Headset size={18} className="shrink-0 text-slate-400" />Support Center</button>
                </div>
                <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                  <button onClick={() => { setShowProfile(false); window.location.href = '/login'; }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 sm:text-sm"><LogOut size={18} className="shrink-0 text-red-500" />Sign Out</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
