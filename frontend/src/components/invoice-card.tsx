import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Hash,
  Calendar,
  Check,
  X,
  AlertOctagon,
  Shield,
  FileCheck2,
} from 'lucide-react'
import type { Invoice, ResolutionStatus } from '../lib/invoices'

const statusMeta = {
  clean: {
    label: 'VERIFIED CLEAN',
    icon: CheckCircle2,
    className: 'text-success',
    chip: 'border-success/30 bg-success/10 text-success',
  },
  review: {
    label: '⚠️ NEEDS REVIEW',
    icon: Eye,
    className: 'text-warning',
    chip: 'border-warning/40 bg-warning/10 text-warning',
  },
  flagged: {
    label: '⚠️ FLAG DETECTED',
    icon: AlertTriangle,
    className: 'text-danger',
    chip: 'border-danger/40 bg-danger/10 text-danger',
  },
} as const

interface InvoiceCardProps {
  invoice: Invoice
  selected?: boolean
  onSelect?: (id: string) => void
  hoveredAnomalyKey?: string | null
  onHoverAnomaly?: (key: string | null) => void
  isHoveredFromDoc?: boolean
  onResolve?: (id: string, action: ResolutionStatus, note?: string) => void
}

export function InvoiceCard({
  invoice,
  selected = false,
  onSelect,
  hoveredAnomalyKey,
  onHoverAnomaly,
  isHoveredFromDoc = false,
  onResolve,
}: InvoiceCardProps) {
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false)
  const meta = statusMeta[invoice.status]
  const Icon = meta.icon
  const isAnomaly = invoice.status !== 'clean'
  const isAnomalyHovered =
    Boolean(hoveredAnomalyKey) &&
    (hoveredAnomalyKey === invoice.anomalyField ||
      (hoveredAnomalyKey === 'lineItem' && !invoice.anomalyField))

  const isCleanOrResolved = invoice.status === 'clean' || invoice.resolution === 'approved'

  const glowClass =
    invoice.status === 'flagged'
      ? 'danger-glow'
      : invoice.status === 'review'
        ? 'warn-glow'
        : ''

  return (
    <article
      onClick={onSelect ? () => onSelect(invoice.id) : undefined}
      aria-current={selected || undefined}
      className={`glass relative overflow-hidden rounded-2xl p-5 transition-all duration-150 ease-out hover:-translate-y-0.5 ${glowClass} ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'glow-ring ring-2 ring-glow/90 border-glow/60 bg-surface/70'
          : isHoveredFromDoc
            ? 'ring-2 ring-accent/80 border-accent/60 bg-surface/60 scale-[1.01]'
            : 'border-border hover:border-glow/40 hover:bg-surface/40'
      }`}
    >
      {/* Accent edge for anomalies */}
      {isAnomaly && !isCleanOrResolved && (
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 w-1.5 transition-all duration-150 ${
            isAnomalyHovered
              ? 'w-2.5 bg-danger shadow-[0_0_12px_rgba(239,68,68,0.8)]'
              : invoice.status === 'flagged'
                ? 'bg-danger'
                : 'bg-warning'
          }`}
        />
      )}

      {/* State 1: Clean or Resolved (Top Green Success Banner with Subtext) */}
      {isCleanOrResolved && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="h-3.5 w-3.5" />
            Payment Approved &amp; Queued for ERP
          </span>
          <span className="text-[10px] opacity-75">
            {invoice.resolutionNote || 'Auto-cleared via SLA policy'}
          </span>
        </div>
      )}

      {/* State 2 & 3 Rejection or Escalation Banners */}
      {!isCleanOrResolved && invoice.resolution === 'rejected' && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400">
          <span className="flex items-center gap-1.5">
            <X className="h-3.5 w-3.5" />
            Invoice Rejected — Discrepancy Notice Sent
          </span>
          <span className="text-[10px] opacity-75">{invoice.resolutionNote || 'Dispatched to vendor'}</span>
        </div>
      )}

      {!isCleanOrResolved && invoice.resolution === 'escalated' && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
          <span className="flex items-center gap-1.5">
            <AlertOctagon className="h-3.5 w-3.5" />
            Escalated to CFO / Compliance Team
          </span>
          <span className="text-[10px] opacity-75">{invoice.resolutionNote || 'Pending approval'}</span>
        </div>
      )}

  <div className="flex items-start justify-between gap-4">
  <div className="min-w-0 flex-1">
    <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
      {invoice.vendor}
    </h3>
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-silver/80">
      <span className="inline-flex items-center gap-1 font-mono">
        <Hash className="h-3 w-3" />
        {invoice.invoiceNo}
      </span>
      <span className="inline-flex items-center gap-1 font-mono">
        <Calendar className="h-3 w-3" />
        {invoice.date}
      </span>
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium">
        {invoice.category}
      </span>
    </div>
  </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-3xl font-extrabold leading-none tracking-tight text-foreground sm:text-4xl">
            {invoice.amount}
          </p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Total Amount
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${meta.chip} ${
            isAnomaly ? 'animate-warn-flash' : ''
          }`}
        >
          {invoice.status === 'clean' && <Icon className="h-3.5 w-3.5" />}
          {meta.label}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowConfidenceDetails(!showConfidenceDetails)
          }}
          className="group/conf inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-glow/60 hover:text-foreground"
        >
          <span>AI confidence</span>
          <span className="font-mono font-semibold text-foreground">{invoice.confidence}%</span>
        </button>
      </div>

      {/* Multi-point AI Verification Breakdown Drawer */}
      {showConfidenceDetails && invoice.auditChecks && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 space-y-2 rounded-xl border border-border/80 bg-background/80 p-3.5 text-xs backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-glow">
              <Shield className="h-3.5 w-3.5" /> Multi-Point AI Audit Trail
            </span>
            <span className="font-mono text-[10px] text-silver/60">4 Sub-checks</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {invoice.auditChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-start justify-between gap-2 rounded-lg bg-surface/40 p-2"
              >
                <div>
                  <p className="font-semibold text-foreground">{check.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{check.detail}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    check.status === 'passed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : check.status === 'failed'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {check.status === 'passed' && 'Passed ✓'}
                  {check.status === 'failed' && 'Failed ✗'}
                  {check.status === 'warning' && 'Review !'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly detail — high visual priority with bidirectional hover */}
      {invoice.flag && (
        <div
          onMouseEnter={() => onHoverAnomaly?.(invoice.anomalyField || 'lineItem')}
          onMouseLeave={() => onHoverAnomaly?.(null)}
          className={`group/anomaly mt-4 flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-sm transition-all duration-150 ease-out ${
            isAnomalyHovered
              ? 'border-danger bg-danger/25 ring-2 ring-danger shadow-[0_0_20px_rgba(239,68,68,0.45)]'
              : invoice.status === 'flagged'
                ? 'border-danger/40 bg-danger/10 hover:border-danger/80 hover:bg-danger/20'
                : 'border-warning/40 bg-warning/10 hover:border-warning/80 hover:bg-warning/20'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`mt-0.5 h-5 w-5 shrink-0 transition-transform duration-150 group-hover/anomaly:scale-110 ${
                invoice.status === 'flagged' ? 'text-danger' : 'text-warning'
              }`}
            />
            <p
              className={`font-medium leading-relaxed tracking-[0.01em] ${
                invoice.status === 'flagged' ? 'text-danger' : 'text-warning'
              }`}
            >
              {invoice.flag}
            </p>
          </div>
          <div className="flex items-center justify-between pl-8 pt-1 text-[11px]">
            <span className="font-mono font-medium text-silver/60 group-hover/anomaly:text-glow">
              Hover to locate & highlight in document ↖
            </span>
            {isAnomalyHovered && (
              <span className="font-mono font-bold uppercase text-danger animate-pulse">
                ● Document Highlighted
              </span>
            )}
          </div>
        </div>
      )}

      {/* Auditor Quick Actions (Visible ONLY for Flagged/Review Cards awaiting intervention) */}
      {selected && onResolve && !isCleanOrResolved && (!invoice.resolution || invoice.resolution === 'pending') && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/80 pt-4"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-silver/60">
            Action:
          </span>
          <button
            type="button"
            onClick={() => onResolve(invoice.id, 'approved', 'Approved by auditor')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all duration-150 hover:border-emerald-500 hover:bg-emerald-500/20 active:scale-95"
          >
            <Check className="h-3.5 w-3.5" /> Approve Payment
          </button>
          <button
            type="button"
            onClick={() => onResolve(invoice.id, 'rejected', 'Discrepancy notice dispatched')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all duration-150 hover:border-rose-500 hover:bg-rose-500/20 active:scale-95"
          >
            <X className="h-3.5 w-3.5" /> Reject &amp; Alert
          </button>
          <button
            type="button"
            onClick={() => onResolve(invoice.id, 'escalated', 'Flagged for manager review')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-all duration-150 hover:border-amber-500 hover:bg-amber-500/20 active:scale-95"
          >
            <AlertOctagon className="h-3.5 w-3.5" /> Escalate
          </button>
        </div>
      )}
    </article>
  )
}
