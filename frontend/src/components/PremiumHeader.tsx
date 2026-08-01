import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, UserRound, Crosshair, Headset } from 'lucide-react';
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
  const unreadCount = 3;

  return (
    <div className="relative flex justify-between items-start mb-6">
      {/* Click outside backdrops */}
      {showProfile && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => {
            setShowProfile(false);
          }}
        />
      )}
      
      <div className="z-10">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1F2937]  ">
          Operation <span className="bg-gradient-to-r from-blue-600 to-indigo-600   bg-clip-text text-transparent">Hub</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate- font-medium">Digital market platform</p>
      </div>

      <div className="flex items-center gap-4 relative z-50">
        {/* Notification Bell */}
        <div className="relative">
          <Button aria-label="Action" 
            onClick={() => {
              setShowProfile(false);
              onNavigateToSupport?.();
            }}
            className="relative p-2 rounded-full transition-all cursor-pointer text-slate-600 dark:text-slate- hover:bg-blue-50 cursor-pointer hover:shadow-sm hover:text-blue-600"
            title="View Broadcast Board & Alerts"
          >
            <Bell size={18} className={unreadCount > 0 ? 'animate-bounce' : ''} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-slate-800 dark:text-slate- text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <Button aria-label="Action" 
            onClick={() => {
              setShowProfile(!showProfile);
            }}
            className={`w-10 h-10 rounded-full border-2 transition-all overflow-hidden flex items-center justify-center cursor-pointer shadow-sm relative ${
              showProfile ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-transparent hover:bg-blue-50 cursor-pointer hover:shadow-sm text-slate-600 dark:text-slate-300'
            }`}
          >
            <UserRound size={20} className={showProfile ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </Button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden text-left"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate- uppercase tracking-widest">Active Profile</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate- mt-1">{userPhone}</p>
                  <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-black uppercase tracking-wider mt-2">
                    {userRole}
                  </span>
                </div>
                
                <div className="p-1.5 space-y-0.5">
                  <Button aria-label="Action" 
                    onClick={() => {
                      setShowProfile(false);
                      onNavigateToAccount?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate- hover:bg-blue-50 cursor-pointer hover:shadow-sm hover:text-blue-600 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <UserRound size={14} className="text-slate-600 dark:text-slate-" />
                    Manage Profile & Security
                  </Button>
                  <Button aria-label="Action" 
                    onClick={() => {
                      setShowProfile(false);
                      onNavigateToNetwork?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate- hover:bg-blue-50 cursor-pointer hover:shadow-sm hover:text-blue-600 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <Crosshair size={14} className="text-slate-600 dark:text-slate-" />
                    Freight Marketplace
                  </Button>
                  <Button aria-label="Action" 
                    onClick={() => {
                      setShowProfile(false);
                      onNavigateToSupport?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate- hover:bg-blue-50 cursor-pointer hover:shadow-sm hover:text-blue-600 transition flex items-center gap-2.5 cursor-pointer"
                  >
                    <Headset size={14} className="text-slate-600 dark:text-slate-" />
                    Logistics Support Desk
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
