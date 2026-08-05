import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { createPendingAction, planAutomation, approveCreateLoad, getPendingAction } from '../ai/automationService';

const router = Router();

router.use(authenticateToken);

router.post('/plan', async (req, res) => {
  try {
    const user = req.user;
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (!message) return res.status(400).json({ error: 'Tell me what you want to do.' });
    if (user.role !== 'CUSTOMER' && user.role !== 'TRANSPORTER') {
      return res.status(403).json({ error: 'AI automation is available only to Customer and Transporter accounts.' });
    }

    const plan = await planAutomation(user, message);
    const pending = await createPendingAction(user, plan);

    return res.json({
      success: true,
      action: plan.action,
      message: pending
        ? `${plan.message} Please approve this action before I proceed.`
        : plan.message,
      payload: plan.payload,
      requiresApproval: Boolean(pending),
      approvalId: pending?.id || null,
      expiresAt: pending?.expires_at || null,
    });
  } catch (error: any) {
    console.error('[AI Automation] plan failed:', error);
    return res.status(500).json({ error: error.message || 'AI automation failed.' });
  }
});

router.get('/actions/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    const action = await getPendingAction(req.user, req.params.id);
    if (!action) return res.status(404).json({ error: 'AI action not found.' });
    return res.json({ success: true, action });
  } catch (error: any) {
    console.error('[AI Automation] action lookup failed:', error);
    return res.status(500).json({ error: 'Unable to retrieve AI action.' });
  }
});

router.post('/actions/:id/approve', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Only Customer accounts can approve load creation actions.' });
    }

    const load = await approveCreateLoad(req.user, req.params.id);
    return res.status(201).json({
      success: true,
      message: 'Approved. Your load has been posted to the TransConet marketplace.',
      load,
    });
  } catch (error: any) {
    console.error('[AI Automation] approval failed:', error);
    const status = /not found|expired|no longer pending|incomplete|invalid|cannot create/i.test(error.message || '') ? 400 : 500;
    return res.status(status).json({ error: error.message || 'Unable to execute approved AI action.' });
  }
});

export default router;
