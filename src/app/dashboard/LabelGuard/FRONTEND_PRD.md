# LabelGuard — Frontend PRD & Implementation Plan
### Senior Product Design + Frontend Architecture Document
**Version 1.0 | August 2026**

---

## 1. Executive Summary

LabelGuard is a Legal Metrology compliance platform for inspecting packaged commodities under India's Legal Metrology (Packaged Commodities) Rules, 2011 (Rule 6). The backend — Supabase Auth, PostgreSQL, RLS, private storage, OCR pipeline, Rule 6 extraction engine, and database service layer — is **fully implemented**.

This document defines the **complete frontend upgrade plan** to transform LabelGuard from a functional but visually inconsistent MVP into a **production-grade, enterprise-quality compliance platform** trusted by government inspectors, compliance officers, manufacturers, and auditors.

**The backend must not be modified.** All frontend changes must consume existing service APIs.

---

## 2. Existing Frontend Architecture Audit

### 2.1 Project Structure

```
src/app/dashboard/LabelGuard/
├── layout.tsx                    — Root layout; injects AppShell & ll-globals.css
├── page.tsx                      — Entry page
├── ll-globals.css                — Scoped CSS custom properties + Tailwind directives
├── components/
│   ├── layout/AppShell.tsx       — Sidebar + TopBar shell (221 lines)
│   ├── auth/LoginForm.tsx        — Login + sign-up form
│   ├── scan/
│   │   ├── ScanWorkflow.tsx      — Master scan state machine (355 lines)
│   │   ├── ImageUploader.tsx     — Drag-drop file upload (193 lines)
│   │   ├── AnalysisLoader.tsx    — OCR progress animation (127 lines)
│   │   ├── OcrReviewPanel.tsx    — OCR result + field review (221 lines)
│   │   ├── ComplianceChecklist.tsx — Rule 6 checklist + edit (286 lines)
│   │   ├── ScanSubmitPanel.tsx   — Post-submission success panel (105 lines)
│   │   └── BoundingBoxOverlay.tsx — Evidence image + bbox overlay
│   ├── dashboard/DashboardView.tsx — KPI + charts + recent (409 lines)
│   ├── repository/RepositoryView.tsx — Table + filter + paginate (341 lines)
│   ├── review/ReviewQueueView.tsx — Dual-pane verification (528 lines)
│   ├── report/ReportView.tsx     — Full report page (357 lines)
│   └── ui/
│       ├── Button.tsx  — 6 variants, 3 sizes
│       ├── Card.tsx    — Card, Spinner, Skeleton, EmptyState, ConfidenceBar
│       ├── Badge.tsx   — StatusPill, Badge, CountBadge
│       └── SignedImage.tsx — Private storage image loader
└── lib/
    ├── types/index.ts            — All TypeScript interfaces
    ├── mock/data.ts              — MOCK_RULES, MOCK_DASHBOARD_STATS (still in use)
    ├── utils/index.ts            — cn(), formatDate, STATUS_CONFIG
    └── supabase/                 — Local supabase utilities
```

### 2.2 Technology Stack

- **Framework**: Next.js (App Router), React 18
- **Styling**: Tailwind CSS + scoped CSS custom properties in `ll-globals.css`
- **Charts**: Recharts (BarChart, PieChart)
- **Icons**: Lucide React
- **State**: Local useState / useCallback / useMemo per-component
- **Data**: Direct calls to `@/lib/supabase/inspections.ts` service functions

### 2.3 Design Token Gap

`ll-globals.css` defines `--ll-bg-base`, `--ll-bg-surface`, etc. — but **every component uses hardcoded Tailwind arbitrary values** (`bg-[#1A1D27]`). The CSS variables are declared but never consumed by components. This is a maintainability gap.

### 2.4 Component Quality Assessment

| Component | Functional | Visual | Issues |
|---|---|---|---|
| AppShell | ✅ | Good | Pending count uses MOCK_INSPECTIONS (not live DB) |
| ScanWorkflow | ✅ | Good | Uses `alert()` for draft/submit errors |
| AnalysisLoader | ✅ | Good | Timer-driven progress (not actual OCR events) |
| OcrReviewPanel | ✅ | OK | Mobile layout: fields appear before image (wrong order) |
| ComplianceChecklist | ✅ | Good | bbox natural size is hardcoded `{1,1}` — overlays wrong |
| ScanSubmitPanel | ✅ | OK | No link to the just-created inspection report |
| DashboardView | ✅ | Good | Charts use MOCK_DASHBOARD_STATS (static) |
| RepositoryView | ✅ | Good | No date filter; inspector name is hardcoded string |
| ReviewQueueView | ⚠️ | OK | 528 lines monolithic; `alert()` for RBAC errors |
| ReportView | ✅ | OK | **CRITICAL BUG**: evidence image uses raw `storage_path` (not signed URL) |

