import { useAuth } from './hooks/useAuth';import { ProtectedRoute } from './components/ProtectedRoute';
import React, { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { APIProvider } from '@vis.gl/react-google-maps';
import { lazyWithRetry } from './utils/lazyWithRetry';
const LoginGateway = lazyWithRetry(() => import('./components/LoginGateway')); // Your secure phone verification screen
import { FloatingNavHub } from './components/FloatingNavHub';
import { DarkModeToggle } from './components/DarkModeToggle';
const WelcomeSlides = lazyWithRetry(() => import('./components/WelcomeSlides'));
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Truck, LogOut, User, ShieldAlert, Sliders, LayoutDashboard, Smartphone, X, Copy, Check, ExternalLink, LifeBuoy, Building, Briefcase, Shield, Headset, CircleUser } from 'lucide-react';
const AdminVerificationFeed = lazyWithRetry(() => import('./components/AdminVerificationFeed'));
const TransporterFleetDashboard = lazyWithRetry(() => import('./components/TransporterFleetDashboard'));
const ExpressMatcher = lazyWithRetry(() => import('./components/ExpressMatcher'));
const AdminPortalGenerator = lazyWithRetry(() => import('./components/AdminPortalGenerator'));
const DedicatedAdminLogin = lazyWithRetry(() => import('./components/DedicatedAdminLogin'));
const AccountManagement = lazyWithRetry(() => import('./components/AccountManagement'));
const DeepSapphireDashboard = lazyWithRetry(() => import('./components/DeepSapphireDashboard'));
const SupportChatWidget = lazyWithRetry(() => import('./components/SupportChatWidget'));
const DriverDashboard = lazyWithRetry(() => import('./components/DriverDashboard'));
// src/App.tsx
const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAP_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
// Highly resilient offline-capable helper to decode JWT payload parameters safely

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = location.pathname.substring(1) || 'dashboard';
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

  // Track current active dashboard view: 'dashboard', 'network', 'admin', 'account', or 'support'
  

  // Track state for Support Dashboard dynamic highlight & active tab on navigation
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

  // High-Fidelity Mobile Simulator States
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

const [expoTunnelUrl, setExpoTunnelUrl] = useState(
  window.location.origin
);

