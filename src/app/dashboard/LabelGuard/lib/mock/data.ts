// ============================================================
// Label Ledger — Mock Data
// Realistic data for all pages. Replace with Supabase calls later.
// ============================================================

import type {
  Profile,
  Rule,
  InspectionSummary,
  InspectionFull,
  Declaration,
  DashboardStats,
  OcrResult,
  ExtractionResult,
} from '../types';

// ────────── Mock Users ───────────────────────────────────────

export const MOCK_USERS: Profile[] = [
  {
    id: 'usr_001',
    full_name: 'Arjun Mehta',
    email: 'arjun.mehta@enforcement.gov.in',
    role: 'admin',
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'usr_002',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@enforcement.gov.in',
    role: 'inspector',
    created_at: '2024-02-10T09:00:00Z',
  },
  {
    id: 'usr_003',
    full_name: 'Rahul Verma',
    email: 'rahul.verma@enforcement.gov.in',
    role: 'inspector',
    created_at: '2024-02-20T09:00:00Z',
  },
  {
    id: 'usr_004',
    full_name: 'Sneha Patel',
    email: 'sneha.patel@enforcement.gov.in',
    role: 'inspector',
    created_at: '2024-03-05T09:00:00Z',
  },
];

export const MOCK_CURRENT_USER: Profile = MOCK_USERS[0]; // admin by default

// ────────── Mock Rules (Legal Metrology Rule 6) ──────────────

export const MOCK_RULES: Rule[] = [
  {
    id: 'rule_001',
    clause: 'Rule 6(1)(a)',
    label: 'Name or generic name of commodity',
    category: 'identity',
    mandatory: true,
    is_conditional: false,
    active: true,
  },
  {
    id: 'rule_002',
    clause: 'Rule 6(1)(b)',
    label: 'Net quantity (weight/volume/number)',
    category: 'quantity',
    mandatory: true,
    is_conditional: false,
    active: true,
  },
  {
    id: 'rule_003',
    clause: 'Rule 6(1)(c)',
    label: 'Month and year of manufacture / packing / import',
    category: 'dates',
    mandatory: true,
    is_conditional: false,
    active: true,
  },
  {
    id: 'rule_004',
    clause: 'Rule 6(1)(d)',
    label: 'Retail sale price (MRP incl. all taxes)',
    category: 'pricing',
    mandatory: true,
    is_conditional: false,
    active: true,
  },
  {
    id: 'rule_005',
    clause: 'Rule 6(1)(e)',
    label: "Name and address of manufacturer / packer / importer",
    category: 'manufacturer',
    mandatory: true,
    is_conditional: false,
    active: true,
  },
  {
    id: 'rule_006',
    clause: 'Rule 6(1)(f)',
    label: 'Consumer care number / email',
    category: 'consumer',
    mandatory: true,
    is_conditional: false,
    active: true,
  },
  {
    id: 'rule_007',
    clause: 'Rule 6(1)(g)',
    label: 'Country of origin (for imported goods)',
    category: 'import',
    mandatory: false,
    is_conditional: true,
    condition_note: 'Mandatory only for imported packaged commodities',
    active: true,
  },
  {
    id: 'rule_008',
    clause: 'Rule 6(1)(h)',
    label: 'Expiry / best before date',
    category: 'dates',
    mandatory: false,
    is_conditional: true,
    condition_note: 'Mandatory for perishable goods',
    active: true,
  },
  {
    id: 'rule_009',
    clause: 'Rule 6(1)(i)',
    label: 'Batch / lot number',
    category: 'identity',
    mandatory: true,
    is_conditional: false,
    active: true,
  },
  {
    id: 'rule_010',
    clause: 'Rule 6(1)(j)',
    label: 'FSSAI license number (food products)',
    category: 'other',
    mandatory: false,
    is_conditional: true,
    condition_note: 'Required for food/beverage products under FSSAI',
    active: true,
  },
];

// ────────── Mock OCR Result ──────────────────────────────────

