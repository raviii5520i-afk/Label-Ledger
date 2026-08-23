// Label Ledger — Repository View Component (Live Supabase Integration)
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, ChevronLeft, ChevronRight, ScanLine,
  Globe2, Package, ArrowUpDown, FileText, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { cn, formatDate, STATUS_CONFIG } from '../../lib/utils';
import { StatusPill } from '../ui/Badge';
import { EmptyState } from '../ui/Card';
import { Button } from '../ui/Button';
import type { InspectionStatus, InspectionSummary } from '../../lib/types';
import { getMyInspections, DbInspection } from '@/lib/supabase/inspections';

const ALL_STATUSES: InspectionStatus[] = [
  'draft', 'pending_review', 'verified_compliant', 'verified_non_compliant',
];
const PAGE_SIZE = 6;

export function RepositoryView() {
  const router = useRouter();
  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<InspectionStatus[]>([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'created_at' | 'product_name' | 'status'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Fetch live inspections from Supabase via getMyInspections()
  const fetchInspections = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await getMyInspections();
    if (res.error) {
      console.warn('[RepositoryView] getMyInspections error:', res.error);
      setError('Unable to load inspections from database. ' + res.error);
      setInspections([]);
    } else if (res.data) {
      // Map database rows (DbInspection) to UI InspectionSummary interface
      const mapped: InspectionSummary[] = res.data.map((dbInsp: DbInspection) => ({
        id: dbInsp.id,
        product_name: dbInsp.product_name || 'Untitled Inspection',
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
    fetchInspections();
  }, [fetchInspections]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = inspections.filter(insp => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        insp.product_name.toLowerCase().includes(q);
      const matchStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(insp.status);
      return matchSearch && matchStatus;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'created_at') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'product_name') {
        cmp = a.product_name.localeCompare(b.product_name);
      } else if (sortField === 'status') {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [inspections, search, selectedStatuses, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleStatus = (st: InspectionStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st],
    );
    setPage(1);
  };

  const toggleSort = (field: 'created_at' | 'product_name' | 'status') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Inspection Repository</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, filter, and access all legal metrology label inspections.
          </p>
        </div>
        <Link href="/dashboard/LabelGuard/scan">
          <Button variant="primary" size="sm">
            <ScanLine className="w-4 h-4 mr-1.5" />
            New Label Scan
          </Button>
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 p-4 bg-red-900/20 border border-red-600/30 rounded-xl text-red-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchInspections}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#1A1D27] border border-[#2E3147] rounded-xl p-4 space-y-3">
        {/* Search */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by product name…"
              className="w-full pl-9 pr-4 py-2 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {ALL_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            const isSelected = selectedStatuses.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                  isSelected ? `${cfg.color} ${cfg.textColor} ${cfg.borderColor}` : 'bg-[#0F1117] text-slate-500 border-[#2E3147] hover:border-slate-600',
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', isSelected ? cfg.dotColor : 'bg-slate-600')} />
                {cfg.label}
              </button>
            );
          })}
          {(selectedStatuses.length > 0 || search) && (
            <button
              onClick={() => { setSelectedStatuses([]); setSearch(''); setPage(1); }}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1A1D27] border border-[#2E3147] rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-3 border-b border-[#2E3147] bg-[#232635]/60">
          {[
            { label: 'Product', field: 'product_name' as const },
            { label: 'Status', field: 'status' as const },
            { label: 'Date', field: 'created_at' as const },
          ].map(({ label, field }) => (
            <button
              key={label}
              onClick={() => field && toggleSort(field)}
              className={cn(
                'flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-left',
                field ? 'text-slate-400 hover:text-slate-200 transition-colors' : 'text-slate-500 cursor-default',
              )}
            >
              {label}
              {field && sortField === field && (
                <ArrowUpDown className={cn('w-3 h-3', sortDir === 'asc' ? 'rotate-180' : '')} />
              )}
            </button>
          ))}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Actions</span>
        </div>

        {/* Rows / Loading / Empty */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs font-medium">Loading inspections from Supabase…</p>
          </div>
        ) : paged.length === 0 ? (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="No inspections found"
            description="Start a new scan to inspect and verify product labels."
            action={{
              label: 'Start New Scan',
              onClick: () => router.push('/dashboard/LabelGuard/scan'),
            }}
          />
        ) : (
          <div className="divide-y divide-[#2E3147]">
            {paged.map(insp => (
              <InspectionRow key={insp.id} inspection={insp} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2E3147]">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-[#2E3147] text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-7 h-7 text-xs rounded border transition-colors',
                    p === page
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-[#2E3147] text-slate-400 hover:text-slate-200 hover:border-slate-500',
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-[#2E3147] text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InspectionRow({ inspection: insp }: { inspection: InspectionSummary }) {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center px-4 py-3 ll-table-row">
      {/* Product */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-slate-200 truncate">{insp.product_name}</p>
          {insp.is_imported && (
            <Globe2 className="w-3 h-3 text-slate-500 shrink-0" aria-label="Imported" />
          )}
        </div>
        {insp.violation_count > 0 && (
          <p className="text-[11px] text-red-400 mt-0.5">
            {insp.violation_count} violation{insp.violation_count > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <StatusPill status={insp.status} size="sm" />
      </div>

      {/* Date */}
      <div>
        <p className="text-xs text-slate-400">{formatDate(insp.created_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/LabelGuard/report/${insp.id}`}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 border border-indigo-600/30 hover:border-indigo-500/50 rounded-lg transition-colors"
        >
          <FileText className="w-3 h-3" />
          Report
        </Link>
      </div>
    </div>
  );
}
