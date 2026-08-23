# PRD — Label Ledger: Legal Metrology Compliance Checker

**Team size:** 3  
**Stack:** Next.js + Tailwind CSS · Supabase (DB / Auth / Storage) · Vercel (hosting) · OCR + AI extraction · Rule engine · Human verification

> Assumption: since exact sprint length wasn't specified, phases below are sized in relative units ("sprints") rather than calendar dates — adjust to your actual hackathon/project timeline. Each phase lists a suggested 3-way task split; rebalance based on who's strongest where.

---

## 1. Problem & Goal

Enforcement officials manually inspect packaged-commodity labels against the Legal Metrology (Packaged Commodities) Rules, 2011 — a slow, inconsistent process at retail scale.

**Goal:** give inspectors a web app that scans a label photo, auto-extracts the mandatory declarations, flags violations against a rule engine, lets a human verify before finalizing, and gives enforcement officers a dashboard over all inspections.

**Success looks like:**
- An inspector can go from "photo of a label" to "signed-off compliance report" in under 2 minutes.
- Extraction accuracy is high enough that manual correction is the exception, not the rule.
- Every finalized report has an auditable trail: image evidence, extracted fields, rule checks, and the inspector who verified it.

---

## 2. Roles

| Role | Can do |
|------|--------|
| Field Inspector | Upload/scan labels, correct extracted fields, submit for verification, view own inspection history |
| Enforcement Officer (Admin) | Everything above + dashboard across all inspectors, verify/override flagged items, delete/archive records, manage rules |

Auth via Supabase Auth (email/password or magic link), role stored in a `profiles` table, enforced with Row Level Security (RLS).

---

## 3. System Architecture (high level)

```
┌─────────────────────────┐
│ Next.js (App Router)    │  Inspector app + Dashboard, Tailwind UI
│  - /scan  /dashboard    │
│  - /repository /report  │
└──────────┬───────────────┘
           │ Server Actions / API Routes
           ▼
┌─────────────────────────┐      ┌────────────────────┐
│ OCR + AI Extraction      │◄────►│ Rule Engine          │
│ (edge/serverless function│      │ (rules table + logic)│
│  or 3rd-party OCR API)   │      └────────────────────┘
└──────────┬───────────────┘
           ▼
┌─────────────────────────┐
│ Supabase                 │
│  - Postgres (data)       │
│  - Storage (label images)│
│  - Auth (roles)          │
└─────────────────────────┘
           │
           ▼
        Vercel (deploy + hosting, cron for batch jobs if needed)
```

### Data model (Supabase / Postgres) — starting schema:

```sql
profiles        (id, full_name, role ['inspector'|'admin'], email, created_at)
rules           (id, clause, label, category, mandatory, is_conditional, pattern_or_logic, active)
inspections     (id, inspector_id, product_name, is_imported, status
                 ['draft'|'pending_review'|'verified_compliant'|'verified_non_compliant'],
                 created_at, verified_by, verified_at)
declarations    (id, inspection_id, rule_id, found boolean, extracted_value,
                 bbox jsonb, confidence numeric, manually_corrected boolean)
evidence_images (id, inspection_id, storage_path, annotated_storage_path, caption)
audit_log       (id, inspection_id, actor_id, action, note, created_at)
```

**RLS:** inspectors can select/insert/update their own inspections rows where `status = 'draft'`; only admin role can update status to a `verified_*` state or delete records.

---

## 4. Suggested 3-way role split

| Role | Responsibilities |
|------|-----------------|
| **A — Frontend & Reporting** | Next.js/Tailwind UI (scan flow, dashboard, repository, report view/print/export), client-side state, forms |
| **B — Backend & Data** | Supabase schema/RLS/Auth, API routes / server actions, rule engine logic, Vercel deployment/env config |
| **C — AI/Vision Pipeline** | OCR integration, AI field-extraction prompt/service, image evidence highlighting (bounding boxes), accuracy tuning |

Expect real overlap — especially B↔C on how extracted fields get passed to the rule engine, and A↔C on rendering bounding-box overlays. Pair on those seams rather than working in silos.

---

## 5. Phases

### Phase 0 — Setup & Foundations

**Goal:** everyone can run the app locally and ship to a shared Vercel preview.

| Who | Tasks |
|-----|-------|
| A | `create-next-app` (App Router, TS), Tailwind config, base layout, design tokens/theme, routing skeleton (`/scan`, `/dashboard`, `/repository`, `/report/[id]`) |
| B | Supabase project, profiles/rules/inspections/declarations/evidence_images/audit_log tables + RLS policies, seed the rules table with Rule 6 declarations, connect Vercel↔GitHub↔Supabase env vars |
| C | Evaluate OCR options (Tesseract.js client-side vs a hosted OCR API vs Supabase Edge Function wrapping one), evaluate AI extraction approach (regex baseline vs LLM-based field extraction), spike a proof-of-concept on 3–5 sample label photos |

**Exit criteria:** empty app deploys to Vercel; Supabase tables exist with RLS; OCR spike returns text from a real photo.

---

### Phase 1 — Core Scan MVP (manual-first)

