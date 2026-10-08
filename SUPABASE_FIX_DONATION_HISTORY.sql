-- ============================================================
--  Fix donation_history RLS — only show the logged-in user's rows
--  Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop all existing policies on donation_history
DROP POLICY IF EXISTS "Users can read own donation history"   ON public.donation_history;
DROP POLICY IF EXISTS "Users can insert own donation history" ON public.donation_history;
DROP POLICY IF EXISTS "Users can delete own donation history" ON public.donation_history;

-- SELECT: only rows where user_id matches the logged-in user
CREATE POLICY "Users can read own donation history"
  ON public.donation_history FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: only allowed to insert rows for yourself
CREATE POLICY "Users can insert own donation history"
  ON public.donation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: only your own rows
CREATE POLICY "Users can delete own donation history"
  ON public.donation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Also fix donation_pledges the same way
DROP POLICY IF EXISTS "Users can read own pledges"             ON public.donation_pledges;
DROP POLICY IF EXISTS "Authenticated users can insert pledges" ON public.donation_pledges;

CREATE POLICY "Users can read own pledges"
  ON public.donation_pledges FOR SELECT
  USING (auth.uid() = donor_user_id);

CREATE POLICY "Authenticated users can insert pledges"
  ON public.donation_pledges FOR INSERT
  TO authenticated WITH CHECK (TRUE);

-- Remove any orphan rows in donation_history where user_id is NULL
-- (these are leftover seed/test data that no user owns)
DELETE FROM public.donation_history WHERE user_id IS NULL;
