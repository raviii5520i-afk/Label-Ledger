// Label Ledger — Rule 6 Compliance Engine
// Evaluates extracted Legal Metrology fields against Rule 6 Packaged Commodities standards.

import type { ExtractionResult } from '@/app/dashboard/LabelGuard/lib/types';
import { MOCK_RULES } from '@/app/dashboard/LabelGuard/lib/mock/data';

export interface EvaluatedRuleCheck {
  rule_id: string;
  clause: string;
  label: string;
  passed: boolean;
  extracted_value: string | null;
  expected_value: string | null;
  notes: string | null;
}

export interface EvaluatedInspectionItem {
  clause: string;
  label: string;
  found: boolean;
  extracted_value: string | null;
  bbox: any | null;
  confidence: number | null;
  manually_corrected: boolean;
}

/**
 * Evaluates extracted fields against Legal Metrology Rule 6 requirements.
 */
export function evaluateRule6Compliance(
  inspectionId: string,
  extraction: ExtractionResult
): {
  items: (EvaluatedInspectionItem & { inspection_id: string })[];
  checks: (EvaluatedRuleCheck & { inspection_id: string })[];
} {
  const fields = extraction.fields || {};

  const items: (EvaluatedInspectionItem & { inspection_id: string })[] = [];
  const checks: (EvaluatedRuleCheck & { inspection_id: string })[] = [];

  for (const rule of MOCK_RULES) {
    const fieldKey = ruleToFieldKey(rule.id);
    const field = fieldKey ? fields[fieldKey] : undefined;

    const found = !!(field && field.value);
    const extractedVal = field?.value ?? null;
    const confidenceVal = field?.confidence ?? (found ? 0.90 : 0);

    // Build inspection_items payload
    items.push({
      inspection_id: inspectionId,
      clause: rule.clause,
      label: rule.label,
      found,
      extracted_value: extractedVal,
      bbox: field?.bbox ?? null,
      confidence: confidenceVal,
      manually_corrected: false,
    });

    // Build rule_checks payload
    const passed = found || !rule.mandatory;
    let notes = passed
      ? 'Declaration present and compliant with Rule 6'
      : `Violation: Mandatory declaration ${rule.label} missing from label image`;

    if (found && confidenceVal < 0.60) {
      notes = `Needs Manual Review: Low OCR confidence (${Math.round(confidenceVal * 100)}%) for ${rule.label}`;
    }

    checks.push({
      inspection_id: inspectionId,
      rule_id: rule.id,
      clause: rule.clause,
      label: rule.label,
      passed,
      extracted_value: extractedVal,
      expected_value: rule.mandatory ? 'Mandatory declaration must be visible' : 'Optional declaration',
      notes,
    });
  }

  return { items, checks };
}

function ruleToFieldKey(ruleId: string): keyof ExtractionResult['fields'] | null {
  const map: Record<string, keyof ExtractionResult['fields']> = {
    rule_001: 'product_name',
    rule_002: 'net_quantity',
    rule_003: 'mfg_date',
    rule_004: 'mrp',
    rule_005: 'manufacturer_address',
    rule_006: 'consumer_care',
    rule_007: 'country_of_origin',
    rule_008: 'expiry_date',
    rule_009: 'batch_number',
    rule_010: 'fssai_license',
  };
  return map[ruleId] ?? null;
}
