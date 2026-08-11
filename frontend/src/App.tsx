import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { fetchCsrfToken } from './api/client';
import React, { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { APIProvider } from '@vis.gl/react-google-maps';
import { FloatingNavHub } from './components/FloatingNavHub';
import LoginGateway from './components/LoginGateway';
import WelcomeSlides from './components/WelcomeSlides';
import TransporterFleetDashboard from './components/TransporterFleetDashboard';
import TransporterHome from './components/TransporterHome';
import ExpressMatcher from './components/ExpressMatcher';
import AdminPortalGenerator from './components/AdminPortalGenerator';
import DedicatedAdminLogin from './components/DedicatedAdminLogin';
import AccountManagement from './components/AccountManagement';
import DeepSapphireDashboard from './components/DeepSapphireDashboard';
import ShipperShipmentsPage from './components/ShipperShipmentsPage';
import SupportChatWidget from './components/SupportChatWidget';
import DriverDashboard from './components/DriverDashboard';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ShieldAlert } from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAP_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY || '';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.substring(1) || 'dashboard';
  const dashboardViews = ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'];
  const setActiveView = (v: string) => navigate('/' + v);
  const { isAuthenticated, userPhone, userEmail, activeRole, isOnboarded, login, logout, setRole, setOnboarded } = useAuthStore();
  const { handleLoginSuccess, handleLogout } = useAuth({ login, logout, setRole, setActiveView });
  const [supportTab, setSupportTab] = useState<'chat' | 'notifications'>('chat');
  const [supportHighlight, setSupportHighlight] = useState(false);

  const handleNavigateToSupportWithHighlight = () => {
    setSupportTab('notifications');
    setSupportHighlight(true);
    setActiveView('support');
  };

  useEffect(() => { fetchCsrfToken(); }, []);

  const renderAppContent = () => {
    if (!isAuthenticated) {
      if (location.pathname === '/admin/login') {
        return (
          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800 scrollbar-none animate-in fade-in">
            <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading Admin Portal...</div>}>
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
              <div className="absolute -inset-6 bg-gradient-to-tr from-brand-100/50 to-brand-50/50 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition duration-1000" />
              <div className="relative">
                <span className="text-[36px] sm:text-[52px] font-sans font-light tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-0.5">
                  <span className="font-bold text-brand-900">Trans</span><span className="text-slate-400 dark:text-slate-400">Conet</span>
                </span>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="h-[1px] w-8 bg-transparent" />
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-[0.2em] uppercase">Connecting Cargo with Capacity</p>
                  <div className="h-[1px] w-8 bg-transparent" />
                </div>
              </div>
            </div>
            <WelcomeSlides onComplete={() => { setOnboarded(true); localStorage.setItem('onboarded', 'true'); }} />
          </div>
        );
      }
      return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800 scrollbar-none animate-in fade-in">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading Gateway...</div>}>
            <LoginGateway onLoginSuccess={handleLoginSuccess} />
          </Suspense>
        </div>
      );
    }

    const isAdmin = activeRole.includes('ADMIN');
    const isTransporter = activeRole === 'TRANSPORTER';
    const isShipper = activeRole === 'CUSTOMER';

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-800">
        <FloatingNavHub activeRole={activeRole} isAdminAuthorized={isAdmin} onLogout={handleLogout} />

        {(!dashboardViews.includes(activeView) || isTransporter) && !isAdmin && (
          <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/95">
            <div className="select-none">
              <span className="text-[24px] font-light tracking-tight text-slate-900 dark:text-white">
                <span className="font-bold text-brand-900">Trans</span><span className="text-slate-400">Conet</span>
              </span>
              <p className="mt-[-2px] pl-0.5 text-[7.5px] font-bold uppercase tracking-[0.15em] text-slate-500">Connecting Cargo with Capacity</p>
            </div>
            <button onClick={handleLogout} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-red-500" title="Sign Out" aria-label="Sign out"><LogOut size={16} /></button>
          </header>
        )}

        <div className={`min-h-0 flex-1 flex flex-col ${dashboardViews.includes(activeView) ? 'overflow-hidden p-0' : 'overflow-y-auto overflow-x-hidden scrollbar-none ' + (['account', 'wallet', 'reports', 'settings'].includes(activeView) ? 'pb-24' : 'p-3 pb-24')}`}>
          <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>}>
            {activeView === 'admin' || (isAdmin && dashboardViews.includes(activeView)) ? (
              isAdmin ? <AdminPortalGenerator currentRole={activeRole} userPhone={userPhone} userEmail={userEmail} /> : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center"><ShieldAlert size={44} className="mb-4 text-red-500" /><h3 className="text-lg font-black text-slate-900 dark:text-white">Access Denied</h3></div>
              )
            ) : activeView === 'fleet' && isTransporter ? (
              <TransporterFleetDashboard />
            ) : activeView === 'driver-dashboard' && isTransporter ? (
              <DriverDashboard />
            ) : dashboardViews.includes(activeView) && isTransporter ? (
              <TransporterHome onNavigate={setActiveView} userPhone={userPhone} />
            ) : activeView === 'shipments' && isShipper ? (
              <ShipperShipmentsPage />
            ) : activeView === 'track-shipments' && isShipper ? (
              <DeepSapphireDashboard
                onNavigateToNetwork={() => setActiveView('network')}
                onNavigateToPostCargo={() => setActiveView('post-load')}
                onNavigateToAccount={() => setActiveView('account')}
                onNavigateToSupport={handleNavigateToSupportWithHighlight}
                onNavigateToTrack={() => setActiveView('track-shipments')}
                userPhone={userPhone}
                userRole={activeRole}
                activeView="track-shipments"
              />
            ) : dashboardViews.includes(activeView) && isShipper ? (
              <DeepSapphireDashboard
                onNavigateToNetwork={() => setActiveView('network')}
                onNavigateToPostCargo={() => setActiveView('post-load')}
                onNavigateToTrack={() => setActiveView('track-shipments')}
                onNavigateToAccount={() => setActiveView('account')}
                onNavigateToSupport={handleNavigateToSupportWithHighlight}
                userPhone={userPhone}
                userRole={activeRole}
              />
            ) : ['network', 'post-load', 'marketplace'].includes(activeView) ? (
              <div className="h-full min-h-0 flex flex-col overflow-hidden">
                <ExpressMatcher
                  initialMode={activeView === 'post-load' ? 'SHIPPER' : activeView === 'marketplace' ? 'TRANSPORTER' : (isShipper ? 'SHIPPER' : 'TRANSPORTER')}
                  initialSubMode={isTransporter && localStorage.getItem('userVerified') !== 'true' ? 'REGISTER' : 'JOBS'}
                />
              </div>
            ) : ['support', 'messages'].includes(activeView) ? (
              <SupportChatWidget inline={true} initialTab={supportTab} highlight={supportHighlight} onHighlightReset={() => setSupportHighlight(false)} />
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
      <div className="fixed inset-0 h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-slate-50 font-sans text-slate-900 dark:bg-slate-800 dark:text-white">
        {renderAppContent()}
      </div>
    </APIProvider>
  );
}
