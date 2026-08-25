-- Fix RLS policies to use inspector_id instead of created_by

-- 1. Inspector SELECT: Inspectors can view their own inspections
DROP POLICY IF EXISTS inspections_select_inspector_own ON public.inspections;
CREATE POLICY inspections_select_inspector_own
  ON public.inspections
  FOR SELECT
  TO authenticated
  USING (inspector_id = auth.uid());

-- 2. Inspector INSERT: Inspectors can create inspections owned by themselves
DROP POLICY IF EXISTS inspections_insert_inspector_own ON public.inspections;
CREATE POLICY inspections_insert_inspector_own
  ON public.inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (inspector_id = auth.uid());

-- 3. Inspector UPDATE: Inspectors can update unverified inspections (draft / pending_review)
DROP POLICY IF EXISTS inspections_update_inspector_own ON public.inspections;
CREATE POLICY inspections_update_inspector_own
  ON public.inspections
  FOR UPDATE
  TO authenticated
  USING (
    inspector_id = auth.uid() AND
    status IN ('draft', 'pending_review')
  )
  WITH CHECK (
    inspector_id = auth.uid() AND
    status IN ('draft', 'pending_review')
  );
