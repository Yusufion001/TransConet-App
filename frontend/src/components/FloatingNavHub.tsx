import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { DarkModeToggle } from './DarkModeToggle';
import TransConetAIAssistant from './TransConetAIAssistant';
import MyBids from './MyBids';
import './navigation-visibility.css';
import { LayoutDashboard, Briefcase, Package, Truck, Navigation, MapPin, Settings, HelpCircle, LogOut, Shield, Menu, X, Handshake, Users, Activity } from 'lucide-react';

export interface FloatingNavHubProps {
  activeRole: string;
  isAdmin?: boolean;
  isAdminAuthorized?: boolean;
  onLogout: () => void;
}

export function FloatingNavHub({ isAdminAuthorized, onLogout, activeRole }: FloatingNavHubProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.substring(1) || 'dashboard';
  const [isOpen, setIsOpen] = useState(false);
  const [showMyBids, setShowMyBids] = useState(false);
  const setActiveView = (view: string) => navigate('/' + view);

  const customerNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'shipments', label: 'Shipments', icon: Package },
    { id: 'network', label: 'Find Transport', icon: Briefcase },
    { id: 'track-shipments', label: 'Track', icon: MapPin },
    { id: 'post-load', label: 'Post Cargo', icon: Package },
    { id: 'settings', label: 'Account', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
    ...(isAdminAuthorized ? [{ id: 'admin', label: 'Administration', icon: Shield }] : []),
  ];

  const transporterNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Find Loads', icon: Briefcase },
    { id: 'driver-dashboard', label: 'My Trips', icon: Navigation },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'my-bids', label: 'My Bids', icon: Handshake },
    { id: 'wallet', label: 'Earnings', icon: Activity },
    { id: 'settings', label: 'Account', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
    ...(isAdminAuthorized ? [{ id: 'admin', label: 'Administration', icon: Shield }] : []),
  ];

  const adminNavItems = [
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'settings', label: 'Account', icon: Settings },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users', icon: Users },
  ];

  const navItems = activeRole.includes('ADMIN') ? adminNavItems : activeRole === 'TRANSPORTER' ? transporterNavItems : customerNavItems;
  const handleNavClick = (id: string) => {
    if (id === 'my-bids') {
      setShowMyBids(true);
      setIsOpen(false);
      return;
    }
    setActiveView(id);
    setIsOpen(false);
  };

  return (
    <>
      <TransConetAIAssistant role={activeRole === 'TRANSPORTER' ? 'TRANSPORTER' : 'CUSTOMER'} />
      <motion.div
        className="tc-floating-nav-hub tc-navigation-layer fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-[200] md:hidden"
      >
        <motion.button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          whileTap={{ scale: .94 }}
          onClick={() => setIsOpen(v => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_10px_30px_rgba(7,27,73,.22)] ring-4 ring-white/80 dark:ring-slate-950/80"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showMyBids && activeRole === 'TRANSPORTER' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[190] bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setShowMyBids(false)}>
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="relative mx-auto flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900"><Handshake size={18} className="text-brand-600" /> My Bids</div>
                <Button type="button" aria-label="Close My Bids" onClick={() => setShowMyBids(false)} className="rounded-full bg-transparent p-2 text-slate-500"><X size={18} /></Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-5"><MyBids /></div>
            </motion.div>
          </motion.div>
        )}

        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 max-h-[72vh] overflow-y-auto rounded-[20px] border border-slate-200 bg-white p-4 shadow-xl md:left-auto md:right-6 md:w-80" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 px-2 pb-3">
                <div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-brand-600">TransConet</p><h3 className="text-sm font-bold text-slate-800">More</h3></div>
                <div className="flex items-center gap-2"><DarkModeToggle /><Button aria-label="Close menu" onClick={() => setIsOpen(false)} className="rounded-full bg-transparent p-2 text-slate-500"><X size={17} /></Button></div>
              </div>
              <nav aria-label="Additional navigation" className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return <motion.button key={item.id} type="button" whileTap={{ scale: .97 }} onClick={() => handleNavClick(item.id)} className="flex min-h-16 items-center gap-3 rounded-xl px-3 text-left text-slate-700 hover:bg-slate-50"><Icon size={20} className="shrink-0 text-brand-600" /><span className="text-sm font-semibold">{item.label}</span></motion.button>;
                })}
                <motion.button type="button" whileTap={{ scale: .97 }} onClick={onLogout} className="flex min-h-16 items-center gap-3 rounded-xl px-3 text-left text-red-500 hover:bg-red-50"><LogOut size={20} /><span className="text-sm font-semibold">Logout</span></motion.button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="tc-floating-nav-hub tc-navigation-layer fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 z-[200] hidden md:block">
        <motion.button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: .95 }}
          onClick={() => setIsOpen(v => !v)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-brand-700"
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </motion.button>
      </motion.div>
    </>
  );
}
