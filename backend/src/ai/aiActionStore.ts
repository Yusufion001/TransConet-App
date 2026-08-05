import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type AiActionStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONSUMED'
  | 'EXPIRED'
  | 'FAILED';

export interface PendingAiAction {
  id: string;
  userId: string;
  role: 'CUSTOMER' | 'TRANSPORTER';
  actionName: string;
  status: AiActionStatus;
  payload: Record<string, unknown>;
  expiresAt: string;
  createdAt: string;
  approvedAt: string | null;
  consumedAt: string | null;
  errorMessage: string | null;
}

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase AI action storage is not configured');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createPendingAiAction(input: {
  userId: string;
  role: 'CUSTOMER' | 'TRANSPORTER';
  actionName: string;
  payload: Record<string, unknown>;
  expiresAt: Date;
}): Promise<PendingAiAction> {
  const { data, error } = await getSupabaseAdmin()
    .from('transconet_ai_actions')
    .insert({
      user_id: input.userId,
      role: input.role,
      action_name: input.actionName,
      status: 'PENDING_APPROVAL',
      payload: input.payload,
      expires_at: input.expiresAt.toISOString(),
    })
    .select('*')
    .single();

  if (error) throw new Error(`Unable to create AI approval: ${error.message}`);
  return mapAction(data);
}

export async function getPendingAiAction(userId: string, actionId: string): Promise<PendingAiAction | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('transconet_ai_actions')
    .select('*')
    .eq('id', actionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(`Unable to read AI approval: ${error.message}`);
  if (!data) return null;

  const action = mapAction(data);
  if (action.status === 'PENDING_APPROVAL' && new Date(action.expiresAt).getTime() <= Date.now()) {
    await getSupabaseAdmin()
      .from('transconet_ai_actions')
      .update({ status: 'EXPIRED' })
      .eq('id', action.id)
      .eq('user_id', userId)
      .eq('status', 'PENDING_APPROVAL');
    return { ...action, status: 'EXPIRED' };
  }

  return action;
}

export async function approveAiAction(userId: string, actionId: string): Promise<PendingAiAction> {
  const { data, error } = await getSupabaseAdmin()
    .from('transconet_ai_actions')
    .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
    .eq('id', actionId)
    .eq('user_id', userId)
    .eq('status', 'PENDING_APPROVAL')
    .gt('expires_at', new Date().toISOString())
    .select('*')
    .single();

  if (error) throw new Error(`Unable to approve AI action: ${error.message}`);
  return mapAction(data);
}

export async function rejectAiAction(userId: string, actionId: string): Promise<PendingAiAction> {
  const { data, error } = await getSupabaseAdmin()
    .from('transconet_ai_actions')
    .update({ status: 'REJECTED' })
    .eq('id', actionId)
    .eq('user_id', userId)
    .eq('status', 'PENDING_APPROVAL')
    .select('*')
    .single();

  if (error) throw new Error(`Unable to reject AI action: ${error.message}`);
  return mapAction(data);
}

function mapAction(row: any): PendingAiAction {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    actionName: row.action_name,
    status: row.status,
    payload: row.payload ?? {},
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    consumedAt: row.consumed_at,
    errorMessage: row.error_message,
  };
}
