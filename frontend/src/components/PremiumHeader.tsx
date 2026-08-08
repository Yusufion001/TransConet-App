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
    <header className="sticky top-0 z-40 flex min-h-[60px] w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 sm:min-h-[64px] sm:px-5 md:px-6">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 sm:h-10 sm:w-10">
          <Package size={20} strokeWidth={2.3} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-[18px] font-bold tracking-[-0.02em] text-[#0B1F44] dark:text-white sm:text-[20px]">TransConet</h1>
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{userRole.replace('_', ' ')} portal</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button variant="ghost" size="icon" onClick={() => onNavigateToSupport?.()} className="relative h-10 w-10 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" title="Notifications" aria-label="Notifications">
          <Bell size={19} strokeWidth={2} />
          {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-slate-950" />}
        </Button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowProfile(!showProfile)} aria-expanded={showProfile} aria-haspopup="menu" className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:h-11 sm:px-3">
            <UserRound size={18} strokeWidth={2} />
            <span className="hidden max-w-[140px] truncate text-sm font-semibold sm:block">{userPhone}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.15, ease: 'easeOut' }} role="menu" className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-24px))] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="mb-1 text-xs font-medium text-slate-500">Signed in as</p>
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{userPhone}</p>
                </div>
                <div className="flex flex-col gap-1 p-2">
                  <button onClick={() => { setShowProfile(false); onNavigateToAccount?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Settings size={18} className="shrink-0 text-slate-400" />Account Settings</button>
                  <button onClick={() => { setShowProfile(false); onNavigateToNetwork?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Crosshair size={18} className="shrink-0 text-slate-400" />Freight Network</button>
                  <button onClick={() => { setShowProfile(false); onNavigateToSupport?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Headset size={18} className="shrink-0 text-slate-400" />Support Center</button>
                </div>
                <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                  <button onClick={() => { setShowProfile(false); window.location.href = '/login'; }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"><LogOut size={18} className="shrink-0 text-red-500" />Sign Out</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
