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

export const PremiumHeader = ({ 
  userPhone, 
  userRole, 
  onNavigateToAccount, 
  onNavigateToSupport,
  onNavigateToNetwork
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
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b-0 border-x-0 border-t-0 border-slate-200 dark:border-slate-800 mb-8 px-6 py-4 flex items-center justify-between">
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-brand-600 flex items-center justify-center shadow-sm">
          <Package size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            TransConet
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
            {userRole.replace('_', ' ')} Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onNavigateToSupport?.()}
          className="relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          title="Notifications"
        >
          <Bell size={20} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
          )}
        </Button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <UserRound size={16} strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold hidden md:block text-slate-700 dark:text-slate-300">
              {userPhone}
            </span>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl enterprise-shadow z-50 overflow-hidden origin-top-right"
              >
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Signed in as</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white truncate">{userPhone}</p>
                </div>
                
                <div className="p-2 flex flex-col gap-1">
                  <button 
                    onClick={() => { setShowProfile(false); onNavigateToAccount?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Settings size={18} className="text-slate-400" />
                    Account Settings
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); onNavigateToNetwork?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Crosshair size={18} className="text-slate-400" />
                    Freight Network
                  </button>
                  <button 
                    onClick={() => { setShowProfile(false); onNavigateToSupport?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Headset size={18} className="text-slate-400" />
                    Support Center
                  </button>
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      setShowProfile(false);
                      // Trigger global logout event or navigate to login
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut size={18} className="text-rose-500" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
