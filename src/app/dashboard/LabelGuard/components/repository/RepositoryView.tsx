'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, Filter, ChevronLeft, ChevronRight, ScanLine,
  Globe2, Package, ArrowUpDown, FileText,
} from 'lucide-react';
import { cn, formatDate, STATUS_CONFIG } from '../../lib/utils';
import { StatusPill } from '../ui/Badge';
import { EmptyState } from '../ui/Card';
import { Button } from '../ui/Button';
import type { InspectionStatus, InspectionSummary } from '../../lib/types';
import { MOCK_INSPECTIONS, MOCK_USERS } from '../../lib/mock/data';

const ALL_STATUSES: InspectionStatus[] = [
  'draft', 'pending_review', 'verified_compliant', 'verified_non_compliant',
];
const PAGE_SIZE = 6;

export function RepositoryView() {
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<InspectionStatus[]>([]);
  const [inspectorId, setInspectorId] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'created_at' | 'product_name' | 'status'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const inspectors = MOCK_USERS.filter(u => u.role === 'inspector');

  // Filter + sort
  const filtered = useMemo(() => {
    let result = MOCK_INSPECTIONS.filter(insp => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        insp.product_name.toLowerCase().includes(q) ||
        insp.inspector.full_name.toLowerCase().includes(q);
      const matchStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(insp.status);
      const matchInspector = inspectorId === 'all' || insp.inspector.id === inspectorId;
      return matchSearch && matchStatus && matchInspector;
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
  }, [search, selectedStatuses, inspectorId, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleStatus(s: InspectionStatus) {
    setPage(1);
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s],
    );
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Inspection Repository</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {MOCK_INSPECTIONS.length} total inspections
          </p>
        </div>
        <Link href="/dashboard/LabelGuard/scan">
          <Button leftIcon={<ScanLine className="w-4 h-4" />} size="sm">
            New Scan
          </Button>
        </Link>
      </div>

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
              placeholder="Search by product name or inspector…"
              className="w-full pl-9 pr-4 py-2 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={inspectorId}
            onChange={e => { setInspectorId(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-[#0F1117] border border-[#2E3147] rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-44"
          >
            <option value="all">All inspectors</option>
            {inspectors.map(u => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </select>
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
          {(selectedStatuses.length > 0 || search || inspectorId !== 'all') && (
            <button
              onClick={() => { setSelectedStatuses([]); setSearch(''); setInspectorId('all'); setPage(1); }}
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
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-4 py-3 border-b border-[#2E3147] bg-[#232635]/60">
          {[
            { label: 'Product', field: 'product_name' as const },
            { label: 'Inspector', field: null },
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

        {/* Rows */}
        {paged.length === 0 ? (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="No inspections found"
            description="Try adjusting your search or filter criteria"
          />
        ) : (
          <div className="divide-y divide-[#2E3147]">
            {paged.map(insp => (
              <InspectionRow key={insp.id} inspection={insp} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center px-4 py-3 ll-table-row">
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

      {/* Inspector */}
      <div className="min-w-0">
        <p className="text-xs text-slate-300 truncate">{insp.inspector.full_name}</p>
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
        {insp.status !== 'draft' && (
          <Link
            href={`/dashboard/LabelGuard/report/${insp.id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 border border-indigo-600/30 hover:border-indigo-500/50 rounded-lg transition-colors"
          >
            <FileText className="w-3 h-3" />
            Report
          </Link>
        )}
      </div>
    </div>
  );
}
