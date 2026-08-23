"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIPlannerModal from "@/components/ai/AIPlannerModal";
import { Plus, Sparkles, Calendar, MapPin, CheckCircle, Share2, Compass, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAIPlanner={() => setIsAIModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-card">
          <div>
            <h1 className="font-display font-bold text-2xl text-text-main">
              Welcome back, Traveller 👋
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Plan your next adventure or continue organizing ongoing trips.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/trips/create"
              className="px-5 py-2.5 rounded-control bg-primary hover:bg-primary-hover text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Plan a New Trip
            </Link>
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-5 py-2.5 rounded-control bg-indigo-light text-indigo hover:bg-indigo/10 border border-indigo/20 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              AI Trip Planner
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-card bg-surface border border-border shadow-card">
            <span className="text-xs text-text-muted font-medium">Total Trips</span>
            <div className="text-2xl font-bold font-display text-text-main mt-1">3</div>
          </div>
          <div className="p-4 rounded-card bg-surface border border-border shadow-card">
            <span className="text-xs text-text-muted font-medium">Upcoming Trips</span>
            <div className="text-2xl font-bold font-display text-primary mt-1">1</div>
          </div>
          <div className="p-4 rounded-card bg-surface border border-border shadow-card">
            <span className="text-xs text-text-muted font-medium">Cities Visited</span>
            <div className="text-2xl font-bold font-display text-teal mt-1">7</div>
          </div>
          <div className="p-4 rounded-card bg-surface border border-border shadow-card">
            <span className="text-xs text-text-muted font-medium">Total Budget Saved</span>
            <div className="text-2xl font-bold font-display text-indigo mt-1">₹5,400</div>
          </div>
        </div>

        {/* Featured Upcoming Trip (Hero Focus) */}
        <div className="rounded-card bg-surface border border-border shadow-card overflow-hidden">
          <div className="h-48 sm:h-64 relative">
            <img
              src="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80"
              alt="Rajasthan"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-text-main/80 via-transparent to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal text-white">Upcoming</span>
                  <span className="text-xs text-gray-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> 10 Oct – 15 Oct
                  </span>
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl">Rajasthan Adventure</h2>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium text-text-main">4 Cities:</span>
                <span>Delhi → Jaipur → Jodhpur → Udaipur</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Compass className="w-4 h-4 text-teal" />
                <span className="font-medium text-text-main">12 Activities Planned</span>
              </div>
            </div>

            {/* Budget Bar */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-main">Budget Status</span>
                <span className="text-teal font-bold">₹17,500 spent / ₹20,000 budget (₹2,500 left)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                <div className="h-full bg-teal rounded-full" style={{ width: "87.5%" }} />
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/trips/1"
                className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors"
              >
                Continue Planning
              </Link>
              <Link
                href="/trips/1/budget"
                className="px-4 py-2 rounded-control bg-background border border-border hover:border-primary text-text-main font-medium text-xs transition-colors"
              >
                View Budget Intelligence
              </Link>
              <Link
                href="/trip/share/abc123"
                className="px-4 py-2 rounded-control bg-background border border-border hover:border-primary text-text-muted hover:text-text-main font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share Trip
              </Link>
            </div>
          </div>
        </div>

        {/* Two Column Section: Recent Trips + AI Suggestion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Trips Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display font-bold text-lg text-text-main">Recent & Draft Trips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-card bg-surface border border-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-text-muted">Completed</span>
                  <span className="text-xs text-text-muted">3 Days</span>
                </div>
                <h4 className="font-display font-bold text-base text-text-main">Goa Weekend Getaway</h4>
                <p className="text-xs text-text-muted">Budget: ₹12,000</p>
                <Link href="/trips/1" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  View Itinerary <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-card bg-surface border border-border shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-light text-indigo">Draft</span>
                  <span className="text-xs text-text-muted">6 Days</span>
                </div>
                <h4 className="font-display font-bold text-base text-text-main">Kerala Tea Gardens</h4>
                <p className="text-xs text-text-muted">Budget: ₹25,000</p>
                <Link href="/trips/1" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  Continue Planning <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* AI Suggestion Sidebar Card */}
          <div className="p-5 rounded-card bg-indigo-light/40 border border-indigo/20 space-y-4">
            <div className="flex items-center gap-2 text-indigo font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              AI Route Recommendation
            </div>
            <p className="text-xs text-text-main leading-relaxed">
              We noticed Day 3 in your Rajasthan trip is busy! Let AI optimize your travel route between Jaipur and Jodhpur to save 2 hours.
            </p>
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="w-full py-2 rounded-control bg-indigo text-white font-semibold text-xs shadow-sm hover:bg-indigo/90 transition-colors"
            >
              Optimize Day 3 Route
            </button>
          </div>
        </div>
      </main>

      <Footer />
      <AIPlannerModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
}
