import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'

interface MediaItem {
  url: string
  type: string
  caption?: string | null
}

interface Props {
  media: MediaItem[]
  isMobile: boolean
}

function Lightbox({ index, media, onClose, onPrev, onNext }: {
  index: number
  media: MediaItem[]
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const item = media[index]
  const hasPrev = index > 0
  const hasNext = index < media.length - 1

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hasPrev, hasNext])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.6)', fontSize: 24, lineHeight: 1,
          fontFamily: 'var(--font-mono)',
        }}
      >
        x
      </button>

      {hasPrev && (
        <button
          onClick={e => { e.stopPropagation(); onPrev() }}
          style={{
            position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 28, fontFamily: 'var(--font-mono)',
          }}
        >
          {'<'}
        </button>
      )}

      {hasNext && (
        <button
          onClick={e => { e.stopPropagation(); onNext() }}
          style={{
            position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 28, fontFamily: 'var(--font-mono)',
          }}
        >
          {'>'}
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          src={item.url}
          alt={item.caption ?? ''}
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '90vw', maxHeight: '90vh',
            objectFit: 'contain', borderRadius: 2, display: 'block',
          }}
        />
      </AnimatePresence>

      {item.caption && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: 24,
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          {item.caption}
        </div>
      )}
    </motion.div>,
    document.body
  )
}

export default function MediaContactSheet({ media, isMobile }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ left: 0, width: 1 })
  const [hasOverflow, setHasOverflow] = useState(false)
  const dragRef = useRef<{ startX: number; startScroll: number } | null>(null)

  const updateThumb = () => {
    const el = scrollRef.current
    if (!el) return
    const ratio = el.clientWidth / el.scrollWidth
    setHasOverflow(el.scrollWidth > el.clientWidth + 1)
    setThumb({
      left: (el.scrollLeft / el.scrollWidth) * 100,
      width: ratio * 100,
    })
  }

  useEffect(() => {
    updateThumb()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateThumb, { passive: true })
    const ro = new ResizeObserver(updateThumb)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateThumb); ro.disconnect() }
  }, [media])

  const onThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = scrollRef.current
    if (!el) return
    dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft }

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current || !el || !trackRef.current) return
      const trackWidth = trackRef.current.clientWidth
      const dx = ev.clientX - dragRef.current.startX
      el.scrollLeft = dragRef.current.startScroll + (dx / trackWidth) * el.scrollWidth
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    const track = trackRef.current
    if (!el || !track) return
    const rect = track.getBoundingClientRect()
    const clickRatio = (e.clientX - rect.left) / rect.width
    el.scrollTo({ left: clickRatio * el.scrollWidth - el.clientWidth / 2, behavior: 'smooth' })
  }

  return (
    <>
      <div
        ref={scrollRef}
        style={{ width: '100%', overflowX: 'auto', scrollbarWidth: 'none' }}
      >
        <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
          {media.map((m, i) => (
            m.type === 'video' ? (
              <iframe
                key={i}
                src={m.url}
                style={{
                  height: isMobile ? 200 : 350,
                  width: isMobile ? 320 : 560,
                  border: '0.5px solid var(--border)',
                  borderRadius: 4,
                  display: 'block',
                  flexShrink: 0,
                }}
                allowFullScreen
              />
            ) : (
              <img
                key={i}
                src={m.url}
                alt={m.caption ?? ''}
                onClick={() => !isMobile && setLightboxIndex(i)}
                style={{
                  height: isMobile ? 200 : 350,
                  width: 'auto',
                  display: 'block',
                  flexShrink: 0,
                  border: '0.5px solid var(--border)',
                  borderRadius: 4,
                  cursor: isMobile ? 'default' : 'zoom-in',
                }}
              />
            )
          ))}
        </div>
      </div>

      {!isMobile && hasOverflow && (
        <div
          ref={trackRef}
          onClick={onTrackClick}
          style={{
            marginTop: 10,
            height: 2,
            background: 'var(--border)',
            borderRadius: 1,
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <div
            onMouseDown={onThumbMouseDown}
            style={{
              position: 'absolute',
              top: 0,
              height: '100%',
              left: `${thumb.left}%`,
              width: `${thumb.width}%`,
              background: 'var(--text-muted)',
              borderRadius: 1,
              cursor: 'grab',
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            index={lightboxIndex}
            media={media}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex(i => Math.max(0, (i ?? 0) - 1))}
            onNext={() => setLightboxIndex(i => Math.min(media.length - 1, (i ?? 0) + 1))}
          />
        )}
      </AnimatePresence>
    </>
  )
}
