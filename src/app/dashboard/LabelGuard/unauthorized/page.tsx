// Label Ledger — Unauthorized Access Page
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, FolderOpen, LayoutDashboard } from 'lucide-react';
import { getCurrentProfile } from '@/lib/supabase/profiles';

export const metadata: Metadata = {
  title: 'Access Restricted',
};

export default async function UnauthorizedPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-900/30 border border-amber-500/30 flex items-center justify-center mb-5 shadow-lg shadow-amber-900/20">
        <ShieldAlert className="w-7 h-7 text-amber-400" />
      </div>
      <h1 className="text-xl font-bold text-slate-100">Access Restricted</h1>
      <p className="text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
        Your account role <span className="font-semibold text-slate-200 capitalize">({profile?.role || 'user'})</span> does not have permission to access this enforcement module.
      </p>

      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <Link
          href="/dashboard/LabelGuard/repository"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A1D27] hover:bg-[#232635] text-slate-200 text-xs font-semibold border border-[#2E3147] transition-colors"
        >
          <FolderOpen className="w-4 h-4 text-indigo-400" />
          View Repository
        </Link>
        <Link
          href="/dashboard/LabelGuard/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A1D27] hover:bg-[#232635] text-slate-200 text-xs font-semibold border border-[#2E3147] transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