const [copied, setCopied] = useState(false);

  const [statusBarTime, setStatusBarTime] = useState('09:41');
  const [simulatedCarrier] = useState('MTN NG 5G');

  // Clock Synchronizer for Phone Status Bar
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

  const interval = setInterval(updateTime, 15000); // Check every 15 seconds

  return () => clearInterval(interval);
}, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(expoTunnelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper function to render active screen views
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
          <div className="flex-1 flex flex-col justify-center py-8 px-4 bg-slate-50 dark:bg-slate-800  overflow-y-auto scrollbar-none animate-in fade-in">
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
            <WelcomeSlides 
              onComplete={() => {
                setOnboarded(true);
                localStorage.setItem('onboarded', 'true');
              }} 
            />
          </div>
        );
      }
      return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800  scrollbar-none animate-in fade-in">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">Loading Gateway...</div>}><LoginGateway onLoginSuccess={handleLoginSuccess} /></Suspense>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-800  overflow-hidden relative">
        {/* Mobile Device Header Inside Frame */}
        <header className="border-b border-slate-200 dark:border-slate-700  bg-white dark:bg-slate-900/95  backdrop-blur-md sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none">
          <div className="flex items-center gap-2 select-none">
            <div className="flex flex-col relative group">
              <span className="text-[24px] sm:text-[28px] font-sans font-light tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                <span className="font-bold text-brand-900">Trans</span><span className="text-slate-400 dark:text-slate-400">Conet</span>
              </span>
              <p className="text-[7.5px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.15em] uppercase pl-0.5 mt-[-2px]">Connecting Cargo with Capacity</p>
            </div>
          </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="text-slate-400 dark:text-slate-400 hover:text-red-500 p-1.5 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area Inside Mobile Frame */}
        <div className={`flex-1 flex flex-col overflow-x-hidden overflow-y-auto scrollbar-none ${['account', 'wallet', 'reports', 'settings'].includes(activeView) ? 'pb-24' : 'p-3 pb-24'}`}>
          <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          
          {activeView === 'fleet' && activeRole !== 'CUSTOMER' ? (
            <TransporterFleetDashboard />
          ) : activeView === 'driver-dashboard' && activeRole !== 'CUSTOMER' ? (
            <DriverDashboard />
          ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) && activeRole !== 'TRANSPORTER' ? (
            <DeepSapphireDashboard 
              onNavigateToNetwork={() => setActiveView('network')}
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
              <AdminPortalGenerator 
                currentRole={activeRole} 
                userPhone={userPhone}
                userEmail={userEmail}
                 
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
                <div className="bg-red-500/10 p-4 rounded-full animate-pulse">
                  <ShieldAlert size={44} className="text-red-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white  tracking-tight">Access Denied</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400  leading-relaxed max-w-xs mx-auto">
                  You are not authorized to view the Administrative portal.
                </p>
              </div>
            )
          ) : ['support', 'messages'].includes(activeView) ? (
            <SupportChatWidget 
              inline={true} 
              initialTab={supportTab}
              highlight={supportHighlight}
              onHighlightReset={handleSupportHighlightReset}
            />
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
      <div className="min-h-screen bg-slate-100 dark:bg-slate-800  text-slate-900 dark:text-white  font-sans transition-all duration-75 flex flex-col justify-between">
      
      {import.meta.env.DEV && (
  <div className="hidden md:block bg-white dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm shrink-0">

    {/* Existing simulator code */}

  </div>
)}
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="text-brand-500 animate-pulse" size={18} />
            <span className="text-xs font-black tracking-wider text-slate-800 dark:text-slate-100  uppercase">
              TransConet Mobile Simulator
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Layout Presets */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800  p-1 rounded-xl border border-slate-200 dark:border-slate-700 ">
              <button
                onClick={() => setUseMobileFrame(true)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  useMobileFrame ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400  hover:text-slate-900 dark:text-white :text-white'
                }`}
              >
                Mobile Frame
              </button>
              <button
                onClick={() => setUseMobileFrame(false)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  !useMobileFrame ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400  hover:text-slate-900 dark:text-white :text-white'
                }`}
              >
                Full Screen
              </button>
            </div>

            <button
              onClick={() => setIsMobilePortalOpen(true)}
              className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  hover:border-brand-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200  flex items-center gap-1.5 transition cursor-pointer shadow-sm overflow-hidden"
            >
              <Smartphone size={12} className="text-brand-400" />
              <span>Mobile Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation Area */}
      {isMobileDevice ? (
        <div className="flex-1 w-full bg-slate-50 dark:bg-slate-800 flex flex-col h-full overflow-hidden relative">
          {renderAppContent()}
        </div>
      ) : useMobileFrame ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 bg-slate-100 dark:bg-slate-800  mobile-simulator-active overflow-hidden">
          {/* Physical Phone Shell Container */}
          <div className="relative w-full max-w-[390px] h-[calc(100vh-145px)] max-h-[812px] min-h-[580px] bg-slate-950 rounded-[50px] ring-[12px] ring-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-[4px] border-slate-800/80 flex flex-col overflow-hidden transition-all duration-75">
            {/* Dynamic Physical Buttons Mockups */}
            <div className="absolute left-[-15px] top-[140px] w-[3px] h-[40px] bg-slate-700 rounded-l-md" />
            <div className="absolute left-[-15px] top-[195px] w-[3px] h-[60px] bg-slate-700 rounded-l-md" />
            <div className="absolute left-[-15px] top-[265px] w-[3px] h-[60px] bg-slate-700 rounded-l-md" />
            <div className="absolute right-[-15px] top-[220px] w-[3px] h-[80px] bg-slate-700 rounded-r-md" />

            {/* Dynamic Island Cutout Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center gap-1 px-3 shadow-inner">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800/50 flex items-center justify-center">
                <div className="w-1 h-1 bg-brand-900/60 rounded-full" />
              </div>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-auto" />
            </div>

            {/* Realistic Dynamic Status Bar */}
            <div className="h-11 bg-white dark:bg-slate-900  px-6 pt-2 flex items-center justify-between text-[11px] font-bold select-none text-slate-800 dark:text-slate-100  z-40 shrink-0 border-b border-slate-100 dark:border-slate-800 ">
              <span className="tracking-tight">{statusBarTime}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-400">{simulatedCarrier}</span>
                {/* 5G Signal Strength */}
                <svg className="w-3.5 h-3.5 fill-current text-slate-800 dark:text-slate-100 " viewBox="0 0 24 24">
                  <rect x="2" y="16" width="3" height="4" rx="0.5" />
                  <rect x="7" y="12" width="3" height="8" rx="0.5" />
                  <rect x="12" y="8" width="3" height="12" rx="0.5" />
                  <rect x="17" y="4" width="3" height="16" rx="0.5" />
                </svg>
                {/* Wifi */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21l-12-12c5-5 14-5 19 0l-12 12zm0-18c-3.3 0-6.4 1.3-8.8 3.5l8.8 8.8 8.8-8.8c-2.4-2.2-5.5-3.5-8.8-3.5z" />
                </svg>
                {/* Battery percentage */}
                <div className="flex items-center gap-0.5 border border-current rounded px-1 py-0.25 text-[8px] font-black">
                  <span>100%</span>
                  <div className="w-1 h-2 bg-current rounded-sm ml-0.5" />
                </div>
              </div>
            </div>

            {/* Simulated Frame Screen Viewer */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50 dark:bg-slate-800 ">
              {renderAppContent()}
            </div>

            {/* Virtual Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300  rounded-full z-50 pointer-events-none" />
          </div>
        </div>
      ) : (
        /* Standard Widescreen Rendering Frame */
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 flex flex-col h-full">
          {isAuthenticated ? (
            <div className="flex-1 flex flex-col space-y-6 animate-in fade-in h-full">
              {/* Desktop Header */}
              <header className="border-b border-slate-200 dark:border-slate-700  bg-white dark:bg-slate-900  backdrop-blur-md sticky top-0 z-40 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 select-none group cursor-pointer">
                      <div className="flex flex-col relative">
                        <span className="text-[24px] sm:text-[28px] font-sans font-light tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                          <span className="font-bold text-brand-900">Trans</span><span className="text-slate-400 dark:text-slate-400">Conet</span>
                        </span>
                        <p className="text-[7.5px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.15em] uppercase pl-0.5 mt-[-2px]">Connecting Cargo with Capacity</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveView('account')}
                      className="flex items-center gap-2 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 border px-3 py-1.5 rounded-xl cursor-pointer transition border-slate-200 dark:border-slate-700 "
                    >
                      <User size={14} className="text-brand-400" />
                      <span className="text-xs font-mono">{userPhone}</span>
                      
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="text-slate-500 dark:text-slate-400  hover:text-red-400 p-2 rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </header>

              <main className={['account', 'wallet', 'reports', 'settings'].includes(activeView) ? 'flex-1 flex flex-col' : 'pt-6 pb-0 flex-1 flex flex-col'}>
              {/* Main Widescreen Focus Area Layout */}
                <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                
                <Routes>
                  {activeRole !== 'CUSTOMER' && (
                    <>
                      <Route path="/fleet" element={<div className="flex-1 overflow-y-auto"><TransporterFleetDashboard /></div>} />
                      <Route path="/driver-dashboard" element={<div className="flex-1 overflow-y-auto"><DriverDashboard /></div>} />
                    </>
                  )}
                  {activeRole !== 'TRANSPORTER' && (
                    <>
                      {['/dashboard', '/shipments', '/orders', '/notifications', '/track-shipments', '/boost-load'].map(path => (
                        <React.Fragment key={path}><Route path={path} element={
                          <DeepSapphireDashboard 
                            onNavigateToNetwork={() => setActiveView('network')}
                            onNavigateToAccount={() => setActiveView('account')}
                            onNavigateToSupport={handleNavigateToSupportWithHighlight}
                            userPhone={userPhone}
                            userRole={activeRole}
                          />
                        } /></React.Fragment>
                      ))}
                    </>
                  )}
                  
                  {activeRole !== 'TRANSPORTER' && (
                    <>
                      {['/network', '/post-load'].map(path => (
                        <React.Fragment key={path}><Route path={path} element={
                          <div className="h-full flex flex-col">
                            <ExpressMatcher 
                              initialMode={'SHIPPER'} 
                              initialSubMode={'JOBS'}
                            />
                          </div>
                        } /></React.Fragment>
                      ))}
                    </>
                  )}
                  {activeRole !== 'CUSTOMER' && (
                    <>
                      {['/network', '/marketplace'].map(path => (
                        <React.Fragment key={path}><Route path={path} element={
                          <div className="h-full flex flex-col">
                            <ExpressMatcher 
                              initialMode={'TRANSPORTER'} 
                              initialSubMode={localStorage.getItem('userVerified') !== 'true' ? 'REGISTER' : 'JOBS'}
                            />
                          </div>
                        } /></React.Fragment>
                      ))}
                    </>
                  )}
                  <Route path="/admin/login" element={<DedicatedAdminLogin onLoginSuccess={(admin) => {
    if (admin) {
      login(localStorage.getItem('admin_token') || '', 'Admin', admin.email);
      setRole(admin.role);
    }
    navigate('/admin');
  }} />} />
                  <Route path="/admin" element={
                    activeRole.includes('ADMIN') ? (
                      <AdminPortalGenerator 
                        currentRole={activeRole} 
                        userPhone={userPhone} 
                        userEmail={userEmail}
                         
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm overflow-hidden">
                        <div className="bg-red-500/10 p-5 rounded-full mb-2">
                          <ShieldAlert size={56} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black">Access Denied</h2>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                          You do not possess the required security credentials to access the Admin Portal Generator.
                        </p>
                      </div>
                    )
                  } />
                  {['/support', '/messages'].map(path => (
                    <React.Fragment key={path}><Route path={path} element={
                      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xl">
                        <SupportChatWidget 
                          inline={true} 
                          initialTab={supportTab}
                          highlight={supportHighlight}
                          onHighlightReset={handleSupportHighlightReset}
                        />
                      </div>
                    } /></React.Fragment>
                  ))}
                  <Route path="/account" element={<AccountManagement initialSection={null} />} />
                  <Route path="/wallet" element={<AccountManagement initialSection="FINANCE" />} />
                  <Route path="/reports" element={<AccountManagement initialSection="QUALITY" />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                </Suspense>
              </main>
            </div>
          ) : (
            <div className="max-w-md mx-auto md:py-12 h-[100dvh] md:h-auto animate-in fade-in flex flex-col justify-center relative">
              <div className="absolute top-4 right-4 z-50">
                <DarkModeToggle />
              </div>
              {location.pathname === '/admin/login' ? (
                <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">Loading Admin Portal...</div>}>
                  <DedicatedAdminLogin onLoginSuccess={(admin) => {
    if (admin) {
      login(localStorage.getItem('admin_token') || '', 'Admin', admin.email);
      setRole(admin.role);
    }
    navigate('/admin');
  }} />
                </Suspense>
              ) : !isOnboarded ? (
                <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">Loading...</div>}><WelcomeSlides onComplete={() => { setOnboarded(true); localStorage.setItem('onboarded', 'true'); }} /></Suspense>
              ) : (
                <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">Loading Gateway...</div>}><LoginGateway onLoginSuccess={handleLoginSuccess} /></Suspense>
              )}
            </div>
          )}
        </div>
      )}

      {/* Extreme Minimalist Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700  py-6 text-center text-[11px] text-slate-500 dark:text-slate-400  shrink-0">
        © {new Date().getFullYear()} TransConet. All rights reserved.
      </footer>



      {/* Expo Mobile Testing Portal Modal */}
      {isMobilePortalOpen && (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-800  backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-3xl max-w-md w-full overflow-hidden shadow-2xl shadow-blue-500/10 animate-in fade-in zoom-in duration-75">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700  flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="text-brand-500" size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white  tracking-tight">Mobile Test Portal</h3>
              </div>
              <button 
                onClick={() => setIsMobilePortalOpen(false)}
                className="text-slate-500 dark:text-slate-400  hover:text-slate-900 dark:text-white  p-1 rounded-lg hover:bg-slate-200  transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* QR Code Presentation */}
              <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800  p-6 rounded-2xl border border-slate-200 dark:border-slate-700 ">
                <div className="bg-white dark:bg-slate-900  p-4 rounded-xl shadow-lg  overflow-hidden">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(expoTunnelUrl)}`} 
                    alt="Mobile App QR Code"
                    className="w-48 h-48"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400  mt-4 tracking-wider uppercase">
                  Scan to Open on Phone
                </span>
              </div>

              {/* Dynamic URL Input & Copy */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400  uppercase tracking-wider block">
                  Web App URL
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={expoTunnelUrl}
                    onChange={(e) => setExpoTunnelUrl(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  text-slate-900 dark:text-white  rounded-xl px-3 py-2 text-xs font-mono flex-1 focus:outline-none focus:border-brand-500"
                    placeholder="https://..."
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl transition flex items-center justify-center"
                    title="Copy URL to clipboard"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-50 dark:bg-slate-800  p-4 rounded-xl border border-slate-200 dark:border-slate-700  text-xs text-slate-500 dark:text-slate-400  space-y-2.5">
                <p className="font-bold text-slate-700 dark:text-slate-200 ">How to test on your phone:</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>Install the <strong className="text-slate-800 dark:text-slate-100 ">Expo Go</strong> app from App Store (iOS) or Play Store (Android).</li>
                  <li>Scan the QR Code above with your Camera (iOS) or the Expo Go scanner (Android).</li>
                  <li>Alternatively, copy and paste the URL directly into Expo Go's address bar.</li>
                </ol>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800  border-t border-slate-200 dark:border-slate-700  flex justify-end">
              <button 
                onClick={() => setIsMobilePortalOpen(false)}
                className="bg-brand-600 hover:bg-brand-50 cursor-pointer hover:shadow-sm0 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Done
   </button>
   </div>
   </div>
   </div>

    )}
              {isAuthenticated && (
          <FloatingNavHub
            isAdmin={activeRole.includes('ADMIN')}
            onLogout={handleLogout}
            activeRole={activeRole}
          />
        )}
            
    </APIProvider>
  );
}
