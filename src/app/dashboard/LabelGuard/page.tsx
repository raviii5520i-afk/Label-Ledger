// Label Ledger — Root Landing Page (Server Component)
import { getCurrentUser } from '@/lib/supabase/auth';
import { LandingPageView } from './components/landing/LandingPageView';

export const metadata = {
  title: 'LabelGuard — AI-Powered Legal Metrology Compliance',
  description: 'Scan packaged commodity labels, extract mandatory declarations, evaluate Legal Metrology compliance, and manage secure inspection workflows with LabelGuard.',
};

export default async function LabelGuardRootPage() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return <LandingPageView isAuthenticated={isAuthenticated} />;
}
