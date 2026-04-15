import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../context/LangContext'
import Nav from '../components/Nav'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Profile {
  name: string
  title: string
  bioLong: string
  location: string
  email: string
  phone?: string
  githubUrl?: string
  linkedinUrl?: string
}

export default function Contact() {
  const { lang, t } = useLang()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const cache = useRef<Record<string, any>>({})

  useEffect(() => {
    const cacheKey = `profile_${lang}`
    if (cache.current[cacheKey]) {
      setProfile(cache.current[cacheKey])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`${API}/api/v1/profile?lang=${lang}`)
      .then(r => r.json())
      .then(data => {
        cache.current[cacheKey] = data.data ?? data
        setProfile(data.data ?? data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [lang])

  if (loading) return <LoadingSkeleton />

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{
        padding: '200px 0',
        textAlign: 'center',
        fontFamily: 'var(--font-serif)',
        fontSize: 18,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}>
        {t('could not load profile.', 'no se pudo cargar el perfil.')}
      </div>
    </div>
  )

  const links = [
    { label: t('email', 'email'), value: profile?.email ?? '', href: `mailto:${profile?.email}` },
    { label: t('github', 'github'), value: 'bauzaballa', href: profile?.githubUrl ?? '#' },
    { label: t('linkedin', 'linkedin'), value: 'bauzaballa', href: profile?.linkedinUrl ?? '#' },
  ]

  return (
    <div>
      <Nav />

      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '140px 8vw 80px',
      }}>
        {/* Header block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: 3,
            marginBottom: 16,
          }}>
            {t('/ contact', '/ contacto')}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 6vw, 72px)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            lineHeight: 1,
          }}>
            {t('Get in touch.', 'Hablemos.')}
          </h1>

          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            lineHeight: 1.7,
            marginTop: 16,
            maxWidth: 480,
          }}>
            {t('Open to fullstack roles, frontend roles, freelance projects, and play overwatch.', 'Abierto a roles fullstack, roles frontend, proyectos freelance y jugar overwatch.')}
          </p>
        </motion.div>

        {/* Direct links */}
        <div style={{ marginTop: 48 }}>
          {links.map((link, i) => (
            <LinkRow
              key={link.label}
              label={link.label}
              value={link.value}
              href={link.href}
              delay={i * 0.08}
              isLast={i === links.length - 1}
            />
          ))}
        </div>

        {/* Location note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: links.length * 0.08 + 0.3 }}
          style={{
            marginTop: 40,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          {t('based in La Plata, Buenos Aires — available remotely', 'ubicado en La Plata, Buenos Aires — disponible de forma remota')}
        </motion.div>
      </div>
    </div>
  )
}

interface LinkRowProps {
  label: string
  value: string
  href: string
  delay: number
  isLast: boolean
}

function LinkRow({ label, value, href, delay, isLast }: LinkRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '0.5px solid var(--border)',
        borderBottom: isLast ? '0.5px solid var(--border)' : 'none',
        padding: '20px 0',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <a
        href={href}
        target={href.startsWith('mailto') ? undefined : '_blank'}
        rel="noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: hovered ? 'var(--text-primary)' : 'var(--accent-teal)',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'color 0.15s ease',
        }}
      >
        {value}
      </a>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '140px 8vw 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {[80, 300, 400, 40].map((w, i) => (
          <div key={i} style={{
            height: i === 1 ? 72 : i === 2 ? 60 : 14,
            width: `min(${w}px, 100%)`,
            background: 'var(--bg-surface)',
            borderRadius: 2,
            animation: 'contactPulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.12}s`,
          }} />
        ))}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              borderTop: '0.5px solid var(--border)',
              borderBottom: i === 2 ? '0.5px solid var(--border)' : 'none',
              padding: '20px 0',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <div style={{
                height: 10, width: 40,
                background: 'var(--bg-surface)',
                borderRadius: 2,
                animation: 'contactPulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
              <div style={{
                height: 10, width: 120,
                background: 'var(--bg-surface)',
                borderRadius: 2,
                animation: 'contactPulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.1 + 0.05}s`,
              }} />
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes contactPulse { 0%,100% { opacity: 0.3 } 50% { opacity: 0.7 } }`}</style>
    </div>
  )
}
