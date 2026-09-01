import { Radar, ShieldCheck, RotateCcw, FileSpreadsheet } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

interface DashboardHeaderProps {
  onReplayIntro?: () => void
  onExportAll?: () => void
}

export function DashboardHeader({ onReplayIntro, onExportAll }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="glow-ring flex h-11 w-11 items-center justify-center rounded-xl bg-surface/60">
          <Radar className="h-6 w-6 text-glow" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Parchi<span className="text-glow">Pilot</span>
          </h1>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Autonomous AI Financial Auditor
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <ThemeToggle />

        {onReplayIntro && (
          <button
            type="button"
            onClick={onReplayIntro}
            title="Replay cinematic intro"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-glow/40 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Intro</span>
          </button>
        )}

        {onExportAll && (
          <button
            type="button"
            onClick={onExportAll}
            title="Export all audit logs to JSON / CSV"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-glow/40 hover:text-foreground"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-glow" />
            <span>Export Audit Trail</span>
          </button>
        )}

        <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-ring absolute inline-flex h-full w-full rounded-full bg-glow opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-glow" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Agent Live
          </span>
        </div>
        <div className="glass hidden items-center gap-2 rounded-full px-4 py-2 sm:flex">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-muted-foreground">SOC-2 Secured</span>
        </div>
      </div>
    </header>
  )
}
