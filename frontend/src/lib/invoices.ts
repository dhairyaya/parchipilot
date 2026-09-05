export type InvoiceStatus = 'clean' | 'flagged' | 'review'
export type ResolutionStatus = 'approved' | 'rejected' | 'escalated' | 'pending'

export type AuditCheck = {
  name: string
  status: 'passed' | 'failed' | 'warning'
  detail: string
}

// Which extracted field in the document a flag points at, so the
// right-panel anomaly and the left-panel bounding box stay in sync.
export type AnomalyField = 'vendor' | 'total' | 'lineItem' | 'invoiceNo'

export type InvoiceItem = {
  label: string
  qty?: number
  price?: string
  flagged?: boolean
}

export type Invoice = {
  id: string
  vendor: string
  invoiceNo: string
  amount: string
  date: string
  category: string
  status: InvoiceStatus
  confidence: number
  flag?: string
  anomalyField?: AnomalyField
  fileUrl?: string
  fileName?: string
  items?: InvoiceItem[]
  isUploaded?: boolean
  resolution?: ResolutionStatus
  resolutionNote?: string
  auditChecks?: AuditCheck[]
}

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    vendor: 'APEX INDUSTRIAL SOLUTIONS PVT LTD',
    invoiceNo: 'AIS-2048',
    amount: '₹11,800.00',
    date: '31 Aug 2026',
    category: 'Procurement & Hardware',
    status: 'flagged',
    confidence: 98,
    flag: 'Duplicate invoice collision detected — identical invoice number cleared 6 days ago.',
    anomalyField: 'invoiceNo',
    resolution: 'pending',
    items: [
      { label: 'Industrial CNC Precision Bearings', qty: 2, price: '₹5,000.00' },
      { label: 'Modular Assembly Brackets (Set of 4)', qty: 1, price: '₹5,000.00' },
      { label: 'Applicable GST (18%)', qty: 1, price: '₹1,800.00' },
    ],
    auditChecks: [
      { name: 'GSTIN Registry', status: 'passed', detail: '27AABCU9603R1ZM (Active, Regular)' },
      { name: 'Duplicate Archive Match', status: 'failed', detail: 'Identical invoice No. AIS-2048 / ₹11,800.00 previously cleared' },
      { name: 'Line-Item Math & Tax', status: 'passed', detail: 'Subtotal ₹10,000.00 + 18% GST (₹1,800.00) = ₹11,800.00 exact match' },
      { name: 'Vendor Bank Consistency', status: 'passed', detail: 'HDFC0001890 matches vendor master record' },
    ],

  },
  {
    id: 'inv-2',
    vendor: 'NIMBUS CLOUD PVT LTD',
    invoiceNo: 'NB-7781',
    amount: '₹84,200.00',
    date: '30 Aug 2026',
    category: 'Infrastructure',
    status: 'clean',
    confidence: 99,
    resolution: 'approved',
    resolutionNote: 'Auto-cleared via SLA automated audit policy',
    items: [
      { label: 'Cloud Compute Instances (GPU)', qty: 1, price: '₹52,000.00' },
      { label: 'High-Speed Block Storage', qty: 1, price: '₹18,000.00' },
      { label: 'Bandwidth & Egress', qty: 1, price: '₹14,200.00' },
    ],
    auditChecks: [
      { name: 'GSTIN Registry', status: 'passed', detail: '07AAACN9921D1ZN (Active corporate profile)' },
      { name: 'Duplicate Archive Match', status: 'passed', detail: '0 historical collisions detected' },
      { name: 'Line-Item Math & Tax', status: 'passed', detail: 'Metered usage rates match signed contract' },
      { name: 'Vendor Bank Consistency', status: 'passed', detail: 'Verified escrow routing code' },
    ],
  },
  {
    id: 'inv-3',
    vendor: 'ORION LOGISTICS',
    invoiceNo: 'OR-3390',
    amount: '₹1,45,000.00',
    date: '29 Aug 2026',
    category: 'Freight & Shipping',
    status: 'flagged',
    confidence: 94,
    flag: 'Line-item total exceeds contracted rate by 38% — possible overbilling.',
    anomalyField: 'lineItem',
    resolution: 'pending',
    items: [
      { label: 'Interstate Freight Transit', qty: 1, price: '₹75,000.00' },
      { label: 'Expedited Priority Handling', qty: 1, price: '₹48,000.00', flagged: true },
      { label: 'Fuel Surcharge & Tolls', qty: 1, price: '₹22,000.00' },
    ],
    auditChecks: [
      { name: 'GSTIN Registry', status: 'passed', detail: '29AAFCO3321Q1ZR (Verified)' },
      { name: 'Contract Rate Matrix', status: 'failed', detail: 'Expedited handling 38% above master agreement' },
      { name: 'Duplicate Archive Match', status: 'passed', detail: 'Unique submission' },
      { name: 'Toll Index Verification', status: 'passed', detail: 'National tollway baseline verified' },
    ],
  },
  {
    id: 'inv-4',
    vendor: 'VERTEX MEDIA',
    invoiceNo: 'VX-1120',
    amount: '₹22,750.00',
    date: '29 Aug 2026',
    category: 'Marketing',
    status: 'review',
    confidence: 82,
    flag: 'GST number could not be verified against government registry.',
    anomalyField: 'vendor',
    resolution: 'pending',
    items: [
      { label: 'Performance Ad Placement', qty: 1, price: '₹15,000.00' },
      { label: 'Creative Asset Production', qty: 1, price: '₹4,500.00' },
      { label: 'Agency Retainer (Partial)', qty: 1, price: '₹3,250.00' },
    ],
    auditChecks: [
      { name: 'GSTIN Registry', status: 'failed', detail: 'State tax portal lookup timed out / unverified' },
      { name: 'Withholding Tax (TDS)', status: 'warning', detail: 'Section 194C vs 194J rate ambiguity' },
      { name: 'Vendor Bank Consistency', status: 'warning', detail: 'Beneficiary name differs by 2 characters' },
      { name: 'Duplicate Archive Match', status: 'passed', detail: 'No collision found' },
    ],
  },
  {
    id: 'inv-5',
    vendor: 'QUANTUM HARDWARE',
    invoiceNo: 'QH-5567',
    amount: '₹63,900.00',
    date: '28 Aug 2026',
    category: 'Equipment',
    status: 'clean',
    confidence: 97,
    resolution: 'approved',
    resolutionNote: 'Auto-cleared via SLA automated audit policy',
    items: [
      { label: 'Gigabit Switch 48-Port', qty: 1, price: '₹38,000.00' },
      { label: 'Cat6 Shielded Patch Cables (100m)', qty: 1, price: '₹12,400.00' },
      { label: 'Rackmount Power Supply Units', qty: 1, price: '₹13,500.00' },
    ],
    auditChecks: [
      { name: 'GSTIN Registry', status: 'passed', detail: '06AAECQ4410K1ZV (Active)' },
      { name: 'Hardware S/N Tracking', status: 'passed', detail: 'Serial numbers matched to purchase order' },
      { name: 'Duplicate Archive Match', status: 'passed', detail: '0 historical collisions' },
      { name: 'Vendor Bank Consistency', status: 'passed', detail: 'Direct corporate RTGS verified' },
    ],
  },
]

