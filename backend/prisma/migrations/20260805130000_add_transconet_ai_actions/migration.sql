CREATE TABLE IF NOT EXISTS public.transconet_ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  action_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS transconet_ai_actions_user_status_idx
  ON public.transconet_ai_actions (user_id, status);

CREATE INDEX IF NOT EXISTS transconet_ai_actions_id_idx
  ON public.transconet_ai_actions (id DESC);