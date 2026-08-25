'use client';

import { PageHeader } from '../components/ui/PageHeader';
import { BookOpen, Scale, FileText, CheckCircle2 } from 'lucide-react';

const LEGAL_METROLOGY_RULES = [
  {
    id: 'LM-01',
    clause: 'Rule 6(1)(a)',
    requirement: 'Name/Generic Name of the Commodity',
    checks: 'Must be clearly declared on the principal display panel.',
    status: 'Automated',
  },
  {
    id: 'LM-02',
    clause: 'Rule 6(1)(b)',
    requirement: 'Manufacturer/Packer Details',
    checks: 'Complete manufacturer, packer, or importer details including street address, city, state, and pin code.',
    status: 'Automated',
  },
  {
    id: 'LM-03',
    clause: 'Rule 6(1)(c)',
    requirement: 'Net Quantity',
    checks: 'Declared in terms of standard unit of weight, measure, or number.',
    status: 'Automated',
  },
  {
    id: 'LM-04',
    clause: 'Rule 6(1)(d)',
    requirement: 'Maximum Retail Price (MRP)',
    checks: 'Clearly declared as "MRP Rs. ... incl. of all taxes".',
    status: 'Automated',
  },
  {
    id: 'LM-05',
    clause: 'Rule 6(1)(e)',
    requirement: 'Date of Manufacture',
    checks: 'Month and year of manufacture, pre-packing, or import.',
    status: 'Automated',
  },
  {
    id: 'LM-06',
    clause: 'Rule 6(1)(f)',
    requirement: 'Consumer Care Details',
    checks: 'Contact name, address, phone number, and email.',
    status: 'Automated',
  },
  {
    id: 'LM-07',
    clause: 'Rule 6(1)(g)',
    requirement: 'Country of Origin',
    checks: 'Required for all imported pre-packaged commodities.',
    status: 'Automated',
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
        <PageHeader 
          title="Inspection Rule" 
          description="Documentation of the compliance checks automated by LabelGuard."
        />

        <div className="bg-white border border-[var(--lg-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--lg-border)] bg-[var(--lg-background)]">
            <h2 className="text-lg font-bold text-[var(--lg-navy)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--lg-green-accent)]" />
              Rule 6 of Legal Metrology (Packaged Commodities) Rules, 2011
            </h2>
            <p className="text-sm text-[var(--lg-muted)] mt-1">
              Every package shall bear thereon or on a label securely affixed thereto, a definite, plain and conspicuous declaration made in accordance with the provisions of this chapter.
            </p>
          </div>

          <div className="divide-y divide-[var(--lg-border)]">
            {LEGAL_METROLOGY_RULES.map((rule) => (
              <div key={rule.id} className="p-6 flex flex-col md:flex-row md:items-start gap-4 hover:bg-[var(--lg-background)]/50 transition-colors">
                <div className="w-full md:w-1/4 shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--lg-navy)]/5 text-[var(--lg-navy)] text-xs font-bold mb-2 font-mono">
                    {rule.clause}
                  </div>
                  <div className="text-[10px] text-[var(--lg-muted)] font-mono">
                    ID: {rule.id}
                  </div>
                </div>
                
                <div className="w-full md:w-2/4">
                  <h3 className="text-base font-bold text-[var(--lg-navy)] mb-1.5 flex items-center gap-2">
                    {rule.requirement}
                  </h3>
                  <p className="text-sm text-[var(--lg-muted)] flex gap-2">
                    <FileText className="w-4 h-4 mt-0.5 shrink-0 text-[var(--lg-border)]" />
                    {rule.checks}
                  </p>
                </div>
                
                <div className="w-full md:w-1/4 flex md:justify-end">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--lg-green-light)] text-[var(--lg-green-accent)] text-xs font-bold border border-[var(--lg-green-accent)]/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {rule.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
