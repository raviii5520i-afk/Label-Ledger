"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, authError, clearError } = useAuthStore();

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
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      // Error is stored in Zustand authError and also thrown here
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side: Premium branding & image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-text-main overflow-hidden select-none">
        {/* Background Image with custom overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
            alt="Beautiful beach scenery"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-text-main via-text-main/50 to-primary/30 mix-blend-multiply" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2.5 self-start group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">
              Globe<span className="text-primary">Trotter</span>
            </span>
          </Link>

          <div className="space-y-6 max-w-lg mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-semibold text-primary-light">
              <Sparkles className="w-3.5 h-3.5" />
              Discover Your Next Horizon
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight tracking-tight">
              Plan less. <br />
              Travel more.
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed font-light">
              Build personalized multi-city trips, manage budgets seamlessly, and organize your dream itineraries with intelligent planning tools.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-6">
            <span>© 2026 GlobeTrotter Inc.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 md:px-20 py-12 relative overflow-hidden">
        {/* Subtle background glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md space-y-8 z-10">
          {/* Logo visible only on mobile */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <Link href="/" className="flex lg:hidden items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-text-main">
                Globe<span className="text-primary">Trotter</span>
              </span>
            </Link>
            <div className="text-center lg:text-left">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-main tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1.5">
                Sign in to your account to resume your travel plans.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {displayError && (
              <div className="p-3.5 rounded-control bg-red-50 border border-red-200 text-red-600 text-xs font-medium animate-shake">
                {displayError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-text-main">
                Email Address
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

          {/* Social Logins */}
          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative px-3.5 bg-background text-[10px] uppercase font-bold tracking-wider text-text-muted">
                or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    // Try to log in with a default demo credential if they want quick testing
                    await login("aarav@example.com", "password123");
                    router.push("/dashboard");
                  } catch (e: any) {
                    setValidationError("Social authentication simulation failed. Please use email/password.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-control border border-border bg-surface hover:bg-background text-text-main text-xs font-semibold shadow-sm transition-all"
              >
                {/* SVG for Google */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.68 14.93 1 12 1 7.35 1 3.39 3.65 1.45 7.5l3.8 2.95C6.18 7.35 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.54z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.25 10.45c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.45 2.9C.53 4.75 0 6.82 0 9s.53 4.25 1.45 6.1l3.8-2.95z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.13 0-5.82-2.31-6.76-5.41L1.45 15.9C3.39 19.75 7.35 22.3 12 23z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await login("aarav@example.com", "password123");
                    router.push("/dashboard");
                  } catch (e: any) {
                    setValidationError("Social authentication simulation failed. Please use email/password.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-control border border-border bg-surface hover:bg-background text-text-main text-xs font-semibold shadow-sm transition-all"
              >
                {/* SVG for Apple */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.64.73-1.2 1.88-1.05 2.99 1.12.09 2.27-.58 3-1.44z" />
                </svg>
                Apple
              </button>
            </div>
          </div>

          {/* Direct Sign Up Link */}
          <div className="text-center">
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
