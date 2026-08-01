const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

// Replace synchronous imports with React.lazy
const importsToReplace = [
  'AdminBrandConsole',
  'AdminSyncStatusBar',
  'AdminOverviewTab',
  'AdminLiveTrips',
  'AdminDisputes',
  'AdminAnalytics',
  'AdminUserManagement',
  'AdminErrorCenter',
  'AdminApiManagement',
  'AdminSecurityCenter',
  'AdminSystemSettings',
  'AdminDatabaseHealth',
  'AdminAuditLogs',
  'AdminVerificationCenter',
  'AdminContentManagement',
  'AdminSupportCare',
  'AdminNotificationCenter',
  'AdminSubscriptionBilling',
  'AdminFleetMarketplace',
  'AdminPartnerManagement',
  'AdminMarketingCenter',
  'AdminFinancialOperations',
  'AdminRiskFraud',
  'AdminAIAutomation',
  'AdminFeatureManagement',
  'AdminDeveloperConsole',
  'AdminBackupRecovery',
  'AdminRolePermission',
  'AdminReportsCenter',
  'AdminPlatformConfiguration',
  'AdminActivityTimeline'
];

importsToReplace.forEach(component => {
  code = code.replace(
    new RegExp(`import ${component} from './${component}';`, 'g'),
    `const ${component} = lazy(() => import('./${component}'));`
  );
});

// Make sure Suspense and lazy are imported
if (!code.includes('lazy,')) {
  code = code.replace("import React, { useState }", "import React, { useState, lazy, Suspense }");
}

code = code.replace(
  '<div className="bg-slate-50/50 rounded-3xl p-1 md:p-4 min-h-[500px]">',
  '<div className="bg-slate-50/50 rounded-3xl p-1 md:p-4 min-h-[500px]">\n        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>'
);

code = code.replace(
  '{activeTab === "ACTIVITY_TIMELINE" && <AdminActivityTimeline />}\n      </div>',
  '{activeTab === "ACTIVITY_TIMELINE" && <AdminActivityTimeline />}\n        </Suspense>\n      </div>'
);

// We need to also import Loader2 if not present
if (!code.includes('Loader2')) {
  code = code.replace("import { ShieldCheck, ", "import { ShieldCheck, Loader2, ");
}

fs.writeFileSync('src/components/AdminPortalGenerator.tsx', code);
console.log('Patched AdminPortalGenerator.tsx');
