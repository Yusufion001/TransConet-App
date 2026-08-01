
import React, { useState, lazy, Suspense } from 'react';
import { 
  Globe, ShieldCheck, FileText, Headset, Bell, CreditCard, Truck, Users, Megaphone, 
  Wallet, AlertTriangle, BarChart, Bot, ToggleLeft, Code, Database, History, Key, 
  Sliders, DollarSign, UserCheck, Activity, ShieldAlert, Loader2
} from 'lucide-react';
import { useAdminEngine } from '../hooks/useAdminEngine';
import { AdminBrandConsole } from './AdminBrandConsole';
import { AdminSyncStatusBar } from './AdminSyncStatusBar';
import { Button } from './ui/Button';
const AdminOverviewTab = lazy(() => import('./AdminOverviewTab'));
const AdminLiveTrips = lazy(() => import('./AdminLiveTrips'));
const AdminDisputes = lazy(() => import('./AdminDisputes'));
const AdminAnalytics = lazy(() => import('./AdminAnalytics'));
const AdminUserManagement = lazy(() => import('./AdminUserManagement'));
const AdminAlertCenter = lazy(() => import('./AdminAlertCenter'));
const AdminApiManagement = lazy(() => import('./AdminApiManagement'));
const AdminSecurityCenter = lazy(() => import('./AdminSecurityCenter'));
const AdminSystemSettings = lazy(() => import('./AdminSystemSettings'));
const AdminDatabaseHealth = lazy(() => import('./AdminDatabaseHealth'));
const AdminAuditLogs = lazy(() => import('./AdminAuditLogs'));
const AdminVerificationCenter = lazy(() => import('./AdminVerificationCenter'));
const AdminContentManagement = lazy(() => import('./AdminContentManagement'));
const AdminSupportCare = lazy(() => import('./AdminSupportCare'));
const AdminNotificationCenter = lazy(() => import('./AdminNotificationCenter'));
const AdminSubscriptionBilling = lazy(() => import('./AdminSubscriptionBilling'));
const AdminFleetMarketplace = lazy(() => import('./AdminFleetMarketplace'));
const AdminPartnerManagement = lazy(() => import('./AdminPartnerManagement'));
const AdminMarketingCenter = lazy(() => import('./AdminMarketingCenter'));
const AdminFinancialOperations = lazy(() => import('./AdminFinancialOperations'));
const AdminRiskFraud = lazy(() => import('./AdminRiskFraud'));
const AdminAIAutomation = lazy(() => import('./AdminAIAutomation'));
const AdminFeatureManagement = lazy(() => import('./AdminFeatureManagement'));
const AdminDeveloperConsole = lazy(() => import('./AdminDeveloperConsole'));
const AdminBackupRecovery = lazy(() => import('./AdminBackupRecovery'));
const AdminRolePermission = lazy(() => import('./AdminRolePermission'));
const AdminReportsCenter = lazy(() => import('./AdminReportsCenter'));
const AdminPlatformConfiguration = lazy(() => import('./AdminPlatformConfiguration'));
const AdminActivityTimeline = lazy(() => import('./AdminActivityTimeline'));

interface AdminPortalGeneratorProps {
  userPhone: string;
  userEmail: string;
  currentRole: string;
}

