// Label Ledger — Comprehensive Supabase Database Service Layer
import { createClient } from './client';
import { getCurrentUser } from './auth';

// ── 1. STRONGLY TYPED DATABASE ENTITIES ─────────────────────

export interface DbInspection {
  id: string;
  created_by: string;
  status: 'draft' | 'pending_review' | 'verified_compliant' | 'verified_non_compliant';
  product_name: string;
  brand_name?: string | null;
  declared_quantity?: number | null;
  unit?: string | null;
  manufacturer_name?: string | null;
  manufacturer_address?: string | null;
  batch_number?: string | null;
  mrp?: number | null;
  currency?: string | null;
  inspection_result?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInspectionItem {
  id: string;
  inspection_id: string;
  rule_id?: string | null;
  clause: string;
  label: string;
  found: boolean;
  extracted_value?: string | null;
  bbox?: any | null;
  confidence?: number | null;
  manually_corrected: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbLabelEvidence {
  id: string;
  inspection_id: string;
  storage_path: string;
  annotated_storage_path?: string | null;
  caption?: string | null;
  raw_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRuleCheck {
  id: string;
  inspection_id: string;
  rule_id: string;
  passed: boolean;
  extracted_value?: string | null;
  expected_value?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbVerificationLog {
  id: string;
  inspection_id: string;
  officer_id?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  action: string;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  comment?: string | null;
  created_at: string;
}

export interface FullInspectionDetails {
  inspection: DbInspection;
  label_evidence: DbLabelEvidence[];
  inspection_items: DbInspectionItem[];
  rule_checks: DbRuleCheck[];
  verification_logs: DbVerificationLog[];
}

export interface DbOperationResult<T> {
  data: T | null;
  error: string | null;
}

// ── 2. INSPECTIONS CRUD ─────────────────────────────────────

export async function getInspection(id: string): Promise<DbOperationResult<DbInspection>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data as DbInspection, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch inspection.' };
  }
}

export async function getMyInspections(): Promise<DbOperationResult<DbInspection[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DbInspection[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch user inspections.' };
  }
}

export async function getInspectionWithDetails(id: string): Promise<DbOperationResult<FullInspectionDetails>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();

    // Fetch inspection row
    const { data: inspection, error: inspError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (inspError || !inspection) {
      return { data: null, error: inspError?.message || 'Inspection not found.' };
    }

    // Fetch child entities in parallel
    const [evidenceRes, itemsRes, checksRes, logsRes] = await Promise.all([
      supabase.from('label_evidence').select('*').eq('inspection_id', id),
      supabase.from('inspection_items').select('*').eq('inspection_id', id),
      supabase.from('rule_checks').select('*').eq('inspection_id', id),
      supabase.from('verification_logs').select('*').eq('inspection_id', id).order('created_at', { ascending: true }),
    ]);

    return {
      data: {
        inspection: inspection as DbInspection,
        label_evidence: (evidenceRes.data || []) as DbLabelEvidence[],
        inspection_items: (itemsRes.data || []) as DbInspectionItem[],
        rule_checks: (checksRes.data || []) as DbRuleCheck[],
        verification_logs: (logsRes.data || []) as DbVerificationLog[],
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch inspection details.' };
  }
}

export async function createInspection(
  input: Partial<Omit<DbInspection, 'id' | 'created_by' | 'created_at' | 'updated_at'>> & { id?: string }
): Promise<DbOperationResult<DbInspection>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      ...input,
      id: input.id || crypto.randomUUID(),
      created_by: user.id,
      product_name: input.product_name || 'Untitled Product',
      status: input.status || 'draft',
    };

    const { data, error } = await supabase
      .from('inspections')
      .insert(payload)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DbInspection, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to create inspection.' };
  }
}

export async function updateInspection(
  id: string,
  input: Partial<Omit<DbInspection, 'id' | 'created_by' | 'created_at'>>
): Promise<DbOperationResult<DbInspection>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('inspections')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DbInspection, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to update inspection.' };
  }
}

