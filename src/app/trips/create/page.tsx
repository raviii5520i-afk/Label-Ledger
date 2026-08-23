"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIPlannerModal from "@/components/ai/AIPlannerModal";
import { Search, Plus, Trash2, GripVertical, Check, Sparkles, MapPin } from "lucide-react";

export default function CreateTripWizardPage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stops, setStops] = useState([
    { id: "1", city: "Delhi, India", arrival: "10 Oct", departure: "11 Oct", days: 1 },
    { id: "2", city: "Jaipur, Rajasthan", arrival: "11 Oct", departure: "13 Oct", days: 2 },
    { id: "3", city: "Jodhpur, Rajasthan", arrival: "13 Oct", departure: "15 Oct", days: 2 },
  ]);

  const addSuggestion = (cityName: string) => {
    const newStop = {
      id: Date.now().toString(),
      city: `${cityName}, India`,
      arrival: "15 Oct",
      departure: "16 Oct",
      days: 1,
    };
    setStops([...stops, newStop]);
  };

  const removeStop = (id: string) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAIPlanner={() => setIsAIModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-text-muted space-x-1">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-text-main font-semibold">Create New Trip</span>
          </div>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-control border border-border hover:bg-background text-text-muted">
            Save as Draft
          </button>
        </div>

        {/* 6-Step Progress Bar Stepper */}
        <div className="bg-surface p-4 rounded-card border border-border shadow-card overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] text-xs">
            <div className="flex items-center gap-2 text-teal font-semibold">
              <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-[10px]">✓</div>
              <span>1. Basic Info</span>
            </div>
            <div className="h-0.5 w-12 bg-teal" />

            <div className="flex items-center gap-2 text-teal font-semibold">
              <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-[10px]">✓</div>
              <span>2. Dates</span>
            </div>
            <div className="h-0.5 w-12 bg-primary" />

            <div className="flex items-center gap-2 text-primary font-bold">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">3</div>
              <span>3. Destinations</span>
            </div>
            <div className="h-0.5 w-12 bg-border" />

            <div className="flex items-center gap-2 text-text-muted">
              <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px]">4</div>
              <span>4. Budget</span>
            </div>
            <div className="h-0.5 w-12 bg-border" />

            <div className="flex items-center gap-2 text-text-muted">
              <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px]">5</div>
              <span>5. Preferences</span>
            </div>
            <div className="h-0.5 w-12 bg-border" />

            <div className="flex items-center gap-2 text-text-muted">
              <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[10px]">6</div>
              <span>6. Summary</span>
            </div>
          </div>
        </div>

        {/* Wizard Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area (2 Columns) */}
          <div className="lg:col-span-2 bg-surface p-6 rounded-card border border-border shadow-card space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-text-main">
                Step 3 of 6: Choose Your Destinations
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Add the cities you plan to visit on this trip and arrange your travel order.
              </p>
            </div>

            {/* City Search Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, country, or region (e.g., Jaipur, Rajasthan, India)"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-control border border-border focus:border-primary outline-none"
                />
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-text-muted">Quick add:</span>
                {["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer"].map((city) => (
                  <button
                    key={city}
                    onClick={() => addSuggestion(city)}
                    className="px-2.5 py-1 rounded-full bg-background border border-border hover:border-primary/50 text-text-main font-medium transition-colors"
                  >
                    + Add {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordered Stop List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-text-main uppercase tracking-wider">
                Selected Destinations ({stops.length})
              </h3>

              <div className="space-y-2">
                {stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-3.5 rounded-card bg-background border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                      <div>
                        <div className="font-semibold text-xs text-text-main flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                            {index + 1}
                          </span>
                          {stop.city}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {stop.arrival} – {stop.departure} ({stop.days} Day{stop.days > 1 ? "s" : ""})
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="p-1 text-text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button className="px-4 py-2 rounded-control border border-border text-text-muted hover:text-text-main text-xs font-medium">
                Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-4 py-2 rounded-control bg-indigo-light text-indigo hover:bg-indigo/10 border border-indigo/20 font-semibold text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate with AI
                </button>
                <Link
                  href="/trips/1"
                  className="px-5 py-2 rounded-control bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-sm transition-colors"
                >
                  Continue to Step 4: Budget →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Trip Summary Preview */}
          <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-4 h-fit">
            <h3 className="font-display font-bold text-sm text-text-main border-b border-border pb-3">
              Trip Preview Summary
            </h3>
            <div className="h-32 rounded-control overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80"
                alt="Rajasthan"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 text-[10px] bg-text-main/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                Cover Photo
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Trip Title:</span>
                <span className="font-semibold text-text-main">Rajasthan Adventure</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Days:</span>
                <span className="font-semibold text-text-main">5 Days (10 Oct – 15 Oct)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Destinations:</span>
                <span className="font-semibold text-text-main">{stops.length} Cities</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Est. Travel Distance:</span>
                <span className="font-semibold text-teal">620 km</span>
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
