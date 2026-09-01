export type AuditStatus ='approved' | 'flagged' | 'pending'

export interface Invoice{
    id: string 
    vendorName: string 
    date: string
    totalAmount: number
    currency: string
}

export interface AuditResult{
    status: AuditStatus
    anomalies?: string[]
}

export interface InvoiceAuditResponse {
     invoice: Invoice
     audit: AuditResult
}