export async function updateInspectionStatus(
  id: string,
  status: 'draft' | 'pending_review' | 'verified_compliant' | 'verified_non_compliant',
  productName?: string,
  isImported?: boolean
): Promise<DbOperationResult<boolean>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: false, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (productName !== undefined) payload.product_name = productName;
    if (isImported !== undefined) payload.is_imported = isImported;

    const { error } = await supabase
      .from('inspections')
      .update(payload)
      .eq('id', id);

    if (error) return { data: false, error: error.message };
    return { data: true, error: null };
  } catch (err: any) {
    return { data: false, error: err.message || 'Failed to update inspection status.' };
  }
}

export async function deleteInspection(id: string): Promise<DbOperationResult<boolean>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: false, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { error } = await supabase.from('inspections').delete().eq('id', id);

    if (error) return { data: false, error: error.message };
    return { data: true, error: null };
  } catch (err: any) {
    return { data: false, error: err.message || 'Failed to delete inspection.' };
  }
}

// ── 3. INSPECTION ITEMS (DECLARATIONS) CRUD ──────────────────

export async function getInspectionItems(inspectionId: string): Promise<DbOperationResult<DbInspectionItem[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inspection_items')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DbInspectionItem[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch inspection items.' };
  }
}

export async function saveInspectionItem(
  input: Partial<Omit<DbInspectionItem, 'created_at' | 'updated_at'>> & { inspection_id: string; clause: string; label: string }
): Promise<DbOperationResult<DbInspectionItem>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      ...input,
      id: input.id || crypto.randomUUID(),
      found: input.found ?? false,
      manually_corrected: input.manually_corrected ?? false,
    };

    const { data, error } = await supabase
      .from('inspection_items')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DbInspectionItem, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save inspection item.' };
  }
}

export async function saveInspectionItems(
  items: (Partial<Omit<DbInspectionItem, 'created_at' | 'updated_at'>> & { inspection_id: string; clause: string; label: string })[]
): Promise<DbOperationResult<DbInspectionItem[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    if (!items || items.length === 0) return { data: [], error: null };

    const supabase = createClient();
    const payload = items.map(item => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      found: item.found ?? false,
      manually_corrected: item.manually_corrected ?? false,
    }));

    const { data, error } = await supabase
      .from('inspection_items')
      .upsert(payload, { onConflict: 'id' })
      .select('*');

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DbInspectionItem[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save inspection items.' };
  }
}

export async function updateInspectionItem(
  id: string,
  input: Partial<Omit<DbInspectionItem, 'id' | 'inspection_id' | 'created_at'>>
): Promise<DbOperationResult<DbInspectionItem>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('inspection_items')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DbInspectionItem, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to update inspection item.' };
  }
}

export async function deleteInspectionItem(id: string): Promise<DbOperationResult<boolean>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: false, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { error } = await supabase.from('inspection_items').delete().eq('id', id);

    if (error) return { data: false, error: error.message };
    return { data: true, error: null };
  } catch (err: any) {
    return { data: false, error: err.message || 'Failed to delete inspection item.' };
  }
}

// ── 4. RULE CHECKS CRUD ──────────────────────────────────────

export async function getRuleChecks(inspectionId: string): Promise<DbOperationResult<DbRuleCheck[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('rule_checks')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DbRuleCheck[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch rule checks.' };
  }
}

export async function saveRuleCheck(
  input: Partial<Omit<DbRuleCheck, 'created_at' | 'updated_at'>> & { inspection_id: string; rule_id: string }
): Promise<DbOperationResult<DbRuleCheck>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      ...input,
      id: input.id || crypto.randomUUID(),
      passed: input.passed ?? false,
    };

    const { data, error } = await supabase
      .from('rule_checks')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DbRuleCheck, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save rule check.' };
  }
}

export async function saveRuleChecks(
  checks: (Partial<Omit<DbRuleCheck, 'created_at' | 'updated_at'>> & { inspection_id: string; rule_id: string })[]
): Promise<DbOperationResult<DbRuleCheck[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    if (!checks || checks.length === 0) return { data: [], error: null };

    const supabase = createClient();
    const payload = checks.map(c => ({
      ...c,
      id: c.id || crypto.randomUUID(),
      passed: c.passed ?? false,
    }));

    const { data, error } = await supabase
      .from('rule_checks')
      .upsert(payload, { onConflict: 'id' })
      .select('*');

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DbRuleCheck[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save rule checks.' };
  }
}

