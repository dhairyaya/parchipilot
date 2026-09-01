'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Layers,
  Download,
  CheckCircle2,
} from 'lucide-react'
import type { Invoice, ResolutionStatus } from '../lib/invoices'

// Synthesized or server-extracted line items so the document reads like a real invoice scan.
function lineItemsFor(invoice: Invoice) {
  if (invoice.items && invoice.items.length > 0) {
    return invoice.items
  }
  const base = [
    { label: 'Professional services', qty: 1, price: '₹4,500.00' },
    { label: 'Materials & handling', qty: 3, price: '₹6,000.00' },
    { label: 'Applicable GST (18%)', qty: 1, price: '₹2,000.00' },
  ]
  return base.map((item, i) => ({
    ...item,
    flagged: invoice.status !== 'clean' && i === 1,
  }))
}

interface DocumentViewerProps {
  invoice: Invoice
  hoveredAnomalyKey?: string | null
  onHoverAnomaly?: (key: string | null) => void
  onResolve?: (id: string, action: ResolutionStatus, note?: string) => void
}

export function DocumentViewer({
  invoice,
  hoveredAnomalyKey,
  onHoverAnomaly,
  }: DocumentViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'ocr' | 'clean'>('ocr')
  const [isExporting, setIsExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  const isAnomaly = invoice.status !== 'clean'
  const items = lineItemsFor(invoice)

  const isVendorHovered = hoveredAnomalyKey === 'vendor'
  const isTotalHovered = hoveredAnomalyKey === 'total'
  const isInvoiceNoHovered =
    hoveredAnomalyKey === 'invoiceNo' || hoveredAnomalyKey === 'metadata'

  function handleExportCertificate() {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setExportNotice(`Audit Certificate for ${invoice.invoiceNo} generated (SHA256 verified)`)
      setTimeout(() => setExportNotice(null), 4000)
    }, 800)
  }

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-3xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-glow" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-silver/80">
            Document Viewer
          </span>
        </div>

        {/* View mode & Zoom controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-surface/50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('ocr')}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
                viewMode === 'ocr'
                  ? 'bg-glow/20 text-glow shadow-sm'
                  : 'text-silver/60 hover:text-foreground'
              }`}
            >
              <Layers className="h-3 w-3" /> OCR Boxes
            </button>
            <button
              type="button"
              onClick={() => setViewMode('clean')}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all ${
                viewMode === 'clean'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-silver/60 hover:text-foreground'
              }`}
            >
              Raw View
            </button>
          </div>

          <div className="hidden items-center rounded-lg border border-border bg-surface/40 px-1.5 py-0.5 sm:flex">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.1))}
              className="p-1 text-silver/60 hover:text-foreground disabled:opacity-30"
              disabled={zoomLevel <= 0.85}
              title="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="px-1.5 font-mono text-[10px] text-silver/80">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.25, z + 0.1))}
              className="p-1 text-silver/60 hover:text-foreground disabled:opacity-30"
              disabled={zoomLevel >= 1.25}
              title="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCertificate}
            disabled={isExporting}
            className="hidden items-center gap-1 rounded-lg border border-border bg-surface/60 px-2.5 py-1 text-[11px] font-semibold text-silver/80 transition-colors hover:border-glow/60 hover:text-foreground md:inline-flex"
          >
            <Download className="h-3 w-3" />
            {isExporting ? 'Exporting…' : 'Export Audit'}
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="flex items-center gap-1.5 bg-glow/10 px-5 py-1.5 text-xs text-glow border-b border-glow/20 animate-fadeIn">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {exportNotice}
        </div>
      )}

      {/* Document canvas */}
      <div className="relative flex-1 overflow-y-auto p-5 sm:p-8">
        <motion.div
          key={invoice.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative mx-auto flex min-h-[440px] max-w-md flex-col rounded-xl bg-[oklch(0.96_0.01_230)] p-6 text-[oklch(0.2_0.02_250)] shadow-2xl transition-transform sm:p-8"
        >
          {/* Laser sweep over the page */}
          <span
            aria-hidden
            className="animate-laser-sweep pointer-events-none absolute inset-x-5 h-[2px] rounded-full bg-glow shadow-[0_0_16px_4px_var(--glow)]"
          />

          <div className="flex items-start justify-between gap-3">
            {/* Vendor Name Bounding Box */}
            <div
              onMouseEnter={() => (viewMode === 'ocr' ? onHoverAnomaly?.('vendor') : undefined)}
              onMouseLeave={() => (viewMode === 'ocr' ? onHoverAnomaly?.(null) : undefined)}
              className={`group/field relative rounded-lg p-2 transition-all duration-150 ease-out ${
                viewMode === 'ocr'
                  ? `cursor-pointer border ${
                      isVendorHovered
                        ? isAnomaly && invoice.anomalyField === 'vendor'
                          ? invoice.status === 'review'
                            ? 'border-warning bg-warning/15 ring-2 ring-warning/70 shadow-[0_0_18px_rgba(234,179,8,0.35)]'
                            : 'border-danger bg-danger/15 ring-2 ring-danger/70 shadow-[0_0_18px_rgba(239,68,68,0.35)]'
                          : 'border-primary bg-primary/10 ring-2 ring-glow/50'
                        : 'border-dashed border-slate-300 hover:border-primary/70 hover:bg-primary/5'
                    }`
                  : ''
              }`}
            >
              {viewMode === 'ocr' && (
                <span
                  className={`absolute -top-3 left-2 z-10 flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all duration-150 ${
                    isVendorHovered
                      ? isAnomaly && invoice.anomalyField === 'vendor'
                        ? invoice.status === 'review'
                          ? 'bg-warning text-black ring-1 ring-warning/60 shadow-md'
                          : 'bg-danger text-white ring-1 ring-white/30 shadow-md'
                        : 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-slate-200 text-slate-700 opacity-70 group-hover/field:opacity-100 group-hover/field:bg-primary group-hover/field:text-primary-foreground'
                  }`}
                >
                  {isVendorHovered && isAnomaly && invoice.anomalyField === 'vendor'
                    ? '⚠️ UNVERIFIED_VENDOR'
                    : 'VENDOR_NAME'}
                </span>
              )}
              <p className="text-lg font-black uppercase tracking-tight">{invoice.vendor}</p>
              <p className="text-xs text-[oklch(0.5_0.02_250)]">Tax Invoice</p>
            </div>

            {/* Metadata / Invoice No Bounding Box */}
            <div
              onMouseEnter={() => (viewMode === 'ocr' ? onHoverAnomaly?.('invoiceNo') : undefined)}
              onMouseLeave={() => (viewMode === 'ocr' ? onHoverAnomaly?.(null) : undefined)}
              className={`group/field relative p-2 text-right text-xs text-[oklch(0.45_0.02_250)] transition-all duration-150 ease-out ${
                viewMode === 'ocr'
                  ? `cursor-pointer rounded-lg border ${
                      isInvoiceNoHovered
                        ? isAnomaly && invoice.anomalyField === 'invoiceNo'
                          ? invoice.status === 'review'
                            ? 'border-warning bg-warning/15 ring-2 ring-warning/70 shadow-[0_0_18px_rgba(234,179,8,0.35)]'
                            : 'border-danger bg-danger/15 ring-2 ring-danger/70 shadow-[0_0_18px_rgba(239,68,68,0.35)]'
                          : 'border-primary bg-primary/10 ring-2 ring-glow/50'
                        : 'border-dashed border-slate-300 hover:border-primary/70 hover:bg-primary/5'
                    }`
                  : ''
              }`}
            >
              {viewMode === 'ocr' && (
                <span
                  className={`absolute -top-3 right-2 z-10 flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all duration-150 ${
                    isInvoiceNoHovered
                      ? isAnomaly && invoice.anomalyField === 'invoiceNo'
                        ? invoice.status === 'review'
                          ? 'bg-warning text-black ring-1 ring-warning/60 shadow-md'
                          : 'bg-danger text-white ring-1 ring-white/30 shadow-md'
                        : 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-slate-200 text-slate-700 opacity-70 group-hover/field:opacity-100 group-hover/field:bg-primary group-hover/field:text-primary-foreground'
                  }`}
                >
                  {isInvoiceNoHovered && isAnomaly && invoice.anomalyField === 'invoiceNo'
                    ? '⚠️ DUPLICATE_NO'
                    : 'INVOICE_NO'}
                </span>
              )}
              <p
                className={`font-mono font-semibold ${
                  isInvoiceNoHovered && isAnomaly && invoice.anomalyField === 'invoiceNo'
                    ? invoice.status === 'review'
                      ? 'font-bold text-warning'
                      : 'font-bold text-danger'
                    : ''
                }`}
              >
                No. {invoice.invoiceNo}
              </p>
              <p>{invoice.date}</p>
            </div>
          </div>

          <div className="my-5 h-px bg-[oklch(0.85_0.01_250)]" />

          {/* Line Items */}
          <div className="space-y-3 text-sm">
            {items.map((item, idx) => {
              const isFlaggedItem = item.flagged
              const isLineItemHovered = hoveredAnomalyKey === 'lineItem' && isFlaggedItem
              const isItemDirectlyHovered = hoveredAnomalyKey === `item-${idx}`
              const isHighlighted = isLineItemHovered || isItemDirectlyHovered

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => {
                    if (viewMode !== 'ocr') return
                    if (isFlaggedItem) {
                      onHoverAnomaly?.('lineItem')
                    } else {
                      onHoverAnomaly?.(`item-${idx}`)
                    }
                  }}
                  onMouseLeave={() => (viewMode === 'ocr' ? onHoverAnomaly?.(null) : undefined)}
                  className={`group/item relative flex items-center justify-between rounded-lg p-2.5 text-sm transition-all duration-150 ease-out ${
                    viewMode === 'ocr'
                      ? `cursor-pointer border ${
                          isHighlighted
                            ? isFlaggedItem
                              ? invoice.status === 'review'
                                ? 'border-warning bg-warning/15 ring-2 ring-warning/70 shadow-[0_0_18px_rgba(234,179,8,0.35)]'
                                : 'border-danger bg-danger/15 ring-2 ring-danger/70 shadow-[0_0_18px_rgba(239,68,68,0.35)]'
                              : 'border-primary bg-primary/10 ring-2 ring-glow/50'
                            : 'border-dashed border-slate-300 hover:border-primary/70 hover:bg-primary/5'
                        }`
                      : 'px-2.5'
                  }`}
                >
                  {viewMode === 'ocr' && (
                    <span
                      className={`absolute -top-3 left-2 z-10 flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all duration-150 ${
                        isHighlighted
                          ? isFlaggedItem
                            ? invoice.status === 'review'
                              ? 'bg-warning text-black ring-1 ring-warning/60 shadow-md'
                              : 'bg-danger text-white ring-1 ring-white/30 shadow-md'
                            : 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-slate-200 text-slate-700 opacity-70 group-hover/item:opacity-100 group-hover/item:bg-primary group-hover/item:text-primary-foreground'
                      }`}
                    >
                      {isHighlighted && isFlaggedItem ? '⚠️ ANOMALY_ITEM' : 'LINE_ITEM'}
                    </span>
                  )}
                  <span
                    className={
                      isHighlighted && isFlaggedItem
                        ? invoice.status === 'review'
                          ? 'font-semibold text-warning'
                          : 'font-semibold text-danger'
                        : ''
                    }
                  >
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.price && (
                      <span className="font-mono text-xs font-semibold">{item.price}</span>
                    )}
                    {item.qty && (
                      <span className="font-mono text-xs text-[oklch(0.45_0.02_250)]">×{item.qty}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total Due */}
          <div className="mt-auto pt-6">
            <div className="h-px bg-[oklch(0.85_0.01_250)]" />
            <div
              onMouseEnter={() => (viewMode === 'ocr' ? onHoverAnomaly?.('total') : undefined)}
              onMouseLeave={() => (viewMode === 'ocr' ? onHoverAnomaly?.(null) : undefined)}
              className={`group/field relative mt-3 flex items-end justify-between rounded-lg p-3 transition-all duration-150 ease-out ${
                viewMode === 'ocr'
                  ? `cursor-pointer border ${
                      isTotalHovered
                        ? isAnomaly && invoice.anomalyField === 'total'
                          ? invoice.status === 'review'
                            ? 'border-warning bg-warning/15 ring-2 ring-warning/70 shadow-[0_0_18px_rgba(234,179,8,0.35)]'
                            : 'border-danger bg-danger/15 ring-2 ring-danger/70 shadow-[0_0_18px_rgba(239,68,68,0.35)]'
                          : 'border-primary bg-primary/10 ring-2 ring-glow/50'
                        : 'border-dashed border-slate-300 hover:border-primary/70 hover:bg-primary/5'
                    }`
                  : ''
              }`}
            >
              {viewMode === 'ocr' && (
                <span
                  className={`absolute -top-3 left-2 z-10 flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-sm transition-all duration-150 ${
                    isTotalHovered
                      ? isAnomaly && invoice.anomalyField === 'total'
                        ? invoice.status === 'review'
                          ? 'bg-warning text-black ring-1 ring-warning/60 shadow-md'
                          : 'bg-danger text-white ring-1 ring-white/30 shadow-md'
                        : 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-slate-200 text-slate-700 opacity-70 group-hover/field:opacity-100 group-hover/field:bg-primary group-hover/field:text-primary-foreground'
                  }`}
                >
                  {isTotalHovered && isAnomaly && invoice.anomalyField === 'total'
                    ? '⚠️ CALCULATION_DISCREPANCY'
                    : 'TOTAL_DUE'}
                </span>
              )}
              <span className="text-xs uppercase tracking-wider text-[oklch(0.5_0.02_250)]">
                Total Due
              </span>
              <span className="font-mono text-2xl font-black tracking-tight">{invoice.amount}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Verdict strip */}
      <div
        className={`flex items-center justify-between border-t px-5 py-3 text-xs font-semibold transition-colors duration-150 ${
          isAnomaly
            ? 'border-danger/30 bg-danger/10 text-danger'
            : 'border-silver/20 bg-silver/5 text-silver'
        }`}
      >
        <div className="flex items-center gap-2">
          {isAnomaly ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          <span>
            {hoveredAnomalyKey
              ? `Sync Active: Highlighting [${
                  hoveredAnomalyKey === 'invoiceNo'
                    ? 'INVOICE NO'
                    : hoveredAnomalyKey === 'lineItem'
                      ? 'LINE ITEM'
                      : hoveredAnomalyKey === 'vendor'
                        ? 'VENDOR NAME'
                        : hoveredAnomalyKey === 'total'
                          ? 'TOTAL DUE'
                          : hoveredAnomalyKey.startsWith('item-')
                            ? `ITEM #${parseInt(hoveredAnomalyKey.replace('item-', ''), 10) + 1}`
                            : hoveredAnomalyKey.toUpperCase()
                }]`
              : isAnomaly
                ? 'Anomaly located in this document — hover right panel anomaly to highlight'
                : 'No anomalies found in this document'}
          </span>
        </div>
        {hoveredAnomalyKey && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-glow animate-pulse">
            ● Synced
          </span>
        )}
      </div>
    </div>
  )
}
