import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import Nav from '../components/Nav'
import SectionLabel from '../components/SectionLabel'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import TextLink from '../components/TextLink'

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

export default function About() {
  const { theme } = useTheme()
  const { lang, t } = useLang()
  const { isMobile, isCompact } = useBreakpoint()

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Nav />
        <div style={{ padding: '120px 8vw 80px' }}>
          <SkeletonLoader
            blocks={[
              { height: 72, width: '40%' },
              { height: 20, width: '24%' },
              { height: 20, width: '16%' },
              { height: 100, width: '64%' },
              { height: 20, width: '12%' },
            ]}
            gap={16}
          />
        </div>
      </div>
    )
  }

  if (error) return <ErrorState message={t('could not load profile.', 'no se pudo cargar el perfil.')} />

  return (
    <div>
      <Nav />

      {/* HERO SECTION */}
      <section style={{
        padding: isMobile ? '80px 6vw 48px' : '120px 8vw 80px',
        borderBottom: '0.5px solid var(--border)',
        display: isCompact ? 'flex' : 'grid',
        flexDirection: isCompact ? 'column-reverse' : undefined,
        gridTemplateColumns: isCompact ? undefined : '1fr 340px',
        gap: isCompact ? 40 : 80,
        alignItems: 'start',
      }}>
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionLabel>{t('/ about', '/ sobre mí')}</SectionLabel>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 6vw, 72px)',
            color: theme === 'light' ? 'var(--accent-warm)' : 'var(--text-primary)',
            fontWeight: 700,
            lineHeight: 1,
          }}>
            {profile?.name}
          </h1>

          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--accent-teal)', letterSpacing: 2,
            marginTop: 12,
          }}>
            {profile?.title}
          </div>

          <p style={{
            fontFamily: 'var(--font-serif)', fontSize: 18,
            color: 'var(--text-secondary)', lineHeight: 1.9,
            marginTop: 28, maxWidth: 520,
          }}>
            {profile?.bioLong}
          </p>
        </motion.div>

        {/* Right column — photo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          style={{
            width: isCompact ? '100%' : 340,
            maxWidth: isCompact ? 340 : undefined,
            aspectRatio: isCompact ? '3 / 3.5' : undefined,
            height: isCompact ? undefined : 440,
            border: '0.5px solid var(--border)',
            borderRadius: 2,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src="/bau.jpg"
            alt="Bautista Zaballa"
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              filter: 'sepia(0.08) contrast(1.02)',
              display: 'block',
            }}
          />
        </motion.div>
      </section>

      {/* DETAILS SECTION */}
      <section style={{
        padding: isMobile ? '40px 6vw' : '60px 8vw',
        borderBottom: '0.5px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? 28 : 40,
      }}>
        {/* Location */}
        <div>
          <SectionLabel style={{ letterSpacing: 2, marginBottom: 12 }}>{t('location', 'ubicación')}</SectionLabel>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 16,
            color: 'var(--text-primary)',
          }}>
            {profile?.location}
          </div>
        </div>

        {/* Contact */}
        <div>
          <SectionLabel style={{ letterSpacing: 2, marginBottom: 12 }}>{t('contact', 'contacto')}</SectionLabel>
          <a href={`mailto:${profile?.email}`} style={{
            display: 'block',
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--accent-teal)',
            textDecoration: 'none',
          }}>
            {profile?.email}
          </a>
          {profile?.phone && (
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--text-secondary)', marginTop: 4,
            }}>
              {profile.phone}
            </span>
          )}
        </div>

        {/* Elsewhere */}
        <div>
          <SectionLabel style={{ letterSpacing: 2, marginBottom: 12 }}>{t('elsewhere', 'en la web')}</SectionLabel>
          {profile?.githubUrl && (
            <TextLink href={profile.githubUrl}>github -&gt;</TextLink>
          )}
          {profile?.linkedinUrl && (
            <TextLink href={profile.linkedinUrl} style={{ marginTop: 4 }}>linkedin -&gt;</TextLink>
          )}
        </div>
      </section>

      {/* ANALOG PHOTOS SECTION */}
      <section style={{ padding: isMobile ? '40px 6vw' : '60px 8vw', borderBottom: '0.5px solid var(--border)' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 28,
            color: 'var(--text-primary)',
          }}>
            {t('analog.', 'analógico.')}
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 18,
            color: 'var(--text-secondary)', fontStyle: 'italic',
            marginTop: 4,
          }}>
            {t('some frames.', 'algunos fotogramas.')}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 12 : 16,
          marginTop: isMobile ? 24 : 40,
        }}>
          {(['Portra 400', 'Gold 200', 'Vision 250D'] as const).map(film => (
            <PhotoCell key={film} film={film} />
          ))}
        </div>
      </section>
    </div>
  )
}

function PhotoCell({ film }: { film: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: '3 / 4',
        background: 'var(--bg-surface)',
        border: `0.5px solid ${hovered ? 'var(--accent-teal)' : 'var(--border)'}`,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.2s ease',
        cursor: 'default',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-muted)',
      }}>
        {film}
      </span>
    </div>
  )
}
