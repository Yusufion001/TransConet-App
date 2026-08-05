import { Request, Response } from 'express';
import {
  approveAction,
  listPendingActions,
  processAutomationMessage,
  rejectAction
} from '../services/aiAutomationService';

const normalizeRole = (role: string): 'CUSTOMER' | 'TRANSPORTER' | null => {
  if (role === 'CUSTOMER' || role === 'TRANSPORTER') return role;
  if (role === 'SHIPPER') return 'CUSTOMER';
  return null;
};

export async function assistant(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required.' });
    const role = normalizeRole(req.user.role);
    if (!role) return res.status(403).json({ error: 'Only customer and transporter accounts can use the user automation assistant.' });

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message) return res.status(400).json({ error: 'Message is required.' });
    if (message.length > 4000) return res.status(400).json({ error: 'Message is too long.' });

    const result = await processAutomationMessage(req.user.id, role, message, req.body?.context || {});
    return res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('AI automation assistant error:', error);
    return res.status(500).json({ error: 'The TransConet AI assistant is temporarily unavailable.' });
  }
}

export async function pendingActions(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required.' });
    const actions = await listPendingActions(req.user.id);
    return res.json({ success: true, actions });
  } catch (error) {
    console.error('AI pending actions error:', error);
    return res.status(500).json({ error: 'Unable to load pending AI actions.' });
  }
}

export async function approve(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required.' });
    const actionId = String(req.params.id || '');
    const action = await approveAction(req.user.id, actionId);
    if (!action) return res.status(404).json({ error: 'Action not found, already processed, or not owned by this user.' });
    return res.json({ success: true, action, message: 'Approved. Execution will be handled by the TransConet automation worker.' });
  } catch (error) {
    console.error('AI action approval error:', error);
    return res.status(500).json({ error: 'Unable to approve this AI action.' });
  }
}

export async function reject(req: Request, res: Response) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required.' });
    const actionId = String(req.params.id || '');
    const action = await rejectAction(req.user.id, actionId);
    if (!action) return res.status(404).json({ error: 'Action not found, already processed, or not owned by this user.' });
    return res.json({ success: true, action });
  } catch (error) {
    console.error('AI action rejection error:', error);
    return res.status(500).json({ error: 'Unable to reject this AI action.' });
  }
}
