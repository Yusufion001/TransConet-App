import { prismaBypass } from '../db/prisma';

export type AutomationRole = 'CUSTOMER' | 'TRANSPORTER';

type ProposedAction = {
  actionName: string;
  description: string;
  requiresApproval: boolean;
  payload: Record<string, unknown>;
};

type AutomationResult = {
  reply: string;
  needsClarification: boolean;
  clarifyingQuestion: string;
  actions: ProposedAction[];
};

const roleCapabilities: Record<AutomationRole, string[]> = {
  CUSTOMER: ['post_load', 'view_marketplace', 'find_transporters', 'review_bids', 'accept_bid', 'track_shipment', 'manage_shipments', 'payment_and_escrow', 'support'],
  TRANSPORTER: ['view_marketplace', 'find_loads', 'place_bid', 'manage_fleet', 'manage_vehicles', 'track_trips', 'manage_shipments', 'payment_and_escrow', 'support']
};

const allowedActions: Record<AutomationRole, Set<string>> = {
  CUSTOMER: new Set(roleCapabilities.CUSTOMER),
  TRANSPORTER: new Set(roleCapabilities.TRANSPORTER)
};

const CORE_ACTIONS = new Set(['post_load', 'place_bid', 'accept_bid']);

function moneyNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[₦,\s]/g, '').replace(/ngn/i, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function contextValue(context: Record<string, unknown>, key: string) {
  const value = context[key];
  return value === undefined || value === null || value === '' ? undefined : value;
}

function extractAmount(message: string, context: Record<string, unknown>) {
  const fromContext = moneyNumber(contextValue(context, 'amount'));
  if (fromContext) return fromContext;
  const match = message.match(/(?:₦|ngn|naira)\s*([\d,]+(?:\.\d+)?)|\b([\d,]+(?:\.\d+)?)\s*(?:₦|ngn|naira)\b/i);
  if (!match) return null;
  return moneyNumber(match[1] || match[2]);
}

function fallbackResult(message: string, role: AutomationRole, context: Record<string, unknown>): AutomationResult {
  const text = message.trim().toLowerCase();
  const customer = role === 'CUSTOMER';

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(text)) {
    return { reply: `Hello. I'm your TransConet assistant. I can help you use your ${customer ? 'customer' : 'transporter'} features. What would you like to do?`, needsClarification: false, clarifyingQuestion: '', actions: [] };
  }

  if (/\b(help|what can i do|what can you do|features|options)\b/i.test(text)) {
    const features = customer
      ? 'post a load, browse the marketplace, find transporters, review or accept bids, track shipments, manage shipments, payments/escrow, or contact support.'
      : 'browse available loads, find loads, place bids, manage your fleet and vehicles, track trips, manage shipments, payments/escrow, or contact support.';
    return { reply: `I can help you ${features}`, needsClarification: false, clarifyingQuestion: '', actions: [] };
  }

  if (!customer && /\b(bid|offer)\b/i.test(text)) {
    const loadId = contextValue(context, 'loadId');
    const amount = extractAmount(message, context);
    const notes = contextValue(context, 'notes');
    const missing: string[] = [];
    if (!loadId) missing.push('the load you want to bid on');
    if (!amount) missing.push('your bid amount');

    if (missing.length) {
      return {
        reply: 'I can prepare your bid without using the advanced AI service.',
        needsClarification: true,
        clarifyingQuestion: `Please provide ${missing.join(' and ')}.`,
        actions: []
      };
    }

    return {
      reply: `I have prepared a bid of ₦${amount.toLocaleString()} for the selected load. Please review it and approve it before I submit it.`,
      needsClarification: false,
      clarifyingQuestion: '',
      actions: [{
        actionName: 'place_bid',
        description: `Submit a ₦${amount.toLocaleString()} bid for the selected load.`,
        requiresApproval: true,
        payload: { loadId: String(loadId), amount, ...(notes ? { notes: String(notes).slice(0, 1000) } : {}) }
      }]
    };
  }

  if (customer && /\b(accept|choose|select)\b.*\b(bid|offer)\b|\baccept\s+(a\s+)?bid\b/i.test(text)) {
    const bidId = contextValue(context, 'bidId');
    if (!bidId) {
      return { reply: 'I can accept a bid for you, but first select the bid you want to accept.', needsClarification: true, clarifyingQuestion: 'Which bid would you like to accept?', actions: [] };
    }
    return {
      reply: 'I found the bid you selected. Please review and approve this action before I accept it.',
      needsClarification: false,
      clarifyingQuestion: '',
      actions: [{ actionName: 'accept_bid', description: 'Accept the selected transporter bid.', requiresApproval: true, payload: { bidId: String(bidId) } }]
    };
  }

  if (customer && /\b(post|create|add|publish)\b.*\b(load|shipment|cargo)\b|\b(load|shipment)\b.*\b(post|create|publish)\b/i.test(text)) {
    const payload: Record<string, unknown> = {};
    for (const key of ['title', 'cargoType', 'weightKg', 'origin', 'destination', 'suggestedBudget', 'isEscrowEnabled']) {
      const value = contextValue(context, key);
      if (value !== undefined) payload[key] = value;
    }
    const missing = ['title', 'cargoType', 'weightKg', 'origin', 'destination'].filter(key => payload[key] === undefined);
    if (missing.length) {
      return { reply: 'I can prepare the load posting for you.', needsClarification: true, clarifyingQuestion: `Please provide: ${missing.join(', ')}.`, actions: [] };
    }
    return {
      reply: 'I have prepared your load posting. Please review and approve it before I post it.',
      needsClarification: false,
      clarifyingQuestion: '',
      actions: [{ actionName: 'post_load', description: 'Post this load to the TransConet marketplace.', requiresApproval: true, payload }]
    };
  }

  if (/\b(marketplace|available loads?|available capacity|find loads?|browse loads?)\b/i.test(text)) {
    return customer
      ? { reply: 'I can help you explore the marketplace. Tell me the route, cargo type, weight, or transport requirement.', needsClarification: true, clarifyingQuestion: 'What route or shipment requirement should I search for?', actions: [] }
      : { reply: 'I can search the existing TransConet marketplace for available loads. Tell me a route or cargo requirement, or simply say “find available loads”.', needsClarification: true, clarifyingQuestion: 'What load or route should I search for?', actions: [] };
  }

  if (customer && /\b(transporter|transporters|carrier|carriers)\b/i.test(text)) {
    return { reply: 'I can help you find transporters. Tell me the route, cargo type, weight, or another requirement.', needsClarification: true, clarifyingQuestion: 'What route or cargo requirement should I use?', actions: [] };
  }

  if (/\b(fleet|vehicle|vehicles)\b/i.test(text)) {
    return { reply: `I can guide you through ${customer ? 'the customer features available to you' : 'your fleet and vehicle features'}.`, needsClarification: true, clarifyingQuestion: customer ? 'What customer task do you want to perform?' : 'What fleet or vehicle task do you want to perform?', actions: [] };
  }

  if (/\b(track|tracking|trip|shipment)\b/i.test(text)) {
    return { reply: 'I can guide you through shipment or trip tracking. Tell me what you want to check.', needsClarification: true, clarifyingQuestion: 'Which shipment or trip should I help you with?', actions: [] };
  }

  if (/\b(support|help desk|problem|issue)\b/i.test(text)) {
    return { reply: 'I can help you contact TransConet support. Tell me what happened.', needsClarification: true, clarifyingQuestion: 'What issue are you experiencing?', actions: [] };
  }

  if (/\b(payment|pay|escrow|wallet)\b/i.test(text)) {
    return { reply: 'I can guide you through payment and escrow options. Consequential financial actions will always require your approval.', needsClarification: true, clarifyingQuestion: 'What payment or escrow task do you need?', actions: [] };
  }

  return {
    reply: `I'm your TransConet assistant. I can help with your ${customer ? 'customer' : 'transporter'} features without requiring the advanced AI service.`,
    needsClarification: true,
    clarifyingQuestion: customer ? 'Would you like to post a load, find a transporter, review bids, track a shipment, or do something else?' : 'Would you like to find a load, place a bid, manage your fleet, track a trip, or do something else?',
    actions: []
  };
}

