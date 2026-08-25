// Label Ledger — Login, Sign Up, & Password Recovery Form Component
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2,
  AlertCircle, UserPlus, User, CheckCircle2, KeyRound, ArrowLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../i18n/LanguageProvider';

import { signIn, signUp, resetPasswordForEmail } from '@/lib/supabase/auth';

type AuthTab = 'login' | 'signup' | 'forgot_password';

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
  }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!email || !email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (tab === 'login' || tab === 'signup') {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (tab === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = `${t('Full name')} is required`;
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);
    if (!validate() || isLoading) return;

    setIsLoading(true);

    try {
      const result = await signIn({ email, password });

      if (result.error) {
        const msg = result.error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          setAuthError('Invalid email or password. Please check your credentials or create an account.');
        } else if (msg.includes('email not confirmed')) {
          setAuthError('Please confirm your email address via the link sent to your inbox before signing in.');
        } else {
          setAuthError(result.error.message);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      // Ensure page reloads session state cleanly
      window.location.href = '/dashboard/LabelGuard/scan';
    } catch {
      setIsLoading(false);
      setAuthError('Unable to connect. Please check your internet connection and try again.');
    }
  }

  async function handleSignUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);
    if (!validate() || isLoading) return;

    setIsLoading(true);

    try {
      const res = await signUp({
        email,
        password,
        fullName: fullName.trim() || email.split('@')[0],
        role: 'inspector',
      });

      if (res.error) {
        setAuthError(res.error.message);
        setIsLoading(false);
        return;
      }

      // If user session is established immediately
      if (res.session || res.user) {
        const loginRes = await signIn({ email, password });
        setIsLoading(false);
        if (loginRes.user || loginRes.session) {
          window.location.href = '/dashboard/LabelGuard/scan';
          return;
        }
      }

      setIsLoading(false);
      setSuccessMsg('Account created successfully! If email confirmation is enabled, please verify your inbox before signing in.');
      setTab('login');
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err.message || 'Failed to create account.');
    }
  }

  async function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setSuccessMsg(null);
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await resetPasswordForEmail(email.trim());
      setIsLoading(false);

      if (res.error) {
        setAuthError(res.error.message);
        return;
      }

      setSuccessMsg('If an account exists for this email, a password reset link has been sent to your inbox.');
    } catch {
      setIsLoading(false);
      setAuthError('Unable to send password reset request. Please check your connection and try again.');
    }
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--lg-navy)] flex items-center justify-center mb-4 shadow-md">
          <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-[var(--lg-navy)]">LabelGuard</h1>
      </div>

      {/* Card */}
      <div className="w-full bg-white p-8 sm:p-10 border border-[var(--lg-border)] rounded-2xl shadow-xl">
        <h2 className="text-base font-semibold text-[var(--lg-navy)] mb-1">
          {tab === 'signup'
            ? t('Create Inspector Account')
            : tab === 'forgot_password'
            ? t('Reset Password')
            : t('Sign in to your account')}
        </h2>
        <p className="text-xs text-[var(--lg-muted)] mb-5">
          {tab === 'signup'
            ? t('Register official inspector credentials for LabelGuard compliance audit.')
            : tab === 'forgot_password'
            ? t('Enter your email address to receive a secure password recovery link.')
            : t('Access is restricted to authorised enforcement personnel.')}
        </p>

        {/* Tab switcher (Login vs SignUp) */}
        {tab !== 'forgot_password' && (
          <div className="grid grid-cols-2 gap-1 bg-[var(--lg-surface)] p-1 rounded-lg mb-5 border border-[var(--lg-border)]">
            <button
              type="button"
              onClick={() => { setTab('login'); setAuthError(null); setSuccessMsg(null); }}
              className={cn(
                'py-1.5 text-xs font-semibold rounded-md transition-colors',
                tab === 'login' ? 'bg-white text-[var(--lg-navy)] shadow-sm' : 'text-[var(--lg-muted)] hover:text-[var(--lg-navy)]',
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setAuthError(null); setSuccessMsg(null); }}
              className={cn(
                'py-1.5 text-xs font-semibold rounded-md transition-colors',
                tab === 'signup' ? 'bg-white text-[var(--lg-navy)] shadow-sm' : 'text-[var(--lg-muted)] hover:text-[var(--lg-navy)]',
              )}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3 bg-[var(--lg-green-light)] border border-[var(--lg-green-accent)]/40 rounded-lg text-xs text-green-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--lg-green-accent)] shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form Handling */}
        {tab === 'forgot_password' ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="ll-reset-email" className="block text-xs font-medium text-[var(--lg-muted)] mb-1.5">
                {t('Official email address')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--lg-muted)]" />
                <input
                  id="ll-reset-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); setAuthError(null); }}
                  placeholder="you@enforcement.gov.in"
                  required
                  className={cn(
                    'w-full pl-9 pr-3 py-2.5 bg-[var(--lg-surface)] border rounded-lg text-sm text-[var(--lg-navy)] placeholder-slate-600',
                    'focus:outline-none focus:ring-1 focus:ring-[var(--lg-green-accent)] transition-colors',
                    errors.email ? 'border-red-500/60' : 'border-[var(--lg-border)] focus:border-[var(--lg-green-accent)]',
                  )}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-[var(--lg-green-accent)] hover:opacity-90 text-white disabled:opacity-60 transition-colors shadow-lg shadow-[var(--lg-green-accent)]/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4" /> {t('Send Reset Link')}</>}
            </button>

            <button
              type="button"
              onClick={() => { setTab('login'); setAuthError(null); setSuccessMsg(null); }}
              className="w-full flex items-center justify-center gap-1 text-xs text-[var(--lg-muted)] hover:text-[var(--lg-navy)] pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t('Back to Sign In')}
            </button>
          </form>
        ) : (
          <form onSubmit={tab === 'signup' ? handleSignUpSubmit : handlePasswordSignIn}>
            {/* {t('Full name')} (Sign Up only) */}
            {tab === 'signup' && (
              <div className="mb-4">
                <label htmlFor="ll-fullname" className="block text-xs font-medium text-[var(--lg-muted)] mb-1.5">
                  {t('Full name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--lg-muted)]" />
                  <input
                    id="ll-fullname"
                    type="text"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: undefined })); }}
                    placeholder="Arjun Mehta"
                    className={cn(
                      'w-full pl-9 pr-3 py-2.5 bg-[var(--lg-surface)] border rounded-lg text-sm text-[var(--lg-navy)] placeholder-slate-600',
                      'focus:outline-none focus:ring-1 focus:ring-[var(--lg-green-accent)] transition-colors',
                      errors.fullName ? 'border-red-500/60' : 'border-[var(--lg-border)] focus:border-[var(--lg-green-accent)]',
                    )}
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="ll-email" className="block text-xs font-medium text-[var(--lg-muted)] mb-1.5">
                {t('Official email address')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--lg-muted)]" />
                <input
                  id="ll-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); setAuthError(null); }}
                  placeholder="you@enforcement.gov.in"
                  autoComplete="email"
                  className={cn(
                    'w-full pl-9 pr-3 py-2.5 bg-[var(--lg-surface)] border rounded-lg text-sm text-[var(--lg-navy)] placeholder-slate-600',
                    'focus:outline-none focus:ring-1 focus:ring-[var(--lg-green-accent)] transition-colors',
                    errors.email ? 'border-red-500/60' : 'border-[var(--lg-border)] focus:border-[var(--lg-green-accent)]',
                  )}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="ll-password" className="text-xs font-medium text-[var(--lg-muted)]">
                  Password
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setTab('forgot_password'); setAuthError(null); setSuccessMsg(null); }}
                    className="text-xs text-[var(--lg-green-accent)] hover:text-[var(--lg-navy)] font-medium"
                  >
                    {t('Forgot password?')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--lg-muted)]" />
                <input
                  id="ll-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); setAuthError(null); }}
                  placeholder="••••••••"
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  className={cn(
                    'w-full pl-9 pr-9 py-2.5 bg-[var(--lg-surface)] border rounded-lg text-sm text-[var(--lg-navy)] placeholder-slate-600',
                    'focus:outline-none focus:ring-1 focus:ring-[var(--lg-green-accent)] transition-colors',
                    errors.password ? 'border-red-500/60' : 'border-[var(--lg-border)] focus:border-[var(--lg-green-accent)]',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lg-muted)] hover:text-[var(--lg-navy)]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* {t('Confirm Password')} (Sign Up only) */}
            {tab === 'signup' && (
              <div className="mb-5">
                <label htmlFor="ll-confirm-password" className="block text-xs font-medium text-[var(--lg-muted)] mb-1.5">
                  {t('Confirm Password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--lg-muted)]" />
                  <input
                    id="ll-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={cn(
                      'w-full pl-9 pr-9 py-2.5 bg-[var(--lg-surface)] border rounded-lg text-sm text-[var(--lg-navy)] placeholder-slate-600',
                      'focus:outline-none focus:ring-1 focus:ring-[var(--lg-green-accent)] transition-colors',
                      errors.confirmPassword ? 'border-red-500/60' : 'border-[var(--lg-border)] focus:border-[var(--lg-green-accent)]',
                    )}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold mt-2',
                'bg-[var(--lg-green-accent)] hover:opacity-90 text-white border border-[var(--lg-green-accent)]',
                'disabled:opacity-60 disabled:cursor-not-allowed transition-colors',
                'shadow-lg shadow-[var(--lg-green-accent)]/20',
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : tab === 'signup' ? (
                <><UserPlus className="w-4 h-4" /> {t('Create Account & Sign In')}</>
              ) : (
                <><ArrowRight className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-[11px] text-slate-600 mt-6">
        {t('Authorised use only · Legal Metrology Dept.')}
      </p>

      {/* Dev shortcut */}
      <div className="mt-4 flex gap-2 justify-center">
        <Link
          href="/dashboard/LabelGuard/scan"
          className="text-xs text-[var(--lg-navy)] hover:text-[var(--lg-navy-dark)] underline underline-offset-2 font-medium"
        >
          {t('→ Enter App Directly (Dev Mode)')}
        </Link>
      </div>
    </div>
  );
}
