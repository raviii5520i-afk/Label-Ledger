"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Plane, MapPin, Calendar, Clock } from "lucide-react";

interface Stop {
  city: string;
  country: string;
  duration: string;
  highlight: string;
  costTier: string;
}

const STOPS: Stop[] = [
  {
    city: "Delhi",
    country: "NCR, India",
    duration: "Day 1–2",
    highlight: "Historic Forts, Qutub Minar & Food Walks",
    costTier: "₹2,500/day",
  },
  {
    city: "Jaipur",
    country: "Rajasthan, India",
    duration: "Day 3–4",
    highlight: "Hawa Mahal, Amber Fort & Royal Bazaars",
    costTier: "₹3,200/day",
  },
  {
    city: "Udaipur",
    country: "Rajasthan, India",
    duration: "Day 5–6",
    highlight: "Lake Pichola, City Palace & Sunsets",
    costTier: "₹4,000/day",
  },
  {
    city: "Goa",
    country: "Coastal West, India",
    duration: "Day 7–9",
    highlight: "Beaches, Portuguese Heritage & Nightlife",
    costTier: "₹3,800/day",
  },
  {
    city: "Kerala",
    country: "South India",
    duration: "Day 10–12",
    highlight: "Tea Gardens, Houseboats & Ayurvedic Spas",
    costTier: "₹3,500/day",
  },
];

export default function TravelRouteAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 35%"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const planeProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-20 bg-surface border-y border-border relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-light text-teal border border-teal/20 text-xs font-semibold">
            <Plane className="w-3.5 h-3.5" />
            Live Route Simulation
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-text-main tracking-tight">
            How a Multi-City Journey Connects
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Watch your route assemble dynamically. GlobeTrotter links flights, transfers, and daily itineraries automatically.
          </p>
        </div>

        {/* Dynamic Route Timeline (Desktop Horizontal & Mobile Vertical) */}
        <div className="relative">
          {/* Desktop Timeline Bar */}
          <div className="hidden md:block relative mb-12">
            {/* Base line */}
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-border -translate-y-1/2 rounded-full" />

            {/* Scroll-animated connecting line */}
            <motion.div
              style={{
                scaleX: shouldReduceMotion ? 1 : pathLength,
                transformOrigin: "left",
              }}
              className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-primary via-teal to-indigo -translate-y-1/2 rounded-full shadow-sm"
            />

            {/* Traveling Flight Marker */}
            {!shouldReduceMotion && (
              <motion.div
                style={{
                  left: planeProgress,
                }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Plane className="w-4 h-4" />
              </motion.div>
            )}

            {/* Stops Grid */}
            <div className="grid grid-cols-5 gap-4 relative z-10">
              {STOPS.map((stop, index) => {
                return (
                  <motion.div
                    key={stop.city}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex flex-col items-center text-center space-y-3"
                  >
                    {/* Numbered Pin Badge */}
                    <div className="w-10 h-10 rounded-full bg-background border-2 border-primary text-primary font-display font-bold text-xs flex items-center justify-center shadow-card">
                      0{index + 1}
                    </div>

                    <div className="p-4 rounded-card bg-background border border-border hover:border-primary/40 shadow-card hover:shadow-lg transition-all w-full space-y-2">
                      <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-teal">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {stop.duration}
                        </span>
                        <span className="text-[10px] bg-teal/10 px-2 py-0.5 rounded-full">
                          {stop.costTier}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-text-main">
                        {stop.city}
                      </h4>
                      <p className="text-[11px] text-text-muted leading-tight">
                        {stop.highlight}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile Stack View */}
          <div className="md:hidden space-y-4 relative pl-6 border-l-2 border-primary/30 ml-2">
            {STOPS.map((stop, index) => (
              <motion.div
                key={stop.city}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative p-4 rounded-card bg-background border border-border shadow-card space-y-1.5"
              >
                <div className="absolute -left-[31px] top-4 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {index + 1}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display font-bold text-text-main">{stop.city}, {stop.country}</span>
                  <span className="text-teal font-semibold text-[11px]">{stop.duration}</span>
                </div>
                <p className="text-xs text-text-muted">{stop.highlight}</p>
                <span className="inline-block text-[10px] font-medium text-text-muted bg-surface px-2 py-0.5 rounded border border-border">
                  Avg {stop.costTier}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
