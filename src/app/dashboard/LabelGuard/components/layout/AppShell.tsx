// Label Ledger — Main Application Shell (Sidebar + TopBar Layout)
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck, ScanLine, FolderOpen, LayoutDashboard,
  ClipboardCheck, Bell, Menu, X, LogOut, ChevronDown, User, BookOpen,
} from 'lucide-react';
import { cn, isRouteAllowed } from '../../lib/utils';
import { CountBadge } from '../ui/Badge';
import { signOut } from '@/lib/supabase/auth';
import { getCurrentProfile, UserProfile } from '@/lib/supabase/profiles';
import { getMyInspections } from '@/lib/supabase/inspections';
import { useLanguage } from '../../i18n/LanguageProvider';
import { LanguageSelector } from '../../i18n/LanguageSelector';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

// Dashboard first — logical home page for enforcement officers
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/LabelGuard/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/dashboard/LabelGuard/scan', label: 'Scan Label', icon: <ScanLine className="w-4 h-4" /> },
  { href: '/dashboard/LabelGuard/repository', label: 'Repository', icon: <FolderOpen className="w-4 h-4" /> },
  { href: '/dashboard/LabelGuard/review', label: 'Review Queue', icon: <ClipboardCheck className="w-4 h-4" /> },
  { href: '/dashboard/LabelGuard/rules', label: 'Inspection Rule', icon: <BookOpen className="w-4 h-4" /> },
];

function Sidebar({ onClose, pendingCount }: { onClose?: () => void; pendingCount: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getCurrentProfile().then(p => {
      if (p) setProfile(p);
    });
  }, []);

  const activeRole = profile?.role || 'inspector';
  const visibleItems = NAV_ITEMS.filter(item => isRouteAllowed(activeRole, item.href));

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    await signOut();
    router.push('/dashboard/LabelGuard/login');
  }

  const { t } = useLanguage();

  return (
    <aside className="flex flex-col h-full bg-[var(--lg-navy)] text-white w-64 shadow-lg">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <Link href="/dashboard/LabelGuard" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-[var(--lg-green)] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Label Ledger</p>
            <p className="text-[10px] text-white/60 mt-0.5">Legal Metrology</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-white/60 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/50">
          {t('navigation.navigationHeading')}
        </p>
        {visibleItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isPendingItem = item.label === 'Review Queue';
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5',
              )}
            >
              <span className={cn(isActive ? 'text-[var(--lg-green-light)]' : 'text-white/50 group-hover:text-white/80')}>
                {item.icon}
              </span>
              {item.label === 'Dashboard' && t('navigation.dashboard')}
              {item.label === 'Scan Label' && t('navigation.scanLabel')}
              {item.label === 'Repository' && t('navigation.repository')}
              {item.label === 'Review Queue' && t('navigation.reviewQueue')}
              {item.label === 'Inspection Rule' && 'Inspection Rule'}
              {isPendingItem && <CountBadge count={pendingCount} />}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white/5 border border-white/10 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--lg-blue)] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {profile ? profile.full_name : 'Loading...'}
            </p>
            <p className="text-[10px] text-[var(--lg-green-light)] uppercase tracking-wider font-semibold">
              {activeRole}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('navigation.signOut')}
        </button>
      </div>
    </aside>
  );
}

function TopBar({ onMenuClick, pendingCount }: { onMenuClick: () => void; pendingCount: number }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const getPageTitle = () => {
    if (pathname.includes('/scan')) return t('navigation.scanLabel');
    if (pathname.includes('/dashboard')) return t('navigation.dashboard');
    if (pathname.includes('/repository')) return t('navigation.repository');
    if (pathname.includes('/report')) return t('navigation.inspectionReport');
    if (pathname.includes('/review')) return t('navigation.reviewQueue');
    if (pathname.includes('/unauthorized')) return t('navigation.accessRestricted');
    return 'Label Ledger';
  };

  return (
    <header className="h-14 flex items-center px-4 gap-3 border-b border-[var(--lg-border)] bg-[var(--lg-background)]/80 backdrop-blur-sm sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 text-[var(--lg-muted)] hover:text-[var(--lg-navy)] hover:bg-black/5 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <p className="text-sm font-semibold text-[var(--lg-text)]">{getPageTitle()}</p>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSelector />
        {pendingCount > 0 && (
          <Link
            href="/dashboard/LabelGuard/review"
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--lg-orange)] hover:opacity-90 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{pendingCount}</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch live pending inspection count from Supabase
  const fetchPendingCount = useCallback(async () => {
    const res = await getMyInspections();
    if (res.data) {
      const count = res.data.filter(i => i.status === 'pending_review').length;
      setPendingCount(count);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  const isLandingPage = pathname === '/dashboard/LabelGuard' || pathname === '/dashboard/LabelGuard/';
  const isAuthPage = pathname.endsWith('/login') || pathname.endsWith('/unauthorized');

  if (isLandingPage) {
    return (
      <main className="min-h-screen bg-[var(--lg-background)]">
        {children}
      </main>
    );
  }

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[var(--lg-background)] flex items-center justify-center p-4">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--lg-background)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar pendingCount={pendingCount} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex">
            <Sidebar onClose={() => setMobileOpen(false)} pendingCount={pendingCount} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileOpen(true)} pendingCount={pendingCount} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
