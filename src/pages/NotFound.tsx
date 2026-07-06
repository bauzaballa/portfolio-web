import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Nav from '../components/Nav'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'

export default function NotFound() {
  const { t } = useLang()
  const { isMobile } = useBreakpoint()
  const reduce = useReducedMotion()

  useEffect(() => {
    const prev = document.title
    document.title = t('404 — Page Not Found', '404 — Página No Encontrada')
    return () => { document.title = prev }
  }, [t])

  const rise = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      <Nav />

      <main style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '0 6vw' : '0 8vw',
      }}>
        <motion.h1
          {...rise}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(120px, 24vw, 360px)',
            fontWeight: 700, lineHeight: 1,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          404
        </motion.h1>

        <motion.p
          {...rise}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(16px, 1.6vw, 22px)',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginTop: 8,
          }}
        >
          {t(
            "This page doesn't exist — or it moved.",
            'Esta página no existe — o se movió.',
          )}
        </motion.p>

        <motion.div
          {...rise}
          transition={{ duration: 0.8, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to="/"
            className="nf-action"
            style={{
              display: 'inline-block',
              marginTop: 32,
              background: 'var(--accent-teal)', color: '#fff',
              fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1,
              padding: isMobile ? '14px 28px' : '10px 24px',
              borderRadius: 3, textDecoration: 'none',
            }}
          >
            {t('← Back Home', '← Volver al Inicio')}
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
