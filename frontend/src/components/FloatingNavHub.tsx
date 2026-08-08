import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { DarkModeToggle } from './DarkModeToggle';
import TransConetAIAssistant from './TransConetAIAssistant';
import MyBids from './MyBids';
import './navigation-visibility.css';
import {
  LayoutDashboard, Search, PackagePlus, Briefcase, Truck, Navigation,
  MapPin, Rocket, Settings, HelpCircle, LogOut, Shield, Menu, X, Handshake
} from 'lucide-react';

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
  const setActiveView = (v: string) => navigate('/' + v);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNavId, setSelectedNavId] = useState(activeView);
  const [showMyBids, setShowMyBids] = useState(false);

  useEffect(() => { setSelectedNavId(activeView); }, [activeView]);

  useEffect(() => {
    const saved = localStorage.getItem('transport_nav_pos');
    if (saved) {
      try { setPosition(JSON.parse(saved)); } catch { /* ignore invalid saved position */ }
    }
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const currentX = info.point.x;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    let newX = position.x + info.offset.x;
    let newY = position.y + info.offset.y;
    newX = currentX < windowWidth / 2 ? -(windowWidth - 76) : 0;
    const maxY = 0;
    const minY = -(windowHeight - 96);
    if (newY > maxY) newY = maxY;
    if (newY < minY) newY = minY;
    const newPos = { x: newX, y: newY };
    setPosition(newPos);
    localStorage.setItem('transport_nav_pos', JSON.stringify(newPos));
  };

  const customerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'network', label: 'Find Transport', icon: Search },
    { id: 'post-load', label: 'Post Load', icon: PackagePlus },
    { id: 'track-shipments', label: 'Track Shipments', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
    ...(isAdminAuthorized ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  const transporterNavItems = [
    { id: 'driver-dashboard', label: 'Driver Dashboard', icon: Navigation },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'marketplace', label: 'Marketplace', icon: Briefcase },
    { id: 'my-bids', label: 'My Bids', icon: Handshake },
    { id: 'boost-load', label: 'Boost Load', icon: Rocket },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
    ...(isAdminAuthorized ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [])
  ];

  const navItems = activeRole === 'CUSTOMER' ? customerNavItems : transporterNavItems;

  const handleNavClick = (id: string) => {
    if (id === 'my-bids') {
      setSelectedNavId(id);
      setShowMyBids(true);
      setIsOpen(false);
      return;
    }
    setActiveView(id);
    setSelectedNavId(id);
    setTimeout(() => setIsOpen(false), 250);
  };

  const handleLogoutClick = () => {
    onLogout();
    setTimeout(() => setIsOpen(false), 250);
  };

  return (
    <>
      <TransConetAIAssistant role={activeRole === 'TRANSPORTER' ? 'TRANSPORTER' : 'CUSTOMER'} />
      <AnimatePresence>
        {showMyBids && activeRole === 'TRANSPORTER' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[190] bg-slate-900/50 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setShowMyBids(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0, scale: 0.98 }}
              className="relative mx-auto flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white"><Handshake size={18} className="text-brand-600" /> My Bids</div>
                <Button type="button" aria-label="Close My Bids" onClick={() => setShowMyBids(false)} className="rounded-full bg-transparent p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><X size={18} /></Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-5"><MyBids /></div>
            </motion.div>
          </motion.div>
        )}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="tc-navigation-layer absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 md:left-auto md:right-6 md:w-80 bg-white dark:bg-slate-900 rounded-[20px] p-4 shadow-sm border border-slate-200 dark:border-slate-800 max-h-[70vh] overflow-y-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">Menu</h3>
                <div className="flex items-center gap-2">
                  <DarkModeToggle />
                  <Button aria-label="Action" onClick={() => setIsOpen(false)} className="p-1.5 bg-transparent text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={16} strokeWidth={2.5} />
                  </Button>
                </div>
              </div>
              <nav aria-label="Primary navigation" className="tc-navigation-layer grid grid-cols-3 gap-2">
                {navItems.map((item) => {
                  const isActive = selectedNavId === item.id;
                  const Icon = item.icon;
                  return (
                    <motion.button key={item.id} type="button" whileTap={{ scale: 0.9 }} onClick={() => handleNavClick(item.id)} className={`tc-navigation-control relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-colors ${isActive ? 'text-brand-600' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                      {isActive && <motion.div layoutId="nav-highlight" className="absolute inset-0 bg-brand-50 dark:bg-brand-900/30 rounded-2xl z-0" initial={false} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                      <div className="relative z-10 flex flex-col items-center gap-2"><Icon aria-hidden="true" size={24} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" /><span className="text-[10px] font-bold text-center leading-tight">{item.label}</span></div>
                    </motion.button>
                  );
                })}
                <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={handleLogoutClick} className="tc-navigation-control flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all bg-transparent text-red-500 hover:bg-red-50 hover:text-red-600">
                  <LogOut size={24} strokeWidth={2} /><span className="text-[10px] font-bold text-center leading-tight">Logout</span>
                </motion.button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div drag dragMomentum={false} dragElastic={0.1} onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd} animate={position} className="tc-floating-nav-hub tc-navigation-layer fixed z-[200] cursor-grab active:cursor-grabbing" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))', right: 16 }}>
        <motion.button
          type="button"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { if (!isDragging) setIsOpen(!isOpen); }}
          className={`tc-navigation-control w-14 h-14 hover:bg-brand-700 shadow-md rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors ${isOpen ? 'bg-slate-900 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
        >
          {isOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
        </motion.button>
      </motion.div>
    </>
  );
}
