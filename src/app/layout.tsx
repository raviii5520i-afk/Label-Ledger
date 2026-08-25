import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Label Ledger',
    default: 'Label Ledger — Legal Metrology Compliance',
  },
  description:
    'Enforcement-grade label inspection platform for Legal Metrology (Packaged Commodities) Rules, 2011. Scan, extract, verify, and report.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0C0E18] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
