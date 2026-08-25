// Label Ledger — Comprehensive Supabase Database Service Layer
import { createClient } from './client';
import { getCurrentUser } from './auth';

// Helper to resolve current authenticated user or fall back to dev admin user
async function getEffectiveUser(): Promise<{ id: string } | null> {
  const user = await getCurrentUser();
  if (user && user.id) return user;
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return { id: '00000000-0000-0000-0000-000000000001' };
  }
  return null;
}

// ── 1. STRONGLY TYPED DATABASE ENTITIES ─────────────────────

export interface DbInspection {
  id: string;
  inspector_id: string;
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
  clause: string;
  label: string;
  passed: boolean;
  extracted_value?: string | null;
  expected_value?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface DbVerificationLog {
  id: string;
  inspection_id: string;
  officer_id: string;
  action: 'submitted_for_review' | 'verified_compliant' | 'verified_non_compliant' | 'field_corrected' | 'overridden' | 'rejected';
  decision: string;
  notes?: string | null;
  comment?: string | null;
  previous_status?: string | null;
  new_status?: string | null;
  created_at: string;
}

export interface FullInspectionDetails {
  inspection: DbInspection;
  items: DbInspectionItem[];
  inspection_items: DbInspectionItem[];
  evidence: DbLabelEvidence[];
  label_evidence: DbLabelEvidence[];
  checks: DbRuleCheck[];
  rule_checks: DbRuleCheck[];
  logs: DbVerificationLog[];
  verification_logs: DbVerificationLog[];
}

export interface DbOperationResult<T> {
  data: T | null;
  error: string | null;
}

// ── 2. INSPECTION CRUD ROUTINES ──────────────────────────────

export async function getInspection(id: string): Promise<DbOperationResult<DbInspection>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch inspection.' };
  }
}

export async function getMyInspections(): Promise<DbOperationResult<DbInspection[]>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated. Please sign in.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[LabelGuard Repository] Query error:', error.message);
      return { data: null, error: error.message };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[LabelGuard Repository] Fetched inspections count:', (data || []).length, 'for user:', user.id);
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('[LabelGuard Repository] Exception in getMyInspections:', err);
    return { data: null, error: err.message || 'Failed to fetch inspections.' };
  }
}

export async function getInspectionWithDetails(id: string): Promise<DbOperationResult<FullInspectionDetails>> {
  try {
    if (!id || id.trim().length === 0) {
      console.error('[Report] Error: Invalid or missing inspection UUID supplied.');
      return { data: null, error: 'Invalid inspection ID.' };
    }

    const user = await getEffectiveUser();
    if (!user) {
      console.error('[Report] Auth Error: User is not authenticated.');
      return { data: null, error: 'User is not authenticated.' };
    }

    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const activeAuthUid = sessionData?.session?.user?.id || null;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Report] Route inspection ID:', id);
      console.log('[Report] Authenticated user ID (client session):', activeAuthUid);
      console.log('[Report] Effective user ID (service helper):', user.id);
    }

    const [inspRes, itemsRes, evRes, checksRes, logsRes] = await Promise.all([
      supabase.from('inspections').select('*').eq('id', id).maybeSingle(),
      supabase.from('inspection_items').select('*').eq('inspection_id', id),
      supabase.from('label_evidence').select('*').eq('inspection_id', id),
      supabase.from('rule_checks').select('*').eq('inspection_id', id),
      supabase.from('verification_logs').select('*').eq('inspection_id', id).order('created_at', { ascending: false }),
    ]);

    // Diagnostic logging for the 4 distinct cases:
    if (inspRes.error) {
      // Case 3: Supabase query actual error
      console.error('[Report] Case 3 — Supabase Query Error:', inspRes.error.message, inspRes.error);
      return { data: null, error: `Supabase query error: ${inspRes.error.message}` };
    }

    if (!inspRes.data) {
      // Case 1 (does not exist) or Case 2 (RLS blocked)
      console.warn('[Report] Case 1 / Case 2 — Record not found or RLS restricted. ID:', id, 'Active Auth UID:', activeAuthUid);
      return { data: null, error: 'Inspection record not found or access restricted by security policies.' };
    }

    // Case 4: Inspection exists and was successfully loaded
    if (process.env.NODE_ENV === 'development') {
      console.log('[Report] Case 4 — Inspection successfully loaded:', inspRes.data.id, 'Status:', inspRes.data.status, 'Created by:', inspRes.data.inspector_id);
      console.log('[Report] Evidence count:', (evRes.data || []).length);
      console.log('[Report] Items count:', (itemsRes.data || []).length);
      console.log('[Report] Rule checks count:', (checksRes.data || []).length);
      console.log('[Report] Verification logs count:', (logsRes.data || []).length);
    }

    const items = itemsRes.data || [];
    const evidence = evRes.data || [];
    const checks = checksRes.data || [];
    const logs = logsRes.data || [];

    return {
      data: {
        inspection: inspRes.data,
        items,
        inspection_items: items,
        evidence,
        label_evidence: evidence,
        checks,
        rule_checks: checks,
        logs,
        verification_logs: logs,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('[Report] Exception in getInspectionWithDetails:', err);
    return { data: null, error: err.message || 'Failed to fetch inspection details.' };
  }
}

