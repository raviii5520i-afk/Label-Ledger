// Label Ledger — Dashboard Page (Protected: admin, inspector, manufacturer, viewer)
import type { Metadata } from 'next';
import { DashboardView } from '../components/dashboard/DashboardView';
import { requireRole } from '@/lib/supabase/rbac';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  await requireRole(['admin', 'inspector', 'manufacturer', 'viewer']);
  return <DashboardView />;
}
