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
          id: dbInsp.created_by,
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Enforcement Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time compliance overview & inspection activity
          </p>
        </div>
        <Link href="/dashboard/LabelGuard/scan">
          <Button variant="primary" size="sm">
            <ScanLine className="w-4 h-4 mr-1.5" />
            Start Scan
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 bg-red-900/20 border border-red-600/30 rounded-xl text-red-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
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
            <Card className="lg:col-span-2" padding="none">
              <div className="p-4 border-b border-[#2E3147]">
                <CardTitle>Monthly Inspection Trend</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Historical verification activity</p>
              </div>
              <div className="p-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liveStats.monthly_trend} barSize={12} barGap={2}>
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#475569', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#475569', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={24}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1A1D27',
                        border: '1px solid #2E3147',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#F1F5F9',
                      }}
                      cursor={{ fill: '#232635' }}
                    />
                    <Bar dataKey="compliant" name="Compliant" fill="#22C55E" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="non_compliant" name="Non-Compliant" fill="#EF4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Compliance breakdown pie chart */}
            <Card padding="none">
              <div className="p-4 border-b border-[#2E3147]">
                <CardTitle>Compliance Breakdown</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Status distribution</p>
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
                      formatter={(v: string) => <span style={{ color: '#94A3B8', fontSize: 11 }}>{v}</span>}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1A1D27', border: '1px solid #2E3147',
                        borderRadius: 8, fontSize: 12, color: '#F1F5F9',
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
            <Card className="lg:col-span-2" padding="none">
              <div className="p-4 border-b border-[#2E3147] flex items-center justify-between">
                <div>
                  <CardTitle>Most Frequent Violations</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Ranked by occurrence across legal metrology rules</p>
                </div>
              </div>
              <div className="divide-y divide-[#2E3147]">
                {liveStats.top_violations.map((v, i) => (
                  <div key={v.rule_id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#232635]/40 transition-colors">
                    <span className="text-xs text-slate-600 w-4 shrink-0 font-mono">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{v.label}</p>
                      <p className="text-[11px] text-indigo-400 font-mono">{v.clause}</p>
                    </div>
                    <div className="w-24 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#232635] overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${(v.count / (liveStats.top_violations[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-5 text-right font-mono">{v.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Inspector leaderboard */}
            <Card padding="none">
              <div className="p-4 border-b border-[#2E3147]">
                <CardTitle>Inspector Activity</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Compliance rate by inspector</p>
              </div>
              <div className="divide-y divide-[#2E3147]">
                {liveStats.inspector_stats.map(s => {
                  const rate = Math.round((s.compliant / s.total) * 100);
                  return (
                    <div key={s.inspector.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-indigo-200">
                              {s.inspector.full_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-slate-300 truncate max-w-[100px]">
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
                      <div className="h-1 rounded-full bg-[#232635] overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500',
                          )}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">{s.total} inspections</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent inspections */}
          <Card padding="none">
            <div className="p-4 border-b border-[#2E3147] flex items-center justify-between">
              <div>
                <CardTitle>Recent Inspections</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Latest activity from your live inspections</p>
              </div>
              <Link
                href="/dashboard/LabelGuard/repository"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
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
              <div className="divide-y divide-[#2E3147]">
                {recentInspections.map(insp => (
                  <div key={insp.id} className="flex items-center gap-4 px-4 py-3 ll-table-row">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{insp.product_name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Inspection ID: {insp.id.slice(0, 8)}…</p>
                    </div>
                    <StatusPill status={insp.status} size="sm" />
                    <p className="text-[11px] text-slate-500 w-20 text-right shrink-0">{formatDate(insp.created_at)}</p>
                    <Link
                      href={`/dashboard/LabelGuard/report/${insp.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0"
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
    indigo: { bg: 'bg-indigo-900/20', border: 'border-indigo-600/30', icon: 'text-indigo-400', text: 'text-indigo-300' },
    emerald: { bg: 'bg-emerald-900/20', border: 'border-emerald-600/30', icon: 'text-emerald-400', text: 'text-emerald-300' },
    red: { bg: 'bg-red-900/20', border: 'border-red-600/30', icon: 'text-red-400', text: 'text-red-300' },
    amber: { bg: 'bg-amber-900/20', border: 'border-amber-600/30', icon: 'text-amber-400', text: 'text-amber-300' },
  }[color];

  return (
    <div className={cn('border rounded-xl p-4', colorMap.bg, colorMap.border)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <span className={colorMap.icon}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-100 tabular-nums">{value}</p>
      <div className={cn('flex items-center gap-1 mt-1.5 text-[11px]', colorMap.text)}>
        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trend}
      </div>
    </div>
  );
}
