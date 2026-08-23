// Label Ledger — Login Page
// Mocked auth: no real Supabase integration yet
import type { Metadata } from 'next';
import { LoginForm } from '../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