export default function AdminPortalGenerator({ 
  userPhone, 
  userEmail, 
  currentRole
}: AdminPortalGeneratorProps) {
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');

  const {
    error,
    successMessage,
    dashboardMetrics,
    dashboardError,
    lastSyncedTime,
    isSyncing,
    addLog,
    syncAllLiveData
  } = useAdminEngine(userPhone, userEmail, currentRole);

  
  const getTabsForRole = (role: string) => {
    const allTabs = [
      { id: 'OVERVIEW', label: 'Platform Overview', icon: Globe },
      { id: 'VERIFICATION_CENTER', label: 'Verification Center', icon: ShieldCheck },
      { id: 'CONTENT_MANAGEMENT', label: 'Content Management', icon: FileText },
      { id: 'SUPPORT_CUSTOMER_CARE', label: 'Support & Care', icon: Headset },
      { id: 'NOTIFICATION_CENTER', label: 'Notification Center', icon: Bell },
      { id: 'SUBSCRIPTION_BILLING', label: 'Subscription & Billing', icon: CreditCard },
      { id: 'FLEET_LOAD_MAP', label: 'Fleet & Marketplace', icon: Truck },
      { id: 'PARTNER_MANAGEMENT', label: 'Partner Management', icon: Users },
      { id: 'MARKETING_CENTER', label: 'Marketing Center', icon: Megaphone },
      { id: 'FINANCIAL_OPERATIONS', label: 'Financial Operations', icon: Wallet },
      { id: 'RISK_FRAUD', label: 'Risk & Fraud', icon: AlertTriangle },
      { id: 'REPORTS_CENTER', label: 'Reports Center', icon: BarChart },
      { id: 'AI_AUTOMATION', label: 'AI & Automation', icon: Bot },
      { id: 'FEATURE_MANAGEMENT', label: 'Feature Management', icon: ToggleLeft },
      { id: 'DEVELOPER_CONSOLE', label: 'Developer Console', icon: Code },
      { id: 'BACKUP_RECOVERY', label: 'Backup & Recovery', icon: Database },
      { id: 'ACTIVITY_TIMELINE', label: 'Activity Timeline', icon: History },
      { id: 'ROLE_PERMISSION', label: 'Role & Permission', icon: Key },
      { id: 'PLATFORM_CONFIGURATION', label: 'Platform Config', icon: Sliders },
      { id: 'ANALYTICS', label: 'Legacy Analytics', icon: DollarSign },
      { id: 'USERS', label: 'Legacy Users', icon: UserCheck },
      { id: 'LIVE_TRIPS', label: 'Live Trips', icon: Activity },
      { id: 'DISPUTES', label: 'Legacy Disputes', icon: AlertTriangle },
      { id: 'ERROR_CENTER', label: 'Error Center', icon: ShieldAlert },
      { id: 'API_MANAGEMENT', label: 'API Management', icon: Database },
      { id: 'SECURITY_CENTER', label: 'Security Center', icon: ShieldCheck },
      { id: 'SYSTEM_SETTINGS', label: 'Legacy System Settings', icon: Sliders },
      { id: 'DATABASE_HEALTH', label: 'Database Health', icon: Activity },
      { id: 'AUDIT_LOGS', label: 'Legacy Audit Logs', icon: FileText }
    ];

    if (role === 'SUPER_ADMIN') return allTabs;
    if (role === 'PLATFORM_ADMIN') return allTabs.filter(t => ['OVERVIEW', 'ANALYTICS', 'REPORTS_CENTER', 'USERS'].includes(t.id));
    if (role === 'COMPLIANCE_ADMIN') return allTabs.filter(t => ['OVERVIEW', 'VERIFICATION_CENTER', 'USERS', 'RISK_FRAUD'].includes(t.id));
    if (role === 'FINANCE_ADMIN') return allTabs.filter(t => ['OVERVIEW', 'FINANCIAL_OPERATIONS', 'SUBSCRIPTION_BILLING', 'ANALYTICS'].includes(t.id));
    if (role === 'SUPPORT_ADMIN') return allTabs.filter(t => ['OVERVIEW', 'SUPPORT_CUSTOMER_CARE', 'USERS', 'NOTIFICATION_CENTER', 'DISPUTES'].includes(t.id));
    if (role === 'DEVELOPER') return allTabs.filter(t => ['OVERVIEW', 'DEVELOPER_CONSOLE', 'API_MANAGEMENT', 'DATABASE_HEALTH', 'BACKUP_RECOVERY', 'ERROR_CENTER'].includes(t.id));

    return allTabs.filter(t => t.id === 'OVERVIEW');
  };

  return (
    <div id="admin-portal-generator" className="w-full max-w-6xl mx-auto p-1 space-y-8 animate-fade-in">
      <AdminBrandConsole />
      
      <AdminSyncStatusBar 
        lastSyncedTime={lastSyncedTime}
        isSyncing={isSyncing}
        onSync={syncAllLiveData}
      />
      
      {error && (
        <div className="bg-red-950/40 border border-red-500/40 text-red-200 text-xs p-4 rounded-2xl animate-fade-in flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={18} />
          <span>{error && error ? ((error as any).message || JSON.stringify(error)) : error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs p-4 rounded-2xl animate-fade-in flex items-center gap-3">
          <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Admin Tabs Navigation */}
      <div className="flex flex-wrap gap-2 pb-2">
        {getTabsForRole(currentRole).map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-1 md:p-4 min-h-[500px]">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
        {activeTab === 'OVERVIEW' && (
          <AdminOverviewTab 
            currentRole={currentRole} 
            addLog={addLog} 
            metrics={dashboardMetrics} 
            dashboardError={dashboardError}
          />
        )}
        {activeTab === 'ANALYTICS' && (
          <AdminAnalytics metrics={dashboardMetrics} />
        )}
        {activeTab === 'USERS' && <AdminUserManagement />}
        {activeTab === 'LIVE_TRIPS' && <AdminLiveTrips />}
        {activeTab === 'DISPUTES' && <AdminDisputes />}
        {activeTab === "API_MANAGEMENT" && <AdminApiManagement />}
        {activeTab === "SECURITY_CENTER" && <AdminSecurityCenter />}
        {activeTab === "SYSTEM_SETTINGS" && <AdminSystemSettings />}
        {activeTab === "DATABASE_HEALTH" && <AdminDatabaseHealth />}
        {activeTab === "AUDIT_LOGS" && <AdminAuditLogs />}
        {activeTab === "ERROR_CENTER" && <AdminAlertCenter />}
        {activeTab === "VERIFICATION_CENTER" && <AdminVerificationCenter />}
        {activeTab === "CONTENT_MANAGEMENT" && <AdminContentManagement />}
        {activeTab === "SUPPORT_CUSTOMER_CARE" && <AdminSupportCare />}
        {activeTab === "NOTIFICATION_CENTER" && <AdminNotificationCenter />}
        {activeTab === "SUBSCRIPTION_BILLING" && <AdminSubscriptionBilling />}
        {activeTab === "FLEET_LOAD_MAP" && <AdminFleetMarketplace />}
        {activeTab === "PARTNER_MANAGEMENT" && <AdminPartnerManagement />}
        {activeTab === "MARKETING_CENTER" && <AdminMarketingCenter />}
        {activeTab === "FINANCIAL_OPERATIONS" && <AdminFinancialOperations />}
        {activeTab === "RISK_FRAUD" && <AdminRiskFraud />}
        {activeTab === "AI_AUTOMATION" && <AdminAIAutomation />}
        {activeTab === "FEATURE_MANAGEMENT" && <AdminFeatureManagement />}
        {activeTab === "DEVELOPER_CONSOLE" && <AdminDeveloperConsole />}
        {activeTab === "BACKUP_RECOVERY" && <AdminBackupRecovery />}
        {activeTab === "ROLE_PERMISSION" && <AdminRolePermission />}
        {activeTab === "REPORTS_CENTER" && <AdminReportsCenter />}
        {activeTab === "PLATFORM_CONFIGURATION" && <AdminPlatformConfiguration />}
        {activeTab === "ACTIVITY_TIMELINE" && <AdminActivityTimeline />}
        </Suspense>
      </div>
    </div>
  );
}
