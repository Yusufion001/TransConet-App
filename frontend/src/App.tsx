import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { fetchCsrfToken } from './api/client';
import React, { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { APIProvider } from '@vis.gl/react-google-maps';
import { FloatingNavHub } from './components/FloatingNavHub';
import { DarkModeToggle } from './components/DarkModeToggle';
import LoginGateway from './components/LoginGateway';
import WelcomeSlides from './components/WelcomeSlides';
import AdminVerificationFeed from './components/AdminVerificationFeed';
import TransporterFleetDashboard from './components/TransporterFleetDashboard';
import ExpressMatcher from './components/ExpressMatcher';
import AdminPortalGenerator from './components/AdminPortalGenerator';
import DedicatedAdminLogin from './components/DedicatedAdminLogin';
import AccountManagement from './components/AccountManagement';
import DeepSapphireDashboard from './components/DeepSapphireDashboard';
import ShipperShipmentsPage from './components/ShipperShipmentsPage';
import SupportChatWidget from './components/SupportChatWidget';
import DriverDashboard from './components/DriverDashboard';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Truck, LogOut, User, ShieldAlert, Sliders, LayoutDashboard, Smartphone, X, Copy, Check, ExternalLink, LifeBuoy, Building, Briefcase, Shield, Headset, CircleUser } from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAP_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.substring(1) || 'dashboard';
  const dashboardViews = ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'];
  const setActiveView = (v: string) => navigate('/' + v);
  const { isAuthenticated, userPhone, userEmail, activeRole, isOnboarded, login, logout, setRole, setOnboarded } = useAuthStore();
  const {
    handleLoginSuccess,
    handleRoleSwitched,
    handleLogout,
  } = useAuth({
    login,
    logout,
    setRole,
    setActiveView,
  });

  const [supportTab, setSupportTab] = useState<'chat' | 'notifications'>('chat');
  const [supportHighlight, setSupportHighlight] = useState(false);

  const handleNavigateToSupportWithHighlight = () => {
    setSupportTab('notifications');
    setSupportHighlight(true);
    setActiveView('support');
  };

  const handleSupportHighlightReset = () => {
    setSupportHighlight(false);
  };

  const { isMobileDevice, setMobileDevice, isMobileFrame: useMobileFrame, setMobileFrame: setUseMobileFrame } = useUIStore();

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileDevice(isMobile);
      if (isMobile) {
        setUseMobileFrame(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isMobilePortalOpen, setIsMobilePortalOpen] = useState(false);
  const [expoTunnelUrl, setExpoTunnelUrl] = useState(window.location.origin);
  const [copied, setCopied] = useState(false);
  const [statusBarTime, setStatusBarTime] = useState('09:41');
  const [simulatedCarrier] = useState('MTN NG 5G');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setStatusBarTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(expoTunnelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderAppContent = () => {
    if (!isAuthenticated) {
      if (location.pathname === '/admin/login') {
        return (
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800 scrollbar-none animate-in fade-in">
            <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">Loading Admin Portal...</div>}>
              <DedicatedAdminLogin onLoginSuccess={(admin) => {
                if (admin) {
                  login(localStorage.getItem('admin_token') || '', 'Admin', admin.email);
                  setRole(admin.role);
                }
                navigate('/admin');
              }} />
            </Suspense>
          </div>
        );
      }
      if (!isOnboarded) {
        return (
          <div className="flex-1 flex flex-col justify-center py-8 px-4 bg-slate-50 dark:bg-slate-800 overflow-y-auto scrollbar-none animate-in fade-in">
            <div className="max-w-md mx-auto w-full flex flex-col items-center text-center mb-8 select-none relative group">
              <div className="absolute -inset-6 bg-gradient-to-tr from-brand-100/50 to-brand-50/50 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative">
                <span className="text-[36px] sm:text-[52px] font-sans font-light tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
                  <span className="font-bold text-brand-900">Trans</span><span className="text-slate-400 dark:text-slate-400">Conet</span>
                </span>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="h-[1px] w-8 bg-transparent"></div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-[0.2em] uppercase">Connecting Cargo with Capacity</p>
                  <div className="h-[1px] w-8 bg-transparent"></div>
                </div>
              </div>
            </div>
            <WelcomeSlides onComplete={() => { setOnboarded(true); localStorage.setItem('onboarded', 'true'); }} />
          </div>
        );
      }
      return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800 scrollbar-none animate-in fade-in">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">Loading Gateway...</div>}><LoginGateway onLoginSuccess={handleLoginSuccess} /></Suspense>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800 overflow-hidden relative">
        <FloatingNavHub
          activeRole={activeRole}
          isAdminAuthorized={activeRole.includes('ADMIN')}
          onLogout={handleLogout}
        />

        {(!dashboardViews.includes(activeView) || activeRole === 'TRANSPORTER') && (
          <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 select-none">
              <div className="flex flex-col relative group">
                <span className="text-[24px] sm:text-[28px] font-sans font-light tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                  <span className="font-bold text-brand-900">Trans</span><span className="text-slate-400 dark:text-slate-400">Conet</span>
                </span>
                <p className="text-[7.5px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.15em] uppercase pl-0.5 mt-[-2px]">Connecting Cargo with Capacity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleLogout} className="text-slate-400 dark:text-slate-400 hover:text-red-500 p-1.5 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          </header>
        )}

        <div className={`flex-1 flex flex-col overflow-x-hidden overflow-y-auto scrollbar-none ${dashboardViews.includes(activeView) ? 'p-0' : ['account', 'wallet', 'reports', 'settings'].includes(activeView) ? 'pb-24' : 'p-3 pb-24'}`}>
          <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            {activeView === 'fleet' && activeRole !== 'CUSTOMER' ? (
              <TransporterFleetDashboard />
            ) : activeView === 'driver-dashboard' && activeRole !== 'CUSTOMER' ? (
              <DriverDashboard />
            ) : activeView === 'shipments' && activeRole === 'CUSTOMER' ? (
              <ShipperShipmentsPage />
            ) : dashboardViews.includes(activeView) && activeRole !== 'TRANSPORTER' ? (
              <DeepSapphireDashboard
                onNavigateToNetwork={() => setActiveView('network')}
                onNavigateToPostCargo={() => setActiveView('post-load')}
                onNavigateToAccount={() => setActiveView('account')}
                onNavigateToSupport={handleNavigateToSupportWithHighlight}
                userPhone={userPhone}
                userRole={activeRole}
              />
            ) : ['network', 'post-load', 'marketplace'].includes(activeView) ? (
              <div className="h-full flex flex-col overflow-hidden">
                <ExpressMatcher
                  initialMode={activeView === 'post-load' ? 'SHIPPER' : activeView === 'marketplace' ? 'TRANSPORTER' : (activeRole === 'CUSTOMER' ? 'SHIPPER' : 'TRANSPORTER')}
                  initialSubMode={activeRole === 'TRANSPORTER' && localStorage.getItem('userVerified') !== 'true' ? 'REGISTER' : 'JOBS'}
                />
              </div>
            ) : activeView === 'admin' ? (
              activeRole.includes('ADMIN') ? (
                <AdminPortalGenerator currentRole={activeRole} userPhone={userPhone} userEmail={userEmail} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
                  <div className="bg-red-500/10 p-4 rounded-full animate-pulse"><ShieldAlert size={44} className="text-red-500" /></div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Access Denied</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">You are not authorized to view the Administrative portal.</p>
                </div>
              )
            ) : ['support', 'messages'].includes(activeView) ? (
              <SupportChatWidget inline={true} initialTab={supportTab} highlight={supportHighlight} onHighlightReset={handleSupportHighlightReset} />
            ) : (
              <AccountManagement initialSection={activeView === 'wallet' ? 'FINANCE' : activeView === 'reports' ? 'QUALITY' : null} />
            )}
          </Suspense>
        </div>
      </div>
    );
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
      <div className="fixed inset-0 w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-sans">
        {renderAppContent()}
      </div>
    </APIProvider>
  );
}
