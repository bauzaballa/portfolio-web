import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const STORAGE_KEY = 'portfolio_liked'

export default function LikeButton() {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    setLiked(localStorage.getItem(STORAGE_KEY) === 'true')
    fetch(`${API}/api/v1/likes`)
      .then(r => r.json())
      .then(d => setCount(d.data?.count ?? 0))
      .catch(() => {})
  }, [])

  const toggle = async () => {
    const wasLiked = liked
    const newLiked = !wasLiked
    const endpoint = wasLiked ? '/api/v1/likes/decrement' : '/api/v1/likes'

    setLiked(newLiked)
    setCount(c => wasLiked ? c - 1 : c + 1)
    if (newLiked) setBurst(true)
    localStorage.setItem(STORAGE_KEY, String(newLiked))

    try {
      const res = await fetch(`${API}${endpoint}`, { method: 'POST' })
      const d = await res.json()
      setCount(d.data?.count ?? 0)
    } catch {
      setLiked(wasLiked)
      setCount(c => wasLiked ? c + 1 : c - 1)
      localStorage.setItem(STORAGE_KEY, String(wasLiked))
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      cursor: 'pointer', userSelect: 'none',
    }} onClick={toggle}>
      <motion.div
        animate={burst ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onAnimationComplete={() => setBurst(false)}
        style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <svg
          width="18" height="18" viewBox="0 0 24 24"
          fill={liked ? 'var(--accent-warm)' : 'none'}
          stroke={liked ? 'var(--accent-warm)' : 'var(--text-secondary)'}
          strokeWidth="1.5"
          style={{ transition: 'all 0.15s ease' }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: liked ? 'var(--accent-warm)' : 'var(--text-secondary)',
          }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
