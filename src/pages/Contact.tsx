import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import Nav from '../components/Nav'
import SectionLabel from '../components/SectionLabel'
import { useProfile } from '../context/ProfileContext'

export default function Contact() {
  const { t } = useLang()
  const { isMobile } = useBreakpoint()
  const { profile } = useProfile()

  const links = [
    { label: t('email', 'email'), value: profile?.email ?? '', href: profile?.email ? `mailto:${profile.email}` : '#' },
    { label: t('github', 'github'), value: profile?.githubUrl?.split('/').pop() ?? '', href: profile?.githubUrl ?? '#' },
    { label: t('linkedin', 'linkedin'), value: profile?.linkedinUrl?.split('/').pop() ?? '', href: profile?.linkedinUrl ?? '#' },
  ]

  return (
    <div>
      <Nav />

      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: isMobile ? '80px 6vw 48px' : '140px 8vw 80px',
      }}>
        {/* Header block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionLabel>{t('/ contact', '/ contacto')}</SectionLabel>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 6vw, 112px)',
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
          {t('based in', 'ubicado en')} {profile?.location ?? ''} — {t('available remotely', 'disponible de forma remota')}
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
          overflowWrap: 'break-word' as const,
          wordBreak: 'break-all' as const,
          textAlign: 'right' as const,
        }}
      >
        {value}
      </a>
    </motion.div>
  )
}
