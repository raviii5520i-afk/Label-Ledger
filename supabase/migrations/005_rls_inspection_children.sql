-- ============================================================
-- Label Ledger — Phase 4 Step 7: RLS for Child Tables (Corrected Schema)
-- (public.inspection_items, public.label_evidence, public.rule_checks)
-- ============================================================

-- ============================================================
-- 1. TABLE: public.inspection_items
-- ============================================================
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;

-- 1.1 Admin Policy: Full Access
DROP POLICY IF EXISTS inspection_items_admin_all ON public.inspection_items;
CREATE POLICY inspection_items_admin_all
  ON public.inspection_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 1.2 Inspector/Owner SELECT
DROP POLICY IF EXISTS inspection_items_select_owner ON public.inspection_items;
CREATE POLICY inspection_items_select_owner
  ON public.inspection_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 1.3 Inspector/Owner INSERT
DROP POLICY IF EXISTS inspection_items_insert_owner ON public.inspection_items;
CREATE POLICY inspection_items_insert_owner
  ON public.inspection_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 1.4 Inspector/Owner UPDATE
DROP POLICY IF EXISTS inspection_items_update_owner ON public.inspection_items;
CREATE POLICY inspection_items_update_owner
  ON public.inspection_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 1.5 Inspector/Owner DELETE
DROP POLICY IF EXISTS inspection_items_delete_owner ON public.inspection_items;
CREATE POLICY inspection_items_delete_owner
  ON public.inspection_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_items.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 1.6 Manufacturer & Viewer SELECT (Verified Only)
DROP POLICY IF EXISTS inspection_items_select_verified_roles ON public.inspection_items;
CREATE POLICY inspection_items_select_verified_roles
  ON public.inspection_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.id = inspection_items.inspection_id
        AND p.role IN ('manufacturer', 'viewer')
        AND i.status IN ('verified_compliant', 'verified_non_compliant')
    )
  );


-- ============================================================
-- 2. TABLE: public.label_evidence
-- ============================================================
ALTER TABLE public.label_evidence ENABLE ROW LEVEL SECURITY;

-- 2.1 Admin Policy: Full Access
DROP POLICY IF EXISTS label_evidence_admin_all ON public.label_evidence;
CREATE POLICY label_evidence_admin_all
  ON public.label_evidence
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.2 Inspector/Owner SELECT
DROP POLICY IF EXISTS label_evidence_select_owner ON public.label_evidence;
CREATE POLICY label_evidence_select_owner
  ON public.label_evidence
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = label_evidence.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 2.3 Inspector/Owner INSERT
DROP POLICY IF EXISTS label_evidence_insert_owner ON public.label_evidence;
CREATE POLICY label_evidence_insert_owner
  ON public.label_evidence
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = label_evidence.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 2.4 Inspector/Owner UPDATE
DROP POLICY IF EXISTS label_evidence_update_owner ON public.label_evidence;
CREATE POLICY label_evidence_update_owner
  ON public.label_evidence
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = label_evidence.inspection_id
        AND i.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = label_evidence.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 2.5 Inspector/Owner DELETE
DROP POLICY IF EXISTS label_evidence_delete_owner ON public.label_evidence;
CREATE POLICY label_evidence_delete_owner
  ON public.label_evidence
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = label_evidence.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 2.6 Manufacturer & Viewer SELECT (Verified Only)
DROP POLICY IF EXISTS label_evidence_select_verified_roles ON public.label_evidence;
CREATE POLICY label_evidence_select_verified_roles
  ON public.label_evidence
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.id = label_evidence.inspection_id
        AND p.role IN ('manufacturer', 'viewer')
        AND i.status IN ('verified_compliant', 'verified_non_compliant')
    )
  );


-- ============================================================
-- 3. TABLE: public.rule_checks
-- ============================================================
ALTER TABLE public.rule_checks ENABLE ROW LEVEL SECURITY;

-- 3.1 Admin Policy: Full Access
DROP POLICY IF EXISTS rule_checks_admin_all ON public.rule_checks;
CREATE POLICY rule_checks_admin_all
  ON public.rule_checks
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3.2 Inspector/Owner SELECT
DROP POLICY IF EXISTS rule_checks_select_owner ON public.rule_checks;
CREATE POLICY rule_checks_select_owner
  ON public.rule_checks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = rule_checks.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 3.3 Inspector/Owner INSERT
DROP POLICY IF EXISTS rule_checks_insert_owner ON public.rule_checks;
CREATE POLICY rule_checks_insert_owner
  ON public.rule_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = rule_checks.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 3.4 Inspector/Owner UPDATE
DROP POLICY IF EXISTS rule_checks_update_owner ON public.rule_checks;
CREATE POLICY rule_checks_update_owner
  ON public.rule_checks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = rule_checks.inspection_id
        AND i.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = rule_checks.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 3.5 Inspector/Owner DELETE
DROP POLICY IF EXISTS rule_checks_delete_owner ON public.rule_checks;
CREATE POLICY rule_checks_delete_owner
  ON public.rule_checks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = rule_checks.inspection_id
        AND i.created_by = auth.uid()
    )
  );

-- 3.6 Manufacturer & Viewer SELECT (Verified Only)
DROP POLICY IF EXISTS rule_checks_select_verified_roles ON public.rule_checks;
CREATE POLICY rule_checks_select_verified_roles
  ON public.rule_checks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.id = rule_checks.inspection_id
        AND p.role IN ('manufacturer', 'viewer')
        AND i.status IN ('verified_compliant', 'verified_non_compliant')
    )
  );
