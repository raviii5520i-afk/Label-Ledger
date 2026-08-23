// Label Ledger — Root redirect
import { redirect } from 'next/navigation';

export default function LabelGuardRootPage() {
  redirect('/dashboard/LabelGuard/scan');
}
