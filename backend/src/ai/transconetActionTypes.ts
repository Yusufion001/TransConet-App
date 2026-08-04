import { TransConetRole } from './transconetAi';

export type TransConetActionName =
  | 'customer.post_load';

export type PostLoadDraft = {
  title: string;
  cargoType: string;
  weightKg: number;
  origin: string;
  destination: string;
  suggestedBudget?: number | null;
  isEscrowEnabled?: boolean;
};

export type PendingTransConetAction = {
  actionId: string;
  name: TransConetActionName;
  role: TransConetRole;
  status: 'PENDING_APPROVAL';
  draft: PostLoadDraft;
  expiresAt: string;
};

export type ActionApprovalRequest = {
  actionId: string;
  approved: boolean;
};
