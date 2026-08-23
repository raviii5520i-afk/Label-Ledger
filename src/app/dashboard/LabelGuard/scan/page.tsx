// Label Ledger — Scan Page
import type { Metadata } from 'next';
import { ScanWorkflow } from '../components/scan/ScanWorkflow';

export const metadata: Metadata = {
  title: 'Scan Label',
};

export default function ScanPage() {
  return <ScanWorkflow />;
}
