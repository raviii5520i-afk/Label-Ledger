-- ============================================================
-- Label Ledger — Phase 5 Step 2: Supabase Storage Bucket & Storage RLS
-- ============================================================

-- 1. CREATE PRIVATE BUCKET: label-evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('label-evidence', 'label-evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ------------------------------------------------------------
-- 2. ADMIN POLICY: Full Access to storage.objects for label-evidence
-- ------------------------------------------------------------
DROP POLICY IF EXISTS label_evidence_storage_admin_all ON storage.objects;
CREATE POLICY label_evidence_storage_admin_all
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'label-evidence' AND
    public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'label-evidence' AND
    public.is_admin()
  );

-- ------------------------------------------------------------
-- 3. INSPECTOR / OWNER POLICIES
-- ------------------------------------------------------------

-- 3.1 Owner SELECT: Inspectors can view storage objects for inspections they own
DROP POLICY IF EXISTS label_evidence_storage_select_owner ON storage.objects;
CREATE POLICY label_evidence_storage_select_owner
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'label-evidence' AND
    (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = ((storage.foldername(name))[1])::uuid
        AND i.created_by = auth.uid()
    )
  );

-- 3.2 Owner INSERT: Inspectors can upload storage objects into their own inspection folder
DROP POLICY IF EXISTS label_evidence_storage_insert_owner ON storage.objects;
CREATE POLICY label_evidence_storage_insert_owner
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'label-evidence' AND
    (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = ((storage.foldername(name))[1])::uuid
        AND i.created_by = auth.uid()
    )
  );

-- 3.3 Owner DELETE: Inspectors can delete storage objects from their own inspection folder
DROP POLICY IF EXISTS label_evidence_storage_delete_owner ON storage.objects;
CREATE POLICY label_evidence_storage_delete_owner
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'label-evidence' AND
    (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = ((storage.foldername(name))[1])::uuid
        AND i.created_by = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 4. MANUFACTURER & VIEWER POLICIES
-- ------------------------------------------------------------

-- 4.1 Manufacturer & Viewer SELECT: Read-only access to storage objects of verified inspections
DROP POLICY IF EXISTS label_evidence_storage_select_verified_roles ON storage.objects;
CREATE POLICY label_evidence_storage_select_verified_roles
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'label-evidence' AND
    (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
    EXISTS (
      SELECT 1 FROM public.inspections i
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE i.id = ((storage.foldername(name))[1])::uuid
        AND p.role IN ('manufacturer', 'viewer')
        AND i.status IN ('verified_compliant', 'verified_non_compliant')
    )
  );