async function storeActions(userId: string, role: AutomationRole, actions: ProposedAction[], source = 'core_automation') {
  const stored = [];
  for (const action of actions) {
    if (!action?.actionName || !allowedActions[role].has(action.actionName) || !CORE_ACTIONS.has(action.actionName) || action.requiresApproval !== true) continue;
    const payload = { ...(action.payload || {}), description: action.description, source, createdAt: new Date().toISOString() };
    const rows = await prismaBypass.$queryRawUnsafe<any[]>(
      `INSERT INTO public.transconet_ai_actions (user_id, role, action_name, status, payload)
       VALUES ($1, $2, $3, 'PENDING_APPROVAL', $4::jsonb)
       RETURNING id, user_id, role, action_name, status, payload`,
      userId, role, action.actionName, JSON.stringify(payload)
    );
    stored.push(rows[0]);
  }
  return stored;
}

export async function processAutomationMessage(userId: string, role: AutomationRole, message: string, context: Record<string, unknown> = {}) {
  // Core automation is intentionally deterministic and free to run. OpenAI is no longer
  // required for routine navigation, marketplace actions, or approval workflows.
  const result = fallbackResult(message, role, context);
  const actions = await storeActions(userId, role, result.actions);
  return {
    reply: result.reply,
    needsClarification: result.needsClarification,
    clarifyingQuestion: result.clarifyingQuestion,
    actions,
    aiMode: 'core'
  };
}

