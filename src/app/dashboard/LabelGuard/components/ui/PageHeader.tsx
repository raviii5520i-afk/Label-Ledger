// Label Ledger — Page Header Component with Breadcrumbs & Action Slots
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = 'Back',
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  const pathname = usePathname();

  // Dynamically generate breadcrumbs if none are explicitly provided
  const generatedBreadcrumbs = useMemoBreadcrumbs(pathname, breadcrumbs);

  return (
    <div className="space-y-4 mb-6">
      {/* Breadcrumbs Trail */}
      {generatedBreadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link href="/dashboard/LabelGuard/dashboard" className="hover:text-slate-300 transition-colors">
            Label Ledger
          </Link>
          {generatedBreadcrumbs.map((crumb, idx) => {
            const isLast = idx === generatedBreadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="hover:text-slate-300 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn('truncate max-w-[150px]', isLast ? 'text-indigo-400 font-semibold' : 'text-slate-500')}>
                    {crumb.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      )}

      {/* Back button link */}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Link>
      )}

      {/* Header Core Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-100 leading-snug">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500 mt-1 leading-normal">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

// Hook-like helper function to parse Next.js route pathnames into crumb nodes
function useMemoBreadcrumbs(pathname: string, customCrumbs?: BreadcrumbItem[]): BreadcrumbItem[] {
  if (customCrumbs) return customCrumbs;

  const crumbs: BreadcrumbItem[] = [];
  const parts = pathname.split('/').filter(Boolean);

  // Find where our application scoping begins
  const labelGuardIdx = parts.indexOf('LabelGuard');
  if (labelGuardIdx === -1) return [];

  // Extract path parameters after /dashboard/LabelGuard
  const relativeParts = parts.slice(labelGuardIdx + 1);

  let currentPath = '/dashboard/LabelGuard';

  relativeParts.forEach((part, index) => {
    currentPath += `/${part}`;
    let label = part;

    // Transform technical slugs to readable labels
    if (part === 'dashboard') label = 'Dashboard';
    else if (part === 'scan') label = 'Scan Label';
    else if (part === 'repository') label = 'Repository';
    else if (part === 'review') label = 'Review Queue';
    else if (part === 'report') label = 'Report';
    else if (part === 'login') label = 'Login';
    else if (part === 'unauthorized') label = 'Restricted';
    // Fallback: If it's a UUID string, represent as truncated ID
    else if (/^[0-9a-fA-F-]{24,}$/.test(part)) {
      label = `Inspection #${part.slice(0, 8)}`;
    }

    crumbs.push({
      label,
      href: index === relativeParts.length - 1 ? undefined : currentPath,
    });
  });

  return crumbs;
}
