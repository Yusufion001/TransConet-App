import React, { useEffect, useRef, useState } from 'react';
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

export const PremiumHeader = ({
  userPhone,
  userRole,
  onNavigateToAccount,
  onNavigateToSupport,
  onNavigateToNetwork,
}: PremiumHeaderProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = 3;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    if (showProfile) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  return (
    <header className="tc-mobile-safe-top sticky top-0 z-40 flex min-h-[60px] w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 sm:min-h-[64px] sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          <Package size={20} strokeWidth={2.3} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-bold tracking-[-0.02em] text-[#0B1F44] dark:text-white sm:text-[20px]">TransConet</h1>
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 sm:text-[11px]">
            {userRole.replace('_', ' ')} portal
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigateToSupport?.()}
          className="relative h-11 w-11 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={19} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-slate-950" />
          )}
        </Button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowProfile((value) => !value)}
            aria-expanded={showProfile}
            aria-haspopup="menu"
            className="flex h-11 w-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 transition active:scale-[0.98] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto sm:px-3"
          >
            <UserRound size={18} strokeWidth={2} />
            <span className="hidden max-w-[140px] truncate text-sm font-semibold sm:block">{userPhone}</span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                role="menu"
                className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <p className="mb-1 text-xs font-medium text-slate-500">Signed in as</p>
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{userPhone}</p>
                </div>
                <div className="flex flex-col gap-1 p-2">
                  <button type="button" onClick={() => { setShowProfile(false); onNavigateToAccount?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Settings size={18} className="shrink-0 text-slate-400" />Account Settings</button>
                  <button type="button" onClick={() => { setShowProfile(false); onNavigateToNetwork?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Crosshair size={18} className="shrink-0 text-slate-400" />Freight Network</button>
                  <button type="button" onClick={() => { setShowProfile(false); onNavigateToSupport?.(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Headset size={18} className="shrink-0 text-slate-400" />Support Center</button>
                </div>
                <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                  <button type="button" onClick={() => { setShowProfile(false); window.location.href = '/login'; }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"><LogOut size={18} className="shrink-0 text-red-500" />Sign Out</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