export async function updateRuleCheck(
  id: string,
  input: Partial<Omit<DbRuleCheck, 'id' | 'inspection_id' | 'rule_id' | 'created_at'>>
): Promise<DbOperationResult<DbRuleCheck>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('rule_checks')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DbRuleCheck, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to update rule check.' };
  }
}

export async function deleteRuleCheck(id: string): Promise<DbOperationResult<boolean>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: false, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { error } = await supabase.from('rule_checks').delete().eq('id', id);

    if (error) return { data: false, error: error.message };
    return { data: true, error: null };
  } catch (err: any) {
    return { data: false, error: err.message || 'Failed to delete rule check.' };
  }
}

// ── 5. VERIFICATION LOGS CRUD ───────────────────────────────

export async function getVerificationLogs(inspectionId: string): Promise<DbOperationResult<DbVerificationLog[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('verification_logs')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('created_at', { ascending: true });

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DbVerificationLog[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch verification logs.' };
  }
}

export async function createVerificationLog(
  input: Omit<DbVerificationLog, 'id' | 'officer_id' | 'created_at'>
): Promise<DbOperationResult<DbVerificationLog>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    // officer_id is securely derived from current authenticated user's session
    const payload = {
      ...input,
      id: crypto.randomUUID(),
      officer_id: user.id,
    };

    const { data, error } = await supabase
      .from('verification_logs')
      .insert(payload)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as DbVerificationLog, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to create verification log.' };
  }
}

// ── 6. LABEL EVIDENCE CRUD & HELPERS ─────────────────────────

export async function getLabelEvidence(inspectionId: string): Promise<DbOperationResult<DbLabelEvidence[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('label_evidence')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error) return { data: null, error: error.message };
    return { data: (data || []) as DbLabelEvidence[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch label evidence.' };
  }
}

export async function ensureInspectionRecord(
  inspectionId: string,
  productName: string = 'Untitled Inspection',
  status: string = 'draft'
): Promise<DbOperationResult<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data: existing, error: selectError } = await supabase
      .from('inspections')
      .select('id, status, created_by')
      .eq('id', inspectionId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      return { data: null, error: selectError.message };
    }

    if (existing) {
      return { data: { id: existing.id }, error: null };
    }

    const { data: inserted, error: insertError } = await supabase
      .from('inspections')
      .insert({
        id: inspectionId,
        created_by: user.id,
        product_name: productName,
        status,
      })
      .select('id')
      .single();

    if (insertError) return { data: null, error: insertError.message };
    return { data: inserted, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to initialize inspection record.' };
  }
}

export async function saveLabelEvidenceRecord({
  inspectionId,
  storagePath,
  annotatedStoragePath = null,
  caption = null,
  rawText = null,
  productName = 'Untitled Product',
}: {
  inspectionId: string;
  storagePath: string;
  annotatedStoragePath?: string | null;
  caption?: string | null;
  rawText?: string | null;
  productName?: string;
}): Promise<DbOperationResult<DbLabelEvidence>> {
  try {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const inspectionRes = await ensureInspectionRecord(inspectionId, productName, 'draft');
    if (inspectionRes.error || !inspectionRes.data) {
      return { data: null, error: inspectionRes.error || 'Failed to verify parent inspection.' };
    }

    const supabase = createClient();
    const { data: existingEvidence, error: dupCheckError } = await supabase
      .from('label_evidence')
      .select('*')
      .eq('inspection_id', inspectionId)
      .eq('storage_path', storagePath)
      .maybeSingle();

    if (dupCheckError && dupCheckError.code !== 'PGRST116') {
      return { data: null, error: dupCheckError.message };
    }

    if (existingEvidence) {
      return { data: existingEvidence as DbLabelEvidence, error: null };
    }

    const { data: newEvidence, error: insertError } = await supabase
      .from('label_evidence')
      .insert({
        inspection_id: inspectionId,
        storage_path: storagePath,
        annotated_storage_path: annotatedStoragePath,
        caption,
        raw_text: rawText,
      })
      .select('*')
      .single();

    if (insertError) return { data: null, error: insertError.message };
    return { data: newEvidence as DbLabelEvidence, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save label evidence record.' };
  }
}