---

## 3. Current UX Problems

All findings based on actual code inspection.

| # | Area | Problem | Severity |
|---|---|---|---|
| 1 | AppShell | `pendingCount` reads from `MOCK_INSPECTIONS`, not live DB | **High** |
| 2 | AppShell | Nav order: Scan→Repository→Dashboard→Review (illogical) | **High** |
| 3 | AppShell | No breadcrumbs on sub-pages (`/report/[id]`, review detail) | Medium |
| 4 | ScanWorkflow | `alert()` used for draft-saved and submission errors | **High** |
| 5 | ScanSubmitPanel | No link to the just-created inspection report | **High** |
| 6 | ReviewQueueView | `alert()` for RBAC errors and role enforcement | **High** |
| 7 | ReviewQueueView | 528-line monolithic — no sub-component decomposition | Medium |
| 8 | ReviewQueueView | Evidence image shows blank area if no real bbox data | **High** |
| 9 | DashboardView | Monthly trend uses `MOCK_DASHBOARD_STATS.monthly_trend` | **High** |
| 10 | DashboardView | Top Violations uses `MOCK_DASHBOARD_STATS.top_violations` | **High** |
| 11 | DashboardView | Inspector leaderboard is entirely mock data | **High** |
| 12 | **ReportView** | **Evidence image uses raw `storage_path` (not signed URL) — BROKEN** | **Critical** |
| 13 | ReportView | Export PDF / CSV buttons are non-functional stubs | Medium |
| 14 | RepositoryView | No date range filter (type defines it, UI omits it) | Medium |
| 15 | RepositoryView | Inspector column shows hardcoded string `'Inspector'` | Medium |
| 16 | OcrReviewPanel | No confidence legend (what does 87% mean to an inspector?) | Medium |
| 17 | ComplianceChecklist | Manual corrections not persisted to DB `inspection_items` | **High** |
| 18 | ComplianceChecklist | BBox overlay uses `{width:1, height:1}` — renders incorrectly | **High** |
| 19 | Navigation | No "Reports" entry point in sidebar | Medium |
| 20 | Accessibility | `prefers-reduced-motion` not respected in any animation | Medium |
| 21 | Accessibility | Heading hierarchy broken: `<h1>` in TopBar, `<h2>` in main | Medium |
| 22 | Accessibility | Icon-only buttons missing `aria-label` (sort, edit, expand) | Medium |
| 23 | Typography | No defined type scale — arbitrary sizes from `text-[10px]` to `text-3xl` | Medium |
| 24 | Spacing | Mixed padding: p-3/p-4/p-5/p-6 with no documented rhythm | Low |
| 25 | Colors | CSS variables defined but hardcoded values used everywhere | Low |
| 26 | Mobile | OcrReviewPanel: fields show before image on mobile (wrong order) | Medium |
| 27 | Mobile | ComplianceChecklist image defaults to visible on mobile (50% viewport) | Medium |
| 28 | Error Feedback | No global toast system — errors buried or via `alert()` | **High** |
| 29 | Loading States | Dashboard: spinner only, no layout-preserving skeleton | Low |
| 30 | Accessibility | `EmptyState` action uses plain `<button>`, not `Button` component | Low |

---

## 4. Product Design Vision

### Brand Personality

| Dimension | Description |
|---|---|
| **Authoritative** | Every decision carries legal weight |
| **Precise** | Confidence scores, clause references, audit timestamps — no ambiguity |
| **Evidence-Driven** | Images and OCR data are the hero of every view |
| **Trustworthy** | Believable by government officers and auditors |
| **Modern, Restrained** | Enterprise dark UI — not flashy, not generic |

### Visual Hierarchy Principles

| State | Treatment |
|---|---|
| Primary Action | Solid indigo button + shadow — one per section |
| Compliance Success | Emerald green — reserved for confirmed compliant |
| Compliance Failure | Red — violations, non-compliant states |
| Pending / Warning | Amber — awaiting review, low confidence |
| Data References | Info blue — clause codes, inspection IDs |
| Destructive | Red outlined — reject, delete |

---

## 5. Design System

### 5.1 Color Tokens

