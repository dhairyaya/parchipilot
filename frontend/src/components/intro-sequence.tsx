'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type IntroSequenceProps = {
  onComplete: () => void
}

// Timeline (ms) for each beat of the cinematic intro.
const STEP_DURATIONS = [3000, 3000, 3200] as const

const lines = [
  'Are you still auditing invoices manually?',
  'What if an AI could detect vendor fraud instantly?',
]

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= STEP_DURATIONS.length) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_DURATIONS[step])
    return () => clearTimeout(timer)
  }, [step, onComplete])

  return (
    <motion.div
      key="intro"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(12px)' }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      {/* Ambient glow that intensifies as the wordmark arrives */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        initial={{ opacity: 0.12 }}
        animate={{
          opacity: step === 2 ? 0.4 : 0.12,
          background:
            step === 2
              ? 'radial-gradient(circle, oklch(0.7 0.1 65 / 0.45), transparent 62%)'
              : 'radial-gradient(circle, oklch(0.5 0.14 220 / 0.35), transparent 62%)',
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {/* Skip control for repeat visitors */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        Skip intro
      </button>

      <AnimatePresence mode="wait">
        {step < 2 ? (
          <motion.p
            key={`line-${step}`}
            className="relative z-10 max-w-3xl text-balance text-center text-2xl font-medium leading-relaxed tracking-tight text-foreground sm:text-4xl"
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
          >
            {lines[step]}
          </motion.p>
        ) : (
          <motion.div
            key="wordmark"
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(14px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="brushed-bronze text-balance text-center text-6xl font-black tracking-tight sm:text-8xl">
              ParchiPilot
            </h1>
            <motion.p
              className="mt-4 text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground sm:text-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Autonomous AI Financial Auditor
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
