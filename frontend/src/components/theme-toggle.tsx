import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Terminal, Droplets, ChevronDown, Check } from 'lucide-react'
import { useTheme, type Theme } from './theme-provider'

interface ThemeOption {
  id: Theme
  label: string
  subtitle: string
  icon: typeof Sun
  badge: string
  color: string
}

const THEMES: ThemeOption[] = [
  {
    id: 'light',
    label: 'Corporate Minimal',
    subtitle: 'Light crisp slate & Razorpay blue',
    icon: Sun,
    badge: 'Light',
    color: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'dark',
    label: 'Cinematic Slate',
    subtitle: 'Deep obsidian & indigo glow',
    icon: Moon,
    badge: 'Dark',
    color: 'text-indigo-400',
  },
  {
    id: 'terminal',
    label: 'Midnight Terminal',
    subtitle: 'Pure AMOLED black & phosphor green',
    icon: Terminal,
    badge: 'Matrix',
    color: 'text-emerald-400',
  },
  {
    id: 'ocean',
    label: 'Deep Ocean',
    subtitle: 'Mariana navy & cyan/gold glow',
    icon: Droplets,
    badge: 'Ocean',
    color: 'text-cyan-400',
  },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[1]
  const ActiveIcon = activeTheme.icon

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:border-glow/60 hover:shadow-sm active:scale-95"
        title="Switch interface theme"
      >
        <ActiveIcon className={`h-3.5 w-3.5 ${activeTheme.color}`} />
        <span className="hidden sm:inline font-medium">{activeTheme.label}</span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="glass absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="border-b border-border/50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Select Theme
            </p>
          </div>
          <div className="mt-1 space-y-0.5">
            {THEMES.map(({ id, label, subtitle, icon: Icon, badge, color }) => {
              const isSelected = theme === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTheme(id)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary/15 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-primary/20' : 'bg-muted'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">{label}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-normal text-muted-foreground">
                          {badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground opacity-80">{subtitle}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