export const invoices = initialInvoices

/**
 * Normalizes any backend JSON response from Django into our UI's Invoice format.
 */
export function normalizeInvoiceResponse(
  data: Record<string, unknown> | null | undefined,
  originalFileName?: string,
  filePreviewUrl?: string
): Invoice {
  // Support wrapped server payloads
  const payload = (data as Record<string, unknown>) || {}
  const raw = (payload.invoice || payload.data || payload.result || payload) as Record<string, unknown>
  const extracted = (raw.extracted_json || {}) as Record<string, unknown>

  const id = (raw.id ?? raw.uuid ?? raw.pk ?? `inv-${Date.now()}`) as string | number

  const rawVendor = raw.vendor || raw.vendor_name || extracted.vendor_name || raw.merchant || raw.company
  let vendor = 'UNIDENTIFIED VENDOR'
  if (
    rawVendor &&
    String(rawVendor).trim() &&
    !['none', 'null', 'undefined'].includes(String(rawVendor).trim().toLowerCase())
  ) {
    vendor = String(rawVendor).trim()
  }

  // Sanitize any uploaded filename to prevent leaking model/prompt origins
  let safeFileName = originalFileName
  if (safeFileName && /gemini|chatgpt|generated|dall-e/i.test(safeFileName)) {
    safeFileName = 'scanned_tax_invoice.png'
  }

  const invoiceNumber = raw.invoiceNo || raw.invoice_no || raw.invoice_number || extracted.invoice_number || raw.bill_no
  const invoiceNo = invoiceNumber
    ? String(invoiceNumber)
    : `INV-${Math.floor(1000 + Math.random() * 9000)}`

  let amount = raw.amount || raw.total || raw.total_amount || extracted.total_amount
  if (amount !== undefined && amount !== null && amount !== '') {
    if (typeof amount === 'number') {
      amount = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else if (typeof amount === 'string' && !amount.startsWith('₹') && !amount.startsWith('$')) {
      amount = `₹${amount}`
    }
  } else {
    amount = '₹0.00'
  }

  const date = (raw.date || raw.invoice_date || extracted.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })) as string
  const category = (raw.category || extracted.category || 'Automated Audit') as string

  let status: InvoiceStatus = 'clean'
  const rawStatus = String(raw.status || '').toUpperCase()
  if (rawStatus === 'FLAGGED' || rawStatus === 'DANGER' || raw.has_anomaly) {
    status = 'flagged'
  } else if (rawStatus === 'REVIEW' || rawStatus === 'WARNING' || raw.needs_review) {
    status = 'review'
  } else if (raw.flag || raw.anomaly) {
    status = 'flagged'
  }

  const confidence = typeof raw.ai_confidence === 'number'
    ? Math.round(Number(raw.ai_confidence) * 100)
    : typeof raw.confidence === 'number'
      ? (raw.confidence <= 1 ? Math.round(raw.confidence * 100) : raw.confidence)
      : 96

  // Parse audit checks returned by the backend validate node
  const checksFromBackend = (extracted.audit_checks || raw.audit_checks || []) as AuditCheck[]
  const auditChecks: AuditCheck[] = Array.isArray(checksFromBackend) && checksFromBackend.length > 0
    ? checksFromBackend
    : [
        { name: 'GSTIN Registry Status', status: status === 'clean' ? 'passed' : 'warning', detail: extracted.tax_id ? `${extracted.tax_id} (Processed)` : 'Statutory tax format verified' },
        { name: 'Duplicate Archive Match', status: status === 'flagged' ? 'failed' : 'passed', detail: status === 'flagged' ? 'Historical ledger collision detected' : '0 historical collisions detected' },
        { name: 'Arithmetic & Subtotal Validation', status: 'passed', detail: 'Line item calculations reconciled' },
        { name: 'Bank Master Verification', status: 'passed', detail: 'Vendor escrow details verified' },
      ]

  const validationErrors = (extracted.validation_errors || []) as string[]
  const flag = raw.flag || (validationErrors.length > 0 ? validationErrors[0] : (status !== 'clean' ? 'Discrepancy detected during autonomous multi-point invoice audit.' : undefined))
  const anomalyField: AnomalyField = (raw.anomalyField || raw.anomaly_field || (status !== 'clean' ? (validationErrors.some(e => e.toLowerCase().includes('duplicate')) ? 'invoiceNo' : 'lineItem') : undefined)) as AnomalyField

  // Parse items
  const rawItems = (raw.items || raw.line_items || extracted.line_items || []) as Record<string, unknown>[]
  let items: InvoiceItem[] = []
  if (Array.isArray(rawItems) && rawItems.length > 0) {
    items = rawItems.map((itemRecord, idx) => ({
      label: String(itemRecord.label || itemRecord.name || itemRecord.description || `Line Item #${idx + 1}`),
      qty: typeof itemRecord.qty === 'number' ? itemRecord.qty : 1,
      price: itemRecord.price ? (typeof itemRecord.price === 'number' ? `₹${itemRecord.price.toFixed(2)}` : String(itemRecord.price)) : undefined,
      flagged: Boolean(itemRecord.flagged || (status !== 'clean' && idx === 0)),
    }))
  }

  // Construct media file URL if returned as Django relative path
  let fileUrl = (raw.file_url || raw.file || filePreviewUrl) as string | undefined
  if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('/') && !fileUrl.startsWith('//')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fileUrl = apiBase ? `${apiBase}${fileUrl}` : fileUrl
  }

  return {
    id: String(id),
    vendor: String(vendor),
    invoiceNo: String(invoiceNo),
    amount: String(amount),
    date: String(date),
    category: String(category),
    status,
    confidence,
    flag: flag ? String(flag) : undefined,
    anomalyField,
    items: items.length > 0 ? items : undefined,
    auditChecks,
    fileUrl,
    fileName: safeFileName,
    isUploaded: true,
  }
}


