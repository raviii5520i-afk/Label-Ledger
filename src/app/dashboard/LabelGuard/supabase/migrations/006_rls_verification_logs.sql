-- ============================================================
-- Label Ledger — Phase 4 Step 9: RLS for Public.Verification_Logs (Corrected Schema)
-- ============================================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. ADMIN POLICIES (Full Access: SELECT, INSERT, UPDATE, DELETE)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS verification_logs_admin_all ON public.verification_logs;
CREATE POLICY verification_logs_admin_all
  ON public.verification_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 3. OWNER / INSPECTOR POLICIES
-- ------------------------------------------------------------

-- 3.1 Owner SELECT: Inspectors can view logs for inspections they own
DROP POLICY IF EXISTS verification_logs_select_owner ON public.verification_logs;
CREATE POLICY verification_logs_select_owner
  ON public.verification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = verification_logs.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 3.2 Owner INSERT: Inspectors can append log entries for inspections they own (setting officer_id = auth.uid())
DROP POLICY IF EXISTS verification_logs_insert_owner ON public.verification_logs;
CREATE POLICY verification_logs_insert_owner
  ON public.verification_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    officer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = verification_logs.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 4. MANUFACTURER & VIEWER POLICIES
-- ------------------------------------------------------------

-- 4.1 Manufacturer & Viewer SELECT: Read-only access to logs for verified inspections only
DROP POLICY IF EXISTS verification_logs_select_verified_roles ON public.verification_logs;
CREATE POLICY verification_logs_select_verified_roles
  ON public.verification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.id = verification_logs.inspection_id
        AND p.role IN ('manufacturer', 'viewer')
        AND i.status IN ('verified_compliant', 'verified_non_compliant')
    )
  );
