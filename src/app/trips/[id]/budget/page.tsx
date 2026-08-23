"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIPlannerModal from "@/components/ai/AIPlannerModal";
import { AlertTriangle, Plus, Sparkles, CheckCircle2, Clock } from "lucide-react";

export default function BudgetIntelligencePage() {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const expenses = [
    { id: "1", date: "11 Oct", category: "Accommodation", desc: "Hotel Heritage Jaipur", amount: 3200, status: "Verified" },
    { id: "2", date: "11 Oct", category: "Transport", desc: "Express Train Delhi → Jaipur", amount: 850, status: "Verified" },
    { id: "3", date: "12 Oct", category: "Activities", desc: "Amber Fort Entry & Guide", amount: 500, status: "Estimated" },
    { id: "4", date: "13 Oct", category: "Food", desc: "Chokhi Dhani Traditional Dinner", amount: 1200, status: "Estimated" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenAIPlanner={() => setIsAIModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Subheader & Breadcrumbs */}
        <div className="space-y-1">
          <div className="text-xs text-text-muted space-x-1">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <span>&gt;</span>
            <Link href="/trips/1" className="hover:underline">Rajasthan Adventure</Link>
            <span>&gt;</span>
            <span className="text-text-main font-semibold">Budget Intelligence</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-text-main">
            Budget Intelligence & Expense Analytics
          </h1>
        </div>

        {/* Over-Budget Alert Banner */}
        <div className="p-4 rounded-card bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-900 font-medium">
              Day 3 in Jodhpur is approaching your daily limit (₹4,800 estimated). Consider adjusting accommodation or high-cost activities.
            </p>
          </div>
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="px-4 py-2 rounded-control bg-indigo-light text-indigo hover:bg-indigo/10 border border-indigo/20 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Optimize Expenses with AI
          </button>
        </div>

        {/* Top 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-card bg-surface border border-border shadow-card space-y-1">
            <span className="text-xs text-text-muted">Total Trip Budget</span>
            <div className="text-2xl font-extrabold font-display text-text-main">₹20,000</div>
          </div>

          <div className="p-4 rounded-card bg-surface border border-border shadow-card space-y-1">
            <span className="text-xs text-text-muted">Estimated Expenses</span>
            <div className="text-2xl font-extrabold font-display text-text-main">₹17,500</div>
          </div>

          <div className="p-4 rounded-card bg-surface border border-border shadow-card space-y-1">
            <span className="text-xs text-text-muted">Remaining Surplus</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold font-display text-teal">₹2,500</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal">+12.5%</span>
            </div>
          </div>

          <div className="p-4 rounded-card bg-surface border border-border shadow-card space-y-1">
            <span className="text-xs text-text-muted">Daily Avg Spending</span>
            <div className="text-2xl font-extrabold font-display text-text-main">₹3,500 <span className="text-xs font-normal text-text-muted">/ day</span></div>
          </div>
        </div>

        {/* Main 2-Column Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Visual Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Breakdown Mock */}
            <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-4">
              <h3 className="font-display font-bold text-sm text-text-main">Expense Breakdown by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3 rounded-card bg-background border border-border space-y-1">
                  <span className="text-[11px] text-text-muted">Accommodations</span>
                  <div className="font-bold text-sm text-text-main">₹8,000 (45%)</div>
                </div>
                <div className="p-3 rounded-card bg-background border border-border space-y-1">
                  <span className="text-[11px] text-text-muted">Transport</span>
                  <div className="font-bold text-sm text-text-main">₹3,500 (20%)</div>
                </div>
                <div className="p-3 rounded-card bg-background border border-border space-y-1">
                  <span className="text-[11px] text-text-muted">Activities</span>
                  <div className="font-bold text-sm text-text-main">₹4,000 (23%)</div>
                </div>
                <div className="p-3 rounded-card bg-background border border-border space-y-1">
                  <span className="text-[11px] text-text-muted">Food</span>
                  <div className="font-bold text-sm text-text-main">₹2,000 (12%)</div>
                </div>
              </div>
            </div>

            {/* Daily Spending vs Cap */}
            <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-text-main">Daily Spending vs Target Cap (₹4,000)</h3>
                <span className="text-xs text-text-muted">5-Day Forecast</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { day: "Day 1 (Jaipur)", amount: 3100, isOver: false },
                  { day: "Day 2 (Jaipur)", amount: 2800, isOver: false },
                  { day: "Day 3 (Jodhpur)", amount: 4800, isOver: true },
                  { day: "Day 4 (Jodhpur)", amount: 3400, isOver: false },
                  { day: "Day 5 (Udaipur)", amount: 3400, isOver: false },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-text-main">{item.day}</span>
                      <span className={item.isOver ? "text-amber-600 font-bold" : "text-teal"}>
                        ₹{item.amount} {item.isOver && "(Over Cap!)"}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.isOver ? "bg-amber-500" : "bg-teal"}`}
                        style={{ width: `${(item.amount / 5000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Log Expense Form & Table */}
          <div className="space-y-6">
            <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-4">
              <h3 className="font-display font-bold text-sm text-text-main">+ Log New Expense</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Category</label>
                  <select className="w-full p-2 text-xs rounded-control border border-border outline-none bg-surface">
                    <option>Accommodation</option>
                    <option>Transport</option>
                    <option>Activities</option>
                    <option>Food</option>
                    <option>Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Description</label>
                  <input type="text" placeholder="e.g. Hotel Jaipur" className="w-full p-2 text-xs rounded-control border border-border outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Amount (₹)</label>
                  <input type="number" placeholder="2500" className="w-full p-2 text-xs rounded-control border border-border outline-none" />
                </div>
                <button type="button" className="w-full py-2.5 rounded-control bg-primary text-white font-semibold text-xs shadow-sm hover:bg-primary-hover transition-colors">
                  Add Expense
                </button>
              </form>
            </div>

            {/* Recent Expenses Log Table */}
            <div className="p-5 rounded-card bg-surface border border-border shadow-card space-y-3">
              <h3 className="font-display font-bold text-sm text-text-main">Recent Expenses</h3>
              <div className="space-y-2 text-xs">
                {expenses.map((exp) => (
                  <div key={exp.id} className="p-2.5 rounded-card bg-background border border-border flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text-main">{exp.desc}</div>
                      <div className="text-[10px] text-text-muted">{exp.date} • {exp.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-text-main">₹{exp.amount}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${exp.status === "Verified" ? "bg-teal-light text-teal" : "bg-gray-200 text-text-muted"}`}>
                        {exp.status}
                      </span>
                    </div>
                  </div>
                ))}
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
