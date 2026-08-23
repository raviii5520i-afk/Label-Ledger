'use client';

import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, ClipboardCheck, AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { cn, formatDate, STATUS_CONFIG } from '../../lib/utils';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { StatusPill } from '../ui/Badge';
import { MOCK_DASHBOARD_STATS, MOCK_INSPECTIONS } from '../../lib/mock/data';

export function DashboardView() {
  const stats = MOCK_DASHBOARD_STATS;
  const recentInspections = MOCK_INSPECTIONS.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100">Enforcement Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Overview across all inspectors · October 2024
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Inspections"
          value={stats.total_inspections}
          icon={<ClipboardCheck className="w-4 h-4" />}
          trend="+12 this week"
          trendUp
          color="indigo"
        />
        <KpiCard
          label="Compliant"
          value={stats.compliant_count}
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend={`${stats.compliance_rate}% rate`}
          trendUp
          color="emerald"
        />
        <KpiCard
          label="Non-Compliant"
          value={stats.non_compliant_count}
          icon={<AlertTriangle className="w-4 h-4" />}
          trend="+3 this week"
          trendUp={false}
          color="red"
        />
        <KpiCard
          label="Pending Review"
          value={stats.pending_review_count}
          icon={<Clock className="w-4 h-4" />}
          trend="Needs attention"
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
            <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
          </div>
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthly_trend} barSize={12} barGap={2}>
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

        {/* Compliance donut */}
        <Card padding="none">
          <div className="p-4 border-b border-[#2E3147]">
            <CardTitle>Compliance Split</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">All-time verified</p>
          </div>
          <div className="p-4 h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Compliant', value: stats.compliant_count, fill: '#22C55E' },
                    { name: 'Non-Compliant', value: stats.non_compliant_count, fill: '#EF4444' },
                    { name: 'Pending', value: stats.pending_review_count, fill: '#F59E0B' },
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
              <p className="text-xs text-slate-500 mt-0.5">Ranked by occurrence across all inspections</p>
            </div>
          </div>
          <div className="divide-y divide-[#2E3147]">
            {stats.top_violations.map((v, i) => (
              <div key={v.rule_id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#232635]/40 transition-colors">
                <span className="text-xs text-slate-600 w-4 shrink-0 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{v.label}</p>
                  <p className="text-[11px] text-indigo-400 font-mono">{v.clause}</p>
                </div>
                {/* Bar */}
                <div className="w-24 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[#232635] overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(v.count / stats.top_violations[0].count) * 100}%` }}
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
            {stats.inspector_stats.map(s => {
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
            <p className="text-xs text-slate-500 mt-0.5">Latest activity across all inspectors</p>
          </div>
          <Link
            href="/dashboard/LabelGuard/repository"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-[#2E3147]">
          {recentInspections.map(insp => (
            <div key={insp.id} className="flex items-center gap-4 px-4 py-3 ll-table-row">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{insp.product_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">by {insp.inspector.full_name}</p>
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
      </Card>
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