export const MOCK_OCR_RESULT: OcrResult = {
  raw_text: `PARLE-G GLUCOSE BISCUITS
Net Weight: 100g
MRP: Rs. 10/- (Incl. of all taxes)
Mfg. Date: Oct 2024   Best Before: 6 months from mfg.
Batch No.: B24-OCT-112
Manufactured by: Parle Products Pvt. Ltd.,
Vile Parle (E), Mumbai - 400057
Consumer Care: 1800-22-7374
www.parleproducts.com
FSSAI Lic. No.: 10011021002121`,
  words: [
    { text: 'PARLE-G', confidence: 0.98, bbox: { x: 0.1, y: 0.05, w: 0.3, h: 0.06 } },
    { text: 'GLUCOSE', confidence: 0.97, bbox: { x: 0.41, y: 0.05, w: 0.22, h: 0.06 } },
    { text: 'BISCUITS', confidence: 0.99, bbox: { x: 0.64, y: 0.05, w: 0.26, h: 0.06 } },
    { text: 'Net', confidence: 0.95, bbox: { x: 0.1, y: 0.15, w: 0.07, h: 0.04 } },
    { text: 'Weight:', confidence: 0.96, bbox: { x: 0.18, y: 0.15, w: 0.12, h: 0.04 } },
    { text: '100g', confidence: 0.99, bbox: { x: 0.31, y: 0.15, w: 0.08, h: 0.04 } },
    { text: 'MRP:', confidence: 0.97, bbox: { x: 0.1, y: 0.22, w: 0.08, h: 0.04 } },
    { text: 'Rs.', confidence: 0.98, bbox: { x: 0.19, y: 0.22, w: 0.05, h: 0.04 } },
    { text: '10/-', confidence: 0.99, bbox: { x: 0.25, y: 0.22, w: 0.08, h: 0.04 } },
    { text: 'Mfg.', confidence: 0.94, bbox: { x: 0.1, y: 0.30, w: 0.08, h: 0.04 } },
    { text: 'Date:', confidence: 0.96, bbox: { x: 0.19, y: 0.30, w: 0.09, h: 0.04 } },
    { text: 'Oct', confidence: 0.95, bbox: { x: 0.29, y: 0.30, w: 0.06, h: 0.04 } },
    { text: '2024', confidence: 0.99, bbox: { x: 0.36, y: 0.30, w: 0.08, h: 0.04 } },
    { text: 'Batch', confidence: 0.93, bbox: { x: 0.1, y: 0.38, w: 0.09, h: 0.04 } },
    { text: 'No.:', confidence: 0.95, bbox: { x: 0.20, y: 0.38, w: 0.07, h: 0.04 } },
    { text: 'B24-OCT-112', confidence: 0.97, bbox: { x: 0.28, y: 0.38, w: 0.18, h: 0.04 } },
    { text: 'Manufactured', confidence: 0.91, bbox: { x: 0.1, y: 0.46, w: 0.22, h: 0.04 } },
    { text: 'by:', confidence: 0.95, bbox: { x: 0.33, y: 0.46, w: 0.05, h: 0.04 } },
    { text: 'Parle', confidence: 0.97, bbox: { x: 0.39, y: 0.46, w: 0.09, h: 0.04 } },
    { text: 'Products', confidence: 0.96, bbox: { x: 0.49, y: 0.46, w: 0.13, h: 0.04 } },
    { text: 'Mumbai', confidence: 0.88, bbox: { x: 0.1, y: 0.52, w: 0.11, h: 0.04 } },
    { text: '400057', confidence: 0.98, bbox: { x: 0.22, y: 0.52, w: 0.10, h: 0.04 } },
    { text: 'Consumer', confidence: 0.90, bbox: { x: 0.1, y: 0.60, w: 0.14, h: 0.04 } },
    { text: 'Care:', confidence: 0.94, bbox: { x: 0.25, y: 0.60, w: 0.09, h: 0.04 } },
    { text: '1800-22-7374', confidence: 0.99, bbox: { x: 0.35, y: 0.60, w: 0.20, h: 0.04 } },
    { text: 'FSSAI', confidence: 0.92, bbox: { x: 0.1, y: 0.70, w: 0.10, h: 0.04 } },
    { text: 'Lic.', confidence: 0.91, bbox: { x: 0.21, y: 0.70, w: 0.06, h: 0.04 } },
    { text: 'No.:', confidence: 0.95, bbox: { x: 0.28, y: 0.70, w: 0.07, h: 0.04 } },
    { text: '10011021002121', confidence: 0.97, bbox: { x: 0.36, y: 0.70, w: 0.22, h: 0.04 } },
  ],
};