export async function listPendingActions(userId: string) {
  return prismaBypass.$queryRawUnsafe<any[]>(
    `SELECT id, user_id, role, action_name, status, payload
     FROM public.transconet_ai_actions
     WHERE user_id = $1 AND status = 'PENDING_APPROVAL'
     ORDER BY id DESC LIMIT 20`,
    userId
  );
}

async function executeApprovedAction(userId: string, role: AutomationRole, actionName: string, payload: any) {
  if (actionName === 'post_load') {
    if (role !== 'CUSTOMER') throw new Error('Only customers can post loads.');
    if (!payload.title || !payload.origin || !payload.destination || !payload.weightKg || !payload.cargoType) throw new Error('Load title, cargo type, weight, origin, and destination are required.');
    const validCargoTypes = new Set(['AGRICULTURAL_GOODS','CONSTRUCTION_MATERIALS','GENERAL_MERCHANDISE','PHARMACEUTICALS_MEDICAL','ELECTRONICS_APPLIANCES','PETROLEUM_CHEMICALS','HEAVY_MACHINERY']);
    if (!validCargoTypes.has(String(payload.cargoType))) throw new Error('Invalid cargo type.');
    return prismaBypass.loadPosting.create({ data: {
      title: String(payload.title).slice(0, 200), cargoType: payload.cargoType as any, weightKg: Number(payload.weightKg),
      origin: String(payload.origin).slice(0, 200), destination: String(payload.destination).slice(0, 200),
      suggestedBudget: payload.suggestedBudget == null ? null : Number(payload.suggestedBudget),
      isEscrowEnabled: Boolean(payload.isEscrowEnabled), customerId: userId
    }});
  }

  if (actionName === 'place_bid') {
    if (role !== 'TRANSPORTER') throw new Error('Only transporters can place bids.');
    const amount = moneyNumber(payload.amount);
    if (!payload.loadId || !amount) throw new Error('A valid load ID and bid amount are required.');
    const load = await prismaBypass.loadPosting.findUnique({ where: { id: String(payload.loadId) } });
    if (!load || load.status !== 'AVAILABLE') throw new Error('That load is not available for bidding.');
    const duplicate = await prismaBypass.bid.findFirst({ where: { loadId: load.id, driverId: userId, status: 'PENDING' } });
    if (duplicate) throw new Error('You already have a pending bid for this load.');
    return prismaBypass.bid.create({ data: { loadId: load.id, driverId: userId, amount, notes: payload.notes ? String(payload.notes).slice(0, 1000) : null } });
  }

  if (actionName === 'accept_bid') {
    if (role !== 'CUSTOMER') throw new Error('Only customers can accept bids.');
    if (!payload.bidId) throw new Error('A bid ID is required.');
    const bid = await prismaBypass.bid.findUnique({ where: { id: String(payload.bidId) }, include: { load: true } });
    if (!bid || bid.load.customerId !== userId) throw new Error('Bid not found or not owned by this customer.');
    if (bid.load.status !== 'AVAILABLE') throw new Error('This load is no longer available for assignment.');
    await prismaBypass.$transaction([
      prismaBypass.bid.update({ where: { id: bid.id }, data: { status: 'ACCEPTED' } }),
      prismaBypass.bid.updateMany({ where: { loadId: bid.loadId, id: { not: bid.id } }, data: { status: 'REJECTED' } }),
      prismaBypass.loadPosting.update({ where: { id: bid.loadId }, data: { status: 'QUOTE_ACCEPTED' } })
    ]);
    return { success: true, bidId: bid.id, loadId: bid.loadId };
  }

  throw new Error(`Unsupported automation action: ${actionName}`);
}

