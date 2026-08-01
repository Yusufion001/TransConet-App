const fs = require('fs');
let code = fs.readFileSync('src/routes/adminRoutes.ts', 'utf8');

const importReplacement = `import { verifyVehicle, getSystemStatus, getAdminMetrics, getSupabaseDiagnostics, getUsers, updateUserStatus, triggerBackup, getHealth, getApiManagementKeys, testApiEndpoint, getAdminSubscriptions, getAdminReports, getAdminAuditLogs } from '../controllers/adminController';`;
code = code.replace(/import \{ verifyVehicle, getSystemStatus, getAdminMetrics, getSupabaseDiagnostics, getUsers, updateUserStatus, triggerBackup, getHealth, getApiManagementKeys, testApiEndpoint \} from '\.\.\/controllers\/adminController';/, importReplacement);

const newRoutes = `
// Endpoints for Subscriptions, Reports, and Audit Logs
router.get('/subscriptions', requireSpecificAdminRole(['SUPER_ADMIN', 'FINANCE_ADMIN', 'PLATFORM_ADMIN']), getAdminSubscriptions);
router.get('/reports', requireSpecificAdminRole(['SUPER_ADMIN', 'FINANCE_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminReports);
router.get('/audit-logs', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN']), getAdminAuditLogs);
`;

code = code.replace(/export default router;/, newRoutes + '\nexport default router;');

fs.writeFileSync('src/routes/adminRoutes.ts', code);
