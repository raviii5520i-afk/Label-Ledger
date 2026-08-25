export const en = {
  landing: {
    title: "Turn Product Labels Into Compliance Decisions.",
    subtitle: "LabelGuard uses OCR, Legal Metrology rules, and secure evidence workflows to help inspectors verify packaged commodities faster and with greater confidence.",
    badge: "Legal Metrology Compliance Enforcement",
    nav: { howItWorks: "How It Works", features: "Platform Features", demo: "Interactive Demo", security: "GovTech Security" },
    buttons: { controlRoom: "Control Room", inspectorSignIn: "Inspector Sign In", startScan: "Start Scan", getAccess: "Get Access", startInspection: "Start Inspection", explorePlatform: "Explore Platform" }
  },
  navigation: { dashboard: "Dashboard", scanLabel: "Scan Label", repository: "Repository", reviewQueue: "Review Queue", navigationHeading: "Navigation", signOut: "Sign out", accessRestricted: "Access Restricted", inspectionReport: "Inspection Report" },
  scan: {
    title: "Scan Product Label",
    subtitle: "Upload a label photo to auto-extract declarations and check compliance.",
    steps: { upload: "Upload Label", analyzing: "AI OCR Scan", review: "OCR Review", checklist: "Rule 6 Check", submit: "Submit" },
    status: { ready: "STATUS: READY", scanning: "STATUS: SCANNING", extraction: "STATUS: EXTRACTION", evaluating: "STATUS: EVALUATING", reportReady: "STATUS: REPORT_READY" },
    upload: { dragAndDrop: "Drag and drop a product label image here", clickToBrowse: "or click to browse", supportTypes: "Supports JPEG, PNG, WEBP up to 5MB" },
    review: { title: "OCR Extraction Review", imported: "Is this an imported product?", productName: "Product Name", missingFields: "Review missing fields", confirm: "Confirm Extraction" },
    submitPanel: { success: "Inspection complete!", savedToRepo: "Your inspection has been saved to the repository.", scanAnother: "Scan Another Label", submittedReview: "Submitted for Review", submittedViolations: "Submitted — Violations Flagged", subtext: "has been submitted. An enforcement officer will verify this inspection.", idUnavailable: "Inspection ID unavailable. Please retry or open the inspection from Repository.", declarationsPassed: "Declarations passed", violationsFound: "Violations found", status: "Status", pendingReview: "Pending Review", flaggedClauses: "Flagged clauses", viewReport: "View Inspection Report" }
  },
  compliance: {
    rule6Evaluation: "Rule 6 Evaluation",
    compliant: "COMPLIANT",
    reviewRequired: "REVIEW REQUIRED",
    pendingInspection: "PENDING INSPECTION",
    waiting: "WAITING",
    saveDraft: "Save Draft",
    submitForReview: "Submit for Review",
    ruleDescription: "Rule Description",
    extractedValue: "Extracted Value",
    status: "Status"
  },
  repository: {
    title: "Inspection Repository",
    search: "Search inspections...",
    noInspections: "No inspections found.",
    filters: { all: "All", draft: "Draft", pending: "Pending Review", compliant: "Compliant", nonCompliant: "Non-Compliant" },
    table: { id: "ID", date: "Date", product: "Product", status: "Status", actions: "Actions" }
  },
  dashboard: {
    title: "Dashboard",
    totalInspections: "Total Inspections",
    compliant: "Compliant",
    nonCompliant: "Non-Compliant",
    pendingReview: "Pending Review",
    recentActivity: "Recent Activity"
  },
  reviewQueue: {
    title: "Review Queue",
    approve: "Approve",
    reject: "Reject",
    noPending: "No pending inspections to review."
  }
};
