import OpenAI from 'openai';
import { prisma } from '../db/prisma';
import { AutomationAction, AutomationRole, isAllowedAutomationAction, requiresApproval } from './automationPolicy';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_AUTOMATION_MODEL || 'gpt-5-mini';

type UserContext = {
  id: string;
  role: AutomationRole;
  email?: string;
  phoneNumber?: string;
};

type PlannedAction = {
  action: AutomationAction;
  message: string;
  payload: Record<string, unknown>;
};

const SYSTEM_PROMPT = `You are the TransConet AI assistant. You are the primary navigation and automation face of the logistics application.

The authenticated user has exactly one role: CUSTOMER or TRANSPORTER. Never suggest switching roles and never perform a role-incompatible action.

Available CUSTOMER actions: CREATE_LOAD, SEARCH_LOADS, VIEW_AVAILABLE_CAPACITY, VIEW_MATCHES, VIEW_SHIPMENTS, OPEN_SUPPORT.
Available TRANSPORTER actions: SEARCH_LOADS, VIEW_AVAILABLE_CAPACITY, VIEW_MATCHES, VIEW_SHIPMENTS, VIEW_FLEET, OPEN_SUPPORT.

Return ONLY valid JSON with this shape:
{"action":"ACTION_NAME","message":"short helpful response","payload":{}}

For CREATE_LOAD, collect or infer only the following payload fields when supplied: title, cargoType, weightKg, origin, destination, suggestedBudget, isEscrowEnabled.
Valid cargoType values are: AGRICULTURAL_GOODS, CONSTRUCTION_MATERIALS, GENERAL_MERCHANDISE, PHARMACEUTICALS_MEDICAL, ELECTRONICS_APPLIANCES, PETROLEUM_CHEMICALS, HEAVY_MACHINERY.

Do not invent missing critical load information. If origin, destination, or weightKg is missing, use action CREATE_LOAD and explain what is still needed in the message. Do not execute any mutating action yourself. The server controls authorization and approval.`;

function stripCodeFence(value: string): string {
  return value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export async function planAutomation(user: UserContext, userMessage: string): Promise<PlannedAction> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured on the backend.');
  }

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Authenticated user role: ${user.role}. User ID is server-controlled and must never be placed into an action payload.` },
      { role: 'user', content: userMessage.trim().slice(0, 8000) },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('AI returned an empty automation plan.');

  const parsed = JSON.parse(stripCodeFence(raw)) as Partial<PlannedAction>;
  if (typeof parsed.action !== 'string' || !isAllowedAutomationAction(user.role, parsed.action)) {
    throw new Error('AI proposed an action that is not available for this account role.');
  }

  const payload = parsed.payload && typeof parsed.payload === 'object' ? parsed.payload as Record<string, unknown> : {};
  const message = typeof parsed.message === 'string' && parsed.message.trim()
    ? parsed.message.trim()
    : 'I understand what you want to do.';

  return { action: parsed.action, message, payload };
}

export async function createPendingAction(user: UserContext, plan: PlannedAction) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (!requiresApproval(plan.action)) {
    return null;
  }

  const rows = await prisma.$queryRaw<Array<{ id: string; expires_at: Date }>>`
    INSERT INTO public.transconet_ai_actions
      (user_id, role, action_name, status, payload, expires_at)
    VALUES
      (${user.id}, ${user.role}, ${plan.action}, 'PENDING_APPROVAL', ${JSON.stringify(plan.payload)}::jsonb, ${expiresAt})
    RETURNING id, expires_at
  `;

  return rows[0] || null;
}

export async function getPendingAction(user: UserContext, actionId: string) {
  const rows = await prisma.$queryRaw<Array<any>>`
    SELECT id, user_id, role, action_name, status, payload, expires_at, created_at, approved_at, consumed_at
    FROM public.transconet_ai_actions
    WHERE id = ${actionId}::uuid AND user_id = ${user.id}
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function approveCreateLoad(user: UserContext, actionId: string) {
  const action = await getPendingAction(user, actionId);
  if (!action) throw new Error('AI action not found.');
  if (action.role !== user.role) throw new Error('AI action role mismatch.');
  if (action.action_name !== 'CREATE_LOAD') throw new Error('This AI action cannot create a load.');
  if (action.status !== 'PENDING_APPROVAL') throw new Error('This AI action is no longer pending approval.');
  if (new Date(action.expires_at).getTime() <= Date.now()) {
    await prisma.$executeRaw`
      UPDATE public.transconet_ai_actions SET status = 'EXPIRED'
      WHERE id = ${actionId}::uuid AND user_id = ${user.id} AND status = 'PENDING_APPROVAL'
    `;
    throw new Error('This AI approval has expired. Please ask me again.');
  }

  const payload = action.payload as Record<string, unknown>;
  const title = String(payload.title || 'Cargo Freight').trim();
  const origin = String(payload.origin || '').trim();
  const destination = String(payload.destination || '').trim();
  const weightKg = Number(payload.weightKg);
  const cargoType = String(payload.cargoType || 'GENERAL_MERCHANDISE');
  const validCargoTypes = new Set([
    'AGRICULTURAL_GOODS', 'CONSTRUCTION_MATERIALS', 'GENERAL_MERCHANDISE',
    'PHARMACEUTICALS_MEDICAL', 'ELECTRONICS_APPLIANCES', 'PETROLEUM_CHEMICALS', 'HEAVY_MACHINERY'
  ]);

  if (!origin || !destination || !Number.isFinite(weightKg) || weightKg <= 0 || !validCargoTypes.has(cargoType)) {
    throw new Error('The load details are incomplete or invalid. Please ask the AI to complete the missing information.');
  }

  const created = await prisma.loadPosting.create({
    data: {
      title: title.slice(0, 200),
      cargoType: cargoType as any,
      weightKg,
      origin: origin.slice(0, 200),
      destination: destination.slice(0, 200),
      suggestedBudget: payload.suggestedBudget == null ? null : Number(payload.suggestedBudget),
      isEscrowEnabled: Boolean(payload.isEscrowEnabled),
      customerId: user.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE public.transconet_ai_actions
    SET status = 'CONSUMED', approved_at = now(), consumed_at = now()
    WHERE id = ${actionId}::uuid AND user_id = ${user.id} AND status = 'PENDING_APPROVAL'
  `;

  return created;
}
