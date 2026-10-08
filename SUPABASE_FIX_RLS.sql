-- ============================================================
--  LifeLink — Fix infinite recursion in profiles RLS
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Drop the broken recursive policies
DROP POLICY IF EXISTS "Users can view own profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert own profile"       ON public.profiles;

-- Step 2: Create a SECURITY DEFINER function that bypasses RLS
-- to safely check the current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Step 3: Re-create policies using the function (no recursion)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.get_my_role() = 'admin');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.get_my_role() = 'admin');

CREATE POLICY "Allow insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
