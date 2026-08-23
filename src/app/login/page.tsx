"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { signIn } from "@/lib/supabase/auth";
import { getCurrentProfile } from "@/lib/supabase/profiles";

export default function LoginPage() {
  const router = useRouter();
  const { clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    clearError();
  }, [clearError]);

  if (!isMounted) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    clearError();

    if (!email) {
      setValidationError("Email address is required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setValidationError("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn({ email, password });
      if (res.error) {
        const msg = res.error.message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
          setValidationError("Invalid email or password. Please check your credentials.");
        } else if (msg.includes("email not confirmed")) {
          setValidationError("Please verify your email address before signing in.");
        } else {
          setValidationError(res.error.message || "Authentication failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Fetch user profile & role safely from database
      await getCurrentProfile();

      setIsLoading(false);
      router.push("/dashboard/LabelGuard/scan");
    } catch (err: unknown) {
      setIsLoading(false);
      setValidationError("An unexpected network error occurred. Please try again.");
    }
  };

  const displayError = validationError;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-heading font-bold text-xl text-text-main tracking-tight">GlobeTrotter</span>
        </Link>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-text-muted">
          Sign in to access your trips, itineraries, and saved places
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-surface py-8 px-4 sm:px-10 shadow-xl border border-border rounded-card space-y-6">
          {displayError && (
            <div className="p-3.5 rounded-control bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {displayError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-text-main">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-control border border-border bg-surface text-text-main placeholder-text-muted text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-text-main">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-control border border-border bg-surface text-text-main placeholder-text-muted text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 bg-surface cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-text-muted select-none cursor-pointer">
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-control bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Direct Sign Up Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-text-muted">Don't have an account? </span>
            <Link href="/signup" className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