export const MOCK_EXTRACTION_RESULT: ExtractionResult = {
  fields: {
    product_name: { value: 'Parle-G Glucose Biscuits', confidence: 0.97, bbox: { x: 0.1, y: 0.05, w: 0.8, h: 0.06 } },
    net_quantity: { value: '100g', confidence: 0.99, bbox: { x: 0.1, y: 0.15, w: 0.29, h: 0.04 } },
    mrp: { value: 'Rs. 10/- (Incl. of all taxes)', confidence: 0.98, bbox: { x: 0.1, y: 0.22, w: 0.65, h: 0.04 } },
    mfg_date: { value: 'October 2024', confidence: 0.95, bbox: { x: 0.1, y: 0.30, w: 0.4, h: 0.04 } },
    expiry_date: { value: '6 months from manufacture date', confidence: 0.89, bbox: { x: 0.45, y: 0.30, w: 0.45, h: 0.04 } },
    batch_number: { value: 'B24-OCT-112', confidence: 0.97, bbox: { x: 0.1, y: 0.38, w: 0.36, h: 0.04 } },
    manufacturer_address: { value: 'Parle Products Pvt. Ltd., Vile Parle (E), Mumbai - 400057', confidence: 0.91, bbox: { x: 0.1, y: 0.46, w: 0.8, h: 0.10 } },
    consumer_care: { value: '1800-22-7374', confidence: 0.99, bbox: { x: 0.1, y: 0.60, w: 0.55, h: 0.04 } },
    fssai_license: { value: '10011021002121', confidence: 0.92, bbox: { x: 0.1, y: 0.70, w: 0.48, h: 0.04 } },
  },
};

// ────────── Mock Declarations (for a completed inspection) ────

function makeDeclarations(inspectionId: string, scenario: 'compliant' | 'violations'): Declaration[] {
  const base: Omit<Declaration, 'id' | 'inspection_id' | 'found' | 'extracted_value' | 'confidence' | 'manually_corrected'>[] = MOCK_RULES.map(rule => ({ rule, bbox: null }));

  if (scenario === 'compliant') {
    return base.map((d, i) => ({
      id: `decl_${inspectionId}_${i}`,
      inspection_id: inspectionId,
      rule: d.rule,
      found: true,
      extracted_value: getSampleValue(d.rule.id),
      bbox: getSampleBBox(i),
      confidence: 0.85 + Math.random() * 0.15,
      manually_corrected: false,
    }));
  }

  // violations scenario: 3 missing
  const violatingIds = ['rule_006', 'rule_008', 'rule_010'];
  return base.map((d, i) => ({
    id: `decl_${inspectionId}_${i}`,
    inspection_id: inspectionId,
    rule: d.rule,
    found: !violatingIds.includes(d.rule.id),
    extracted_value: violatingIds.includes(d.rule.id) ? null : getSampleValue(d.rule.id),
    bbox: violatingIds.includes(d.rule.id) ? null : getSampleBBox(i),
    confidence: violatingIds.includes(d.rule.id) ? 0 : 0.55 + Math.random() * 0.45,
    manually_corrected: d.rule.id === 'rule_005',
  }));
}

function getSampleValue(ruleId: string): string {
  const map: Record<string, string> = {
    rule_001: 'Parle-G Glucose Biscuits',
    rule_002: '100g',
    rule_003: 'October 2024',
    rule_004: 'MRP Rs. 10/- (Incl. of all taxes)',
    rule_005: 'Parle Products Pvt. Ltd., Vile Parle (E), Mumbai - 400057',
    rule_006: '1800-22-7374',
    rule_007: 'India',
    rule_008: 'Best before 6 months from manufacture',
    rule_009: 'B24-OCT-112',
    rule_010: '10011021002121',
  };
  return map[ruleId] ?? 'Present';
}

function getSampleBBox(index: number): { x: number; y: number; w: number; h: number } {
  const bboxes = [
    { x: 0.1, y: 0.05, w: 0.8, h: 0.06 },
    { x: 0.1, y: 0.15, w: 0.29, h: 0.04 },
    { x: 0.1, y: 0.30, w: 0.4, h: 0.04 },
    { x: 0.1, y: 0.22, w: 0.65, h: 0.04 },
    { x: 0.1, y: 0.46, w: 0.8, h: 0.10 },
    { x: 0.1, y: 0.60, w: 0.55, h: 0.04 },
    { x: 0.1, y: 0.05, w: 0.8, h: 0.06 },
    { x: 0.45, y: 0.30, w: 0.45, h: 0.04 },
    { x: 0.1, y: 0.38, w: 0.36, h: 0.04 },
    { x: 0.1, y: 0.70, w: 0.48, h: 0.04 },
  ];
  return bboxes[index % bboxes.length];
}

// ────────── Mock Inspections ─────────────────────────────────

