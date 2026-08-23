// Label Ledger — Admin Review Queue Page
import type { Metadata } from 'next';
import { ReviewQueueView } from '../components/review/ReviewQueueView';

export const metadata: Metadata = {
  title: 'Review Queue',
};

export default function ReviewPage() {
  return <ReviewQueueView />;
}
