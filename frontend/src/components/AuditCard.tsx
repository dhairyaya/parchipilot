import type { InvoiceAuditResponse } from "../types"
interface AuditCardProps {
    data: InvoiceAuditResponse
}

function AuditCard({ data }: AuditCardProps)  {
    const status = data.audit.status
    const { totalAmount, currency} = data.invoice
    const statusClass = `audit-card audit-card--${status}`
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
    }).format(totalAmount)
    return (
    <article className={statusClass}>
     <h2 className="audit-card__vendor">{data.invoice.vendorName}</h2>
     <p className="audit-card__amount">{formattedAmount}</p>
     
     {data.audit.anomalies && data.audit.anomalies.length>0 && (
      <ul>
        {data.audit.anomalies.map((anomaly)=> (
        <li className="audit-card__anomaly" key={anomaly}>
          {anomaly}
        </li>
     ))}
     </ul>
     )}
    </article>
    )
}

export default AuditCard
