// Label Ledger — Root Layout
// Injects dark theme, AppShell, and global ToastProvider for all LabelGuard pages
import type { Metadata } from 'next';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { LanguageProvider } from './i18n/LanguageProvider';
import './ll-globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Label Ledger',
    default: 'Label Ledger — Legal Metrology Compliance',
  },
  description:
    'Enforcement-grade label inspection tool for Legal Metrology (Packaged Commodities) Rules, 2011. Scan, extract, verify, and report.',
};

export default function LabelGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Scoped dark-theme wrapper — doesn't affect parent Globe Trotter app
    <div className="ll-root" style={{ colorScheme: 'dark' }}>
      <LanguageProvider>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </LanguageProvider>
    </div>
  );
}
