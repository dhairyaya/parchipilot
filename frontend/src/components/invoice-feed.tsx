import { InvoiceCard } from './invoice-card'
import { invoices } from '../lib/invoices'
import { ListChecks } from 'lucide-react'

export function InvoiceFeed() {
  const flaggedCount = invoices.filter((i) => i.status !== 'clean').length

  return (
    <section aria-label="Audited invoice feed" className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-glow" />
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Audited Invoice Feed
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-danger">{flaggedCount}</span> anomalies
          across <span className="font-mono font-semibold text-foreground">{invoices.length}</span>{' '}
          scans
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>
    </section>
  )
}
