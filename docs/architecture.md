# Label-Ledger Architecture & Organization

This document explains the conceptual architecture of the Label-Ledger application and how the current folder structure maps to this design. 

In order to maintain strict compatibility with Next.js App Router and Supabase CLI conventions, the physical folder structure has been preserved.

## Conceptual Architecture

The application is built on a modern, unified full-stack architecture:

```text
Label-Ledger
│
├── FRONTEND
│   ├── Next.js / React (App Router)
│   ├── Components (Tailwind CSS, Radix UI primitives)
│   └── User Interface & Layouts
│
├── BACKEND
│   ├── API Routes (Serverless endpoints)
│   ├── OCR Engine (Multi-pass Canvas processing)
│   ├── Gemini Vision (Semantic extraction)
│   ├── Tesseract.js (Spatial bounding boxes)
│   └── Compliance Logic (Rule 6 validation)
│
└── DATABASE
    ├── Supabase (Managed PostgreSQL)
    ├── PostgreSQL (Schema and Relational Data)
    ├── RLS (Row Level Security policies)
    ├── Triggers (Automated integrity checks)
    └── Migrations (Version-controlled schema)
```

## Directory Mapping

Here is how the physical directories in the repository map to the conceptual architecture:

### FRONTEND
- **`src/app/`**: Next.js App Router pages, layouts, and routing logic.
- **`src/app/dashboard/LabelGuard/`**: The core application module containing the Dashboard, Scan Label workflow, and Reports.
- **`src/app/dashboard/LabelGuard/components/`**: React components specifically tailored for the LabelGuard features (e.g., UI primitives, overlays, uploaders).
- **`src/app/dashboard/LabelGuard/ll-globals.css`**: Global stylesheet for the application.

### BACKEND
- **`src/app/api/`**: Next.js Serverless API Routes (e.g., the `ocr/ai-vision` endpoint that securely communicates with Gemini).
- **`src/lib/ocr/`**: Core Optical Character Recognition logic.
  - `engine.ts`: Preprocessing and Tesseract execution.
  - `extractor.ts`: Legal Metrology logic and data sanitization.
  - `fusion.ts`: Hybrid engine combining Tesseract and Gemini outputs.
  - `rules.ts`: Compliance rule validation checks.
- **`src/lib/supabase/`**: Backend service wrappers for Supabase (Auth, Storage, Inspections, RBAC).

### DATABASE
- **`src/app/dashboard/LabelGuard/supabase/migrations/`**: Version-controlled SQL migrations that define the PostgreSQL database schema.
- **`supabase/migrations/`**: Legacy/root migration folder (retained for backward compatibility with Supabase CLI).
- **Database Functions & Triggers**: Defined within the migration files (e.g., `010_sync_inspection_created_by.sql`, `011_fix_inspections_status_constraint.sql`) to enforce data integrity and authorization via Row Level Security (RLS).
