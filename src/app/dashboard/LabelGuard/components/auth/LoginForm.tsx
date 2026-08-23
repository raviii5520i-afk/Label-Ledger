'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, ArrowRight, Zap, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { signIn } from '@/lib/supabase/auth';
import { getCurrentProfile } from '@/lib/supabase/profiles';

type AuthTab = 'password' | 'magic_link';

export function LoginForm() {
  const [tab, setTab] = useState<AuthTab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    if (tab === 'password' && !password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await signIn({ email, password });

      if (result.error) {
        const msg = result.error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          setAuthError('Invalid email or password. Please check your credentials.');
        } else if (msg.includes('email not confirmed')) {
          setAuthError('Please verify your email address before signing in.');
        } else {
          setAuthError(result.error.message || 'Authentication failed. Please check your connection and try again.');
        }
        setIsLoading(false);
        return;
      }

      // Retrieve profile and role after successful authentication
      await getCurrentProfile();

      setIsLoading(false);
      window.location.href = '/dashboard/LabelGuard/scan';
    } catch (err: unknown) {
      setIsLoading(false);
      setAuthError('An unexpected network error occurred. Please try again.');
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!validate()) return;

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    setMagicSent(true);
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40">
          <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-white">Label Ledger</h1>
        <p className="text-sm text-slate-400 mt-1">Legal Metrology Compliance</p>
      </div>

      {/* Card */}
      <div className="bg-[#1A1D27] border border-[#2E3147] rounded-2xl p-6">
        <h2 className="text-base font-semibold text-slate-100 mb-1">Sign in to your account</h2>
        <p className="text-xs text-slate-500 mb-5">
          Access is restricted to authorised enforcement personnel.
        </p>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-lg flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Tab Switch */}
        <div className="flex p-1 bg-[#0F1117] rounded-lg mb-5 gap-1">
          {(['password', 'magic_link'] as AuthTab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErrors({}); setAuthError(null); setMagicSent(false); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all',
                tab === t
                  ? 'bg-[#232635] text-slate-200 shadow'
                  : 'text-slate-500 hover:text-slate-300',
              )}
            >
              {t === 'password' ? (
                <><Lock className="w-3 h-3" /> Password</>
              ) : (
                <><Zap className="w-3 h-3" /> Magic Link</>
              )}
            </button>
          ))}
        </div>

        {/* Magic link success */}
        {magicSent ? (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-indigo-900/40 border border-indigo-600/40 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Check your inbox</p>
            <p className="text-xs text-slate-500 mt-1">
              A sign-in link has been sent to <span className="text-slate-300">{email}</span>
            </p>
            <button
              onClick={() => { setMagicSent(false); setEmail(''); }}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={tab === 'password' ? handlePasswordSignIn : handleMagicLink} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="ll-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                Official email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  id="ll-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); setAuthError(null); }}
                  placeholder="you@enforcement.gov.in"
                  autoComplete="email"
                  className={cn(
                    'w-full pl-9 pr-3 py-2.5 bg-[#0F1117] border rounded-lg text-sm text-slate-200 placeholder-slate-600',
                    'focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors',
                    errors.email ? 'border-red-500/60' : 'border-[#2E3147] focus:border-indigo-500',
                  )}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password (password tab only) */}
            {tab === 'password' && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="ll-password" className="text-xs font-medium text-slate-400">
                    Password
                  </label>
                  <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    id="ll-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); setAuthError(null); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(
                      'w-full pl-9 pr-9 py-2.5 bg-[#0F1117] border rounded-lg text-sm text-slate-200 placeholder-slate-600',
                      'focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors',
                      errors.password ? 'border-red-500/60' : 'border-[#2E3147] focus:border-indigo-500',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
              </div>
            )}

            {tab === 'magic_link' && <div className="mb-5" />}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold',
                'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500',
                'disabled:opacity-60 disabled:cursor-not-allowed transition-colors',
                'shadow-lg shadow-indigo-900/30',
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : tab === 'password' ? (
                <><ArrowRight className="w-4 h-4" /> Sign in</>
              ) : (
                <><Mail className="w-4 h-4" /> Send magic link</>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-[11px] text-slate-600 mt-6">
        Authorised use only · Legal Metrology Dept.
      </p>

      {/* Dev shortcut */}
      <div className="mt-4 flex gap-2 justify-center">
        <Link
          href="/dashboard/LabelGuard/scan"
          className="text-xs text-indigo-500 hover:text-indigo-400 underline underline-offset-2"
        >
          → Enter as Admin (dev)
        </Link>
      </div>
    </div>
  );
}