**Goal:** an inspector can upload a label, see extracted text, manually confirm fields, and save a draft inspection.

| Who | Tasks |
|-----|-------|
| A | `/scan` page: image upload UI, product name / inspector / imported-flag form, editable extracted-text panel, "save draft" |
| B | inspections CRUD via server actions, Supabase Storage upload for label images, API route/server action to persist a draft |
| C | Wire OCR call into the scan flow; return raw text + word bounding boxes to the frontend |

**Exit criteria:** a real photo → OCR text → saved `inspections` row with an image in Supabase Storage.

---

### Phase 2 — AI Field Extraction + Rule Engine

**Goal:** move from "raw OCR text" to structured fields, and auto-check them against the rules table.

| Who | Tasks |
|-----|-------|
| A | Render the compliance checklist table (clause, declaration, found/missing, extracted value) on `/scan` results |
| B | Rule engine module: given extracted fields + rules table, output found/missing + violations; API route `POST /api/inspections/[id]/check` |
| C | AI extraction step: OCR text → structured fields (`product_name`, `mrp`, `net_quantity`, `mfg_date`, `manufacturer_address`, `consumer_care`, `country_of_origin`), with a confidence score per field; fall back to regex rules where AI is uncertain |

**Exit criteria:** a saved inspection shows a real found/missing table with extracted values, generated automatically (not hand-typed).

---

### Phase 3 — Evidence Highlighting & Report Output

**Goal:** each declaration is backed by visual evidence, and a shareable report exists.

| Who | Tasks |
|-----|-------|
| A | Report view (`/report/[id]`): compliance stamp, checklist, evidence thumbnails, "Export PDF" / "Export CSV" |
| B | Store bbox per declaration in `declarations`, serve annotated image (or overlay coordinates) via API; PDF generation (server-side, e.g. `@react-pdf/renderer` or headless print) |
| C | Draw bounding-box overlays on the label image for each matched declaration (crop + highlight as "evidence"); basic font-size/readability heuristic from bbox height |

**Exit criteria:** opening a report shows the label image with highlighted regions per declaration, and a PDF can be exported.

---

### Phase 4 — Dashboard, Repository & Search

**Goal:** officers can see everything, not just one inspection at a time.

| Who | Tasks |
|-----|-------|
| A | `/dashboard` (aggregate stats, most-frequent-violations chart), `/repository` (searchable/filterable table by product, status, date, inspector) |
| B | Aggregation queries (Postgres views or RPC functions) for dashboard stats; pagination for repository |
| C | Support batch/bulk view of extraction confidence across records (helps prioritize which need review) |

**Exit criteria:** dashboard reflects real data across multiple inspectors' inspections; repository search works.

---

### Phase 5 — Human Verification Workflow & Roles

**Goal:** nothing becomes a final report without a human checking it — this is the safety net for AI extraction errors.

| Who | Tasks |
|-----|-------|
| A | Review queue UI for admins: list of `pending_review` inspections, side-by-side extracted-value vs. image, approve/override/reject controls |
| B | Status transitions (`draft → pending_review → verified_*`) with RLS enforcing who can move which state; `audit_log` writes on every verification action |
| C | Surface low-confidence fields prominently in the review UI so reviewers know what to double-check first |

**Exit criteria:** an inspector submits a scan, an admin reviews and verifies it, and the audit log shows both actions.

---

### Phase 6 — Hardening, Testing & Demo Prep

**Goal:** stable enough to demo/ship.

| Who | Tasks |
|-----|-------|
| A | Responsive/mobile pass, empty/error states, loading states |
| B | RLS review (no data leaks across inspectors), rate-limit or size-limit uploads, production env vars on Vercel, basic load test |
| C | Accuracy pass on a labeled test set of ~20–30 real product photos; document known failure modes |
| **All** | End-to-end test of the full flow: scan → extract → rule check → evidence → verify → export |

**Exit criteria:** the full flow works end-to-end on a fresh Vercel deployment with no local-only dependencies.

---

## 6. Non-functional requirements

- **Security:** RLS on every table; images in a private Supabase Storage bucket with signed URLs, not public.
- **Auditability:** every status change and manual correction logged in `audit_log`.
- **Accuracy over automation:** AI extraction never auto-finalizes a report — Phase 5's human verification is mandatory, not optional.
- **Accessibility:** keyboard-navigable forms, sufficient color contrast on status pills/stamps.

---

## 7. Out of scope (for now)

- Real-time multi-inspector collaboration on a single scan.
- Offline/mobile-native app (PWA could be a later stretch goal).
- Automated legal citation validation beyond the seeded rules table (legal text should be reviewed by a human before enforcement use).

---

## 8. Open questions to resolve as a team

1. Which OCR/AI extraction service — self-hosted (Tesseract.js) vs. a paid OCR API vs. an LLM-based extractor? (Affects cost, accuracy, and Phase 0/2 timeline.)
2. What's the actual sprint length/deadline, so Phase durations can be converted from relative units to real dates?
3. Do inspectors need offline capture (photo now, submit later) for low-connectivity retail sites?