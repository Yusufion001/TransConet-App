ALTER TABLE public.transconet_ai_actions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE public.transconet_ai_actions
SET expires_at = NOW() + INTERVAL '30 minutes'
WHERE expires_at IS NULL
  AND status = 'PENDING_APPROVAL';

ALTER TABLE public.transconet_ai_actions
  ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS transconet_ai_actions_expires_at_idx
  ON public.transconet_ai_actions (expires_at)
  WHERE status = 'PENDING_APPROVAL';
