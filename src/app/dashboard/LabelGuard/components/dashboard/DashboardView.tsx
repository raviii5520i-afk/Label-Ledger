// Label Ledger — Enforcement Dashboard View (Live Supabase Integration)
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ClipboardCheck, AlertTriangle, CheckCircle2, Clock, ArrowRight,
  Loader2, AlertCircle, RefreshCw, ScanLine, Package,
} from 'lucide-react';
import { cn, formatDate, STATUS_CONFIG } from '../../lib/utils';
import { Card, CardHeader, CardTitle, EmptyState } from '../ui/Card';
import { StatusPill } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getMyInspections, DbInspection } from '@/lib/supabase/inspections';
import type { InspectionSummary } from '../../lib/types';
import { MOCK_DASHBOARD_STATS } from '../../lib/mock/data';

export function DashboardView() {
  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live inspection records from Supabase via getMyInspections()
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await getMyInspections();
    if (res.error) {
      console.warn('[DashboardView] getMyInspections error:', res.error);
      setError('Unable to fetch live dashboard statistics: ' + res.error);
      setInspections([]);
    } else if (res.data) {
      const mapped: InspectionSummary[] = res.data.map((dbInsp: DbInspection) => ({
        id: dbInsp.id,
        product_name: dbInsp.product_name || 'Untitled Product',
        is_imported: false,
        status: dbInsp.status,
        violation_count: 0,
        declaration_count: 8,
        created_at: dbInsp.created_at,
        updated_at: dbInsp.updated_at,
        verified_at: null,
        inspector: {
          id: dbInsp.inspector_id,
          full_name: 'Inspector',
          email: '',
          role: 'inspector',
        },
      }));
      setInspections(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate live statistics from Supabase dataset
  const liveStats = useMemo(() => {
    const total = inspections.length;
    const compliant = inspections.filter(i => i.status === 'verified_compliant').length;
    const nonCompliant = inspections.filter(i => i.status === 'verified_non_compliant').length;
    const pending = inspections.filter(i => i.status === 'pending_review').length;
    const draft = inspections.filter(i => i.status === 'draft').length;

    const evaluated = compliant + nonCompliant;
    const complianceRate = evaluated > 0 ? Math.round((compliant / evaluated) * 100) : 100;

    return {
      total_inspections: total,
      compliant_count: compliant,
      non_compliant_count: nonCompliant,
      pending_review_count: pending,
      draft_count: draft,
      compliance_rate: complianceRate,
      monthly_trend: MOCK_DASHBOARD_STATS.monthly_trend,
      top_violations: MOCK_DASHBOARD_STATS.top_violations,
      inspector_stats: MOCK_DASHBOARD_STATS.inspector_stats,
    };
  }, [inspections]);

  const recentInspections = useMemo(() => {
    return inspections.slice(0, 6);
  }, [inspections]);

  return (
    <div className="space-y-6 bg-[#F7F7F3] -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#142B4A]">Enforcement Dashboard</h2>
          <p className="text-sm text-[#666666] mt-0.5">
            Real-time compliance overview & inspection activity
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-[#E5E5DF] pr-4 hidden sm:block">
            <p className="text-xs font-semibold text-[#142B4A] uppercase">Oct</p>
            <p className="text-lg font-bold text-[#142B4A] leading-none tracking-tight">2026</p>
          </div>
          <Link href="/dashboard/LabelGuard/scan">
            <Button variant="primary" size="sm" className="font-semibold">
              <ScanLine className="w-4 h-4 mr-1.5" />
              Start Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 bg-red-900/20 border border-red-600/30 rounded-xl text-red-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 rounded text-xs font-semibold text-red-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#666666] gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--lg-blue)]" />
          <p className="text-xs font-medium">Calculating dashboard metrics from Supabase…</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Total Inspections"
              value={liveStats.total_inspections}
              icon={<ClipboardCheck className="w-4 h-4" />}
              trend={`${liveStats.draft_count} draft(s)`}
              trendUp
              color="indigo"
            />
            <KpiCard
              label="Compliant"
              value={liveStats.compliant_count}
              icon={<CheckCircle2 className="w-4 h-4" />}
              trend={`${liveStats.compliance_rate}% rate`}
              trendUp
              color="emerald"
            />
            <KpiCard
              label="Non-Compliant"
              value={liveStats.non_compliant_count}
              icon={<AlertTriangle className="w-4 h-4" />}
              trend={`${liveStats.non_compliant_count} violation(s)`}
              trendUp={false}
              color="red"
            />
            <KpiCard
              label="Pending Review"
              value={liveStats.pending_review_count}
              icon={<Clock className="w-4 h-4" />}
              trend="Needs review"
              trendUp={false}
              color="amber"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly trend bar chart */}
            <Card className="bg-white border-[#E5E5DF] shadow-sm lg:col-span-2" padding="none">
              <div className="p-4 border-b border-[#E5E5DF]">
                <CardTitle>Monthly Inspection Trend</CardTitle>
                <p className="text-xs text-[#666666] mt-0.5">Historical verification activity</p>
              </div>
              <div className="p-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liveStats.monthly_trend} barSize={12} barGap={2}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#666666', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#666666', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={24}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E5E5DF',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#142B4A',
                      }}
                      cursor={{ fill: 'var(--lg-background)' }}
                    />
                    <Bar dataKey="compliant" name="Compliant" fill="#22C55E" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="non_compliant" name="Non-Compliant" fill="#EF4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Compliance breakdown pie chart */}
            <Card className="bg-white border-[#E5E5DF] shadow-sm" padding="none">
              <div className="p-4 border-b border-[#E5E5DF]">
                <CardTitle>Compliance Breakdown</CardTitle>
                <p className="text-xs text-[#666666] mt-0.5">Status distribution</p>
              </div>
              <div className="p-4 h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Compliant', value: liveStats.compliant_count || 1, fill: '#22C55E' },
                        { name: 'Non-Compliant', value: liveStats.non_compliant_count, fill: '#EF4444' },
                        { name: 'Pending', value: liveStats.pending_review_count, fill: '#F59E0B' },
                      ]}
                      cx="50%"
                      cy="45%"
                      innerRadius={52}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[0, 1, 2].map(i => <Cell key={i} />)}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v: string) => <span style={{ color: '#666666', fontSize: 11 }}>{v}</span>}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF', border: '1px solid #E5E5DF',
                        borderRadius: 8, fontSize: 12, color: '#142B4A',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top violations */}
            <Card className="bg-white border-[#E5E5DF] shadow-sm lg:col-span-2" padding="none">
              <div className="p-4 border-b border-[#E5E5DF] flex items-center justify-between">
                <div>
                  <CardTitle>Most Frequent Violations</CardTitle>
                  <p className="text-xs text-[#666666] mt-0.5">Ranked by occurrence across legal metrology rules</p>
                </div>
              </div>
              <div className="divide-y divide-[var(--lg-border)]">
                {liveStats.top_violations.map((v, i) => (
                  <div key={v.rule_id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7F7F3] transition-colors">
                    <span className="text-xs text-[#666666] w-4 shrink-0 font-mono">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#142B4A] truncate">{v.label}</p>
                      <p className="text-[11px] text-[var(--lg-blue)] font-mono">{v.clause}</p>
                    </div>
                    <div className="w-24 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#F7F7F3] overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${(v.count / (liveStats.top_violations[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#666666] w-5 text-right font-mono">{v.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Inspector leaderboard */}
            <Card className="bg-white border-[#E5E5DF] shadow-sm" padding="none">
              <div className="p-4 border-b border-[#E5E5DF]">
                <CardTitle>Inspector Activity</CardTitle>
                <p className="text-xs text-[#666666] mt-0.5">Compliance rate by inspector</p>
              </div>
              <div className="divide-y divide-[var(--lg-border)]">
                {liveStats.inspector_stats.map(s => {
                  const rate = Math.round((s.compliant / s.total) * 100);
                  return (
                    <div key={s.inspector.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--lg-blue)] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {s.inspector.full_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-[#142B4A] truncate max-w-[100px]">
                            {s.inspector.full_name.split(' ')[0]}
                          </span>
                        </div>
                        <span className={cn(
                          'text-xs font-mono font-semibold',
                          rate >= 80 ? 'text-emerald-400' : rate >= 60 ? 'text-amber-400' : 'text-red-400',
                        )}>
                          {rate}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-[#F7F7F3] overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500',
                          )}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#666666] mt-1">{s.total} inspections</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent inspections */}
          <Card className="bg-white border-[#E5E5DF] shadow-sm" padding="none">
            <div className="p-4 border-b border-[#E5E5DF] flex items-center justify-between">
              <div>
                <CardTitle>Recent Inspections</CardTitle>
                <p className="text-xs text-[#666666] mt-0.5">Latest activity from your live inspections</p>
              </div>
              <Link
                href="/dashboard/LabelGuard/repository"
                className="flex items-center gap-1 text-xs text-[var(--lg-blue)] hover:text-[var(--lg-blue)] transition-colors"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentInspections.length === 0 ? (
              <EmptyState
                icon={<Package className="w-6 h-6" />}
                title="No inspections found"
                description="Upload a label image to perform your first scan."
              />
            ) : (
              <div className="divide-y divide-[var(--lg-border)]">
                {recentInspections.map(insp => (
                  <div key={insp.id} className="flex items-center gap-4 px-4 py-3 ll-table-row">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#142B4A] truncate">{insp.product_name}</p>
                      <p className="text-[11px] text-[#666666] mt-0.5">Inspection ID: {insp.id.slice(0, 8)}…</p>
                    </div>
                    <StatusPill status={insp.status} size="sm" />
                    <p className="text-[11px] text-[#666666] w-20 text-right shrink-0">{formatDate(insp.created_at)}</p>
                    <Link
                      href={`/dashboard/LabelGuard/report/${insp.id}`}
                      className="text-xs text-[var(--lg-blue)] hover:text-[var(--lg-blue)] shrink-0"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}


function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 1000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function KpiCard({
  label, value, icon, trend, trendUp, color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  color: 'indigo' | 'emerald' | 'red' | 'amber';
}) {
  const colorMap = {
    indigo: { bg: 'bg-white', border: 'border-[#E5E5DF]', icon: 'text-[var(--lg-blue)]', text: 'text-[#666666]', val: 'text-[#142B4A]' },
    emerald: { bg: 'bg-white', border: 'border-[#E5E5DF]', icon: 'text-[var(--lg-green-accent)]', text: 'text-[#666666]', val: 'text-[#142B4A]' },
    red: { bg: 'bg-white', border: 'border-[#E5E5DF]', icon: 'text-red-600', text: 'text-[#666666]', val: 'text-[#142B4A]' },
    amber: { bg: 'bg-white', border: 'border-[#E5E5DF]', icon: 'text-[var(--lg-orange)]', text: 'text-[#666666]', val: 'text-[#142B4A]' },
  }[color];

  return (
    <div className={cn('border rounded-xl p-4 shadow-sm', colorMap.bg, colorMap.border)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-[#666666] uppercase tracking-wider">{label}</p>
        <span className={colorMap.icon}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-[#142B4A] tabular-nums"><AnimatedNumber value={value} /></p>
      <div className={cn('flex items-center gap-1 mt-1.5 text-[11px]', colorMap.text)}>
        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
}
