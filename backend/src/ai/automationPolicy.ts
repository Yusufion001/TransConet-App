export type AutomationRole = 'CUSTOMER' | 'TRANSPORTER';

export type AutomationAction =
  | 'CREATE_LOAD'
  | 'SEARCH_LOADS'
  | 'VIEW_AVAILABLE_CAPACITY'
  | 'VIEW_MATCHES'
  | 'VIEW_SHIPMENTS'
  | 'VIEW_FLEET'
  | 'OPEN_SUPPORT';

const customerActions: AutomationAction[] = [
  'CREATE_LOAD',
  'SEARCH_LOADS',
  'VIEW_AVAILABLE_CAPACITY',
  'VIEW_MATCHES',
  'VIEW_SHIPMENTS',
  'OPEN_SUPPORT',
];

const transporterActions: AutomationAction[] = [
  'SEARCH_LOADS',
  'VIEW_AVAILABLE_CAPACITY',
  'VIEW_MATCHES',
  'VIEW_SHIPMENTS',
  'VIEW_FLEET',
  'OPEN_SUPPORT',
];

export function allowedAutomationActions(role: AutomationRole): AutomationAction[] {
  return role === 'CUSTOMER' ? customerActions : transporterActions;
}

export function isAllowedAutomationAction(
  role: AutomationRole,
  action: string,
): action is AutomationAction {
  return allowedAutomationActions(role).includes(action as AutomationAction);
}

export function requiresApproval(action: AutomationAction): boolean {
  // Read/navigation requests can be handled immediately. Mutating actions
  // must always pause for explicit user approval.
  return action === 'CREATE_LOAD';
}
