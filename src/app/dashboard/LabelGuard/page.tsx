// Label Ledger — Root Redirect Handler
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/auth';
import { getCurrentUserRole } from '@/lib/supabase/profiles';

export default async function LabelGuardRootPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/dashboard/LabelGuard/login');
  }

  const role = (await getCurrentUserRole()) || 'inspector';

  if (role === 'manufacturer' || role === 'viewer') {
    redirect('/dashboard/LabelGuard/repository');
  }

  redirect('/dashboard/LabelGuard/scan');
}
