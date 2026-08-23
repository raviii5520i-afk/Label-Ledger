"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIPlannerModal from "@/components/ai/AIPlannerModal";
import ScrollProgressBar from "@/components/landing/ScrollProgressBar";
import InteractiveWorldMap from "@/components/landing/InteractiveWorldMap";
import TravelRouteAnimation from "@/components/landing/TravelRouteAnimation";
import PlanJourneySteps from "@/components/landing/PlanJourneySteps";
import {
  MapPin,
  Calendar,
  PieChart,
  Sparkles,
  ArrowRight,
  Compass,
  Globe2,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const destinations = [
    {
      name: "Jaipur",
      country: "Rajasthan, India",
      tagline: "Forts, Palaces & Desert Culture",
      image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
      cost: "Mid-Range",
    },
    {
      name: "Goa",
      country: "Coastal West, India",
      tagline: "Beaches, Nightlife & Heritage",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      cost: "Budget",
    },
    {
      name: "Kerala",
      country: "South India",
      tagline: "Backwaters & Tea Plantations",
      image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      cost: "Comfort",
    },
    {
      name: "Himachal",
      country: "North India",
      tagline: "Mountains, Valleys & Adventure",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
      cost: "Budget",
    },
  ];

  // Motion variants with strict reduced motion support & cinematic easings
  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 25 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.15 : 0.55,
        delay: shouldReduceMotion ? 0 : customDelay,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-main relative selection:bg-primary/20">
      {/* Scroll Progress Bar at very top */}
      <ScrollProgressBar />

      {/* Persistent Navigation Header */}
      <Navbar onOpenAIPlanner={() => setIsAIModalOpen(true)} />

      {/* HERO SECTION — Cinematic Staggered Reveal */}
      <section className="relative min-h-[90vh] flex flex-col justify-center py-16 md:py-24 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden border-b border-border/40">
        {/* 0.0s Ambient background motion (particles / subtle glow) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[250px] bg-teal/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:48px_48px]" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          {/* 0.3s Badge & 0.6s Eyebrow */}
          <motion.div
            custom={0.3}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-sm hover:border-primary/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Multi-City Travel Planning</span>
          </motion.div>

          {/* 0.8s Headline Reveal by Lines */}
          <motion.div
            custom={0.6}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="space-y-2 max-w-4xl mx-auto"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-text-main tracking-tight leading-[1.1]">
              Plan less. <br />
              <span className="bg-gradient-to-r from-primary via-teal to-indigo bg-clip-text text-transparent">
                Travel more.
              </span>
            </h1>
          </motion.div>

          {/* 1.1s Supporting text */}
          <motion.p
            custom={0.9}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed"
          >
            Build personalized multi-city trips, manage budgets seamlessly, discover curated experiences, and let AI craft your dream itinerary.
          </motion.p>

          {/* 1.3s CTA Buttons with refined micro-interactions */}
          <motion.div
            custom={1.1}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/trips/create"
              className="w-full sm:w-auto px-8 py-3.5 rounded-control bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5"
            >
              Start Planning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-control bg-indigo-light text-indigo hover:bg-indigo/10 border border-indigo/20 font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-indigo" />
              Try AI Trip Planner
            </button>
          </motion.div>

          {/* 1.5s Ambient Visual: Interactive Global Flight Map */}
          <motion.div
            custom={1.3}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="pt-10 max-w-5xl mx-auto"
          >
            <InteractiveWorldMap />
          </motion.div>
        </div>
      </section>

      {/* TRAVEL ROUTE ANIMATION SECTION */}
      <TravelRouteAnimation />

      {/* HOW IT WORKS / 5-STEP JOURNEY SECTION */}
      <PlanJourneySteps />

      {/* POPULAR DESTINATIONS SECTION */}
      <section className="py-24 bg-surface/50 border-b border-border relative overflow-hidden" id="explore">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-light text-teal border border-teal/20 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />
                Trending Routes
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-4xl text-text-main tracking-tight">
                Popular Destinations
              </h2>
              <p className="text-sm text-text-muted">
                Explore top multi-city routes curated by seasoned explorers.
              </p>
            </motion.div>

            <Link
              href="/dashboard"
              className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5 group self-start md:self-auto"
            >
              View All Destinations
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Destination Cards Grid with Non-Layout-Shifting Transforms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: shouldReduceMotion ? 0.1 : 0.45,
                  delay: shouldReduceMotion ? 0 : i * 0.08,
                }}
                className="group rounded-card overflow-hidden bg-surface border border-border shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
              >
                {/* Image Frame - Square Aspect Ratio */}
                <div className="aspect-square relative overflow-hidden bg-text-main">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Subtle hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
                  
                  {/* Top Badge */}
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-surface/95 backdrop-blur-md text-text-main shadow-sm">
                    {dest.cost}
                  </span>

                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-[11px] font-medium opacity-90">{dest.country}</span>
                    <h3 className="font-display font-bold text-lg leading-tight">{dest.name}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-text-muted leading-relaxed">
                    {dest.tagline}
                  </p>

                  <Link
                    href="/trips/create"
                    className="w-full mt-2 py-2.5 rounded-control bg-primary/10 hover:bg-primary text-primary hover:text-white font-semibold text-xs transition-colors duration-200 flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>Plan Trip Here</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CINEMATIC CTA SECTION */}
      <section className="py-24 bg-gradient-to-b from-background via-surface to-background relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-md"
          >
            <Globe2 className="w-7 h-7" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-5xl text-text-main tracking-tight leading-tight"
          >
            Your next adventure is waiting.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-text-muted max-w-xl mx-auto"
          >
            Plan it with Globe Trotter. Connect routes, optimize budgets, and invite friends in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/trips/create"
              className="w-full sm:w-auto px-9 py-3.5 rounded-control bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-control bg-surface hover:bg-background border border-border text-text-main font-semibold text-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-indigo" />
              Generate with AI
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Interactive AI Planner Modal */}
      <AIPlannerModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
