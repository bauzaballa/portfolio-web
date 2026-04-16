import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface MediaItem {
  url: string
  type: string
  caption?: string | null
}

interface Props {
  media: MediaItem[]
  isMobile: boolean
}

export default function MediaContactSheet({ media, isMobile }: Props) {
  const [active, setActive] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActive(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setActive(i => Math.min(media.length - 1, i + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [media.length])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const thumb = strip.children[active] as HTMLElement
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [active])

  const current = media[active]
  const thumbW = isMobile ? 56 : 80
  const thumbH = isMobile ? 40 : 56

  return (
    <div>
      {/* Primary display */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 1,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--text-muted)',
          background: 'var(--bg)',
          padding: '2px 6px',
          border: '0.5px solid var(--border)',
          borderRadius: 2,
          lineHeight: 1.6,
        }}>
          {String(active + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {current.type === 'video' ? (
              <iframe
                src={current.url}
                style={{
                  width: '100%',
                  height: isMobile ? 220 : 480,
                  border: '0.5px solid var(--border)',
                  borderRadius: 4,
                  display: 'block',
                }}
                allowFullScreen
              />
            ) : (
              <img
                src={current.url}
                alt={current.caption ?? ''}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  border: '0.5px solid var(--border)',
                  borderRadius: 4,
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        {current.caption && (
          <motion.p
            key={`cap-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 8,
              paddingLeft: 2,
            }}
          >
            {current.caption}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div
          className="media-strip"
          style={{
            marginTop: 12,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 4,
            padding: '10px 12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <div
            ref={stripRef}
            style={{ display: 'flex', gap: 6, width: 'max-content' }}
          >
            {media.map((m, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: thumbW,
                  height: thumbH,
                  padding: 0,
                  border: i === active
                    ? '1.5px solid var(--accent-teal)'
                    : '0.5px solid var(--border)',
                  borderRadius: 3,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  opacity: i === active ? 1 : 0.45,
                  transition: 'opacity 0.15s, border-color 0.15s',
                  flexShrink: 0,
                  background: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {m.type === 'video' ? (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
                    ▶
                  </span>
                ) : (
                  <img
                    src={m.url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
