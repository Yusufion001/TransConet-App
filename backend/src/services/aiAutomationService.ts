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
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const rows = await prismaBypass.$queryRawUnsafe<any[]>(
      `INSERT INTO public.transconet_ai_actions (user_id, role, action_name, status, payload, expires_at)
       VALUES ($1, $2, $3, 'PENDING_APPROVAL', $4::jsonb, $5)
       RETURNING id, user_id, role, action_name, status, payload, expires_at`,
      userId, role, action.actionName, JSON.stringify(payload), expiresAt
    );
    stored.push(rows[0]);
  }
  return stored;
}

export async function processAutomationMessage(userId: string, role: AutomationRole, message: string, context: Record<string, unknown> = {}) {
  // Core automation is intentionally deterministic and free to run. OpenAI is no longer
  // required for routine navigation, marketplace actions, or approval workflows.
  const base = fallbackResult(message, role, context);
  const actions = await storeActions(userId, role, base.actions, 'core_automation');
  return {
    ...base,
    actions
  };
}