export async function approveAction(userId: string, actionId: string) {
  const rows = await prismaBypass.$queryRawUnsafe<any[]>(
    `SELECT id, user_id, role, action_name, status, payload
     FROM public.transconet_ai_actions
     WHERE id = $1 AND user_id = $2 AND status = 'PENDING_APPROVAL'
     LIMIT 1`,
    actionId, userId
  );
  const action = rows[0];
  if (!action) return null;

  const role = action.role as AutomationRole;
  if (!allowedActions[role]?.has(action.action_name) || !CORE_ACTIONS.has(action.action_name)) throw new Error('This automation action is not permitted.');

  try {
    const result = await executeApprovedAction(userId, role, action.action_name, action.payload || {});
    const updated = await prismaBypass.$queryRawUnsafe<any[]>(
      `UPDATE public.transconet_ai_actions
       SET status = 'COMPLETED', payload = $1::jsonb
       WHERE id = $2 AND user_id = $3 AND status = 'PENDING_APPROVAL'
       RETURNING id, user_id, role, action_name, status, payload`,
      JSON.stringify({ ...(action.payload || {}), result, completedAt: new Date().toISOString() }), actionId, userId
    );
    return updated[0] || null;
  } catch (error: any) {
    await prismaBypass.$queryRawUnsafe(
      `UPDATE public.transconet_ai_actions SET status = 'FAILED', payload = $1::jsonb WHERE id = $2 AND user_id = $3 AND status = 'PENDING_APPROVAL'`,
      JSON.stringify({ ...(action.payload || {}), error: String(error?.message || error), failedAt: new Date().toISOString() }), actionId, userId
    );
    throw error;
  }
}

export async function rejectAction(userId: string, actionId: string) {
  const rows = await prismaBypass.$queryRawUnsafe<any[]>(
    `UPDATE public.transconet_ai_actions
     SET status = 'REJECTED', payload = payload || jsonb_build_object('rejectedAt', to_jsonb(now()))
     WHERE id = $1 AND user_id = $2 AND status = 'PENDING_APPROVAL'
     RETURNING id, user_id, role, action_name, status, payload`,
    actionId, userId
  );
  return rows[0] || null;
}
