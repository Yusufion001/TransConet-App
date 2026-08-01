import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace activeView state
content = content.replace("const [activeView, setActiveView] = useState<string>('dashboard');", "");
content = content.replace("import { Truck, LogOut", "import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';\nimport { Truck, LogOut");

// We need to inject a wrapper component that uses hooks since App can't use useNavigate if it is rendering BrowserRouter
// Actually, BrowserRouter is now in main.tsx, so App can use hooks!
content = content.replace("export default function App() {", "export default function App() {\n  const navigate = useNavigate();\n  const location = useLocation();\n  const activeView = location.pathname.substring(1) || 'dashboard';\n  const setActiveView = (v: string) => navigate('/' + v);");

const oldTernary = `                {activeView === 'fleet' ? (
                    <div className="flex-1 overflow-y-auto"><TransporterFleetDashboard /></div>
                ) : activeView === 'driver-dashboard' ? (
                    <div className="flex-1 overflow-y-auto"><DriverDashboard /></div>
                ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? (
                  <DeepSapphireDashboard 
                    onNavigateToNetwork={() => setActiveView('network')}
                    onNavigateToAccount={() => setActiveView('account')}
                    onNavigateToSupport={handleNavigateToSupportWithHighlight}
                    userPhone={userPhone}
                    userRole={activeRole}
                    activeView={activeView}
                  />
                ) : ['network', 'post-load', 'marketplace'].includes(activeView) ? (
                    <div className="h-full flex flex-col">
                      <ExpressMatcher 
                        initialMode={activeView === 'post-load' ? 'SHIPPER' : activeView === 'marketplace' ? 'TRANSPORTER' : (activeRole === 'CUSTOMER' ? 'SHIPPER' : 'TRANSPORTER')} 
                        initialSubMode={activeRole === 'TRANSPORTER' && localStorage.getItem('userVerified') !== 'true' ? 'REGISTER' : 'JOBS'}
                      />
                    </div>
                ) : activeView === 'admin' ? (
                  isAdminAuthorized ? (
                    <AdminPortalGenerator 
                      currentRole={activeRole} 
                      userPhone={userPhone} 
                      userEmail={userEmail}
                      onRoleSwitched={handleRoleSwitched} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4 bg-white  rounded-3xl p-8 shadow-sm">
                      <div className="bg-rose-500/10 p-5 rounded-full mb-2">
                        <ShieldAlert size={56} className="text-rose-500" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black">Access Denied</h2>
                      <p className="text-slate-500  leading-relaxed max-w-md mx-auto">
                        You do not possess the required security credentials to access the Admin Portal Generator.
                      </p>
                    </div>
                  )
                ) : ['support', 'messages'].includes(activeView) ? (
                  <div className="max-w-2xl mx-auto bg-white  border border-slate-200  rounded-3xl overflow-hidden shadow-xl">
                    <SupportChatWidget 
                      inline={true} 
                      initialTab={supportTab}
                      highlight={supportHighlight}
                      onHighlightReset={handleSupportHighlightReset}
                    />
                  </div>
                ) : (
                  <AccountManagement initialSection={activeView === 'wallet' ? 'FINANCE' : activeView === 'reports' ? 'QUALITY' : null} />
                )}`;

const newRoutes = `                <Routes>
                  <Route path="/fleet" element={<div className="flex-1 overflow-y-auto"><TransporterFleetDashboard /></div>} />
                  <Route path="/driver-dashboard" element={<div className="flex-1 overflow-y-auto"><DriverDashboard /></div>} />
                  {['/dashboard', '/shipments', '/orders', '/notifications', '/track-shipments', '/boost-load'].map(path => (
                    <Route key={path} path={path} element={
                      <DeepSapphireDashboard 
                        onNavigateToNetwork={() => setActiveView('network')}
                        onNavigateToAccount={() => setActiveView('account')}
                        onNavigateToSupport={handleNavigateToSupportWithHighlight}
                        userPhone={userPhone}
                        userRole={activeRole}
                        activeView={activeView}
                      />
                    } />
                  ))}
                  {['/network', '/post-load', '/marketplace'].map(path => (
                    <Route key={path} path={path} element={
                      <div className="h-full flex flex-col">
                        <ExpressMatcher 
                          initialMode={path === '/post-load' ? 'SHIPPER' : path === '/marketplace' ? 'TRANSPORTER' : (activeRole === 'CUSTOMER' ? 'SHIPPER' : 'TRANSPORTER')} 
                          initialSubMode={activeRole === 'TRANSPORTER' && localStorage.getItem('userVerified') !== 'true' ? 'REGISTER' : 'JOBS'}
                        />
                      </div>
                    } />
                  ))}
                  <Route path="/admin" element={
                    isAdminAuthorized ? (
                      <AdminPortalGenerator 
                        currentRole={activeRole} 
                        userPhone={userPhone} 
                        userEmail={userEmail}
                        onRoleSwitched={handleRoleSwitched} 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 px-4 text-center space-y-4 bg-white rounded-3xl p-8 shadow-sm">
                        <div className="bg-rose-500/10 p-5 rounded-full mb-2">
                          <ShieldAlert size={56} className="text-rose-500" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black">Access Denied</h2>
                        <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
                          You do not possess the required security credentials to access the Admin Portal Generator.
                        </p>
                      </div>
                    )
                  } />
                  {['/support', '/messages'].map(path => (
                    <Route key={path} path={path} element={
                      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
                        <SupportChatWidget 
                          inline={true} 
                          initialTab={supportTab}
                          highlight={supportHighlight}
                          onHighlightReset={handleSupportHighlightReset}
                        />
                      </div>
                    } />
                  ))}
                  <Route path="/account" element={<AccountManagement initialSection={null} />} />
                  <Route path="/wallet" element={<AccountManagement initialSection="FINANCE" />} />
                  <Route path="/reports" element={<AccountManagement initialSection="QUALITY" />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>`;

content = content.replace(oldTernary, newRoutes);

// Remove activeView={activeView} from FloatingNavHub and setActiveView
content = content.replace(
  "activeView={activeView}\n           setActiveView={setActiveView}",
  ""
);

fs.writeFileSync('src/App.tsx', content);
