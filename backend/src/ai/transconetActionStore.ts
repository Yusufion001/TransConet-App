import crypto from 'crypto';
import { PendingTransConetAction, PostLoadDraft } from './transconetActionTypes';
import { TransConetRole } from './transconetAi';

const ACTION_TTL_MS = 10 * 60 * 1000;
const actions = new Map<string, PendingTransConetAction>();

function purgeExpired() {
  const now = Date.now();
  for (const [id, action] of actions) {
    if (Date.parse(action.expiresAt) <= now) actions.delete(id);
  }
}

export function createPendingPostLoad(role: TransConetRole, draft: PostLoadDraft): PendingTransConetAction {
  purgeExpired();
  const action: PendingTransConetAction = {
    actionId: crypto.randomUUID(),
    name: 'customer.post_load',
    role,
    status: 'PENDING_APPROVAL',
    draft,
    expiresAt: new Date(Date.now() + ACTION_TTL_MS).toISOString(),
  };
  actions.set(action.actionId, action);
  return action;
}

export function consumeApprovedAction(actionId: string, role: TransConetRole): PendingTransConetAction | null {
  purgeExpired();
  const action = actions.get(actionId);
  if (!action || action.role !== role || action.status !== 'PENDING_APPROVAL') return null;
  actions.delete(actionId);
  return action;
}

export function rejectPendingAction(actionId: string, role: TransConetRole): boolean {
  purgeExpired();
  const action = actions.get(actionId);
  if (!action || action.role !== role) return false;
  actions.delete(actionId);
  return true;
}
