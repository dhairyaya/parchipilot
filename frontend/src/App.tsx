import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './components/theme-provider'
import { IntroSequence } from './components/intro-sequence'
import { Dashboard } from './components/dashboard'

export default function App() {
  const [introDone, setIntroDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem('parchi_intro_seen') === 'true'
    } catch {
      return false
    }
  })

  function handleIntroComplete() {
    setIntroDone(true)
    try {
      localStorage.setItem('parchi_intro_seen', 'true')
    } catch {
      // ignore
    }
  }
 
  function handleReplayIntro() {
    try {
      localStorage.removeItem('parchi_intro_seen')
    } catch {
      // ignore
    }
    setIntroDone(false)
  }


  return (
    <ThemeProvider defaultTheme="dark">
      <AnimatePresence mode="wait">
        {!introDone ? (
          <IntroSequence key="intro" onComplete={handleIntroComplete} />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Dashboard onReplayIntro={handleReplayIntro} />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  )
}
