// Label Ledger — Report Page (Protected: admin, inspector, manufacturer, viewer)
import type { Metadata } from 'next';
import { ReportView } from '../../components/report/ReportView';
import { requireRole } from '@/lib/supabase/rbac';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Report — ${params.id.slice(0, 8)}…`,
  };
}

export default async function ReportPage({ params }: Props) {
  await requireRole(['admin', 'inspector', 'manufacturer', 'viewer']);

  return <ReportView inspectionId={params.id} />;
}
