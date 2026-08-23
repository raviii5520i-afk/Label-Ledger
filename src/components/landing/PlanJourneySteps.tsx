"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Compass,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: typeof MapPin;
  accent: "primary" | "teal" | "indigo";
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Choose Destinations",
    description:
      "Select multiple cities or entire regions. Drag and re-order legs with instant distance and transit calculations.",
    icon: MapPin,
    accent: "primary",
  },
  {
    number: "02",
    title: "Plan Your Trip",
    description:
      "Set your calendar dates, preferred travel pace (relaxed vs. fast-paced), and target budget limits.",
    icon: Calendar,
    accent: "teal",
  },
  {
    number: "03",
    title: "Discover Places",
    description:
      "Access AI-curated sights, top culinary experiences, hidden local gems, and verified traveler reviews.",
    icon: Compass,
    accent: "indigo",
  },
  {
    number: "04",
    title: "Build Itinerary",
    description:
      "Organize activities day-by-day with timeline, calendar, and map views. Collaborate with travel companions in real-time.",
    icon: FileText,
    accent: "primary",
  },
  {
    number: "05",
    title: "Start Exploring",
    description:
      "Sync your offline itinerary, track expenses live on the go, and share interactive trip journals with 1 click.",
    icon: Sparkles,
    accent: "teal",
  },
];

export default function PlanJourneySteps() {
  const [activeStep, setActiveStep] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const getAccentStyles = (accent: Step["accent"], isActive: boolean) => {
    switch (accent) {
      case "teal":
        return {
          bg: isActive ? "bg-teal text-white" : "bg-teal-light text-teal",
          border: isActive ? "border-teal" : "border-teal/20",
          glow: "group-hover:border-teal/50",
        };
      case "indigo":
        return {
          bg: isActive ? "bg-indigo text-white" : "bg-indigo-light text-indigo",
          border: isActive ? "border-indigo" : "border-indigo/20",
          glow: "group-hover:border-indigo/50",
        };
      case "primary":
      default:
        return {
          bg: isActive ? "bg-primary text-white" : "bg-primary-light text-primary",
          border: isActive ? "border-primary" : "border-primary/20",
          glow: "group-hover:border-primary/50",
        };
    }
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Intelligent Workflow
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-text-main tracking-tight">
            Plan Your Journey in 5 Simple Steps
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            From initial inspiration to boarding your flight, GlobeTrotter streamlines every phase of multi-city travel.
          </p>
        </div>

        {/* 5-Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            const style = getAccentStyles(step.accent, isActive);

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: shouldReduceMotion ? 0.1 : 0.45,
                  delay: shouldReduceMotion ? 0 : idx * 0.08,
                  ease: "easeOut",
                }}
                onMouseEnter={() => setActiveStep(idx)}
                onClick={() => setActiveStep(idx)}
                className={`relative p-5 rounded-card bg-surface border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isActive
                    ? "border-primary shadow-lg ring-2 ring-primary/10"
                    : "border-border hover:border-primary/40 shadow-card hover:shadow-md"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar with Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-display font-extrabold text-2xl text-text-muted/40 group-hover:text-primary transition-colors">
                      {step.number}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-panel flex items-center justify-center transition-all ${style.bg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Step Title & Details */}
                  <div>
                    <h3 className="font-display font-bold text-base text-text-main group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed mt-2">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Status indicator badge */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-[11px] font-semibold">
                  <span className={isActive ? "text-primary font-bold" : "text-text-muted"}>
                    {isActive ? "Active Step" : "Step " + (idx + 1)}
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isActive
                        ? "text-primary translate-x-1"
                        : "text-text-muted opacity-40 group-hover:translate-x-0.5 group-hover:opacity-100"
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action CTA underneath steps */}
        <div className="mt-12 text-center">
          <Link
            href="/trips/create"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-control bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all group"
          >
            Start Building Your Trip
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
