// Label Ledger — Report Page (Protected: admin, inspector, manufacturer, viewer)
import type { Metadata } from 'next';
import { ReportView } from '../../components/report/ReportView';
import { MOCK_INSPECTION_FULL, MOCK_INSPECTIONS } from '../../lib/mock/data';
import { requireRole } from '@/lib/supabase/rbac';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const insp = MOCK_INSPECTIONS.find(i => i.id === params.id);
  return {
    title: insp ? `Report — ${insp.product_name}` : 'Inspection Report',
  };
}

export default async function ReportPage({ params }: Props) {
  await requireRole(['admin', 'inspector', 'manufacturer', 'viewer']);

  const inspection = MOCK_INSPECTION_FULL[params.id];

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-3">🔍</p>
        <h2 className="text-lg font-semibold text-slate-200">Inspection not found</h2>
        <p className="text-sm text-slate-500 mt-1">ID: {params.id}</p>
        <a href="/dashboard/LabelGuard/repository" className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
          ← Back to Repository
        </a>
      </div>
    );
  }

  return <ReportView inspection={inspection} />;
}
