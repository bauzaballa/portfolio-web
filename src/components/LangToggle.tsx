import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import LangPicker from './LangPicker'

const HINT_DISMISSED_KEY = 'portfolio_lang_hint_dismissed'

export default function LangToggle() {
  const { hasUserChosen } = useLang()
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (hasUserChosen) return
    if (localStorage.getItem(HINT_DISMISSED_KEY) === '1') return
    const t = setTimeout(() => setShowHint(true), 600)
    return () => clearTimeout(t)
  }, [hasUserChosen])

  useEffect(() => {
    if (hasUserChosen && showHint) {
      setShowHint(false)
      localStorage.setItem(HINT_DISMISSED_KEY, '1')
    }
  }, [hasUserChosen, showHint])

  useEffect(() => {
    if (!showHint) return
    const t = setTimeout(() => {
      setShowHint(false)
      localStorage.setItem(HINT_DISMISSED_KEY, '1')
    }, 6000)
    return () => clearTimeout(t)
  }, [showHint])

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <AnimatePresence>
        {showHint && (
          <motion.span
            key="ring"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.95, 1.15, 1.25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: 2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: -3,
              borderRadius: 999,
              border: '1px solid var(--accent-teal)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
      <LangPicker variant="nav" />
    </div>
  )
}
