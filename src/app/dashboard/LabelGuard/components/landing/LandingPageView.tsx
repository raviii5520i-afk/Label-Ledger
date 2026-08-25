// Label Ledger — Landing Page Coordinator View Component (SaaS/GovTech Design)
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Cpu, Layers, Activity, FileText, CheckCircle2, XCircle, AlertTriangle,
  ArrowRight, Sparkles, Lock, RefreshCw, FileCode, Check, HelpCircle, ArrowUpRight,
  TrendingUp, BarChart2, Package, Globe, Tag, Calendar, User, Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ClauseTag } from '../ui/Badge';
import { SplashScreen } from '../SplashScreen';
import { useLanguage } from '../../i18n/LanguageProvider';
import { LanguageSelector } from '../../i18n/LanguageSelector';

interface LandingPageViewProps {
  isAuthenticated: boolean;
}

export function LandingPageView({ isAuthenticated }: LandingPageViewProps) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [selectedDemoTab, setSelectedDemoTab] = useState<'scan' | 'dashboard'>('scan');

  // Telemetry animation sequence states
  const [scanStep, setScanStep] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Monitor prefers-reduced-motion and drive the animation loop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setScanStep(4);
      return;
    }

    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 5);
    }, 4500); // 4.5s cycle for clear readability of each state
    return () => clearInterval(interval);
  }, []);

  // Automatic cycle for How it Works steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Section 2 / Phase 2 Pipeline Animation States
  const pipelineRef = useRef<HTMLDivElement>(null);
  const [pipelineVisible, setPipelineVisible] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineTrigger, setPipelineTrigger] = useState(0);

  // Monitor intersection for compliance pipeline
  useEffect(() => {
    const currentRef = pipelineRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPipelineVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // Run sequential simulation for compliance pipeline
  useEffect(() => {
    if (!pipelineVisible) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPipelineStep(3);
      return;
    }

    setPipelineStep(0);
    const t1 = setTimeout(() => setPipelineStep(1), 1600); // SCAN sweeps & coordinates map
    const t2 = setTimeout(() => setPipelineStep(2), 3600); // EXTRACT populates values
    const t3 = setTimeout(() => setPipelineStep(3), 5600); // EVALUATE runs checks & verdict stamps

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pipelineVisible, pipelineTrigger]);

  const handleReRunSimulation = () => {
    setPipelineTrigger((prev) => prev + 1);
  };

  const actionUrl = isAuthenticated ? '/dashboard/LabelGuard/scan' : '/dashboard/LabelGuard/login';
  const dashboardUrl = isAuthenticated ? '/dashboard/LabelGuard/dashboard' : '/dashboard/LabelGuard/login';

  return (
    <div className="ll-root min-h-screen bg-[#F7F7F2] text-[#111827] overflow-x-hidden selection:bg-[#EAF4DE]">
      <SplashScreen />
      {/* Navigation Header */}
      <header className="no-print sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5DF] transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/LabelGuard" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-[#4F8F1F] flex items-center justify-center shadow-md shadow-[#4F8F1F]/20">
              <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-wide text-[#111827]">LabelGuard</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#666666]">
            <a href="#how-it-works" className="hover:text-[#4F8F1F] transition-colors">{t('landing.nav.howItWorks')}</a>
            <a href="#features" className="hover:text-[#4F8F1F] transition-colors">{t('landing.nav.features')}</a>
            <a href="#showcase" className="hover:text-[#4F8F1F] transition-colors">{t('landing.nav.demo')}</a>
            <a href="#security" className="hover:text-[#4F8F1F] transition-colors">{t('landing.nav.security')}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            {isAuthenticated ? (
              <Link href="/dashboard/LabelGuard/dashboard">
                <Button className="font-bold hover:-translate-y-0.5 transition-transform" variant="secondary" size="sm" leftIcon={<BarChart2 className="w-3.5 h-3.5" />}>
                  {t('landing.buttons.controlRoom')}
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard/LabelGuard/login">
                <Button className="font-bold hover:-translate-y-0.5 transition-transform" variant="ghost" size="sm">
                  {t('landing.buttons.inspectorSignIn')}
                </Button>
              </Link>
            )}
            <Link href={actionUrl}>
              <Button className="font-bold bg-[#4F8F1F] hover:bg-[#3f7318] text-white hover:-translate-y-0.5 transition-transform shadow-lg shadow-[#4F8F1F]/20" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {isAuthenticated ? t('landing.buttons.startScan') : t('landing.buttons.getAccess')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1 — HERO */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 border-b border-[#E5E5DF] overflow-hidden bg-[#F7F7F2]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF4DE] border border-[#4F8F1F]/20 text-[11px] font-bold text-[#4F8F1F] tracking-wide uppercase shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('landing.badge')}
            </div>
            
            <style>{`
              @keyframes heroWordFadeSlide {
                0% { opacity: 0; transform: translateY(25px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              .hero-word {
                opacity: 0;
                animation: heroWordFadeSlide 750ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
              }
            `}</style>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#111827] tracking-tight leading-[1.05] flex flex-wrap gap-x-3 gap-y-1">
              {t('landing.title').split(' ').map((word, i) => {
                const isHighlight = word.toLowerCase().includes('compliance') || word.toLowerCase().includes('decisions');
                return (
                  <span 
                    key={i}
                    className={cn(
                      "inline-block hero-word",
                      isHighlight ? "text-[#4F8F1F]" : "text-[#111827]"
                    )}
                    style={{ animationDelay: `${i * 300}ms` }}
                  >
                    {word}
                  </span>
                )
              })}
            </h1>
            
            <p className="text-sm md:text-base text-[#666666] max-w-lg leading-relaxed pt-2">
              {t('landing.subtitle')}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={actionUrl}>
                <Button className="font-bold bg-[#4F8F1F] hover:bg-[#3f7318] text-white hover:-translate-y-1 transition-transform shadow-xl shadow-[#4F8F1F]/20 px-8 h-12" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {t('landing.buttons.startInspection')}
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button className="font-bold bg-white text-[#111827] border border-[#E5E5DF] hover:border-[#111827] hover:-translate-y-1 transition-all h-12 px-8" size="lg">
                  {t('landing.buttons.explorePlatform')}
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Visual: Verification Workbench */}
          <div className="lg:col-span-6 w-full relative">
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-[#4F8F1F]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative border border-[#E5E5DF] bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E5DF]">
                <h3 className="text-[10px] font-mono text-[#666666] uppercase tracking-widest font-bold flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5" />
                  VERIFICATION WORKBENCH
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-500/20 text-[9px] font-bold text-emerald-600 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REPORT READY
                </div>
              </div>

              <div className="space-y-6">
                {/* Product Summary */}
                <div>
                  <h4 className="text-xl font-bold text-[#111827]">OAT FORCE</h4>
                  <p className="text-sm font-medium text-[#666666] mt-0.5">Premium Rolled Oats</p>
                  <p className="text-xs text-[#8A8A84] mt-2">100% Whole Grain Oats</p>
                </div>

                {/* Extracted Data Grid */}
                <div className="grid grid-cols-2 gap-4 bg-[#F7F7F2] p-4 rounded-xl border border-[#E5E5DF]">
                  <div>
                    <p className="text-[10px] font-bold text-[#8A8A84] uppercase tracking-wider mb-1">MRP</p>
                    <p className="text-sm font-bold text-[#111827]">₹45.00</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#8A8A84] uppercase tracking-wider mb-1">Net Qty</p>
                    <p className="text-sm font-bold text-[#111827]">150g</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-[#8A8A84] uppercase tracking-wider mb-1">Pack Date</p>
                    <p className="text-sm font-bold text-[#111827]">Aug 2026</p>
                  </div>
                </div>

                {/* Rule Evaluation */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#666666]">Rule 6(1)(d) — Max retail price</span>
                    <span className="font-bold text-[#4F8F1F] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Compliant</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#666666]">Rule 6(1)(c) — Net quantity</span>
                    <span className="font-bold text-[#4F8F1F] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Compliant</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-4 border-b border-[#E5E5DF]">
                    <span className="font-semibold text-[#666666]">Rule 6(1)(f) — Customer care</span>
                    <span className="font-bold text-amber-500 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Review</span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-[#111827]">Attention required</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2.5 py-1 rounded uppercase tracking-wider">Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — FEATURE STRIP */}
      <section className="no-print bg-white border-b border-[#E5E5DF] py-6 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[#111827]">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide">
            <Cpu className="w-4 h-4 text-[#4F8F1F] shrink-0" />
            <span>AI-Powered OCR</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#4F8F1F] shrink-0" />
            <span>Legal Metrology Rule 6</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide">
            <Lock className="w-4 h-4 text-[#4F8F1F] shrink-0" />
            <span>Secure evidence storage</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide">
            <Layers className="w-4 h-4 text-[#4F8F1F] shrink-0" />
            <span>Role-based verification</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide">
            <FileText className="w-4 h-4 text-[#4F8F1F] shrink-0" />
            <span>Audit-ready reports</span>
          </div>
        </div>
      </section>

      {/* SECTION 4 — HOW LABELGUARD WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-[#E5E5DF]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-[#4F8F1F] uppercase tracking-widest font-semibold">End-to-End Workflow</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#142B4A] tracking-tight">How LabelGuard Works</h2>
            <p className="text-xs md:text-sm text-[#8A8A84]">
              The automated metrology audit pipeline from original upload to archived regulatory sign-off.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left pt-6 max-w-5xl mx-auto relative">
            <WorkflowStep num="01" title="Scan Label" desc="Upload the commodity image. The image is saved under private Supabase storage protection." active={activeStep === 0} />
            <WorkflowStep num="02" title="Extract Text" desc="OCR localizes declaration coordinates and reads values with confidence indicators." active={activeStep === 1} />
            <WorkflowStep num="03" title="Evaluate Rules" desc="Rule 6 checks automatically inspect mandatory fields (MRP, Net Qty, Best Before)." active={activeStep === 2} />
            <WorkflowStep num="04" title="Verify Actions" desc="Inspectors make edits and submit. Authorized officers verify decisions on-screen." active={activeStep === 3} />
            <WorkflowStep num="05" title="Generate Report" desc="Finalized compliance reports archive evidence, corrections, and logs." active={activeStep === 4} />
          </div>
        </div>
      </section>

      {/* SECTION 5 — FEATURES SECTION */}
      <section id="features" className="py-20 md:py-28 border-b border-[#E5E5DF] bg-[#F7F7F3]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-[#4F8F1F] uppercase tracking-widest font-semibold">RegTech Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#142B4A] tracking-tight">Core Platform Features</h2>
            <p className="text-xs md:text-sm text-[#8A8A84]">
              Designed around regulatory rigor, security standards, and operational clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
            <FeatureCard
              icon={<Cpu className="w-5 h-5 text-[#4F8F1F]" />}
              title="AI OCR Scanning Engine"
              desc="Extracts text and maps spatial bounding box coordinates directly from packaged commodity label photos."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-5 h-5 text-[#4F8F1F]" />}
              title="Rule 6 Compliance Logic"
              desc="Validates mandatory declarations (MRP, weight, manufacturing details) against Metrology Rules."
            />
            <FeatureCard
              icon={<Lock className="w-5 h-5 text-[#4F8F1F]" />}
              title="Strict Private Storage"
              desc="Uses PostgreSQL Row Level Security (RLS) policies and authenticated signed URLs to protect evidence."
            />
            <FeatureCard
              icon={<Layers className="w-5 h-5 text-[#4F8F1F]" />}
              title="Human Verification Loop"
              desc="Empowers authorized verification officers to review, correct, override, and sign off compliance status."
            />
            <FeatureCard
              icon={<Activity className="w-5 h-5 text-[#4F8F1F]" />}
              title="Operational Dashboard"
              desc="Provides active review statistics, trends, and compliance rates derived from live Supabase inspections."
            />
            <FeatureCard
              icon={<FileText className="w-5 h-5 text-[#4F8F1F]" />}
              title="Audit-Ready Reports"
              desc="Compiles evidence, checklist results, metadata corrections, and action history into clean reports."
            />
          </div>
        </div>
      </section>

      {/* SECTION 6 — PRODUCT SHOWCASE (Interactive Review Interface Showcase) */}
      <section id="showcase" className="py-20 md:py-28 border-b border-[#E5E5DF]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-[#4F8F1F] uppercase tracking-widest font-semibold">Interactive Product Showcase</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#142B4A] tracking-tight">Inspect the Verification Workbench</h2>
            <p className="text-xs md:text-sm text-[#8A8A84]">
              Interactive demo of the LabelGuard interface. Select fields to simulate label scanning highlights.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-white border border-[#E5E5DF] rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 text-left grid grid-cols-1 lg:grid-cols-12">
            {/* Showcase Visual preview */}
            <div className="lg:col-span-6 p-6 border-b lg:border-b-0 lg:border-r border-[#E5E5DF] bg-[#F7F7F3]/60 flex flex-col justify-between h-96 relative">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(42,48,87,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(42,48,87,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-between text-xs text-[#8A8A84] border-b border-[#E5E5DF] pb-3">
                <span className="font-mono">INSP_ID: #404468...</span>
                <span className="font-mono bg-[#EAF4DE] border border-[#4F8F1F]/30 text-[#142B4A] px-2 py-0.5 rounded">
                  DEMO ACTIVE
                </span>
              </div>

              {/* Simulated Image with Bounding Boxes */}
              <div className="relative flex-1 flex items-center justify-center p-4">
                <div className="relative border border-[#E5E5DF] bg-white p-6 rounded-xl w-72 text-center space-y-4">
                  {/* Bounding box highlights controlled by clicked items */}
                  <div className={cn(
                    'absolute inset-x-4 top-4 h-6 border rounded transition-all duration-200 pointer-events-none',
                    highlightedField === 'name' ? 'border-[#4F8F1F] bg-indigo-500/10 scale-105' : 'border-[#E5E5DF] opacity-40'
                  )} />
                  <div className={cn(
                    'absolute inset-x-4 top-14 h-6 border rounded transition-all duration-200 pointer-events-none',
                    highlightedField === 'mrp' ? 'border-[#4F8F1F] bg-indigo-500/10 scale-105' : 'border-[#E5E5DF] opacity-40'
                  )} />
                  <div className={cn(
                    'absolute inset-x-4 top-24 h-6 border rounded transition-all duration-200 pointer-events-none',
                    highlightedField === 'qty' ? 'border-[#4F8F1F] bg-indigo-500/10 scale-105' : 'border-[#E5E5DF] opacity-40'
                  )} />

                  <p className="text-xs font-mono text-[#142B4A] font-semibold uppercase">Potato Chips Premium</p>
                  <p className="text-[10px] font-mono text-[#666666]">MRP: Rs. 60.00 (Incl. of all taxes)</p>
                  <p className="text-[10px] font-mono text-[#666666]">Net Quantity: 100 g</p>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-1.5 text-[10px] text-[#8A8A84]">
                <InfoCircle className="w-3.5 h-3.5" />
                <span>Select fields on the right to simulate bounding box overlay highlight.</span>
              </div>
            </div>

            {/* Showcase Control panel */}
            <div className="lg:col-span-6 p-6 space-y-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-widest mb-4">Extracted Declarations</p>
                
                <div className="space-y-3">
                  <ShowcaseRow
                    label="Rule 6(1)(a) - Commodity Name"
                    val="Potato Chips Premium"
                    conf={94}
                    isSelected={highlightedField === 'name'}
                    onClick={() => setHighlightedField(highlightedField === 'name' ? null : 'name')}
                  />
                  <ShowcaseRow
                    label="Rule 6(1)(d) - Maximum Retail Price"
                    val="Rs 60.00"
                    conf={89}
                    isSelected={highlightedField === 'mrp'}
                    onClick={() => setHighlightedField(highlightedField === 'mrp' ? null : 'mrp')}
                  />
                  <ShowcaseRow
                    label="Rule 6(1)(c) - Net Quantity"
                    val="100 g"
                    conf={97}
                    isSelected={highlightedField === 'qty'}
                    onClick={() => setHighlightedField(highlightedField === 'qty' ? null : 'qty')}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5DF] flex items-center justify-between text-xs">
                <div>
                  <p className="text-[#666666]">Status Check</p>
                  <p className="text-emerald-400 font-semibold mt-0.5">COMPLIANT OVERVIEW</p>
                </div>
                <Link href={actionUrl}>
                  <Button className="font-semibold" variant="primary" size="sm">
                    Open Scan Workbench
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 — SECURITY SECTION */}
      <section id="security" className="py-20 md:py-28 border-b border-[#E5E5DF] bg-[#F7F7F3]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-mono text-[#4F8F1F] uppercase tracking-widest font-semibold">GovTech Security Integrity</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#142B4A] tracking-tight">Compliance Data Should Be Protected.</h2>
            <p className="text-sm text-[#666666] leading-relaxed">
              LabelGuard protects inspection evidence using isolated database policies and cryptographic access constraints. Sensitive data remains strictly secure.
            </p>
            
            <div className="space-y-4">
              <SecurityFeature title="PostgreSQL Row Level Security (RLS)" desc="Ensures that district inspectors can only view and modify records belonging to their authorized jurisdictions." />
              <SecurityFeature title="Private Storage Buckets" desc="Evidence images are stored in protected storage. Direct public file URLs are completely blocked." />
              <SecurityFeature title="Cryptographic Signed URLs" desc="Files are fetched via temporary, time-restricted signed links generated on mount." />
              <SecurityFeature title="Append-Only Verification Logs" desc="Verification decisions write irreversible logs, creating a solid audit history for metrology departments." />
            </div>
          </div>

          {/* Security Visual */}
          <div className="lg:col-span-6">
            <div className="border border-[#E5E5DF] bg-white rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(42,48,87,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(42,48,87,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#E5E5DF] mb-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#4F8F1F]" />
                  <span className="text-xs font-semibold text-[#142B4A]">Evidence Vault Architecture</span>
                </div>
                <span className="text-[10px] font-mono text-[#4F8F1F] bg-[#EAF4DE] border border-[#4F8F1F]/30 px-2 py-0.5 rounded">SSL / AES-256</span>
              </div>

              {/* Architecture chart representation */}
              <div className="relative space-y-4 z-10 font-mono text-[10px] text-[#666666]">
                <div className="p-3 bg-white border border-[#4F8F1F]/30 rounded-lg flex items-center justify-between">
                  <span>Inspector Request</span>
                  <span className="text-emerald-400">Bearer Authenticated</span>
                </div>
                <div className="flex justify-center my-1 text-[#666666]">↓</div>
                <div className="p-3 bg-[#F7F7F3] border border-[#E5E5DF] rounded-lg">
                  <p className="font-semibold text-[#142B4A] mb-1">Supabase Row Level Security (RLS)</p>
                  <p className="text-[9px] text-[#8A8A84] font-sans">SELECT WHERE inspector_id = auth.uid()</p>
                </div>
                <div className="flex justify-center my-1 text-[#666666]">↓</div>
                <div className="p-3 bg-white border border-emerald-500/30 rounded-lg flex items-center justify-between">
                  <span>Cryptographic Signed URL</span>
                  <span className="text-emerald-400 font-semibold">Expires in 60s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11 — LEGAL METROLOGY RULES */}
      <section className="py-20 md:py-28 border-b border-[#E5E5DF]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-[#4F8F1F] uppercase tracking-widest font-semibold">Regulatory Framework</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#142B4A] tracking-tight">Built Around Legal Metrology Compliance.</h2>
            <p className="text-xs md:text-sm text-[#8A8A84] leading-relaxed">
              India&apos;s Legal Metrology (Packaged Commodities) Rules, 2011 mandate specific declarations on pre-packaged goods to protect consumer interests. LabelGuard helps automate checking these rules.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <RuleCard clause="Rule 6(1)(a)" label="Commodity Identity" desc="Generic name or description of the commodity inside." />
            <RuleCard clause="Rule 6(1)(b)" label="Packer / Importer" desc="Street address and details of packer or manufacturer." />
            <RuleCard clause="Rule 6(1)(c)" label="Net Quantity" desc="Net quantity in standard unit of weight or measure." />
            <RuleCard clause="Rule 6(1)(d)" label="MRP Statement" desc="Maximum retail price inclusive of all taxes." />
            <RuleCard clause="Rule 6(1)(e)" label="Mfg / Import Month" desc="Month and year of manufacture or packaging." />
            <RuleCard clause="Rule 6(1)(f)" label="Consumer Care" desc="Contact details for customer care/grievance." />
            <RuleCard clause="Rule 6(1)(g)" label="Country of Origin" desc="Country of manufacture for imported commodities." />
            <RuleCard clause="Rule 18(1)" label="Verification" desc="Standard quantity validation against guidelines." />
          </div>

          <div className="max-w-2xl mx-auto bg-[#EAF4DE] border border-[#4F8F1F]/30 rounded-xl p-4 text-left text-xs text-[#142B4A] leading-relaxed flex items-start gap-3">
            <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#4F8F1F]" />
            <span>
              <strong>Disclaimer:</strong> LabelGuard acts as an assistive tool for inspection, OCR data parsing, and metrology audit workflow automation. Regulatory and final compliance decisions remain with authorized government personnel.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 12 — DASHBOARD PREVIEW */}
      <section className="py-20 md:py-28 border-b border-[#E5E5DF] bg-[#F7F7F3]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-mono text-[#4F8F1F] uppercase tracking-widest font-semibold">Active Dashboards</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#142B4A] tracking-tight">Supervise District Inspection Activity</h2>
            <p className="text-xs md:text-sm text-[#8A8A84]">
              Track compliance rates, violations, and pending verification queues across your territory.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-white border border-[#E5E5DF] rounded-2xl p-6 shadow-xl shadow-slate-200/50 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-4">
              <span className="text-xs font-semibold text-[#142B4A] font-mono">Enforcement Overview (Demo)</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-100 border border-emerald-800/30 px-2 py-0.5 rounded">SYSTEM HEALTHY</span>
            </div>

            {/* KPI Cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DemoKpi label="Total Inspections" value={142} trend="+12% this month" />
              <DemoKpi label="Compliance Rate" value="84%" trend="On target" />
              <DemoKpi label="Pending Reviews" value={7} trend="Require action" />
              <DemoKpi label="Violations Found" value={23} trend="-3% compared to July" />
            </div>

            {/* Inspection list preview */}
            <div className="border border-[#E5E5DF] bg-[#F7F7F3] rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-[#E5E5DF] bg-slate-100 font-mono text-[#8A8A84] text-[10px] uppercase">
                <span>Product Name</span>
                <span>Date</span>
                <span>Violations</span>
                <span>Verification</span>
              </div>
              <div className="divide-y divide-[#E5E5DF] font-mono text-[#142B4A]">
                <div className="grid grid-cols-4 gap-2 px-4 py-3">
                  <span>BRITANNIA MARIE GOLD</span>
                  <span>24 Aug 2026</span>
                  <span className="text-emerald-400">0</span>
                  <span className="text-emerald-400 font-semibold">VERIFIED COMPLIANT</span>
                </div>
                <div className="grid grid-cols-4 gap-2 px-4 py-3">
                  <span>HALDIRAM BHUJA 250G</span>
                  <span>23 Aug 2026</span>
                  <span className="text-red-400">1 (Rule 6(1)(d))</span>
                  <span className="text-red-400 font-semibold">VERIFIED NON-COMPLIANT</span>
                </div>
                <div className="grid grid-cols-4 gap-2 px-4 py-3">
                  <span>LAYS SALTED MAX</span>
                  <span>22 Aug 2026</span>
                  <span className="text-amber-400">Rule 6(1)(a)</span>
                  <span className="text-amber-400 font-semibold">PENDING OFFICER REVIEW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13 — CTA SECTION */}
      <section className="py-20 md:py-28 border-b border-[#E5E5DF] bg-radial-glow relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-semibold text-[#142B4A] tracking-tight leading-tight">
            Make Every Inspection Smarter.
          </h2>
          <p className="text-sm md:text-base text-[#666666] max-w-xl mx-auto">
            Scan. Verify. Document. Protect. Automate Metrology checkups immediately.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Link href={actionUrl}>
              <Button className="font-semibold" variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start an Inspection
              </Button>
            </Link>
            <Link href={dashboardUrl}>
              <Button className="font-semibold" variant="secondary" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="no-print bg-[#F7F7F3] border-t border-[#E5E5DF] py-12 text-[#8A8A84] text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#4F8F1F]" />
              <span className="text-sm font-semibold text-[#142B4A] tracking-widest uppercase">LabelGuard</span>
            </div>
            <p className="text-[#8A8A84] max-w-xs leading-relaxed">
              AI-powered packaged commodity compliance inspection and evidence storage platform under Legal Metrology guidelines.
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">Platform</p>
            <ul className="space-y-2">
              <li><Link href={actionUrl} className="hover:text-[#4F8F1F]">Scan Label</Link></li>
              <li><Link href={dashboardUrl} className="hover:text-[#4F8F1F]">Compliance Dashboard</Link></li>
              <li><Link href="/dashboard/LabelGuard/repository" className="hover:text-[#4F8F1F]">Inspections Repository</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">How It Works</p>
            <ul className="space-y-2">
              <li><a href="#how-it-works" className="hover:text-[#4F8F1F]">5-Step Pipeline</a></li>
              <li><a href="#features" className="hover:text-[#4F8F1F]">Features</a></li>
              <li><a href="#showcase" className="hover:text-[#4F8F1F]">Showcase</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">Security</p>
            <ul className="space-y-2">
              <li><a href="#security" className="hover:text-[#4F8F1F]">RLS Policies</a></li>
              <li><a href="#security" className="hover:text-[#4F8F1F]">Signed URLs</a></li>
              <li><a href="#security" className="hover:text-[#4F8F1F]">Encryption</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">System</p>
            <ul className="space-y-2">
              <li><span className="text-[#666666] block">Version 1.0.0</span></li>
              <li><span className="text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-[#E5E5DF] text-center text-[#666666]">
          <p>© 2026 LabelGuard. All rights reserved. Assistive GovTech RegTech compliance toolkit.</p>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HELPERS & SUB-COMPONENTS
   ───────────────────────────────────────────────────────────── */

function ComparisonStep({ num, text, type }: { num: string; text: string; type: 'before' | 'after' }) {
  return (
    <div className="flex gap-3 items-start">
      <span className={cn(
        'font-mono text-xs px-1.5 py-0.5 rounded border text-center shrink-0 w-8',
        type === 'before' ? 'bg-red-950/20 border-red-900/30 text-red-400' : 'bg-indigo-950/30 border-indigo-800/30 text-[#4F8F1F]'
      )}>
        {num}
      </span>
      <p className="text-xs text-[#142B4A] mt-0.5 leading-normal">{text}</p>
    </div>
  );
}

function WorkflowStep({ num, title, desc, active }: { num: string; title: string; desc: string; active: boolean }) {
  return (
    <div className={cn(
      'border rounded-2xl p-5 space-y-3 transition-all duration-300 relative',
      active
        ? 'bg-white border-[#4F8F1F] shadow-lg ring-1 ring-[#4F8F1F]/20 scale-[1.02]'
        : 'bg-white/40 border-[#E5E5DF] opacity-60'
    )}>
      <span className="text-xs font-mono text-[#4F8F1F] font-semibold">{num}</span>
      <h3 className="text-sm font-semibold text-[#142B4A]">{title}</h3>
      <p className="text-xs text-[#666666] leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border border-[#E5E5DF] bg-white rounded-2xl p-6 space-y-4 hover:border-[#4F8F1F]/40 hover:bg-slate-50 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#E5E5DF] flex items-center justify-center group-hover:border-[#4F8F1F]/30 group-hover:bg-[#EAF4DE] transition-colors">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#142B4A]">{title}</h3>
      <p className="text-xs text-[#666666] leading-relaxed">{desc}</p>
    </div>
  );
}

function ShowcaseRow({
  label, val, conf, isSelected, onClick
}: {
  label: string;
  val: string;
  conf: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 border rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3',
        isSelected
          ? 'bg-[#EAF4DE] border-[#4F8F1F] shadow-md'
          : 'bg-white border-[#E5E5DF] hover:border-slate-600'
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] text-[#8A8A84] font-semibold">{label}</p>
        <p className="text-xs font-semibold text-[#142B4A] font-mono mt-0.5 truncate">{val}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-[#8A8A84]">Confidence</p>
        <p className="text-xs font-semibold text-emerald-400 font-mono mt-0.5">{conf}%</p>
      </div>
    </div>
  );
}

function SecurityFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
      <div>
        <h4 className="text-xs font-semibold text-[#142B4A]">{title}</h4>
        <p className="text-xs text-[#8A8A84] leading-normal mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function RuleCard({ clause, label, desc }: { clause: string; label: string; desc: string }) {
  return (
    <div className="border border-[#E5E5DF] bg-white/40 rounded-xl p-4 space-y-2">
      <ClauseTag>{clause}</ClauseTag>
      <h4 className="text-xs font-semibold text-[#142B4A] leading-snug">{label}</h4>
      <p className="text-[11px] text-[#8A8A84] leading-normal">{desc}</p>
    </div>
  );
}

function DemoKpi({ label, value, trend }: { label: string; value: string | number; trend: string }) {
  return (
    <div className="border border-[#E5E5DF] bg-[#F7F7F3] rounded-xl p-4">
      <p className="text-[10px] text-[#8A8A84] uppercase font-semibold">{label}</p>
      <p className="text-2xl font-semibold text-[#142B4A] mt-1 font-mono">{value}</p>
      <p className="text-[10px] text-[#8A8A84] mt-1">{trend}</p>
    </div>
  );
}

function InfoCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  );
}