```css
/* Backgrounds */
--color-bg-base:      #0C0E18;   /* Page background */
--color-bg-surface:   #13172A;   /* Card surfaces */
--color-bg-elevated:  #1E2239;   /* Table headers, hover rows */
--color-bg-overlay:   #252B45;   /* Modals, dropdowns */

/* Borders */
--color-border:       #2A3057;
--color-border-focus: #4F6EF7;

/* Text */
--color-text-primary:   #F0F4FF;
--color-text-secondary: #8B92B3;
--color-text-muted:     #4E5778;

/* Brand (Indigo — Authority) */
--color-brand:         #4F6EF7;
--color-brand-subtle:  rgba(79,110,247,0.12);

/* Success (Emerald — Compliant) */
--color-success:       #10B981;
--color-success-subtle:rgba(16,185,129,0.12);

/* Warning (Amber — Pending) */
--color-warning:       #F59E0B;

/* Error (Red — Non-Compliant) */
--color-error:         #EF4444;

/* Info (Sky — Data References) */
--color-info:          #38BDF8;
```

### 5.2 Typography

```
Font Family:
  Primary:    "Inter" (Google Fonts)
  Monospace:  "JetBrains Mono" (clause codes, IDs, confidence values)

Type Scale:
  display-lg:  36px / 700  — Compliance stamp
  display-md:  24px / 700  — Page hero metrics
  heading-lg:  18px / 700  — Page <h1>
  heading-md:  15px / 600  — Section <h2>
  heading-sm:  13px / 600  — Card titles
  body-md:     14px / 400  — Default body
  body-sm:     13px / 400  — Secondary body
  label-md:    12px / 500  — Form labels
  label-sm:    11px / 500  — Metadata
  caption:     10px / 500 uppercase tracking-widest — Section markers
  mono-md:     13px JetBrains Mono — clause refs
  mono-sm:     12px JetBrains Mono — extracted values, confidence %
  kpi:         32px / 800 tabular-nums — Dashboard KPI numerals
```

### 5.3 Spacing Scale (4px base grid)

| Token | Size | Use |
|---|---|---|
| xs | 4px | Badge dot gaps |
| sm | 8px | Input icon padding |
| md | 12px | Card internal gaps |
| lg | 16px | Default card padding |
| xl | 20px | Section padding |
| 2xl | 24px | Between card sections |
| 3xl | 32px | Page section gaps |
| 4xl | 48px | Full-page section gaps |

### 5.4 Border Radius

| Element | Radius |
|---|---|
| Cards | 12px (rounded-xl) |
| Buttons | 8px (rounded-lg) |
| Inputs | 8px |
| Pills/Badges | 9999px (rounded-full) |
| Tags (Clause) | 4px (rounded) |
| Modals | 16px |
| Upload Zone | 16px |

### 5.5 Shadows

```
elevation-1: 0 1px 3px rgba(0,0,0,0.3)           — Cards
elevation-2: 0 4px 12px rgba(0,0,0,0.4)          — Focused inputs
elevation-3: 0 8px 24px rgba(0,0,0,0.5)          — Modals
elevation-brand: 0 4px 16px rgba(79,110,247,0.25) — Primary CTA
```

### 5.6 Buttons

| Variant | Style |
|---|---|
| primary | Solid indigo + brand shadow |
| secondary | Surface bg + border |
| ghost | Transparent, text only |
| outline | Transparent + visible border |
| danger | Red tinted + border |
| success | Emerald tinted + border |
| icon | Square ghost-style |

### 5.7 New Components Needed

| Component | Notes |
|---|---|
| `Toast` | Top-right notification; 4 variants: success/error/warning/info; auto-dismiss 4s |
| `ConfirmDialog` | Focus-trapped modal for irreversible verification actions |
| `Input` | Reusable primitive with label, icon, error state slots |
| `ClauseTag` | Monospace badge for `Rule 6(1)(a)` references |
| `DateRangePicker` | From/To date filter for Repository |
| `Tooltip` | Hover tooltip for confidence % legend |
| `AuditTimeline` | Chronological verification log entries |

---

## 6. Information Architecture

### Proposed Sidebar Order (Current order is illogical)

**Current**: Scan → Repository → Dashboard → Review  
**Proposed**: Dashboard → Scan Label → Repository → Review Queue

### Role-Based Nav Visibility

