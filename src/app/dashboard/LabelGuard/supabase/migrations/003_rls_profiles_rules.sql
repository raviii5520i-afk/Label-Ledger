-- ============================================================
-- Label Ledger — Phase 4 Step 3: RLS for Profiles & Rules
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE: public.profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can SELECT their own profile
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy 2: Admins can SELECT all profiles
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Admins can UPDATE any profile
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ------------------------------------------------------------
-- 2. TABLE: public.rules
-- ------------------------------------------------------------
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can SELECT active rules
DROP POLICY IF EXISTS rules_select_active_authenticated ON public.rules;
CREATE POLICY rules_select_active_authenticated
  ON public.rules
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Policy 2: Admins can SELECT all rules (including inactive)
DROP POLICY IF EXISTS rules_select_all_admin ON public.rules;
CREATE POLICY rules_select_all_admin
  ON public.rules
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy 3: Admins can INSERT rules
DROP POLICY IF EXISTS rules_insert_admin ON public.rules;
CREATE POLICY rules_insert_admin
  ON public.rules
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Policy 4: Admins can UPDATE rules
DROP POLICY IF EXISTS rules_update_admin ON public.rules;
CREATE POLICY rules_update_admin
  ON public.rules
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy 5: Admins can DELETE rules
DROP POLICY IF EXISTS rules_delete_admin ON public.rules;
CREATE POLICY rules_delete_admin
  ON public.rules
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
