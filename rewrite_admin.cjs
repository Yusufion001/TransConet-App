const fs = require('fs');

const imports = `
import React, { useState } from 'react';
import { 
  Globe, ShieldCheck, FileText, Headset, Bell, CreditCard, Truck, Users, Megaphone, 
  Wallet, AlertTriangle, BarChart, Bot, ToggleLeft, Code, Database, History, Key, 
  Sliders, DollarSign, UserCheck, Activity, ShieldAlert
} from 'lucide-react';
import { useAdminEngine } from '../hooks/useAdminEngine';
import { AdminBrandConsole } from './AdminBrandConsole';
import { AdminSyncStatusBar } from './AdminSyncStatusBar';
import AdminOverviewTab from './AdminOverviewTab';
import AdminLiveTrips from './AdminLiveTrips';
import AdminDisputes from './AdminDisputes';
import AdminAnalytics from './AdminAnalytics';
import AdminUserManagement from './AdminUserManagement';
import AdminErrorCenter from './AdminErrorCenter';
import AdminApiManagement from './AdminApiManagement';
import AdminSecurityCenter from './AdminSecurityCenter';
import AdminSystemSettings from './AdminSystemSettings';
import AdminDatabaseHealth from './AdminDatabaseHealth';
import AdminAuditLogs from './AdminAuditLogs';
import AdminVerificationCenter from './AdminVerificationCenter';
import AdminContentManagement from './AdminContentManagement';
import AdminSupportCare from './AdminSupportCare';
import AdminNotificationCenter from './AdminNotificationCenter';
import AdminSubscriptionBilling from './AdminSubscriptionBilling';
import AdminFleetMarketplace from './AdminFleetMarketplace';
import AdminPartnerManagement from './AdminPartnerManagement';
import AdminMarketingCenter from './AdminMarketingCenter';
import AdminFinancialOperations from './AdminFinancialOperations';
import AdminRiskFraud from './AdminRiskFraud';
import AdminAIAutomation from './AdminAIAutomation';
import AdminFeatureManagement from './AdminFeatureManagement';
import AdminDeveloperConsole from './AdminDeveloperConsole';
import AdminBackupRecovery from './AdminBackupRecovery';
import AdminRolePermission from './AdminRolePermission';
import AdminReportsCenter from './AdminReportsCenter';
import AdminPlatformConfiguration from './AdminPlatformConfiguration';
import AdminActivityTimeline from './AdminActivityTimeline';
`;

const interfaceProps = `
interface AdminPortalGeneratorProps {
  userPhone: string;
  userEmail: string;
  currentRole: string;
  onRoleSwitched: (token: string, newRole: string) => void;
}
`;

const mainComponent = `
export default function AdminPortalGenerator({ 
  userPhone, 
  userEmail, 
  currentRole, 
  onRoleSwitched 
}: AdminPortalGeneratorProps) {
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');

  const {
    error,
    successMessage,
    dashboardMetrics,
    lastSyncedTime,
    isSyncing,
    addLog,
    syncAllLiveData
  } = useAdminEngine(userPhone, userEmail, currentRole, onRoleSwitched);

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
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs p-4 rounded-2xl animate-fade-in flex items-center gap-3">
          <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Admin Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {[ 
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
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all \${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }\`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-50/50 rounded-3xl p-1 md:p-4 min-h-[500px]">
        {activeTab === 'OVERVIEW' && (
          <AdminOverviewTab 
            currentRole={currentRole} 
            addLog={addLog} 
            metrics={dashboardMetrics} 
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
        {activeTab === "ERROR_CENTER" && <AdminErrorCenter />}
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
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AdminPortalGenerator.tsx', imports + interfaceProps + mainComponent);
console.log('Rewrote AdminPortalGenerator.tsx');
