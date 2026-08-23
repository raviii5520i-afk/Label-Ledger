"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Compass, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { signUp } from "@/lib/supabase/auth";
import { getCurrentProfile } from "@/lib/supabase/profiles";

export default function SignupPage() {
  const router = useRouter();
  const { clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    clearError();
  }, [clearError]);

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-gray-200" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score, label: "Weak", color: "bg-red-500", textColor: "text-red-500" };
      case 2:
      case 3:
        return { score, label: "Medium", color: "bg-amber-500", textColor: "text-amber-500" };
      case 4:
        return { score, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500" };
      default:
        return { score: 0, label: "", color: "bg-gray-200" };
    }
  }, [password]);

  if (!isMounted) {
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    clearError();

    if (!name.trim()) {
      setValidationError("Full name is required.");
      return;
    }

    if (!email) {
      setValidationError("Email address is required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }

    if (passwordStrength.score < 2) {
      setValidationError("Please choose a stronger password (must contain a combination of letters, numbers, or symbols).");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setValidationError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUp({
        email,
        password,
        fullName: name,
      });

      if (res.error) {
        const msg = res.error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("user already exists")) {
          setValidationError("An account with this email address already exists. Please log in.");
        } else if (msg.includes("password")) {
          setValidationError("Password is too weak. Please choose a stronger password.");
        } else {
          setValidationError(res.error.message || "Signup failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Query profile and role after registration
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
          Create your account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-text-muted">
          Join thousands of travelers planning their dream journeys
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

          <form className="space-y-4" onSubmit={handleSignup} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-text-main">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-control border border-border bg-surface text-text-main placeholder-text-muted text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="text-xs font-semibold text-text-main">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-muted">Password Strength</span>
                    <span className={`font-bold ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-background rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-main">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-control border border-border bg-surface text-text-main placeholder-text-muted text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20 bg-surface cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-text-muted leading-relaxed cursor-pointer select-none">
                I agree to the{" "}
                <a href="#" className="font-semibold text-primary hover:text-primary-hover hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-primary hover:text-primary-hover hover:underline">
                  Privacy Policy
                </a>
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
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Direct Sign In Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-text-muted">Already have an account? </span>
            <Link href="/login" className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