export async function ensureInspectionRecord(
  id: string,
  productName = 'Packaged Commodity',
  status: 'draft' | 'pending_review' = 'draft'
): Promise<DbOperationResult<DbInspection>> {
  try {
    if (!id || id.trim().length === 0) {
      return { data: null, error: 'Invalid inspection ID.' };
    }

    const user = await getEffectiveUser();
    if (!user) {
      console.error('[LabelGuard] Auth Error: User is not authenticated.');
      return { data: null, error: 'User is not authenticated. Please sign in to create inspections.' };
    }

    const supabase = createClient();
    const existing = await supabase.from('inspections').select('*').eq('id', id).maybeSingle();

    if (existing.data) {
      console.log('[LabelGuard] getEffectiveUser result:', user);
      console.log('[LabelGuard] Found existing DB inspection ID:', existing.data.id);
      return { data: existing.data, error: null };
    }

    const newRecord = {
      id,
      inspector_id: user.id,
      status,
      product_name: productName.trim() || 'Packaged Commodity',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('[LabelGuard] getEffectiveUser result:', user);
    console.log('[LabelGuard] Inserting new record into public.inspections:', id);

    const { data, error } = await supabase.from('inspections').insert(newRecord).select('*').single();
    if (error) {
      console.error('[LabelGuard] Insert error:', error.message);
      return { data: null, error: error.message };
    }

    console.log('[LabelGuard] Created inspection ID:', data.id);
    console.log('[LabelGuard] Inspection created successfully in Supabase.');
    return { data, error: null };
  } catch (err: any) {
    console.error('[LabelGuard] Exception in ensureInspectionRecord:', err);
    return { data: null, error: err.message || 'Failed to create inspection record.' };
  }
}

export async function createInspection(
  productName: string,
  brandName?: string,
  notes?: string
): Promise<DbOperationResult<DbInspection>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const id = crypto.randomUUID();
    return ensureInspectionRecord(id, productName, 'draft');
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to create inspection.' };
  }
}

export async function updateInspection(
  id: string,
  updates: Partial<Omit<DbInspection, 'id' | 'inspector_id' | 'created_at'>>
): Promise<DbOperationResult<DbInspection>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = { ...updates, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('inspections')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
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
    if (!id || id.trim().length === 0) {
      return { data: false, error: 'Invalid or missing inspection ID.' };
    }

    const user = await getEffectiveUser();
    if (!user) {
      return { data: false, error: 'User is not authenticated. Please sign in to submit inspections.' };
    }

    const ensureRes = await ensureInspectionRecord(id, productName || 'Packaged Commodity');
    if (ensureRes.error || !ensureRes.data) {
      console.error('[LabelGuard Submit] ensureInspectionRecord error:', ensureRes.error);
      return { data: false, error: ensureRes.error || 'Failed to ensure database inspection record.' };
    }

    const supabase = createClient();
    const payload: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (productName !== undefined && productName.trim().length > 0) {
      payload.product_name = productName.trim();
    }

    console.log('[LabelGuard Submit] inspectionId:', id);
    console.log('[LabelGuard Submit] current status:', ensureRes.data.status);
    console.log('[LabelGuard Submit] updating to:', status);

    const { data: updatedRows, error } = await supabase
      .from('inspections')
      .update(payload)
      .eq('id', id)
      .select('*');

    console.log('[LabelGuard Submit] Supabase response:', { updatedRows, error });

    if (error) {
      console.error('[LabelGuard Submit] Update error:', error.message);
      return { data: false, error: error.message };
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.error('[LabelGuard Submit] 0 rows updated in Supabase.');
      return {
        data: false,
        error: 'Inspection update failed. Record not found or update restricted by security policies.',
      };
    }

    // Record verification log for submitted status
    if (status === 'pending_review') {
      await supabase.from('verification_logs').insert({
        id: crypto.randomUUID(),
        inspection_id: id,
        officer_id: user.id,
        action: 'submitted_for_review',
        decision: 'Submitted inspection for officer verification',
        previous_status: ensureRes.data.status,
        new_status: 'pending_review',
        created_at: new Date().toISOString(),
      });
    }

    console.log('[LabelGuard Submit] submit successful for inspection ID:', id);
    return { data: true, error: null };
  } catch (err: any) {
    console.error('[LabelGuard Submit] Exception in updateInspectionStatus:', err);
    return { data: false, error: err.message || 'Failed to update inspection status.' };
  }
}

export async function deleteInspection(id: string): Promise<DbOperationResult<boolean>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: false, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { error } = await supabase.from('inspections').delete().eq('id', id);
    if (error) return { data: false, error: error.message };
    return { data: true, error: null };
  } catch (err: any) {
    return { data: false, error: err.message || 'Failed to delete inspection.' };
  }
}

// ── 3. INSPECTION ITEMS ROUTINES ─────────────────────────────

export async function getInspectionItems(inspectionId: string): Promise<DbOperationResult<DbInspectionItem[]>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('inspection_items')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error) return { data: null, error: error.message };
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch items.' };
  }
}

