// Label Ledger — Scan Page (Protected: admin, inspector)
import type { Metadata } from 'next';
import { ScanWorkflow } from '../components/scan/ScanWorkflow';
import { requireRole } from '@/lib/supabase/rbac';

export const metadata: Metadata = {
  title: 'Scan Label',
};

export default async function ScanPage() {
  await requireRole(['admin', 'inspector']);
  return <ScanWorkflow />;
}
