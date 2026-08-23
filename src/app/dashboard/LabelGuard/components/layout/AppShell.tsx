// Label Ledger — App Shell Layout (Sidebar + TopBar + Mobile Nav)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ScanLine,
  LayoutDashboard,
  FolderOpen,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { CountBadge } from '../ui/Badge';
import { MOCK_CURRENT_USER, MOCK_INSPECTIONS } from '../../lib/mock/data';

// ── Nav Items ────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/LabelGuard/scan', label: 'Scan Label', icon: <ScanLine className="w-4 h-4" /> },
  { href: '/dashboard/LabelGuard/repository', label: 'Repository', icon: <FolderOpen className="w-4 h-4" /> },
  { href: '/dashboard/LabelGuard/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, adminOnly: true },
  { href: '/dashboard/LabelGuard/review', label: 'Review Queue', icon: <ClipboardCheck className="w-4 h-4" />, adminOnly: true },
];

// ── Sidebar ───────────────────────────────────────────────────

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user = MOCK_CURRENT_USER;
  const pendingCount = MOCK_INSPECTIONS.filter(i => i.status === 'pending_review').length;

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.adminOnly || user.role === 'admin',
  );

  return (
    <aside className="flex flex-col h-full bg-[#0F1117] border-r border-[#2E3147] w-64">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#2E3147]">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Label Ledger</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Legal Metrology</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {visibleItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isPending = item.label === 'Review Queue';
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1D27] border border-transparent',
              )}
            >
              <span className={cn(isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')}>
                {item.icon}
              </span>
              {item.label}
              {isPending && <CountBadge count={pendingCount} />}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-[#2E3147]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#1A1D27] cursor-pointer transition-colors group">
          <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.full_name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
        </div>
        <Link
          href="/dashboard/LabelGuard/login"
          className="flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}

// ── TopBar ────────────────────────────────────────────────────

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const pendingCount = MOCK_INSPECTIONS.filter(i => i.status === 'pending_review').length;

  const getPageTitle = () => {
    if (pathname.includes('/scan')) return 'Scan Label';
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/repository')) return 'Repository';
    if (pathname.includes('/report')) return 'Inspection Report';
    if (pathname.includes('/review')) return 'Review Queue';
    return 'Label Ledger';
  };

  return (
    <header className="h-14 flex items-center px-4 gap-3 border-b border-[#2E3147] bg-[#0F1117]/80 backdrop-blur-sm sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#232635] rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-sm font-semibold text-slate-200">{getPageTitle()}</h1>

      <div className="ml-auto flex items-center gap-2">
        {pendingCount > 0 && (
          <Link
            href="/dashboard/LabelGuard/review"
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-900/20 border border-amber-600/30 hover:bg-amber-900/30 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{pendingCount} pending</span>
          </Link>
        )}
      </div>
    </header>
  );
}

// ── AppShell (main export) ───────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  const pathname = usePathname();
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[#0F1117] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