export async function saveInspectionItem(
  item: Omit<DbInspectionItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<DbOperationResult<DbInspectionItem>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      id: item.id || crypto.randomUUID(),
      ...item,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('inspection_items')
      .upsert(payload)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save item.' };
  }
}

export async function saveInspectionItems(
  items: (Omit<DbInspectionItem, 'id' | 'created_at' | 'updated_at'> & { id?: string })[]
): Promise<DbOperationResult<DbInspectionItem[]>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    if (!items || items.length === 0) return { data: [], error: null };

    const supabase = createClient();
    const payload = items.map((item) => ({
      id: item.id || crypto.randomUUID(),
      ...item,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('inspection_items')
      .upsert(payload)
      .select('*');

    if (error) return { data: null, error: error.message };
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save items.' };
  }
}

// ── 4. RULE CHECKS ROUTINES ──────────────────────────────────

export async function getRuleChecks(inspectionId: string): Promise<DbOperationResult<DbRuleCheck[]>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('rule_checks')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error) return { data: null, error: error.message };
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch rule checks.' };
  }
}

export async function saveRuleCheck(
  check: Omit<DbRuleCheck, 'id' | 'created_at'> & { id?: string }
): Promise<DbOperationResult<DbRuleCheck>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const payload = {
      id: check.id || crypto.randomUUID(),
      ...check,
    };

    const { data, error } = await supabase
      .from('rule_checks')
      .upsert(payload)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save rule check.' };
  }
}

export async function saveRuleChecks(
  checks: (Omit<DbRuleCheck, 'id' | 'created_at'> & { id?: string })[]
): Promise<DbOperationResult<DbRuleCheck[]>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    if (!checks || checks.length === 0) return { data: [], error: null };

    const supabase = createClient();
    const payload = checks.map((check) => ({
      id: check.id || crypto.randomUUID(),
      ...check,
    }));

    const { data, error } = await supabase
      .from('rule_checks')
      .upsert(payload)
      .select('*');

    if (error) return { data: null, error: error.message };
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save rule checks.' };
  }
}

// ── 5. VERIFICATION LOGS ROUTINES ────────────────────────────

export async function getVerificationLogs(inspectionId: string): Promise<DbOperationResult<DbVerificationLog[]>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('verification_logs')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch verification logs.' };
  }
}

export async function createVerificationLog(
  inspectionIdOrObj: string | { inspectionId?: string; inspection_id?: string; action: DbVerificationLog['action']; decision?: string; notes?: string | null; comment?: string | null; previousStatus?: string | null; previous_status?: string | null; newStatus?: string | null; new_status?: string | null },
  actionArg?: DbVerificationLog['action'],
  decisionArg?: string,
  notesArg?: string | null,
  previousStatusArg?: string | null,
  newStatusArg?: string | null
): Promise<DbOperationResult<DbVerificationLog>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    let inspectionId: string;
    let action: DbVerificationLog['action'];
    let decision: string;
    let notes: string | null | undefined;
    let previousStatus: string | null | undefined;
    let newStatus: string | null | undefined;

    if (typeof inspectionIdOrObj === 'object') {
      inspectionId = inspectionIdOrObj.inspectionId || inspectionIdOrObj.inspection_id || '';
      action = inspectionIdOrObj.action;
      decision = inspectionIdOrObj.decision || inspectionIdOrObj.comment || action;
      notes = inspectionIdOrObj.notes ?? inspectionIdOrObj.comment ?? null;
      previousStatus = inspectionIdOrObj.previousStatus || inspectionIdOrObj.previous_status;
      newStatus = inspectionIdOrObj.newStatus || inspectionIdOrObj.new_status;
    } else {
      inspectionId = inspectionIdOrObj;
      action = actionArg!;
      decision = decisionArg || action;
      notes = notesArg ?? null;
      previousStatus = previousStatusArg;
      newStatus = newStatusArg;
    }

    const supabase = createClient();
    const payload = {
      id: crypto.randomUUID(),
      inspection_id: inspectionId,
      officer_id: user.id,
      action,
      decision,
      notes: notes || null,
      previous_status: previousStatus || null,
      new_status: newStatus || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('verification_logs')
      .insert(payload)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to create verification log.' };
  }
}

// ── 6. LABEL EVIDENCE ROUTINES ───────────────────────────────

export async function getLabelEvidence(inspectionId: string): Promise<DbOperationResult<DbLabelEvidence[]>> {
  try {
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    const supabase = createClient();
    const { data, error } = await supabase
      .from('label_evidence')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error) return { data: null, error: error.message };
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch evidence.' };
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
    const user = await getEffectiveUser();
    if (!user) return { data: null, error: 'User is not authenticated.' };

    await ensureInspectionRecord(inspectionId, productName, 'draft');

    const supabase = createClient();
    const payload = {
      id: crypto.randomUUID(),
      inspection_id: inspectionId,
      storage_path: storagePath,
      annotated_storage_path: annotatedStoragePath,
      caption,
      raw_text: rawText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('label_evidence')
      .insert(payload)
      .select('*')
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to save evidence record.' };
  }
}
