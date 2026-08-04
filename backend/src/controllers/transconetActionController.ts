import { Request, Response } from 'express';
import { createLoad } from './loadController';
import { assertSingleRole } from '../ai/transconetAi';
import { consumeApprovedAction, rejectPendingAction } from '../ai/transconetActionStore';
import { ActionApprovalRequest } from '../ai/transconetActionTypes';

export const approveTransConetAction = async (req: Request, res: Response): Promise<Response> => {
  const role = req.user?.role;
  assertSingleRole(role);

  const { actionId, approved } = req.body as Partial<ActionApprovalRequest>;
  if (!actionId || typeof approved !== 'boolean') {
    return res.status(400).json({ error: 'actionId and approved are required.' });
  }

  if (!approved) {
    const rejected = rejectPendingAction(actionId, role);
    return res.status(rejected ? 200 : 404).json({
      status: rejected ? 'cancelled' : 'not_found',
      message: rejected ? 'Action cancelled.' : 'Approval request expired or was not found.',
    });
  }

  const action = consumeApprovedAction(actionId, role);
  if (!action) {
    return res.status(404).json({ error: 'Approval request expired or was not found.' });
  }

  if (action.name !== 'customer.post_load' || role !== 'CUSTOMER') {
    return res.status(403).json({ error: 'This action is not available for your account.' });
  }

  // Reuse the existing, role-protected load creation path. It performs the
  // existing validation/business persistence and queues load embedding work.
  req.body = action.draft;
  return createLoad(req, res, (error) => {
    if (error) {
      console.error('[TransConet AI] approved action failed:', error);
      if (!res.headersSent) res.status(500).json({ error: 'The approved action could not be completed.' });
    }
  });
};
