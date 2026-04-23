import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'
import { useProfile } from '../context/ProfileContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import Nav from '../components/Nav'
import SectionLabel from '../components/SectionLabel'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'
import TextLink from '../components/TextLink'
import PdfPages from '../components/PdfPages'

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

interface Resume {
  id: number
  label: string
  description: string | null
  fileUrl: string
  previewUrl: string | null
  format: string
  fileSize: number | null
  sortOrder: number
}

export default function About() {
  const { theme } = useTheme()
  const { lang, t } = useLang()
  const { profile: contextProfile } = useProfile()
  const { isMobile, isCompact } = useBreakpoint()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [resumes, setResumes] = useState<Resume[]>([])
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

  useEffect(() => {
    fetch(`${API}/api/v1/resumes`)
      .then(r => r.json())
      .then(data => setResumes(data.data ?? []))
      .catch(() => {})
  }, [])

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
            fontSize: 'clamp(40px, 6vw, 112px)',
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
            src={contextProfile?.photoUrl ?? '/bau.jpg'}
            alt={contextProfile?.name ?? ''}
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
          <a href={profile?.email ? `mailto:${profile.email}` : '#'} style={{
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

      {/* RESUMES SECTION */}
      {resumes.length > 0 && (
        <section style={{ padding: isMobile ? '40px 6vw' : '60px 8vw', borderBottom: '0.5px solid var(--border)' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 28,
              color: 'var(--text-primary)',
            }}>
              {t('resumes.', 'curriculums.')}
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 18,
              color: 'var(--text-secondary)', fontStyle: 'italic',
              marginTop: 4,
            }}>
              {t('pick a format.', 'elegí un formato.')}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? 16 : 24,
            marginTop: isMobile ? 24 : 40,
          }}>
            {resumes.map(r => (
              <ResumeCell key={r.id} resume={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ResumeCell({ resume }: { resume: Resume }) {
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)
  const { t } = useLang()
  const isPdf = resume.format.toLowerCase() === 'pdf'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: 300,
      }}
    >
      <div
        onClick={() => isPdf && setOpen(true)}
        style={{
          height: 400,
          aspectRatio: '3 / 4',
          background: 'var(--bg-surface)',
          border: `0.5px solid ${hovered ? 'var(--accent-teal)' : 'var(--border)'}`,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          transition: 'border-color 0.2s ease',
          cursor: isPdf ? 'zoom-in' : 'default',
        }}>
        {resume.previewUrl ? (
          <img
            src={resume.previewUrl}
            alt={resume.label}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 32,
            color: 'var(--text-muted)',
            letterSpacing: 2,
          }}>
            {resume.format.toUpperCase()}
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: 8, left: 8,
          padding: '2px 6px',
          background: 'var(--bg)',
          border: '0.5px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-secondary)',
          letterSpacing: 1,
        }}>
          {resume.format.toUpperCase()}
        </div>
      </div>

      <div>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 16,
          color: 'var(--text-primary)',
        }}>
          {resume.label}
        </div>
        {resume.description && (
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 13,
            color: 'var(--text-secondary)', fontStyle: 'italic',
            marginTop: 2,
          }}>
            {resume.description}
          </div>
        )}
      </div>

      <a
        href={resume.fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--accent-teal)',
          textDecoration: 'none',
          marginTop: 2,
        }}
      >
        {t('download ->', 'descargar ->')}
      </a>

      <AnimatePresence>
        {open && <ResumeLightbox resume={resume} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function ResumeLightbox({ resume, onClose }: { resume: Resume; onClose: () => void }) {
  const { isMobile } = useBreakpoint()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.01)',
        backdropFilter: 'blur(3px)',
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
          zIndex: 1,
        }}
      >
        x
      </button>

      <PdfPages url={resume.fileUrl} isMobile={isMobile} />

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 24,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        {resume.label}
      </div>
    </motion.div>,
    document.body
  )
}
