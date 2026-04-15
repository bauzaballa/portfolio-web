import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLike } from '../context/LikeContext'

export default function LikeButton() {
  const { count, liked, handleLike } = useLike()
  const [burst, setBurst] = useState(false)

  const onClick = async () => {
    if (liked) return
    setBurst(true)
    await handleLike()
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      cursor: 'pointer', userSelect: 'none',
    }} onClick={onClick}>
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
        {liked && (
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--accent-warm)',
            }}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
