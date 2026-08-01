import { Router, Request, Response } from 'express';
import { getAdminFleet, getAdminLoads, getAdminAiModels, getAdminDatabaseHealth, getAdminRedisMonitoring, getAdminBackupHistory, getAdminDeveloperLogs, getAdminNotifications, getAdminMarketing, getAdminContent, getAdminPartners, getAdminVerifications } from '../controllers/adminController';
import { verifyVehicle, getSystemStatus, getAdminMetrics, getSupabaseDiagnostics, getUsers, updateUserStatus, triggerBackup, getHealth, getApiManagementKeys, testApiEndpoint, getAdminSubscriptions, getAdminReports, getAdminAuditLogs, getAdminRiskAlerts, updateRiskAlertStatus, getAdminSecurityEvents, getAdminPlatformConfig, updateAdminPlatformConfig } from '../controllers/adminController';
import { generateAdminInsights } from '../controllers/aiOptimizationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { authenticateAdminOrSuper, requireSpecificAdminRole } from '../middleware/adminAuthMiddleware';
import { getUserActivityStatement } from '../services/statementService';

const router = Router();

// General admin access middleware
router.use(authenticateAdminOrSuper);

// Endpoint for live aggregated administrative metrics
router.get('/metrics', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FINANCE_ADMIN']), getAdminMetrics);

// Endpoint for triggering automated backups (Cron-ready)
router.post('/trigger-backup', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), triggerBackup);

// API Management Endpoints
router.get('/api-keys', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), getApiManagementKeys);
router.post('/test-api', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), testApiEndpoint);

// AI Insights Endpoint
router.get('/ai-insights', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVELOPER']), generateAdminInsights);

// Endpoint for administrative metrics and environment detection
router.get('/system-status', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER', 'PLATFORM_ADMIN']), getSystemStatus);

// Endpoint for performing deep Supabase diagnostics scans
router.get('/supabase-diagnostics', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), getSupabaseDiagnostics);

// Endpoint for health metrics
router.get('/health', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER', 'PLATFORM_ADMIN']), getHealth);

// Endpoint for admins to verify transporter vehicles
router.post('/verify-vehicle/:vehicleId', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN']), verifyVehicle);
router.patch('/verify-vehicle/:vehicleId', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN']), verifyVehicle);

// Endpoints for User & Compliance Management
router.get('/users', requireSpecificAdminRole(['SUPER_ADMIN', 'SUPPORT_ADMIN', 'COMPLIANCE_ADMIN', 'PLATFORM_ADMIN']), getUsers);
router.patch('/users/:userId/status', requireSpecificAdminRole(['SUPER_ADMIN', 'SUPPORT_ADMIN', 'COMPLIANCE_ADMIN']), updateUserStatus);
router.get('/verifications', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN', 'PLATFORM_ADMIN']), getAdminVerifications);

// Endpoint for Admins/Developers to generate a complete user activity statement
router.get('/user-statement/:userId', requireSpecificAdminRole(['SUPER_ADMIN', 'SUPPORT_ADMIN', 'COMPLIANCE_ADMIN', 'FINANCE_ADMIN']), async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const statement = await getUserActivityStatement(userId);
    
    if (!statement) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Omit sensitive data like password hash
    const safeStatementData = statement;
    return res.status(200).json({
      success: true,
      message: 'User activity statement generated successfully',
      data: safeStatementData
    });
  } catch (error: any) {
    console.error('Error generating user statement:', error);
    return res.status(500).json({ error: 'Internal server error while generating user statement' });
  }
});


// Endpoints for Subscriptions, Reports, and Audit Logs
router.get('/subscriptions', requireSpecificAdminRole(['SUPER_ADMIN', 'FINANCE_ADMIN', 'PLATFORM_ADMIN']), getAdminSubscriptions);
router.get('/reports', requireSpecificAdminRole(['SUPER_ADMIN', 'FINANCE_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminReports);
router.get('/audit-logs', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN']), getAdminAuditLogs);
router.get('/risk-alerts', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN', 'PLATFORM_ADMIN']), getAdminRiskAlerts);
router.patch('/risk-alerts/:id/status', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN', 'PLATFORM_ADMIN']), updateRiskAlertStatus);
router.get('/security-events', requireSpecificAdminRole(['SUPER_ADMIN', 'COMPLIANCE_ADMIN']), getAdminSecurityEvents);
router.get('/config', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN']), getAdminPlatformConfig);
router.patch('/config', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN']), updateAdminPlatformConfig);


// Endpoints for Fleet and Loads
router.get('/fleet', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminFleet);
router.get('/loads', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminLoads);

// Infrastructure and Developer endpoints
router.get('/ai-models', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), getAdminAiModels);
router.get('/db-health', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), getAdminDatabaseHealth);
router.get('/redis-monitoring', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), getAdminRedisMonitoring);
router.get('/backup-history', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), getAdminBackupHistory);
router.get('/developer-logs', requireSpecificAdminRole(['SUPER_ADMIN', 'DEVELOPER']), getAdminDeveloperLogs);

// Enterprise Operations Endpoints (Phase 3)
router.get('/notifications', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminNotifications);
router.get('/marketing', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FINANCE_ADMIN']), getAdminMarketing);
router.get('/content', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'SUPPORT_ADMIN']), getAdminContent);
router.get('/partners', requireSpecificAdminRole(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'FINANCE_ADMIN']), getAdminPartners);

export default router;
