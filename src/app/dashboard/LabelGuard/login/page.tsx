import type { Metadata } from 'next';
import { LoginForm } from '../components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | LabelGuard',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[var(--lg-background)] font-sans px-4 py-12 selection:bg-[var(--lg-green-accent)]/30">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