export const MOCK_INSPECTIONS: InspectionSummary[] = [
  {
    id: 'insp_001',
    product_name: 'Parle-G Glucose Biscuits',
    is_imported: false,
    status: 'verified_compliant',
    created_at: '2024-10-18T09:30:00Z',
    verified_at: '2024-10-18T11:15:00Z',
    inspector: { id: 'usr_002', full_name: 'Priya Sharma' },
    violation_count: 0,
    declaration_count: 10,
  },
  {
    id: 'insp_002',
    product_name: "Britannia NutriChoice 5 Grain Biscuits",
    is_imported: false,
    status: 'verified_non_compliant',
    created_at: '2024-10-17T14:00:00Z',
    verified_at: '2024-10-17T16:30:00Z',
    inspector: { id: 'usr_003', full_name: 'Rahul Verma' },
    violation_count: 3,
    declaration_count: 10,
  },
  {
    id: 'insp_003',
    product_name: 'Amul Gold Full Cream Milk',
    is_imported: false,
    status: 'pending_review',
    created_at: '2024-10-18T08:00:00Z',
    verified_at: null,
    inspector: { id: 'usr_004', full_name: 'Sneha Patel' },
    violation_count: 1,
    declaration_count: 10,
  },
  {
    id: 'insp_004',
    product_name: 'Maggi 2-Minute Noodles',
    is_imported: false,
    status: 'pending_review',
    created_at: '2024-10-17T11:30:00Z',
    verified_at: null,
    inspector: { id: 'usr_002', full_name: 'Priya Sharma' },
    violation_count: 2,
    declaration_count: 10,
  },
  {
    id: 'insp_005',
    product_name: 'Lay\'s Classic Salted Chips (Imported)',
    is_imported: true,
    status: 'draft',
    created_at: '2024-10-18T12:00:00Z',
    verified_at: null,
    inspector: { id: 'usr_004', full_name: 'Sneha Patel' },
    violation_count: 0,
    declaration_count: 0,
  },
  {
    id: 'insp_006',
    product_name: 'Tata Salt Lite',
    is_imported: false,
    status: 'verified_compliant',
    created_at: '2024-10-16T10:00:00Z',
    verified_at: '2024-10-16T13:45:00Z',
    inspector: { id: 'usr_003', full_name: 'Rahul Verma' },
    violation_count: 0,
    declaration_count: 10,
  },
  {
    id: 'insp_007',
    product_name: 'Horlicks Original (500g)',
    is_imported: false,
    status: 'verified_non_compliant',
    created_at: '2024-10-15T09:00:00Z',
    verified_at: '2024-10-15T12:00:00Z',
    inspector: { id: 'usr_002', full_name: 'Priya Sharma' },
    violation_count: 2,
    declaration_count: 10,
  },
  {
    id: 'insp_008',
    product_name: 'Fortune Sunflower Oil (1L)',
    is_imported: false,
    status: 'verified_compliant',
    created_at: '2024-10-14T11:00:00Z',
    verified_at: '2024-10-14T14:30:00Z',
    inspector: { id: 'usr_004', full_name: 'Sneha Patel' },
    violation_count: 0,
    declaration_count: 10,
  },
  {
    id: 'insp_009',
    product_name: 'Haldirams Aloo Bhujia',
    is_imported: false,
    status: 'pending_review',
    created_at: '2024-10-18T07:30:00Z',
    verified_at: null,
    inspector: { id: 'usr_003', full_name: 'Rahul Verma' },
    violation_count: 1,
    declaration_count: 10,
  },
  {
    id: 'insp_010',
    product_name: 'Nescafe Classic Coffee (200g)',
    is_imported: false,
    status: 'draft',
    created_at: '2024-10-18T13:00:00Z',
    verified_at: null,
    inspector: { id: 'usr_002', full_name: 'Priya Sharma' },
    violation_count: 0,
    declaration_count: 0,
  },
];

// ────────── Mock Full Inspections ────────────────────────────

