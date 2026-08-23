// Label Ledger — Repository Page
import type { Metadata } from 'next';
import { RepositoryView } from '../components/repository/RepositoryView';

export const metadata: Metadata = {
  title: 'Repository',
};

export default function RepositoryPage() {
  return <RepositoryView />;
}
