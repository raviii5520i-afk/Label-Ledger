'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { updatePassword, getCurrentSession, signOut } from '@/lib/supabase/auth';
import { cn } from '../lib/utils';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getCurrentSession().then((session) => {
      if (session && session.user) {
        setHasValidSession(true);
      } else {
        setHasValidSession(false);
        setError('This password reset link has expired or is invalid. Please request a new one.');
      }
      setCheckingSession(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await updatePassword(password);
      if (res.error) {
        setError(res.error.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
      
      // Sign out and redirect to login after 2 seconds
      setTimeout(async () => {
        await signOut();
        router.push('/dashboard/LabelGuard/login');
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Unable to update password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40">
            <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-white">Label Ledger</h1>
          <p className="text-sm text-slate-400 mt-1">Reset Account Password</p>
        </div>

        <div className="bg-[#1A1D27] border border-[#2E3147] rounded-2xl p-6 shadow-2xl">
          {checkingSession ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs">Verifying recovery token…</p>
            </div>
          ) : success ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Password Reset Complete</h3>
              <p className="text-xs text-slate-400">
                Your password has been updated successfully. Redirecting you to sign in…
              </p>
            </div>
          ) : !hasValidSession ? (
            <div className="text-center py-4 space-y-3">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">Reset Link Expired</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {error || 'This password reset link has expired or is invalid. Please request a new link.'}
              </p>
              <Link
                href="/dashboard/LabelGuard/login"
                className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-semibold text-slate-100">Set New Password</h2>
              <p className="text-xs text-slate-500 mb-2">
                Enter your new password for your LabelGuard account.
              </p>

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60 transition-colors shadow-lg shadow-indigo-900/30"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Save New Password</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