| Nav Item | Admin | Inspector | Manufacturer | Viewer |
|---|---|---|---|---|
| Dashboard | ✅ Full | ✅ Full | ✅ Own | ✅ Read |
| Scan Label | ✅ | ✅ | ✅ | ❌ |
| Repository | ✅ All | ✅ Own | ✅ Own | ✅ Read |
| Review Queue | ✅ Verify | ✅ Submit | ❌ | ❌ |
| Reports (via repo) | ✅ | ✅ Own | ✅ Own | ✅ |

> RBAC enforcement is backend (RLS). Sidebar visibility is frontend UX only.

### Breadcrumbs (New)

Add on nested routes:
- `Dashboard > Repository > Report: #abc12345`
- `Dashboard > Review Queue > [product_name]`

---

## 7. Scan Experience PRD

### Step 1 — Upload (ImageUploader — KEEP, minor improve)
- Add clearer guidance: "Photograph the front label. All text must be in focus."
- Keep tip cards at bottom
- Loading: spinner + "Uploading to secure storage…"
- Error: red inline alert (file type/size)

### Step 2 — OCR Processing (AnalysisLoader — MODIFY)
- **Problem**: stages advance on fixed timers, not real OCR events
- **Fix**: accept `currentStage` prop from ScanWorkflow; advance on actual pipeline milestones
- Error state: inline error + retry if OCR fails completely

### Step 3 — OCR Review (OcrReviewPanel — MODIFY)
- **Fix mobile layout**: image first, then fields (currently reversed)
- Add confidence legend: green ≥85%, amber 60–85%, red <60%
- Make "Raw OCR Output" collapsible (advanced users only)
- Label auto-populated product name as "Auto-detected"

### Step 4 — Compliance Checklist (ComplianceChecklist — MODIFY)
- **Fix bbox rendering**: load real image dimensions via `onLoad` handler
- **Fix manual corrections**: call `saveInspectionItems()` when field edited
- Add `ClauseTag` for each declaration row
- Add "Why did this fail?" expandable explanation per violation
- Clearly separate mandatory vs optional declarations
- Make edit affordance more obvious (larger edit button)

### Step 5 — Submit (ScanSubmitPanel — MODIFY)
- **Add "View Inspection Report →"** link using `inspectionId` from state
- Show inspection ID (first 12 chars) for user reference
- List violations explicitly, not just count
- Add "What happens next?" explanation of review process

---

## 8. Dashboard PRD

### KPI Cards (5 total — currently 4)

| KPI | Source | Color |
|---|---|---|
| Total Inspections | `inspections.length` | Indigo |
| Pending Review | `filter(pending_review).length` | Amber |
| Compliant | `filter(verified_compliant).length` | Emerald |
| Non-Compliant | `filter(verified_non_compliant).length` | Red |
| **Compliance Rate** (NEW) | `(compliant / evaluated) * 100` | Dynamic |

### Charts

| Chart | Data Source | Action |
|---|---|---|
| Monthly Inspection Activity | Derive from `created_at` grouping | Fix mock → live |
| Compliance Breakdown Donut | Live status distribution | Keep |
| Top Violations | Derive from `rule_checks` where `passed=false` | Fix mock → live |
| Inspector Activity | All mock | Remove or mark phase-2 |

### Quick Actions (NEW — below KPIs)
- **Start New Scan** → `/scan`
- **Review Pending** (only if `pending > 0`) → `/review`

### Loading State
- Replace spinner with skeleton KPI cards matching layout

---

## 9. Repository PRD

### Improved Filter Bar

| Filter | Current | Improved |
|---|---|---|
| Search | Product name | Product name + inspection ID |
| Status | Multi-select pills | Keep |
| Date | **MISSING** | Add date range: From / To |
| Sort | Product/Status/Date | Keep |

### Responsive Table → Cards
- Desktop: 5-column table
- Tablet: 3 columns (Product, Status, Actions)
- Mobile: Card list — status pill + date + Report button per card

---

## 10. Review Queue PRD

### Layout
- Desktop: Two-pane (queue list left / detail + verification right)
- Mobile: Full-screen queue list → tap → full-screen detail

### Detail Pane Hierarchy
1. **Evidence Panel** — label image + bboxes (use signed URL)
2. **Declaration Panel** — checklist with confidence + clause tags
3. **Rule Violation Panel** — failed mandatory clauses only
4. **Verification Action Panel** — notes textarea + action buttons

### Verification Actions

| Action | Color | Confirm Required |
|---|---|---|
| Approve — Compliant | Emerald | YES — ConfirmDialog |
| Approve — Non-Compliant | Red | YES — ConfirmDialog |
| Reject — Return for Correction | Amber | YES — ConfirmDialog |

