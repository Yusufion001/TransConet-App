const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

// 1. Remove the bad function from inside JSX
const BAD_CODE_REGEX = /\s*const getTabsForRole = \(role: string\) => \{[\s\S]*?return allTabs\.filter\(t => t\.id === 'OVERVIEW'\);\n  \};\n\n  getTabsForRole\(currentRole\)\.map/m;

code = code.replace(BAD_CODE_REGEX, 'getTabsForRole(currentRole).map');

// 2. Insert the function before the return
const RETURN_REGEX = /return \(\n    <div id="admin-portal-generator"/;

const funcToInsert = `
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
    <div id="admin-portal-generator"`;

code = code.replace(RETURN_REGEX, funcToInsert);

// Fix curly brace logic inside JSX map
code = code.replace(/<div className="flex flex-wrap gap-2 pb-2">\n          getTabsForRole\(currentRole\)\.map/, '<div className="flex flex-wrap gap-2 pb-2">\n        {getTabsForRole(currentRole).map');

fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
