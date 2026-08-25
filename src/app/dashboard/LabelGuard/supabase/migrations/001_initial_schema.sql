-- ============================================================
-- Label Ledger — Initial Database Schema (Phase 2 Migration)
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLES DEFINITION

-- 3.1 Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'inspector' CHECK (role IN ('inspector', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Rules Table (Legal Metrology Compliance Rules)
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  clause TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'identity' CHECK (category IN ('identity', 'quantity', 'pricing', 'dates', 'manufacturer', 'consumer', 'import', 'other')),
  mandatory BOOLEAN NOT NULL DEFAULT true,
  is_conditional BOOLEAN NOT NULL DEFAULT false,
  condition_note TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist in case the table was created manually or by an older sync
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS clause TEXT;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'identity' CHECK (category IN ('identity', 'quantity', 'pricing', 'dates', 'manufacturer', 'consumer', 'import', 'other'));
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS mandatory BOOLEAN DEFAULT true;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS is_conditional BOOLEAN DEFAULT false;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS condition_note TEXT;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 3.3 Inspections Table
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  is_imported BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'verified_compliant', 'verified_non_compliant')),
  violation_count INTEGER NOT NULL DEFAULT 0,
  declaration_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Ensure columns exist in case the table was created manually or by an older sync
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS inspector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS product_name TEXT DEFAULT '';
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS is_imported BOOLEAN DEFAULT false;
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'verified_compliant', 'verified_non_compliant'));
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS declaration_count INTEGER DEFAULT 0;

-- 3.4 Inspection Items Table (Declarations / Extracted Fields)
CREATE TABLE IF NOT EXISTS public.inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.rules(id) ON DELETE SET NULL,
  clause TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  found BOOLEAN NOT NULL DEFAULT false,
  extracted_value TEXT,
  bbox JSONB,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  manually_corrected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Label Evidence Table (Uploaded Label Images & Visual Evidence)
CREATE TABLE IF NOT EXISTS public.label_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  annotated_storage_path TEXT,
  caption TEXT,
  raw_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 Rule Checks Table (Evaluation of Compliance Rules)
CREATE TABLE IF NOT EXISTS public.rule_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.rules(id) ON DELETE CASCADE,
  passed BOOLEAN NOT NULL DEFAULT false,
  extracted_value TEXT,
  expected_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Verification Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'submitted_for_review', 'verified_compliant', 'verified_non_compliant', 'field_corrected', 'overridden', 'rejected')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_rules_code ON public.rules(code);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector ON public.inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON public.inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON public.inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspection_items_inspection ON public.inspection_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_label_evidence_inspection ON public.label_evidence(inspection_id);
CREATE INDEX IF NOT EXISTS idx_rule_checks_inspection ON public.rule_checks(inspection_id);
CREATE INDEX IF NOT EXISTS idx_rule_checks_rule ON public.rule_checks(rule_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_inspection ON public.verification_logs(inspection_id);

-- 5. UPDATED_AT TRIGGERS
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_rules_updated_at ON public.rules;
CREATE TRIGGER tr_rules_updated_at
  BEFORE UPDATE ON public.rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_inspections_updated_at ON public.inspections;
CREATE TRIGGER tr_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_inspection_items_updated_at ON public.inspection_items;
CREATE TRIGGER tr_inspection_items_updated_at
  BEFORE UPDATE ON public.inspection_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_label_evidence_updated_at ON public.label_evidence;
CREATE TRIGGER tr_label_evidence_updated_at
  BEFORE UPDATE ON public.label_evidence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_rule_checks_updated_at ON public.rule_checks;
CREATE TRIGGER tr_rule_checks_updated_at
  BEFORE UPDATE ON public.rule_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. AUTOMATIC PROFILE CREATION FROM AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'inspector')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'rule_number') THEN
    ALTER TABLE public.rules ALTER COLUMN rule_number DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'title') THEN
    ALTER TABLE public.rules ALTER COLUMN title DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'description') THEN
    ALTER TABLE public.rules ALTER COLUMN description DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'type') THEN
    ALTER TABLE public.rules ALTER COLUMN type DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'severity') THEN
    ALTER TABLE public.rules ALTER COLUMN severity DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rules' AND column_name = 'requirement') THEN
    ALTER TABLE public.rules ALTER COLUMN requirement DROP NOT NULL;
  END IF;
END $$;

-- 7. SEED DATA FOR COMPLIANCE RULES (8 RULES)
INSERT INTO public.rules (code, clause, label, category, mandatory, is_conditional, condition_note, active)
VALUES
  ('LM-01', 'Rule 6(1)(a)', 'Commodity Name', 'identity', true, false, NULL, true),
  ('LM-02', 'Rule 6(1)(b)', 'Manufacturer / Packer / Importer Details', 'manufacturer', true, false, NULL, true),
  ('LM-03', 'Rule 6(1)(c)', 'Net Quantity / Weight', 'quantity', true, false, NULL, true),
  ('LM-04', 'Rule 6(1)(d)', 'Maximum Retail Price', 'pricing', true, false, NULL, true),
  ('LM-05', 'Rule 6(1)(e)', 'Date / Best Before / Use By', 'dates', true, false, NULL, true),
  ('LM-06', 'Rule 6(1)(f)', 'Consumer Care Details', 'consumer', true, false, NULL, true),
  ('LM-07', 'Rule 6(1)(g)', 'Country of Origin', 'import', false, true, 'Mandatory for imported pre-packaged commodities', true),
  ('LM-08', 'Rule 18(1)', 'Quantity Verification', 'quantity', true, false, NULL, true)
ON CONFLICT (code) DO UPDATE SET
  clause = EXCLUDED.clause,
  label = EXCLUDED.label,
  category = EXCLUDED.category,
  mandatory = EXCLUDED.mandatory,
  is_conditional = EXCLUDED.is_conditional,
  condition_note = EXCLUDED.condition_note,
  active = EXCLUDED.active,
  updated_at = NOW();