### RBAC in UI (replace all `alert()`)
- Non-admin: hide verification buttons entirely
- Show styled `InlineAlert`: "Only Admin officers can verify compliance status"
- Never use `alert()` for security enforcement

---

## 11. Report PRD

### Structure
```
[Back to Repository]                      [Export PDF] [Export CSV]

┌─────────────────────────────────────────────────────────────┐
│ COMPLIANCE STAMP (if verified)                              │
│ ✅ VERIFIED COMPLIANT  /  ❌ VERIFIED NON-COMPLIANT         │
│ 7/10 declarations · 0 violations · Inspection ID: abc123   │
└─────────────────────────────────────────────────────────────┘

[Product Information Card]
Product Name | Brand | Quantity | MRP | Manufacturer | Batch | Date

[Evidence Image]          [Violations Panel]
(signed URL, bboxes)      (failed clauses)

[Full Declaration Table]
Clause | Label | Extracted Value | Confidence | Status

[Verification History — Audit Timeline]
Chronological log of all status changes and officer actions

[Print footer]
```

### Critical Fix Required
- **`ReportView` passes `evidence[0].storage_path` directly to the image renderer**
- Fix: call `createLabelEvidenceSignedUrl(evidence[0].storage_path)` in `useEffect`
- OR: use the existing `SignedImage` component

### Print/PDF
- `window.print()` triggered by Export PDF button
- `@media print` CSS: hide sidebar/topbar/buttons, white bg, expand all sections

---

## 12. Responsive Design Strategy

| Breakpoint | Layout Changes |
|---|---|
| Desktop ≥1280px | Full sidebar + two-pane scan/review, 4-col KPI |
| Laptop 1024–1280 | Full sidebar, single-col charts if tight, 2-col KPI |
| Tablet 768–1024 | Overlay sidebar, 2-col KPI, 3-col table, stacked review |
| Mobile <768 | Overlay sidebar, 2×2 KPI, card list repository, image-first scan |

---

## 13. Accessibility Strategy

