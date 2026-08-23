// Label Ledger — Dashboard Page (Admin only)
import type { Metadata } from 'next';
import { DashboardView } from '../components/dashboard/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return <DashboardView />;
}
