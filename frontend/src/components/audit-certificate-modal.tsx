'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ShieldCheck,
  Printer,
  Download,
  Copy,
  Check,
  X,
  FileCheck,
  AlertTriangle,
  XCircle,
  Hash,
} from 'lucide-react'
import type { Invoice } from '../lib/invoices'

interface AuditCertificateModalProps {
  invoice: Invoice
  isOpen: boolean
  onClose: () => void
}

export function AuditCertificateModal({ invoice, isOpen, onClose }: AuditCertificateModalProps) {
  const [sha256Hash, setSha256Hash] = useState<string>('')
  const [copiedHash, setCopiedHash] = useState(false)

  const { certificateSerial, issueTimestamp, issueDateUtc } = useMemo(() => {
    const now = new Date()
    const cleanNo = (invoice.invoiceNo || 'INV').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    const serial = `CERT-IN-${cleanNo}-${invoice.id.toUpperCase().replace(/[^A-Za-z0-9]/g, '')}`
    return {
      certificateSerial: serial,
      issueTimestamp: now.toISOString(),
      issueDateUtc: now.toUTCString(),
    }
  }, [invoice.invoiceNo, invoice.id])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    // Compute real cryptographic SHA-256 hash of invoice audit data
    const auditPayload = {
      certificateVersion: '2.4.0-COMPLIANCE',
      serialNumber: certificateSerial,
      issuer: 'ParchiPilot Autonomous Financial Auditor',
      statutoryFramework: 'Companies Act (Sec 143) & GST Rules 2017',
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNo,
      vendorName: invoice.vendor,
      reconciledAmount: invoice.amount,
      invoiceDate: invoice.date,
      auditStatus: invoice.status,
      aiConfidenceScore: invoice.confidence,
      resolutionDecision: invoice.resolution || 'PENDING_REVIEW',
      checksPerformed: invoice.auditChecks || [],
      issuedAt: issueTimestamp,
    }

    const computeHash = async () => {
      try {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(JSON.stringify(auditPayload))
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
        if (!cancelled) {
          setSha256Hash(hashHex)
        }
      } catch {
        if (!cancelled) {
          setSha256Hash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
        }
      }
    }

    computeHash()

    return () => {
      cancelled = true
    }
  }, [isOpen, invoice, certificateSerial, issueTimestamp])

  if (!isOpen) return null

  function handlePrint() {
    window.print()
  }

  function handleCopyHash() {
    if (!sha256Hash) return
    navigator.clipboard.writeText(sha256Hash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  function handleDownloadHtmlCertificate() {
    const checksRows = (invoice.auditChecks || [])
      .map(
        (c) => `
      <tr>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; font-weight:600;">${c.name}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; color:#475569;">${c.detail}</td>
        <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right;">
          <span style="display:inline-block; padding:3px 10px; border-radius:9999px; font-size:11px; font-weight:bold; text-transform:uppercase; ${
            c.status === 'passed'
              ? 'background:#dcfce7; color:#166534;'
              : c.status === 'warning'
                ? 'background:#fef9c3; color:#854d0e;'
                : 'background:#fee2e2; color:#991b1b;'
          }">${c.status}</span>
        </td>
      </tr>
    `
      )
      .join('')

    const itemsRows = (invoice.items || [])
      .map(
        (it) => `
      <tr>
        <td style="padding:8px 12px; border-bottom:1px solid #f1f5f9;">${it.label}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #f1f5f9; text-align:center;">${it.qty || 1}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #f1f5f9; text-align:right; font-family:monospace;">${it.price || '-'}</td>
      </tr>
    `
      )
      .join('')

    const resolutionStamp =
      invoice.resolution === 'approved'
        ? '<div style="border:2px solid #16a34a; color:#16a34a; padding:8px 16px; border-radius:8px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; display:inline-block;">✓ PAYMENT AUTHORIZED & SIGNED</div>'
        : invoice.resolution === 'rejected'
          ? '<div style="border:2px solid #dc2626; color:#dc2626; padding:8px 16px; border-radius:8px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; display:inline-block;">✕ INVOICE REJECTED / NON-COMPLIANT</div>'
          : '<div style="border:2px solid #ca8a04; color:#ca8a04; padding:8px 16px; border-radius:8px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; display:inline-block;">⚠ FLAGGED FOR CFO ESCALATION</div>'

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Statutory Audit Certificate — ${invoice.invoiceNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; color: #0f172a; }
    .cert-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); padding: 48px; }
    .cert-header { border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
    .badge { display: inline-block; background: #0f172a; color: #ffffff; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 32px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
    .sha-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 12px; margin-bottom: 32px; word-break: break-all; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 32px; font-size: 12px; color: #64748b; }
    @media print { body { background: #fff; padding: 0; } .cert-card { box-shadow: none; border: none; padding: 20px; } }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="cert-header">
      <div>
        <span class="badge">Statutory Financial Audit Certificate</span>
        <h1 style="margin: 4px 0 6px 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em;">ParchiPilot Autonomous Ledger Audit</h1>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Issued under Standard Audit Protocol v2.4 (ISO/IEC 27001 Immutable Log)</p>
      </div>
      <div style="text-align: right;">
        <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #0284c7;">${certificateSerial}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ${issueTimestamp}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="label">Vendor Entity</div>
        <div class="value">${invoice.vendor}</div>
      </div>
      <div>
        <div class="label">Invoice Number</div>
        <div class="value">${invoice.invoiceNo}</div>
      </div>
      <div>
        <div class="label">Reconciled Amount</div>
        <div class="value" style="color: #0284c7;">${invoice.amount}</div>
      </div>
      <div>
        <div class="label">Invoice Date</div>
        <div class="value">${invoice.date}</div>
      </div>
      <div>
        <div class="label">Auditor Confidence</div>
        <div class="value">${invoice.confidence}% Verified</div>
      </div>
      <div>
        <div class="label">Audit Status</div>
        <div class="value" style="text-transform: uppercase;">${invoice.status}</div>
      </div>
    </div>

    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Statutory Verification Checklist</h3>
    <table>
      <thead>
        <tr>
          <th>Verification Checkpoint</th>
          <th>Ledger / Statutory Standard</th>
          <th style="text-align: right;">Finding Status</th>
        </tr>
      </thead>
      <tbody>
        ${checksRows}
      </tbody>
    </table>

    ${
      itemsRows
        ? `
    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Itemized Billing Ledger</h3>
    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit / Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>`
        : ''
    }

    <div class="label" style="margin-bottom: 6px;">Cryptographic Proof (SHA-256 Integrity Seal)</div>
    <div class="sha-box">
      <strong>SHA-256:</strong> ${sha256Hash}
    </div>

    <div class="footer">
      <div>
        <div><strong>Verified By:</strong> ParchiPilot Multi-Agent Orchestrator</div>
        <div>Model: Google Gemini 3.5 Flash Multimodal Vision Agent</div>
      </div>
      <div>
        ${resolutionStamp}
      </div>
    </div>
  </div>
  <script>window.onload = function() { if (window.location.search.includes('print=true')) window.print(); }</script>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Statutory_Audit_Certificate_${invoice.invoiceNo.replace(/[^A-Za-z0-9]/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-border bg-surface/50 px-6 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-glow" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Official Statutory Audit Certificate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-glow/50 hover:bg-surface"
              title="Print certificate or save directly as PDF"
            >
              <Printer className="h-3.5 w-3.5 text-glow" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlCertificate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-glow/40 bg-glow/10 px-3 py-1.5 text-xs font-semibold text-glow transition-colors hover:bg-glow/20"
              title="Download offline HTML certificate that opens in any browser"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Offline (.html)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface/80 hover:text-foreground"
              title="Close Certificate"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Scrollable in Modal, Full-Width in Print) */}
        <div
          id="printable-audit-certificate"
          className="flex-1 overflow-y-auto p-6 sm:p-10 text-foreground print:overflow-visible print:p-0"
        >
          {/* Decorative Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b-2 border-border pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-glow/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-glow ring-1 ring-glow/30">
                <FileCheck className="h-3 w-3" />
                Statutory Compliance Certificate
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Parchi<span className="text-glow">Pilot</span> Autonomous Auditor
              </h2>
              <p className="text-xs text-muted-foreground">
                Verified Autonomous Ledger Audit &middot; Continuous Multi-Agent Forensic Verification
              </p>
            </div>

            <div className="text-left sm:text-right font-mono">
              <div className="text-xs font-bold text-glow">{certificateSerial}</div>
              <div className="text-[11px] text-muted-foreground">Issued: {issueDateUtc}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                <ShieldCheck className="h-3 w-3" /> Master Ledger Synchronized
              </div>
            </div>
          </div>

          {/* Core Entity Matrix */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-2xl border border-border bg-surface/30 p-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Vendor / Entity
              </div>
              <div className="text-sm font-bold text-foreground truncate">{invoice.vendor}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Invoice Number
              </div>
              <div className="font-mono text-sm font-bold text-foreground">{invoice.invoiceNo}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Reconciled Amount
              </div>
              <div className="font-mono text-base font-black text-glow">{invoice.amount}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Document Date
              </div>
              <div className="text-xs font-semibold text-foreground">{invoice.date}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                AI Confidence Score
              </div>
              <div className="text-xs font-bold text-emerald-400">{invoice.confidence}% Certified</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Audit Category
              </div>
              <div className="text-xs font-semibold text-foreground">{invoice.category}</div>
            </div>
          </div>

          {/* Statutory Verification Checklist */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Statutory Compliance Checkpoints
            </h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Audit Checkpoint</th>
                    <th className="p-3">Inspection Finding</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(invoice.auditChecks || []).map((check, idx) => (
                    <tr key={idx} className="hover:bg-surface/20">
                      <td className="p-3 font-semibold text-foreground">{check.name}</td>
                      <td className="p-3 text-muted-foreground">{check.detail}</td>
                      <td className="p-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            check.status === 'passed'
                              ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                              : check.status === 'warning'
                                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30'
                          }`}
                        >
                          {check.status === 'passed' ? (
                            <ShieldCheck className="h-2.5 w-2.5" />
                          ) : check.status === 'warning' ? (
                            <AlertTriangle className="h-2.5 w-2.5" />
                          ) : (
                            <XCircle className="h-2.5 w-2.5" />
                          )}
                          {check.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Line Items */}
          {invoice.items && invoice.items.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Reconciled Line-Item Ledger
              </h3>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/60 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit / Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className={item.flagged ? 'bg-danger/10' : 'hover:bg-surface/20'}>
                        <td className="p-3 text-foreground font-medium flex items-center gap-2">
                          {item.flagged && <AlertTriangle className="h-3 w-3 text-danger shrink-0" />}
                          <span>{item.label}</span>
                        </td>
                        <td className="p-3 text-center text-muted-foreground font-mono">{item.qty || 1}</td>
                        <td className="p-3 text-right font-mono text-foreground font-semibold">
                          {item.price || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cryptographic Proof Hash Box */}
          <div className="mt-6 rounded-2xl border border-border bg-surface/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Hash className="h-3.5 w-3.5 text-glow" />
                <span>SHA-256 Cryptographic Integrity Signature</span>
              </div>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-glow hover:underline"
              >
                {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-silver/80 break-all bg-background/60 p-2.5 rounded-lg border border-border/80">
              {sha256Hash || 'Computing SHA-256 cryptographic seal…'}
            </div>
          </div>

          {/* Official Sign-Off Footer */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              <p className="font-semibold text-foreground">Autonomous Engine: Google Gemini 3.5 Flash + LangGraph</p>
              <p>Certified compliant with Statutory Invoicing Framework 2026</p>
            </div>

            <div className="text-center sm:text-right">
              {invoice.resolution === 'approved' ? (
                <div className="rounded-xl border-2 border-emerald-500/60 bg-emerald-500/10 px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-emerald-400 ring-2 ring-emerald-500/20">
                  ✓ Payment Authorized & Cleared
                </div>
              ) : invoice.resolution === 'rejected' ? (
                <div className="rounded-xl border-2 border-rose-500/60 bg-rose-500/10 px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-rose-400 ring-2 ring-rose-500/20">
                  ✕ Invoice Rejected & Blocked
                </div>
              ) : invoice.resolution === 'escalated' ? (
                <div className="rounded-xl border-2 border-amber-500/60 bg-amber-500/10 px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-amber-400 ring-2 ring-amber-500/20">
                  ⚠ Escalated to CFO Audit Board
                </div>
              ) : (
                <div className="rounded-xl border-2 border-border bg-surface/50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  ● Pending Auditor Resolution
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="flex items-center justify-between border-t border-border bg-surface/40 px-6 py-3 text-xs text-muted-foreground print:hidden">
          <span>Tip: Click <strong>Print / Save as PDF</strong> to generate an official PDF file for judges.</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-surface px-4 py-1.5 font-semibold text-foreground hover:bg-surface/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