| Priority | Fix |
|---|---|
| **P0** | Add `aria-live="polite"` to Toast container |
| **P0** | Add `@media (prefers-reduced-motion: reduce)` to ALL animations in `ll-globals.css` |
| **P0** | Fix heading hierarchy: TopBar `<h1>` → `<p>`; page `<h2>` → `<h1>`; sections → `<h2>` |
| **P1** | Add `aria-label` to all icon-only buttons (sort, edit pencil, expand, close) |
| **P1** | Add `aria-label="Search inspections"` to Repository search input |
| **P1** | Focus trap inside ConfirmDialog; close on Escape key |
| **P2** | Link form error messages to inputs via `aria-describedby` |
| **P2** | Verify color contrast of muted text (#4E5778 on #0C0E18) |

---

## 14. Animation Strategy

### Permitted

| Animation | Duration | Purpose |
|---|---|---|
| OCR scan line (AnalysisLoader) | 2s linear | Active processing signal |
| Progress bar fill | 700ms ease-out | Progress feedback |
| Compliance stamp entrance | 450ms cubic-bezier | Moment of truth |
| Toast slide-in | 250ms ease | Notification |
| Skeleton pulse | 1.5s ease-in-out | Loading state |
| BBox highlight | 150ms ease | Spatial connection |
| Card hover elevation | 100ms ease | Interactivity affordance |
| Sidebar overlay | 200ms ease | Orientation |

### `prefers-reduced-motion` Requirement

```css
@media (prefers-reduced-motion: no-preference) {
  .ll-scan-line   { animation: ll-scan-line 2s linear infinite; }
  .ll-pulse       { animation: ll-pulse-ring 1.8s ease-in-out infinite; }
  .ll-stamp-enter { animation: ll-stamp 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
}
```

### Prohibited
- Parallax effects
- Transitions > 500ms for interactive responses
- Animations without user action (except scan loading)

---

## 15. Performance Strategy

| Area | Current | Recommendation |
|---|---|---|
| Tesseract.js | Loads at scan page mount | Lazy-load: `import('tesseract.js')` on file select |
| Signed URLs | No caching | Cache in component state / useMemo per report session |
| Charts | All Recharts imported | Tree-shaking already works; only import used types |
| Skeleton Loading | Spinner only | Add `SkeletonKpiCard` layout-preserving skeleton |
| Mock data | In production bundles | Remove `MOCK_DASHBOARD_STATS` from production paths |
| Evidence images | Full resolution | Use `object-contain` sizing; no upscaling |

---

## 16. Component Architecture

```
components/
├── ui/
│   ├── Button.tsx           KEEP (add icon variant)
│   ├── Card.tsx             KEEP (add CardFooter)
│   ├── Badge.tsx            MODIFY (add ClauseTag export)
│   ├── SignedImage.tsx      KEEP
│   ├── Toast.tsx            CREATE NEW ← Priority 0
│   ├── ConfirmDialog.tsx    CREATE NEW
│   ├── Input.tsx            CREATE NEW
│   ├── DateRangePicker.tsx  CREATE NEW
│   └── Tooltip.tsx          CREATE NEW
│
├── layout/
│   ├── AppShell.tsx         MODIFY (live pending count, nav order)
│   ├── Breadcrumbs.tsx      CREATE NEW
│   └── PageHeader.tsx       CREATE NEW
│
├── scan/
│   ├── ScanWorkflow.tsx     MODIFY (toast, real stage events)
│   ├── ScanSubmitPanel.tsx  MODIFY (report link, inspection ID)
│   ├── AnalysisLoader.tsx   MODIFY (currentStage prop)
│   ├── OcrReviewPanel.tsx   MODIFY (mobile layout, confidence legend)
│   ├── ComplianceChecklist.tsx MODIFY (image size, DB persist)
│   ├── ImageUploader.tsx    KEEP
│   └── BoundingBoxOverlay.tsx KEEP
│
├── dashboard/
│   └── DashboardView.tsx    MODIFY (live data, 5th KPI)
│
├── repository/
│   └── RepositoryView.tsx   MODIFY (date filter, mobile cards)
│
├── review/
│   ├── ReviewQueueView.tsx  REFACTOR → split into 3
│   ├── ReviewQueueList.tsx  CREATE (extracted)
│   ├── ReviewDetailPanel.tsx CREATE (extracted)
│   └── VerificationPanel.tsx CREATE (extracted)
│
└── report/
    └── ReportView.tsx       MODIFY (signed URL, print CSS)
```

---

## 17. File-by-File Implementation Plan

| File | Action | Purpose | Priority |
|---|---|---|---|
| `ll-globals.css` | MODIFY | `prefers-reduced-motion` guards; `@media print` | **P0** |
| `components/report/ReportView.tsx` | MODIFY | **Fix signed URL — critical bug** | **P0** |
| `components/scan/ScanWorkflow.tsx` | MODIFY | Replace all `alert()` with toast | **P0** |
| `components/scan/ScanSubmitPanel.tsx` | MODIFY | Add View Report link + inspection ID | **P0** |
| `components/layout/AppShell.tsx` | MODIFY | Live pending count; fix nav order | **P0** |
| `components/dashboard/DashboardView.tsx` | MODIFY | Remove all MOCK_DASHBOARD_STATS | **P0** |
| `components/ui/Toast.tsx` | CREATE | Global toast system | **P0** |
| `layout.tsx` | MODIFY | Inter + JetBrains Mono fonts | P1 |
| `tailwind.config.ts` | MODIFY | Semantic color tokens, font families | P1 |
| `components/ui/ConfirmDialog.tsx` | CREATE | Modal for irreversible actions | P1 |
| `components/ui/Input.tsx` | CREATE | Reusable input primitive | P1 |
| `components/ui/Badge.tsx` | MODIFY | Add ClauseTag | P1 |
| `components/scan/AnalysisLoader.tsx` | MODIFY | Real pipeline stage prop | P1 |
| `components/scan/OcrReviewPanel.tsx` | MODIFY | Mobile layout fix; confidence legend | P1 |
| `components/scan/ComplianceChecklist.tsx` | MODIFY | Image natural size; DB persist edits | P1 |
| `components/repository/RepositoryView.tsx` | MODIFY | Date filter; mobile card layout | P1 |
| `components/review/ReviewQueueView.tsx` | REFACTOR | Split into 3 sub-components | P1 |
| `components/review/ReviewQueueList.tsx` | CREATE | Extracted queue list | P1 |
| `components/review/ReviewDetailPanel.tsx` | CREATE | Extracted detail pane | P1 |
| `components/review/VerificationPanel.tsx` | CREATE | Extracted verification panel | P1 |
| `lib/mock/data.ts` | MODIFY | Remove MOCK_DASHBOARD_STATS from production paths | P1 |
| `components/ui/DateRangePicker.tsx` | CREATE | Date range filter | P2 |
| `components/ui/Tooltip.tsx` | CREATE | Confidence % legend tooltip | P2 |
| `components/layout/Breadcrumbs.tsx` | CREATE | Nested route breadcrumbs | P2 |
| `components/layout/PageHeader.tsx` | CREATE | Shared page title + action slot | P2 |
| `components/ui/Card.tsx` | MODIFY | Add CardFooter export | P2 |

**P0 = Critical bug fix | P1 = High priority | P2 = Enhancement**

---

## 18. Frontend Implementation Roadmap

### Phase 1 — Design System Foundation
**Objective**: Core primitives, fonts, toast, confirm dialog  
**Files**: `ll-globals.css`, `tailwind.config.ts`, `layout.tsx`, `Toast.tsx`, `ConfirmDialog.tsx`, `Input.tsx`, `Badge.tsx`  
**Acceptance Criteria**:
- Inter + JetBrains Mono load from Google Fonts
- Toast appears top-right, auto-dismisses after 4s
- ConfirmDialog traps focus, closes on Escape
- Zero `alert()` calls remaining in codebase

### Phase 2 — Layout & Navigation
**Files**: `AppShell.tsx`, `Breadcrumbs.tsx`, `PageHeader.tsx`  
**Acceptance Criteria**:
- Pending badge shows live DB count
- Nav order: Dashboard → Scan → Repository → Review
- Heading hierarchy correct (one `<h1>` per page)
- Breadcrumbs on `/report/[id]`

### Phase 3 — Scan Experience
**Files**: `ScanWorkflow.tsx`, `ScanSubmitPanel.tsx`, `AnalysisLoader.tsx`, `OcrReviewPanel.tsx`, `ComplianceChecklist.tsx`  
**Acceptance Criteria**:
- No `alert()` anywhere in scan workflow
- "View Report" link navigates to `/report/[inspectionId]`
- BBox overlays render at correct image positions
- Manual corrections persist to `inspection_items` table

### Phase 4 — Dashboard
**Files**: `DashboardView.tsx`  
**Acceptance Criteria**:
- No MOCK_DASHBOARD_STATS references in production code
- Monthly chart uses real `created_at` timestamps
- 5th KPI (Compliance Rate) shown
- Loading shows skeleton layout

### Phase 5 — Repository
**Files**: `RepositoryView.tsx`, `DateRangePicker.tsx`  
**Acceptance Criteria**:
- Date range filter works
- Mobile shows card layout
- Search filters by product name and inspection ID

### Phase 6 — Review Queue
**Files**: Split into `ReviewQueueList.tsx`, `ReviewDetailPanel.tsx`, `VerificationPanel.tsx`  
**Acceptance Criteria**:
- No `alert()` in review flow
- ConfirmDialog before every verification action
- RBAC restriction shown as styled in-page message
- Evidence image loaded via signed URL

### Phase 7 — Report
**Files**: `ReportView.tsx`, `ll-globals.css`  
**Acceptance Criteria**:
- Evidence image loads from private Supabase storage (signed URL)
- Print layout: compliance stamp visible, sidebar/buttons hidden
- Audit trail readable as timeline

### Phase 8 — Responsive
- Verify all workflows on 768px, 390px
- Fix OcrReviewPanel mobile layout
- Repository card list on mobile

### Phase 9 — Accessibility
- axe-core: 0 errors on core pages
- Keyboard-only user can complete scan workflow

### Phase 10 — Animation & Polish
- All animations respect `prefers-reduced-motion`
- No transition > 500ms for interactive elements

### Phase 11 — QA
- Full workflow: upload image → OCR → submit → review → report
- Print test on Report page
- Mobile full workflow test

---

## 19. Dependencies

| Dependency | Status | Notes |
|---|---|---|
| `recharts` | Existing | Keep |
| `lucide-react` | Existing | Keep |
| `tesseract.js` | Existing | Keep; lazy-load |
| `@supabase/supabase-js` | Existing | Keep |
| Google Fonts: Inter | NEW | `next/font/google` |
| Google Fonts: JetBrains Mono | NEW | `next/font/google` |

**No new npm packages required.**

---

## 20. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `rule_checks` DB query for violations widget | Medium | Guard with `?.` and fallback to `[]` |
| Signed URL expiry during long review sessions | Medium | Refresh URL on panel open |
| Tesseract OCR accuracy on low-quality photos | High | Communicate manual correction is expected |
| ReviewQueueView refactor breaking state | Medium | Extract incrementally, test each step |
| BBox overlay accuracy after image size fix | Medium | Verify on multiple aspect ratios |
| Mock data still referenced in production | High | Systematic audit of all `MOCK_*` imports |

---

## 21. Acceptance Criteria

### Scan
- [ ] Upload real product image (JPG/PNG/WEBP/HEIC)
- [ ] OCR progress shows real pipeline stage
- [ ] Extracted fields visible with confidence color-coding
- [ ] Manual field corrections persist to `inspection_items`
- [ ] Rule failure shows clause reference + explanation
- [ ] Toast notification on submission (no `alert()`)
- [ ] "View Report" link navigates to correct report

### Dashboard
- [ ] All 5 KPIs computed from live DB data
- [ ] Monthly chart from real timestamps
- [ ] Loading: skeleton layout
- [ ] Error: retry button

### Repository
- [ ] Search by product name + inspection ID
- [ ] Date range filter works
- [ ] Mobile: card layout
- [ ] Pagination correct

### Review Queue
- [ ] Admin can verify with ConfirmDialog
- [ ] Non-admin sees styled restriction (not alert)
- [ ] Evidence image loads from signed URL
- [ ] Verification log entry created

### Report
- [ ] Evidence image from private storage (signed URL)
- [ ] Compliance stamp visible within 3s of load
- [ ] Print output readable
- [ ] Audit trail chronological

---

## 22. Testing & QA Plan

| Test | Steps | Pass Condition |
|---|---|---|
| Full scan workflow | Upload Kurkure packet → complete → submit | Report saved and navigable |
| Report link | Complete scan → "View Report" | `/report/[id]` loads with correct data |
| Evidence image | Open any report with evidence | Image renders (not broken) |
| Review verification | Admin selects pending → approves → confirms | Status → verified_compliant |
| Mobile scan | 390px viewport, full workflow | No horizontal scroll |
| Keyboard nav | Tab through scan workflow | All inputs focusable |
| Print report | Report → Export PDF | Sidebar hidden, stamp visible |
| Error recovery | Dashboard with no Supabase connection | Error alert with Retry |

---

## 23. Backend Compatibility Rules

> **MANDATORY — Read before any implementation begins.**

The following are fixed and must NOT be modified:

| System | Rule |
|---|---|
| **Supabase Auth** | Call `signIn()`, `signOut()`, `getCurrentUser()` — never bypass auth |
| **RLS Policies** | All DB access via service functions in `@/lib/supabase/inspections.ts` — never `supabase.from()` in components |
| **Private Storage** | Evidence ALWAYS via `createLabelEvidenceSignedUrl()` — NEVER expose raw `storage_path` |
| **Status Lifecycle** | `draft` → `pending_review` → `verified_compliant`/`verified_non_compliant` via `updateInspectionStatus()` only |
| **Inspection IDs** | Always `crypto.randomUUID()` — never fabricate or reuse |
| **inspection_items** | Written only via `saveInspectionItems()` |
| **rule_checks** | Written only via `saveRuleChecks()` |
| **verification_logs** | One entry per action via `createVerificationLog()` |
| **OCR Pipeline** | `runOCR()` → `extractLegalMetrologyFields()` → `evaluateRule6Compliance()` — order preserved |
| **getEffectiveUser()** | Dev fallback helper in `inspections.ts` — do not remove |

**Frontend consumes existing services. It never duplicates database logic.**

---

## 24. Final Recommended Implementation Order

```
PRIORITY 0 — Critical (implement first):
  1. ReportView — fix evidence image signed URL (production bug)
  2. ScanWorkflow + ScanSubmitPanel — remove alert(), add toast + report link
  3. AppShell — fix live pending count from Supabase
  4. DashboardView — remove all MOCK_DASHBOARD_STATS from production paths

PRIORITY 1 — Core UX (implement next):
  5.  Create Toast component + ToastProvider context
  6.  Create ConfirmDialog component
  7.  ReviewQueueView — replace alert() with ConfirmDialog + InlineAlert
  8.  ComplianceChecklist — fix image natural size, persist edits to DB
  9.  OcrReviewPanel — fix mobile layout, add confidence legend
  10. Add Inter + JetBrains Mono fonts to layout
  11. Derive real violation/trend data for Dashboard (live rule_checks)

PRIORITY 2 — Enhancement (implement last):
  12. Repository date range filter (DateRangePicker)
  13. Repository mobile card layout
  14. ReviewQueueView refactor → split into 3 files
  15. Breadcrumbs on nested routes
  16. Print CSS for Report export
  17. Accessibility fixes (aria-labels, reduced-motion, heading hierarchy)
  18. Skeleton loading states
```
