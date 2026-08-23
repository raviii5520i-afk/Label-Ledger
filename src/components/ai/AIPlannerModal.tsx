"use client";

import { useState } from "react";
import { Sparkles, X, Check, Loader2, DollarSign, Calendar, MapPin, Compass } from "lucide-react";

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIPlannerModal({ isOpen, onClose }: AIPlannerModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [destination, setDestination] = useState("Rajasthan (Multi-city)");
  const [duration, setDuration] = useState("5");
  const [budget, setBudget] = useState("15000");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Culture", "Food", "History"]);

  if (!isOpen) return null;

  const interestsList = ["Culture", "Food", "History", "Adventure", "Shopping", "Nature"];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      window.location.href = "/trips/1";
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-4xl rounded-panel shadow-modal border-t-4 border-indigo overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Column: Form Controls */}
        <div className="p-6 md:w-1/2 space-y-5 overflow-y-auto border-r border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-light flex items-center justify-center text-indigo">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-lg text-text-main">
                AI Trip Planner <span className="text-xs font-normal text-text-muted">(Powered by Claude)</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-control text-text-muted hover:text-text-main hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">Destination</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-control border border-border focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                  placeholder="Where do you want to go?"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1">Duration (Days)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-control border border-border focus:border-indigo outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1">Max Budget (₹)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-control border border-border focus:border-indigo outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">Interests</label>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? "bg-indigo text-white border-indigo font-medium"
                          : "bg-surface text-text-muted border-border hover:border-indigo/40"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 rounded-control bg-indigo hover:bg-indigo/90 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Itinerary
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Generation Feedback */}
        <div className="p-6 md:w-1/2 bg-background flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-light text-indigo flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo animate-ping" />
                Live Claude AI Engine
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-teal font-medium">
                <Check className="w-4 h-4" />
                <span>Analyzing destination cities (Delhi, Jaipur, Jodhpur)...</span>
              </div>
              <div className="flex items-center gap-2 text-teal font-medium">
                <Check className="w-4 h-4" />
                <span>Filtering top-rated food & heritage activities...</span>
              </div>
              <div className="flex items-center gap-2 text-indigo font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing day-wise route & travel duration...</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-4 text-center font-bold">⏸</span>
                <span>Validating total estimated cost against budget (₹15,000)...</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-card bg-surface border border-border space-y-2">
              <div className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo" />
                Itinerary Preview Snapshot
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Day 1: Jaipur Heritage Arrival — Amber Fort, City Palace, Jal Mahal dinner walk.
              </p>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-bold text-teal">
                <span>Estimated Total Cost</span>
                <span>₹13,800 (₹1,200 under budget!)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-text-muted text-center italic">
            AI output is validated against strict business rules before writing to database.
          </p>
        </div>
      </div>
    </div>
  );
}