export const MOCK_INSPECTION_FULL: Record<string, InspectionFull> = {
  insp_001: {
    ...MOCK_INSPECTIONS[0],
    verified_by: { id: 'usr_001', full_name: 'Arjun Mehta' },
    declarations: makeDeclarations('insp_001', 'compliant'),
    evidence_images: [
      {
        id: 'ev_001',
        inspection_id: 'insp_001',
        storage_path: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        annotated_storage_path: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        caption: 'Front label — Parle-G Glucose Biscuits',
      },
    ],
    audit_log: [
      {
        id: 'audit_001_1',
        inspection_id: 'insp_001',
        actor: { id: 'usr_002', full_name: 'Priya Sharma', role: 'inspector' },
        action: 'created',
        note: null,
        created_at: '2024-10-18T09:30:00Z',
      },
      {
        id: 'audit_001_2',
        inspection_id: 'insp_001',
        actor: { id: 'usr_002', full_name: 'Priya Sharma', role: 'inspector' },
        action: 'submitted_for_review',
        note: 'All fields look accurate, AI extraction was excellent.',
        created_at: '2024-10-18T09:55:00Z',
      },
      {
        id: 'audit_001_3',
        inspection_id: 'insp_001',
        actor: { id: 'usr_001', full_name: 'Arjun Mehta', role: 'admin' },
        action: 'verified_compliant',
        note: 'All 10 mandatory declarations present and accurate.',
        created_at: '2024-10-18T11:15:00Z',
      },
    ],
  },
  insp_002: {
    ...MOCK_INSPECTIONS[1],
    verified_by: { id: 'usr_001', full_name: 'Arjun Mehta' },
    declarations: makeDeclarations('insp_002', 'violations'),
    evidence_images: [
      {
        id: 'ev_002',
        inspection_id: 'insp_002',
        storage_path: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600',
        annotated_storage_path: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600',
        caption: 'Front label — Britannia NutriChoice',
      },
    ],
    audit_log: [
      {
        id: 'audit_002_1',
        inspection_id: 'insp_002',
        actor: { id: 'usr_003', full_name: 'Rahul Verma', role: 'inspector' },
        action: 'created',
        note: null,
        created_at: '2024-10-17T14:00:00Z',
      },
      {
        id: 'audit_002_2',
        inspection_id: 'insp_002',
        actor: { id: 'usr_003', full_name: 'Rahul Verma', role: 'inspector' },
        action: 'field_corrected',
        note: 'Corrected manufacturer address — OCR misread pincode.',
        created_at: '2024-10-17T14:22:00Z',
      },
      {
        id: 'audit_002_3',
        inspection_id: 'insp_002',
        actor: { id: 'usr_003', full_name: 'Rahul Verma', role: 'inspector' },
        action: 'submitted_for_review',
        note: 'Consumer care number not found. FSSAI and expiry also missing.',
        created_at: '2024-10-17T14:35:00Z',
      },
      {
        id: 'audit_002_4',
        inspection_id: 'insp_002',
        actor: { id: 'usr_001', full_name: 'Arjun Mehta', role: 'admin' },
        action: 'verified_non_compliant',
        note: '3 mandatory declarations absent: consumer care, best before, FSSAI. Issuing notice.',
        created_at: '2024-10-17T16:30:00Z',
      },
    ],
  },
};

// ────────── Mock Dashboard Stats ─────────────────────────────

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  total_inspections: 147,
  compliant_count: 89,
  non_compliant_count: 34,
  pending_review_count: 12,
  draft_count: 12,
  compliance_rate: 72.4,
  top_violations: [
    { rule_id: 'rule_006', label: 'Consumer care number / email', clause: 'Rule 6(1)(f)', count: 28 },
    { rule_id: 'rule_008', label: 'Expiry / best before date', clause: 'Rule 6(1)(h)', count: 22 },
    { rule_id: 'rule_010', label: 'FSSAI license number', clause: 'Rule 6(1)(j)', count: 19 },
    { rule_id: 'rule_003', label: 'Month and year of manufacture', clause: 'Rule 6(1)(c)', count: 14 },
    { rule_id: 'rule_005', label: 'Name and address of manufacturer', clause: 'Rule 6(1)(e)', count: 11 },
    { rule_id: 'rule_009', label: 'Batch / lot number', clause: 'Rule 6(1)(i)', count: 9 },
  ],
  monthly_trend: [
    { month: 'May', compliant: 8, non_compliant: 3, pending: 2 },
    { month: 'Jun', compliant: 11, non_compliant: 4, pending: 1 },
    { month: 'Jul', compliant: 14, non_compliant: 5, pending: 3 },
    { month: 'Aug', compliant: 13, non_compliant: 6, pending: 2 },
    { month: 'Sep', compliant: 18, non_compliant: 7, pending: 1 },
    { month: 'Oct', compliant: 25, non_compliant: 9, pending: 3 },
  ],
  inspector_stats: [
    { inspector: { id: 'usr_002', full_name: 'Priya Sharma' }, total: 56, compliant: 42 },
    { inspector: { id: 'usr_003', full_name: 'Rahul Verma' }, total: 48, compliant: 30 },
    { inspector: { id: 'usr_004', full_name: 'Sneha Patel' }, total: 43, compliant: 17 },
  ],
};
