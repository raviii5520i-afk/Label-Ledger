// Label Ledger — Admin/Officer Review Queue Page (Protected: admin, inspector)
import type { Metadata } from 'next';
import { ReviewQueueView } from '../components/review/ReviewQueueView';
import { requireRole } from '@/lib/supabase/rbac';

export const metadata: Metadata = {
  title: 'Review Queue',
};

export default async function ReviewPage() {
  await requireRole(['admin', 'inspector']);
  return <ReviewQueueView />;
}
