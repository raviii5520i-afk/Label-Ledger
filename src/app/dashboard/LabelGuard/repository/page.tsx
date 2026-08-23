// Label Ledger — Repository Page (Protected: admin, inspector, manufacturer, viewer)
import type { Metadata } from 'next';
import { RepositoryView } from '../components/repository/RepositoryView';
import { requireRole } from '@/lib/supabase/rbac';

export const metadata: Metadata = {
  title: 'Repository',
};

export default async function RepositoryPage() {
  await requireRole(['admin', 'inspector', 'manufacturer', 'viewer']);
  return <RepositoryView />;
}
