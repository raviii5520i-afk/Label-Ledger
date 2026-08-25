// ============================================================
// Label Ledger — Shared TypeScript Types
// All interfaces derived from PRD.md data model + seam contracts
// ============================================================

// ────────── Enums / Literals ────────────────────────────────

export type UserRole = 'inspector' | 'admin';

export type InspectionStatus =
  | 'draft'
  | 'pending_review'
  | 'verified_compliant'
  | 'verified_non_compliant';

export type AuditAction =
  | 'created'
  | 'submitted_for_review'
  | 'verified_compliant'
  | 'verified_non_compliant'
  | 'field_corrected'
  | 'overridden'
  | 'rejected';

export type RuleCategory =
  | 'identity'
  | 'quantity'
  | 'pricing'
  | 'dates'
  | 'manufacturer'
  | 'consumer'
  | 'import'
  | 'other';

// ────────── Bounding Box ─────────────────────────────────────

/** All bbox coords are normalized 0–1 relative to image dimensions */
export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ────────── User / Profile ───────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// ────────── Rules ────────────────────────────────────────────

export interface Rule {
  id: string;
  clause: string;          // e.g. "Rule 6(1)(a)"
  label: string;           // e.g. "Name / generic name of commodity"
  category: RuleCategory;
  mandatory: boolean;
  is_conditional: boolean; // e.g. only required for imported goods
  condition_note?: string;
  active: boolean;
}

// ────────── OCR / AI Extraction ──────────────────────────────

/** Seam A←C: returned from OCR service */
export interface OcrWord {
  text: string;
  confidence: number; // 0–1
  bbox: BBox;
}

export interface OcrResult {
  raw_text: string;
  words: OcrWord[];
  diagnostics?: OcrDiagnostics;
}

export interface OcrDiagnostics {
  passCount: number;
  durationMs: number;
  wordCount: number;
  avgConfidence: number;
  bestVariant: string;
  preprocessingVariants: string[];
}

/** Per-field extracted value with confidence and optional bbox */
export interface ExtractedField {
  value: string;
  confidence: number; // 0–1
  bbox?: BBox;
  sourceText?: string;
  confidenceCategory?: 'HIGH' | 'MEDIUM' | 'LOW';
  validationStatus?: 'VALID' | 'UNCERTAIN' | 'INVALID';
}

/** Seam A←C: returned from AI extraction service */
export interface ExtractionResult {
  fields: {
    product_name?: ExtractedField;
    mrp?: ExtractedField;
    net_quantity?: ExtractedField;
    mfg_date?: ExtractedField;
    expiry_date?: ExtractedField;
    manufacturer_address?: ExtractedField;
    marketed_by?: ExtractedField;
    consumer_care?: ExtractedField;
    country_of_origin?: ExtractedField;
    batch_number?: ExtractedField;
    fssai_license?: ExtractedField;
    usp?: ExtractedField;
    bar_code?: ExtractedField;
  };
}

// ────────── Declarations ─────────────────────────────────────

export interface Declaration {
  id: string;
  inspection_id: string;
  rule: Rule;
  found: boolean;
  extracted_value: string | null;
  bbox: BBox | null;
  confidence: number; // 0–1
  manually_corrected: boolean;
}

// ────────── Evidence Images ──────────────────────────────────

export interface EvidenceImage {
  id: string;
  inspection_id: string;
  storage_path: string;        // original image URL
  annotated_storage_path: string | null; // annotated/overlay version
  caption: string | null;
}

// ────────── Audit Log ────────────────────────────────────────

export interface AuditEntry {
  id: string;
  inspection_id: string;
  actor: Pick<Profile, 'id' | 'full_name' | 'role'>;
  action: AuditAction;
  note: string | null;
  created_at: string;
}

// ────────── Inspection (list / summary) ─────────────────────

export interface InspectionSummary {
  id: string;
  product_name: string;
  is_imported: boolean;
  status: InspectionStatus;
  created_at: string;
  verified_at: string | null;
  inspector: Pick<Profile, 'id' | 'full_name'>;
  violation_count: number;  // derived: declarations where found=false && mandatory
  declaration_count: number;
}

// ────────── Inspection (full detail) ────────────────────────

export interface InspectionFull extends InspectionSummary {
  verified_by?: Pick<Profile, 'id' | 'full_name'>;
  declarations: Declaration[];
  evidence_images: EvidenceImage[];
  audit_log: AuditEntry[];
}

// ────────── Dashboard Stats ──────────────────────────────────

export interface DashboardStats {
  total_inspections: number;
  compliant_count: number;
  non_compliant_count: number;
  pending_review_count: number;
  draft_count: number;
  compliance_rate: number; // 0–100 percentage
  top_violations: Array<{
    rule_id: string;
    label: string;
    clause: string;
    count: number;
  }>;
  monthly_trend: Array<{
    month: string; // "Jan", "Feb" …
    compliant: number;
    non_compliant: number;
    pending: number;
  }>;
  inspector_stats: Array<{
    inspector: Pick<Profile, 'id' | 'full_name'>;
    total: number;
    compliant: number;
  }>;
}

// ────────── Filter / Search ──────────────────────────────────

export interface InspectionFilters {
  search: string;
  status: InspectionStatus[];
  date_from: string | null;
  date_to: string | null;
  inspector_id: string | null;
}

// ────────── Scan Flow (local UI state) ──────────────────────

export type ScanStep =
  | 'upload'
  | 'analyzing'
  | 'ocr_review'
  | 'checklist'
  | 'submit';

export interface ScanState {
  step: ScanStep;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  ocrResult: OcrResult | null;
  extractionResult: ExtractionResult | null;
  productName: string;
  isImported: boolean;
  declarations: Declaration[];
  highlightedRuleId: string | null;
}

// ────────── Verification / Review ───────────────────────────

export interface FieldOverride {
  declaration_id: string;
  new_value: string;
  note?: string;
}

export interface VerificationPayload {
  inspection_id: string;
  action: 'approve' | 'reject' | 'override';
  overrides?: FieldOverride[];
  note?: string;
}
