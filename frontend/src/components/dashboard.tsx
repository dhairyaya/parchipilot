'use client'

import { useState, useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  ListChecks,
  PlusCircle,
  Sparkles,
  ChevronUp,
  Search,
  CheckCircle,
  Filter,
} from 'lucide-react'
import { DashboardHeader } from './dashboard-header'
import { DocumentViewer } from './document-viewer'
import { InvoiceCard } from './invoice-card'
import { ScanDropzone } from './scan-dropzone'
import { initialInvoices, type Invoice, type ResolutionStatus } from '../lib/invoices'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

type FilterTab = 'all' | 'flagged' | 'clean' | 'resolved'

interface DashboardProps {
  onReplayIntro?: () => void
}

export function Dashboard({ onReplayIntro }: DashboardProps) {
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(initialInvoices)
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(initialInvoices[0]?.id || '')
  const [hoveredAnomalyKey, setHoveredAnomalyKey] = useState<string | null>(null)
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const selected = invoicesList.find((i) => i.id === activeInvoiceId) ?? invoicesList[0]
  const flaggedCount = invoicesList.filter((i) => i.status !== 'clean').length
  const cleanCount = invoicesList.filter((i) => i.status === 'clean').length
  const resolvedCount = invoicesList.filter(
    (i) => i.resolution && i.resolution !== 'pending'
  ).length

  // Filtered list based on Search & Tabs
  const filteredInvoices = useMemo(() => {
    return invoicesList.filter((invoice) => {
      // Tab filter
      if (filterTab === 'flagged' && invoice.status === 'clean') return false
      if (filterTab === 'clean' && invoice.status !== 'clean') return false
      if (filterTab === 'resolved' && (!invoice.resolution || invoice.resolution === 'pending'))
        return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesVendor = invoice.vendor.toLowerCase().includes(query)
        const matchesInvoiceNo = invoice.invoiceNo.toLowerCase().includes(query)
        const matchesCategory = invoice.category.toLowerCase().includes(query)
        const matchesAmount = invoice.amount.toLowerCase().includes(query)
        if (!matchesVendor && !matchesInvoiceNo && !matchesCategory && !matchesAmount) {
          return false
        }
      }

      return true
    })
  }, [invoicesList, filterTab, searchQuery])

  function handleInvoiceAudited(newInvoice: Invoice) {
    setInvoicesList((prev) => {
      const exists = prev.some((i) => i.id === newInvoice.id)
      if (exists) {
        return prev.map((i) => (i.id === newInvoice.id ? newInvoice : i))
      }
      return [newInvoice, ...prev]
    })
    setActiveInvoiceId(newInvoice.id)
    if (newInvoice.anomalyField) {
      setHoveredAnomalyKey(newInvoice.anomalyField)
    }
    showToast(`Audited document: ${newInvoice.vendor}`)
  }

  function handleResolve(id: string, action: ResolutionStatus, note?: string) {
    setInvoicesList((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          return {
            ...inv,
            resolution: action,
            resolutionNote: note,
          }
        }
        return inv
      })
    )

    const actionText =
      action === 'approved'
        ? 'Payment Approved & Queued for ERP'
        : action === 'rejected'
          ? 'Invoice Rejected & Vendor Alerted'
          : 'Escalated to CFO / Compliance'
    showToast(actionText)
  }

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  function handleExportAll() {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoicesList, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `parchipilot_audit_report_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast('Exported complete multi-point audit log (.JSON)')
  }

  return (
    <motion.main
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8"
    >
      <motion.div variants={item}>
        <DashboardHeader onReplayIntro={onReplayIntro} onExportAll={handleExportAll} />
      </motion.div>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-glow/40 bg-surface/90 px-4 py-3 text-xs font-semibold text-foreground shadow-2xl backdrop-blur-xl animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-glow" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Upload / Autonomous Scan Hero Banner */}
      <motion.section variants={item} className="mt-6">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-glow" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AUTONOMOUS DOCUMENT INGESTION
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDropzoneOpen(!isDropzoneOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1 text-xs font-semibold text-muted-foreground/80 transition-colors duration-150 hover:text-foreground"
          >
            {isDropzoneOpen ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Collapse Dropzone
              </>
            ) : (
              <>
                <PlusCircle className="h-3.5 w-3.5 text-glow" /> Scan New Document
              </>
            )}
          </button>
        </div>

        {isDropzoneOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScanDropzone onInvoiceAudited={handleInvoiceAudited} />
          </motion.div>
        )}
      </motion.section>

      {/* Split screen audit feed & Document viewer */}
      <div className="mt-8 grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* LEFT — Document viewer with interactive bounding boxes */}
        <motion.section
          variants={item}
          aria-label="Document viewer"
          className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]"
        >
          {selected ? (
            <DocumentViewer
              invoice={selected}
              hoveredAnomalyKey={hoveredAnomalyKey}
              onHoverAnomaly={setHoveredAnomalyKey}
              onResolve={handleResolve}
            />
          ) : (
            <div className="glass flex h-full items-center justify-center rounded-3xl p-8 text-center text-sm text-muted-foreground/60">
              No invoice selected
            </div>
          )}
        </motion.section>

        {/* RIGHT — AI audit results */}
        <motion.section variants={item} aria-label="AI audit results" className="flex flex-col">
          {/* Header & Stats */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-glow" />
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                AI Audit Results
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-semibold text-danger">{flaggedCount}</span> anomalies
              across{' '}
              <span className="font-mono font-semibold text-foreground">{invoicesList.length}</span>{' '}
              scans
            </p>
          </div>

          {/* Search & Filter Triage Ribbon */}
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor, invoice #, or total…"
                className="w-full rounded-full border border-border bg-surface/40 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-glow/60 focus:outline-none focus:ring-1 focus:ring-glow/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  filterTab === 'all'
                    ? 'bg-glow/20 text-glow ring-1 ring-glow/50'
                    : 'bg-surface/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({invoicesList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('flagged')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  filterTab === 'flagged'
                    ? 'bg-danger/20 text-danger ring-1 ring-danger/50'
                    : 'bg-surface/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                ⚠️ Anomalies ({flaggedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('clean')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  filterTab === 'clean'
                    ? 'bg-silver/20 text-muted-foreground ring-1 ring-silver/50'
                    : 'bg-surface/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                ✅ Clean ({cleanCount})
              </button>
              {resolvedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterTab('resolved')}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    filterTab === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50'
                      : 'bg-surface/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🛡️ Resolved ({resolvedCount})
                </button>
              )}
            </div>
          </div>

          {/* Cards List */}
          <motion.div variants={container} className="flex flex-col gap-4">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => {
                const isSelected = invoice.id === activeInvoiceId
                const isHoveredFromDoc =
                  Boolean(hoveredAnomalyKey) &&
                  isSelected &&
                  (hoveredAnomalyKey === invoice.anomalyField ||
                    (hoveredAnomalyKey === 'lineItem' &&
                      invoice.items?.some((it) => it.flagged)) ||
                    (hoveredAnomalyKey === 'vendor' && invoice.anomalyField === 'vendor') ||
                    (hoveredAnomalyKey === 'total' && invoice.anomalyField === 'total') ||
                    (hoveredAnomalyKey === 'invoiceNo' && invoice.anomalyField === 'invoiceNo'))

                return (
                  <motion.div key={invoice.id} variants={item}>
                    <InvoiceCard
                      invoice={invoice}
                      selected={isSelected}
                      onSelect={(id) => {
                        setActiveInvoiceId(id)
                        setHoveredAnomalyKey(null)
                      }}
                      hoveredAnomalyKey={isSelected ? hoveredAnomalyKey : null}
                      onHoverAnomaly={(key) => {
                        if (key) {
                          setActiveInvoiceId(invoice.id)
                        }
                        setHoveredAnomalyKey(key)
                      }}
                      isHoveredFromDoc={isHoveredFromDoc}
                      onResolve={handleResolve}
                    />
                  </motion.div>
                )
              })
            ) : (
              <div className="glass flex flex-col items-center justify-center rounded-2xl p-8 text-center text-xs text-muted-foreground/60">
                <Filter className="mb-2 h-5 w-5 opacity-40" />
                <p>No invoices match your filter query.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterTab('all')
                    setSearchQuery('')
                  }}
                  className="mt-2 text-glow underline underline-offset-4"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </motion.div>
        </motion.section>
      </div>

      <motion.footer
        variants={item}
        className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground/60"
      >
        ParchiPilot &middot; Autonomous financial auditing, running continuously in the background.
      </motion.footer>
    </motion.main>
  )
}
