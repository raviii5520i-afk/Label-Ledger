-- ============================================================
-- Label Ledger — Phase 4 Step 2: Prepare Database for RLS
-- ============================================================

-- 1. UPDATE PROFILES ROLE CHECK CONSTRAINT
-- Supports all 4 application roles: admin, inspector, manufacturer, viewer
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('admin', 'inspector', 'manufacturer', 'viewer'));

-- 2. CREATE SECURE IS_ADMIN HELPER FUNCTION
-- Used by future RLS policies to evaluate administrative privileges safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 3. RESTRICT FUNCTION EXECUTION
-- Revoke execution from public, grant to authenticated role only
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
