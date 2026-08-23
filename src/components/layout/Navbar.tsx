"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Compass, Sparkles, Bell, User, LogOut, ChevronDown } from "lucide-react";

interface NavbarProps {
  onOpenAIPlanner?: () => void;
}

export default function Navbar({ onOpenAIPlanner }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/trips/create", label: "My Trips" },
    { href: "#explore", label: "Explore" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-surface/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-surface/80 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-text-main">
            Globe<span className="text-primary">Trotter</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive ? "text-primary font-semibold" : "text-text-muted hover:text-text-main"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {onOpenAIPlanner && (
            <button
              onClick={onOpenAIPlanner}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-control bg-indigo-light text-indigo border border-indigo/20 hover:bg-indigo/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Planner
            </button>
          )}

          <button className="p-2 rounded-control text-text-muted hover:text-text-main hover:bg-background transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal" />
          </button>

          {isMounted && isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full border border-border hover:border-primary/40 transition-colors bg-surface"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium text-text-main hidden lg:inline">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-text-muted hidden lg:inline" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-card border border-border bg-surface shadow-modal py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-bold text-text-main truncate">{user.name}</p>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-text-main hover:bg-background transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>

                  <Link
                    href="/trips/create"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-text-main hover:bg-background transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    My Trips
                  </Link>

                  <div className="border-t border-border my-1.5" />

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors px-2 py-1.5"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold px-3 py-1.5 rounded-control bg-primary hover:bg-primary-hover text-white transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

