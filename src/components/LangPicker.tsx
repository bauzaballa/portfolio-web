import { motion } from 'framer-motion'
import { useLang, type Lang } from '../context/LangContext'

function GlobeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0 -18" />
    </svg>
  )
}

interface Props {
  variant?: 'entry' | 'nav'
}

export default function LangPicker({ variant = 'nav' }: Props) {
  const { lang, setLang } = useLang()

  const options: { value: Lang; label: string; aria: string }[] = [
    { value: 'en', label: 'EN', aria: 'English' },
    { value: 'es', label: 'ES', aria: 'Español' },
  ]

  if (variant === 'entry') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          <GlobeIcon size={11} />
          <span>Language · Idioma</span>
        </div>
        <div
          role="radiogroup"
          aria-label="Language / Idioma"
          style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg-surface)',
            border: '1px solid rgba(196,176,144,0.2)',
            borderRadius: 999,
            padding: 3,
          }}
        >
          {options.map(opt => {
            const active = lang === opt.value
            return (
              <button
                key={opt.value}
                role="radio"
                aria-checked={active}
                aria-label={opt.aria}
                onClick={() => setLang(opt.value)}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem 0.9rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  fontWeight: 600,
                  color: active ? 'var(--bg)' : 'var(--text-secondary)',
                  borderRadius: 999,
                  transition: 'color 0.2s ease',
                  zIndex: 1,
                }}
              >
                {active && (
                  <motion.span
                    layoutId="lang-pill-entry"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'var(--accent-teal)',
                      borderRadius: 999,
                      zIndex: -1,
                    }}
                  />
                )}
                {opt.label}
              </button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Language / Idioma"
      title="Language / Idioma"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '2px 6px 2px 8px',
      }}
    >
      <span style={{
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <GlobeIcon size={12} />
      </span>
      {options.map(opt => {
        const active = lang === opt.value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            aria-label={opt.aria}
            onClick={() => setLang(opt.value)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 7px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              fontWeight: 600,
              color: active ? 'var(--bg)' : 'var(--text-secondary)',
              borderRadius: 999,
              transition: 'color 0.2s ease',
              zIndex: 1,
            }}
          >
            {active && (
              <motion.span
                layoutId="lang-pill-nav"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--accent-teal)',
                  borderRadius: 999,
                  zIndex: -1,
                }}
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
