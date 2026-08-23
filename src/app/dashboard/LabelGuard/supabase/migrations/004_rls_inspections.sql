-- ============================================================
-- Label Ledger — Phase 4 Step 5: RLS for Public.Inspections (Corrected Schema)
-- ============================================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. ADMIN POLICIES (Full Access: SELECT, INSERT, UPDATE, DELETE)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS inspections_admin_all ON public.inspections;
CREATE POLICY inspections_admin_all
  ON public.inspections
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 3. INSPECTOR POLICIES
-- ------------------------------------------------------------

-- 3.1 Inspector SELECT: Inspectors can view their own inspections
DROP POLICY IF EXISTS inspections_select_inspector_own ON public.inspections;
CREATE POLICY inspections_select_inspector_own
  ON public.inspections
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- 3.2 Inspector INSERT: Inspectors can create inspections owned by themselves
DROP POLICY IF EXISTS inspections_insert_inspector_own ON public.inspections;
CREATE POLICY inspections_insert_inspector_own
  ON public.inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- 3.3 Inspector UPDATE: Inspectors can update unverified inspections (draft / pending_review)
-- Cannot change status to verified_* or reassign ownership
DROP POLICY IF EXISTS inspections_update_inspector_own ON public.inspections;
CREATE POLICY inspections_update_inspector_own
  ON public.inspections
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    status IN ('draft', 'pending_review')
  )
  WITH CHECK (
    created_by = auth.uid() AND
    status IN ('draft', 'pending_review')
  );

-- ------------------------------------------------------------
-- 4. MANUFACTURER & VIEWER POLICIES
-- ------------------------------------------------------------

-- 4.1 Manufacturer & Viewer SELECT: Read-only access to verified inspections only
DROP POLICY IF EXISTS inspections_select_verified_public_roles ON public.inspections;
CREATE POLICY inspections_select_verified_public_roles
  ON public.inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('manufacturer', 'viewer')
    ) AND
    status IN ('verified_compliant', 'verified_non_compliant')
  );
