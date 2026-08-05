-- Align the AI approval-action table with the application contract.
-- Existing rows receive a short transition window; new rows get expiry from application code.
ALTER TABLE public.transconet_ai_actions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE public.transconet_ai_actions
SET expires_at = COALESCE(expires_at, created_at + INTERVAL '30 minutes')
WHERE expires_at IS NULL;

ALTER TABLE public.transconet_ai_actions
  ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS transconet_ai_actions_pending_expiry_idx
  ON public.transconet_ai_actions (user_id, status, expires_at);
