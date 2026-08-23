"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plane, Compass, Sparkles } from "lucide-react";

interface CityNode {
  name: string;
  country: string;
  x: number; // percentage in viewbox 0-1000
  y: number; // percentage in viewbox 0-500
  labelPosition?: "top" | "bottom" | "left" | "right";
}

const DESTINATIONS: CityNode[] = [
  { name: "New York", country: "USA", x: 250, y: 175, labelPosition: "top" },
  { name: "London", country: "UK", x: 470, y: 140, labelPosition: "top" },
  { name: "Paris", country: "France", x: 495, y: 165, labelPosition: "bottom" },
  { name: "Dubai", country: "UAE", x: 610, y: 225, labelPosition: "bottom" },
  { name: "New Delhi", country: "India", x: 685, y: 235, labelPosition: "bottom" },
  { name: "Tokyo", country: "Japan", x: 845, y: 185, labelPosition: "top" },
];

const FLIGHT_PATHS = [
  { from: 0, to: 1, curvature: -40 }, // NY -> London
  { from: 1, to: 2, curvature: 15 },  // London -> Paris
  { from: 2, to: 3, curvature: -30 }, // Paris -> Dubai
  { from: 3, to: 4, curvature: 25 },  // Dubai -> Delhi
  { from: 4, to: 5, curvature: -45 }, // Delhi -> Tokyo
  { from: 5, to: 0, curvature: -70 }, // Tokyo -> NY (transpacific loop)
];

export default function InteractiveWorldMap() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activeCity, setActiveCity] = useState<string | null>("New Delhi");
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Generate SVG path string with smooth bezier curve
  const generateArcPath = (from: CityNode, to: CityNode, curvature: number) => {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 + curvature;
    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full rounded-panel overflow-hidden bg-gradient-to-b from-text-main via-[#0f172a] to-text-main text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/10"
    >
      {/* Ambient background glow & grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(2,132,199,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header Info Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-light text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-primary-light" />
            Global Route Intelligence
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
            Seamless Multi-City Connections
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
            <span>Active Global Routes</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>Multi-Stop Sync</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Layer with Parallax */}
      <motion.div
        animate={
          shouldReduceMotion || isTouchDevice
            ? { x: 0, y: 0 }
            : { x: mouseOffset.x, y: mouseOffset.y }
        }
        transition={{ type: "spring", stiffness: 75, damping: 20 }}
        className="relative w-full aspect-[16/9] sm:aspect-[2/1] max-h-[460px] select-none"
      >
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="flightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#0D9488" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stylized continent abstract dots/polygons */}
          <g opacity="0.22" fill="currentColor" className="text-gray-400">
            {/* North America */}
            <circle cx="230" cy="140" r="14" />
            <circle cx="270" cy="150" r="18" />
            <circle cx="220" cy="180" r="16" />
            <circle cx="250" cy="200" r="12" />
            <circle cx="300" cy="180" r="15" />
            <circle cx="280" cy="230" r="10" />

            {/* South America */}
            <circle cx="330" cy="320" r="16" />
            <circle cx="350" cy="360" r="20" />
            <circle cx="360" cy="410" r="14" />

            {/* Europe */}
            <circle cx="480" cy="140" r="12" />
            <circle cx="510" cy="130" r="14" />
            <circle cx="490" cy="170" r="15" />
            <circle cx="530" cy="160" r="16" />

            {/* Africa */}
            <circle cx="510" cy="240" r="18" />
            <circle cx="540" cy="280" r="22" />
            <circle cx="530" cy="340" r="18" />
            <circle cx="560" cy="370" r="15" />

            {/* Asia */}
            <circle cx="640" cy="150" r="22" />
            <circle cx="700" cy="140" r="26" />
            <circle cx="760" cy="160" r="22" />
            <circle cx="680" cy="220" r="24" />
            <circle cx="730" cy="230" r="20" />
            <circle cx="820" cy="190" r="18" />
            <circle cx="770" cy="280" r="16" />

            {/* Oceania */}
            <circle cx="830" cy="360" r="18" />
            <circle cx="870" cy="380" r="16" />
          </g>

          {/* Connecting Flight Arcs */}
          {FLIGHT_PATHS.map((path, idx) => {
            const fromCity = DESTINATIONS[path.from];
            const toCity = DESTINATIONS[path.to];
            const d = generateArcPath(fromCity, toCity, path.curvature);

            return (
              <g key={idx}>
                {/* Background faint path */}
                <path
                  d={d}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  fill="none"
                />

                {/* Animated glowing arc */}
                <path
                  d={d}
                  stroke="url(#flightGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  fill="none"
                  strokeDasharray="8 12"
                  className={shouldReduceMotion ? "" : "animate-[dash_12s_linear_infinite]"}
                  style={{
                    animationDirection: idx % 2 === 0 ? "normal" : "reverse",
                  }}
                />
              </g>
            );
          })}

          {/* City Nodes */}
          {DESTINATIONS.map((city) => {
            const isActive = activeCity === city.name;
            return (
              <g
                key={city.name}
                className="cursor-pointer group"
                onClick={() => setActiveCity(city.name)}
                onMouseEnter={() => setActiveCity(city.name)}
              >
                {/* Pulsing Radar Ring */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isActive ? 14 : 9}
                  className={`${
                    isActive ? "fill-primary/20 stroke-primary" : "fill-teal/10 stroke-teal/40"
                  } stroke-[1.5] transition-all duration-300 ${
                    shouldReduceMotion ? "" : "animate-ping origin-center"
                  }`}
                  style={{ animationDuration: "3s" }}
                />

                {/* Core Hub Dot */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isActive ? 4.5 : 3.5}
                  className={`${
                    isActive
                      ? "fill-white stroke-primary stroke-[2.5]"
                      : "fill-white stroke-teal stroke-[1.5]"
                  } transition-all duration-200 group-hover:scale-125`}
                />

                {/* City Label Badge */}
                <g
                  transform={`translate(${city.x}, ${
                    city.labelPosition === "top" ? city.y - 14 : city.y + 18
                  })`}
                  className="transition-all duration-200"
                >
                  <rect
                    x="-34"
                    y="-10"
                    width="68"
                    height="18"
                    rx="9"
                    className={`${
                      isActive
                        ? "fill-primary text-white"
                        : "fill-black/60 group-hover:fill-black/80 text-gray-300"
                    } backdrop-blur-md transition-colors`}
                  />
                  <text
                    x="0"
                    y="2"
                    textAnchor="middle"
                    className="text-[9px] font-semibold fill-current tracking-wide pointer-events-none select-none"
                  >
                    {city.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Dynamic City Tooltip / Quick Stats */}
        {activeCity && (
          <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 bg-surface/95 backdrop-blur-md border border-border p-3 sm:p-4 rounded-card shadow-modal max-w-[240px] text-text-main transition-all animate-fade-in">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Selected Hub
              </span>
              <span className="text-[10px] text-text-muted">Direct AI Sync</span>
            </div>
            <div className="font-display font-bold text-sm text-text-main flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-teal" />
              {activeCity}
            </div>
            <p className="text-[11px] text-text-muted mt-1 leading-snug">
              Connected across 6 global continents with automated multi-leg routing.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
