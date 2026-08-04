import { TransConetRole } from './transconetAi';

export type TransConetCapability = {
  id: string;
  label: string;
  description: string;
  role: TransConetRole;
  readOnly: boolean;
  approvalRequired: boolean;
};

/**
 * This is the AI-facing allowlist. It describes existing TransConet capability
 * areas; the AI must never invent a capability outside this registry.
 */
export const TRANSCONET_CAPABILITIES: TransConetCapability[] = [
  {
    id: 'customer.post_load',
    label: 'Post a load',
    description: 'Prepare a customer load/shipment request for the existing load marketplace.',
    role: 'CUSTOMER',
    readOnly: false,
    approvalRequired: true,
  },
  {
    id: 'customer.my_loads',
    label: 'View my loads',
    description: 'Review loads belonging to the authenticated customer.',
    role: 'CUSTOMER',
    readOnly: true,
    approvalRequired: false,
  },
  {
    id: 'customer.marketplace',
    label: 'Explore marketplace',
    description: 'Explore available marketplace transport opportunities.',
    role: 'CUSTOMER',
    readOnly: true,
    approvalRequired: false,
  },
  {
    id: 'transporter.marketplace',
    label: 'Find available loads',
    description: 'Explore available loads in the marketplace for a transporter.',
    role: 'TRANSPORTER',
    readOnly: true,
    approvalRequired: false,
  },
  {
    id: 'transporter.fleet',
    label: 'Manage fleet',
    description: 'Navigate and manage transporter fleet capabilities already provided by TransConet.',
    role: 'TRANSPORTER',
    readOnly: false,
    approvalRequired: true,
  },
  {
    id: 'transporter.bidding',
    label: 'Prepare a bid',
    description: 'Prepare a transporter bid or marketplace acceptance action supported by TransConet.',
    role: 'TRANSPORTER',
    readOnly: false,
    approvalRequired: true,
  },
  {
    id: 'shipment.status',
    label: 'Check shipment status',
    description: 'Help the authenticated user navigate supported shipment tracking/status information.',
    role: 'CUSTOMER',
    readOnly: true,
    approvalRequired: false,
  },
  {
    id: 'shipment.status',
    label: 'Check shipment status',
    description: 'Help the authenticated user navigate supported shipment tracking/status information.',
    role: 'TRANSPORTER',
    readOnly: true,
    approvalRequired: false,
  },
];

export function getCapabilitiesForRole(role: TransConetRole): TransConetCapability[] {
  return TRANSCONET_CAPABILITIES.filter((capability) => capability.role === role);
}

export function capabilityPromptForRole(role: TransConetRole): string {
  return getCapabilitiesForRole(role)
    .map((capability) => `- ${capability.id}: ${capability.label} — ${capability.description} (${capability.readOnly ? 'read-only' : 'state-changing; approval required'})`)
    .join('\n');
}
