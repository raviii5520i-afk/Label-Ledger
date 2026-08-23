"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIPlannerModal from "@/components/ai/AIPlannerModal";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Plus,
  Share2,
  Sparkles,
  Edit2,
  GripVertical,
  MapPin,
  Utensils,
  Landmark,
  ShoppingBag,
  Bus,
} from "lucide-react";

export default function TripBuilderPage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");

  const day1Activities = [
    {
      time: "09:00 AM",
      title: "Amber Fort Exploration",
      category: "Sightseeing",
      duration: "3 hrs",
      cost: 500,
      icon: Landmark,
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=400&q=80",
    },
    {
      time: "01:00 PM",
      title: "Lunch at Peacock Rooftop Restaurant",
      category: "Food",
      duration: "1.5 hrs",
      cost: 800,
      icon: Utensils,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    },
    {
      time: "03:00 PM",
      title: "City Palace Jaipur Tour",
      category: "Culture & History",
      duration: "2.5 hrs",
      cost: 600,
      icon: Landmark,
      image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=400&q=80",
    },
    {
      time: "07:00 PM",
      title: "Local Street Food & Bazaar Walk",
      category: "Shopping & Food",
      duration: "2 hrs",
      cost: 400,
      icon: ShoppingBag,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAIPlanner={() => setIsAIModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Metadata Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-card">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-text-main">Rajasthan Adventure</h1>
              <button className="text-text-muted hover:text-primary transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-1">
              <span>📅 10 Oct – 15 Oct (5 Days)</span>
              <span>•</span>
              <span>📍 3 Cities (Delhi, Jaipur, Jodhpur)</span>
              <span>•</span>
              <span className="text-teal font-semibold">💰 Budget: ₹17,500 / ₹20,000</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Toggle */}
            <div className="flex p-1 rounded-control bg-background border border-border">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1 text-xs font-semibold rounded-control transition-colors ${
                  viewMode === "timeline" ? "bg-primary text-white" : "text-text-muted hover:text-text-main"
                }`}
              >
                Timeline View
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1 text-xs font-semibold rounded-control transition-colors ${
                  viewMode === "calendar" ? "bg-primary text-white" : "text-text-muted hover:text-text-main"
                }`}
              >
                Calendar View
              </button>
            </div>

            <Link
              href="/trip/share/abc123"
              className="px-3.5 py-1.5 rounded-control border border-border hover:border-primary text-xs font-semibold text-text-main flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Link>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-3.5 py-1.5 rounded-control bg-indigo-light text-indigo hover:bg-indigo/10 border border-indigo/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Optimize
            </button>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Itinerary Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day 1 Card */}
            <div className="bg-surface rounded-card border border-border shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display font-bold text-base text-text-main flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                  DAY 1 — JAIPUR • WED, 11 OCT
                </h3>
                <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Activity
                </button>
              </div>

              {/* Activity Timeline List */}
              <div className="space-y-3 pl-2">
                {day1Activities.map((act, index) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-card bg-background border border-border hover:border-primary/40 transition-all group"
                    >
                      <GripVertical className="w-4 h-4 text-text-muted cursor-grab mt-2" />
                      <div className="w-14 text-[11px] font-semibold text-text-muted mt-1">{act.time}</div>
                      <div className="w-12 h-12 rounded-control overflow-hidden flex-shrink-0">
                        <img src={act.image} alt={act.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-semibold text-xs text-text-main group-hover:text-primary transition-colors">
                          {act.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                          <span className="px-2 py-0.5 rounded-full bg-surface border border-border text-text-main font-medium flex items-center gap-1">
                            <Icon className="w-3 h-3 text-primary" />
                            {act.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {act.duration}
                          </span>
                          <span className="flex items-center gap-0.5 text-teal font-semibold">
                            ₹{act.cost}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day 2 Card */}
            <div className="bg-surface rounded-card border border-border shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display font-bold text-base text-text-main flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                  DAY 2 — JAIPUR → JODHPUR • THU, 12 OCT
                </h3>
                <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Activity
                </button>
              </div>

              <div className="space-y-3 pl-2">
                <div className="flex items-center gap-3 p-3 rounded-card bg-background border border-border">
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                  <div className="w-14 text-[11px] font-semibold text-text-muted">09:30 AM</div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-semibold text-xs text-text-main">Hawa Mahal Visit</h4>
                    <div className="text-[11px] text-text-muted">Sightseeing • 1.5 hrs • ₹200</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-card bg-indigo-light/50 border border-indigo/20">
                  <Bus className="w-4 h-4 text-indigo" />
                  <div className="w-14 text-[11px] font-semibold text-indigo">12:00 PM</div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="font-semibold text-xs text-indigo">Scenic Intercity Bus to Jodhpur</h4>
                    <div className="text-[11px] text-text-muted">Transit • 5 hrs duration • ₹700</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Intelligence Sidebar */}
          <div className="space-y-6">
            {/* Budget Summary Card */}
            <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display font-bold text-sm text-text-main">Budget Overview</h3>
                <Link href="/trips/1/budget" className="text-xs font-semibold text-primary hover:underline">
                  Full Analytics →
                </Link>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Budget:</span>
                  <span className="font-bold text-text-main">₹20,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Est. Expenses:</span>
                  <span className="font-bold text-text-main">₹17,500</span>
                </div>
                <div className="flex justify-between text-teal font-bold pt-1 border-t border-border">
                  <span>Remaining:</span>
                  <span>₹2,500 left</span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                <div className="h-full bg-teal rounded-full" style={{ width: "87.5%" }} />
              </div>
            </div>

            {/* AI Recommendation Assistant Card */}
            <div className="p-5 rounded-card bg-indigo-light/50 border border-indigo/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo">
                <Sparkles className="w-4 h-4" />
                AI Itinerary Assistant
              </div>
              <p className="text-xs text-text-main leading-relaxed">
                Day 1 has 4 activities packed tightly. Consider moving the Bazaar Walk to Day 2 evening to avoid fatigue.
              </p>
              <button
                onClick={() => setIsAIModalOpen(true)}
                className="w-full py-2 rounded-control bg-indigo text-white font-semibold text-xs shadow-sm hover:bg-indigo/90 transition-colors"
              >
                Apply AI Re-order
              </button>
            </div>

            {/* Quick Route Connector */}
            <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-3 text-xs">
              <h4 className="font-bold text-text-main">Route Sequence</h4>
              <div className="flex items-center justify-between text-text-muted">
                <span>Delhi (1d)</span>
                <span>→</span>
                <span className="text-primary font-bold">Jaipur (2d)</span>
                <span>→</span>
                <span>Jodhpur (2d)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <AIPlannerModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
}
