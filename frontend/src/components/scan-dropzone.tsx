'use client'

import { useRef, useState } from 'react'
import { UploadCloud, Sparkles, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react'
import { normalizeInvoiceResponse, type Invoice } from '../lib/invoices'

interface ScanDropzoneProps {
  onInvoiceAudited?: (invoice: Invoice) => void
  onScanStatusChange?: (isScanning: boolean) => void
}

export function ScanDropzone({ onInvoiceAudited, onScanStatusChange }: ScanDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeBlobUrlRef = useRef<string | null>(null)

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      setErrorMessage(null)
      setStatusMessage(`Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`)
    }
  }

  async function startScan(targetFile?: File | null) {
    const file = targetFile || selectedFile
    if (!file && !inputRef.current?.files?.[0]) {
      inputRef.current?.click()
      return
    }

    const fileToUpload = file || inputRef.current?.files?.[0]
    if (!fileToUpload) return

    setIsScanning(true)
    onScanStatusChange?.(true)
    setErrorMessage(null)
    setStatusMessage('Uploading to Django API & running multi-point AI audit...')

    // Revoke previous blob preview to prevent browser memory leaks
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
      activeBlobUrlRef.current = null
    }

    let previewUrl: string | undefined = undefined
    if (fileToUpload.type.startsWith('image/')) {
      try {
        previewUrl = URL.createObjectURL(fileToUpload)
        activeBlobUrlRef.current = previewUrl
      } catch {
        // ignore
      }
    }

    try {
      const formData = new FormData()
      formData.append('file', fileToUpload)

      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const uploadUrl = apiBase ? `${apiBase}/api/upload/` : '/api/upload/'

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let detail = response.statusText
        try {
          const errData = await response.json()
          detail = errData.detail || errData.error || response.statusText
        } catch {
          // ignore
        }
        throw new Error(`Audit failed (${response.status}): ${detail}`)
      }

      const data = await response.json()
      const auditedInvoice = normalizeInvoiceResponse(data, fileToUpload.name, previewUrl)

      setStatusMessage(`Successfully audited: ${auditedInvoice.vendor}`)
      onInvoiceAudited?.(auditedInvoice)
      setSelectedFile(null)
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Upload failed — please check network or try again.'
      )
      setStatusMessage(null)
    } finally {
      setIsScanning(false)
      onScanStatusChange?.(false)
    }
  }


  return (
    <section
      aria-label="Invoice upload and autonomous scan"
      className="mx-auto w-full"
    >
      <div
        role="button"
        tabIndex={0}
        aria-busy={isScanning}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
          if (e.dataTransfer.files?.[0]) {
            startScan(e.dataTransfer.files[0])
          }
        }}
        className={`glass group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
          isScanning
            ? 'glow-ring border-glow/70 bg-glow/5'
            : isDragging
              ? 'border-glow bg-glow/10 scale-[1.01]'
              : 'border-border hover:border-glow/50 hover:bg-surface/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files)
            if (e.target.files?.[0]) {
              startScan(e.target.files[0])
            }
          }}
        />

        {/* SCANNING STATE — laser sweeping the document */}
        {isScanning && (
          <>
            <span
              aria-hidden
              className="animate-laser-sweep pointer-events-none absolute inset-x-6 h-[2px] rounded-full bg-glow shadow-[0_0_18px_4px_var(--glow)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_22px,oklch(0.8_0.16_205/0.06)_23px)]"
            />
          </>
        )}

        <div
          className={`relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface/60 transition-all duration-300 ${
            isScanning
              ? 'glow-ring text-glow'
              : isDragging
                ? 'glow-ring text-glow'
                : 'text-glow/80 group-hover:text-glow'
          }`}
        >
          {isScanning ? (
            <ScanLine className="animate-pulse-glow h-7 w-7" strokeWidth={1.75} />
          ) : (
            <UploadCloud className="animate-float-y h-7 w-7" strokeWidth={1.75} />
          )}
        </div>

        <p className="relative z-10 text-balance text-base font-bold tracking-wide text-foreground sm:text-lg">
          {isScanning ? (
            <span className="text-glow">AUTONOMOUS AUDIT IN PROGRESS...</span>
          ) : (
            <>
              DRAG &amp; DROP INVOICE{' '}
              <span className="text-muted-foreground">(PDF / IMAGE)</span>
            </>
          )}
        </p>

        <p className="relative z-10 mt-1 text-xs text-silver/70">
          {isScanning
            ? 'Running multi-point AI audit · Extracting line items & detecting anomalies'
            : selectedFile
              ? `Selected: ${selectedFile.name}`
              : 'or click to browse from device · Autonomous OCR & Fraud Detection Engine'}
        </p>

        {errorMessage && (
          <p className="relative z-10 mt-2 flex items-center gap-1.5 text-xs text-warning">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errorMessage}
          </p>
        )}

        {statusMessage && !errorMessage && !isScanning && (
          <p className="relative z-10 mt-2 flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {statusMessage}
          </p>
        )}

        <div className="relative z-10 mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={isScanning}
            onClick={(e) => {
              e.stopPropagation()
              if (selectedFile) {
                startScan(selectedFile)
              } else {
                inputRef.current?.click()
              }
            }}
            className="glow-ring inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isScanning ? 'Auditing with AI\u2026' : 'Upload & Audit Invoice'}
          </button>
        </div>
      </div>
    </section>
  )
}
