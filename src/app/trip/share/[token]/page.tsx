"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIPlannerModal from "@/components/ai/AIPlannerModal";
import { Copy, Share2, Sparkles, Check, MapPin, Calendar, Compass, User } from "lucide-react";

export default function PublicTripSharePage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyTrip = () => {
    setCopied(true);
    setTimeout(() => {
      window.location.href = "/trips/1";
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAIPlanner={() => setIsAIModalOpen(true)} />

      {/* Hero Header */}
      <section className="relative py-16 bg-text-main text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80"
            alt="Rajasthan"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="px-2.5 py-0.5 rounded-full bg-teal text-white font-bold">Public Itinerary</span>
            <span>Created by Aarav Sharma</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl max-w-3xl">
            Rajasthan Adventure — 5-Day Cultural & Heritage Tour
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-gray-300 pt-2 border-t border-gray-700">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> 10 Oct – 15 Oct (5 Days)</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-teal" /> 4 Cities (Delhi, Jaipur, Jodhpur, Udaipur)</span>
            <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-indigo" /> Est. Budget: ₹17,500 (~$210 USD)</span>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Read-Only Public Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-card bg-surface border border-border shadow-card space-y-4">
              <h3 className="font-display font-bold text-lg text-text-main border-b border-border pb-3">
                Day-by-Day Journey
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-primary">DAY 1 — JAIPUR</h4>
                  <div className="p-3 rounded-card bg-background border border-border text-xs space-y-1">
                    <div className="font-semibold text-text-main">09:00 AM — Amber Fort Tour</div>
                    <div className="text-text-muted">Sightseeing • 3 hrs duration • ₹500 entry</div>
                  </div>
                  <div className="p-3 rounded-card bg-background border border-border text-xs space-y-1">
                    <div className="font-semibold text-text-main">01:00 PM — Peacock Rooftop Lunch</div>
                    <div className="text-text-muted">Food & Dining • 1.5 hrs duration • ₹800</div>
                  </div>
                  <div className="p-3 rounded-card bg-background border border-border text-xs space-y-1">
                    <div className="font-semibold text-text-main">03:00 PM — City Palace Jaipur</div>
                    <div className="text-text-muted">Culture & History • 2.5 hrs duration • ₹600</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <h4 className="font-bold text-xs text-primary">DAY 2 — JAIPUR → JODHPUR</h4>
                  <div className="p-3 rounded-card bg-background border border-border text-xs space-y-1">
                    <div className="font-semibold text-text-main">09:30 AM — Hawa Mahal Visit</div>
                    <div className="text-text-muted">Sightseeing • 1.5 hrs duration • ₹200</div>
                  </div>
                  <div className="p-3 rounded-card bg-indigo-light/50 border border-indigo/20 text-xs space-y-1">
                    <div className="font-semibold text-indigo">12:00 PM — Scenic Bus Transit to Jodhpur</div>
                    <div className="text-text-muted">Transit • 5 hrs duration • ₹700</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Copy & Customize Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-card bg-surface border-2 border-primary shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                Copy & Customize This Trip
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Clone Aarav's exact itinerary into your own GlobeTrotter planner. Modify dates, swap activities, or adjust the budget for your group.
              </p>
              <button
                onClick={handleCopyTrip}
                className="w-full py-3 rounded-control bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Trip Copied to Your Account!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy this Trip
                  </>
                )}
              </button>
            </div>

            {/* Highlights Card */}
            <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-2 text-xs">
              <h4 className="font-bold text-text-main">Itinerary Highlights</h4>
              <ul className="space-y-1 text-text-muted">
                <li>✓ 6 Historic Monuments</li>
                <li>✓ 4 Authentic Food Experiences</li>
                <li>✓ 1 Scenic Transit Route</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AIPlannerModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
}
