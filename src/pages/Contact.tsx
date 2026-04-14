import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

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
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/v1/profile`)
      .then(r => r.json())
      .then(data => setProfile(data.data ?? data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const navLinks = [
    { label: 'home', path: '/home' },
    { label: 'work', path: '/projects' },
    { label: 'experience', path: '/experience' },
    { label: 'about', path: '/about' },
    { label: 'contact', path: '/contact' },
  ]

  if (loading) return <LoadingSkeleton navLinks={navLinks} location={location} navigate={navigate} theme={theme} toggle={toggle} />

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar navLinks={navLinks} location={location} navigate={navigate} theme={theme} toggle={toggle} />
      <div style={{
        padding: '200px 0',
        textAlign: 'center',
        fontFamily: 'var(--font-serif)',
        fontSize: 18,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}>
        could not load profile.
      </div>
    </div>
  )

  const links = [
    { label: 'email', value: profile?.email ?? '', href: `mailto:${profile?.email}` },
    { label: 'github', value: 'bauzaballa', href: profile?.githubUrl ?? '#' },
    { label: 'linkedin', value: 'bauzaballa', href: profile?.linkedinUrl ?? '#' },
  ]

  return (
    <div>
      <NavBar navLinks={navLinks} location={location} navigate={navigate} theme={theme} toggle={toggle} />

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
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: 3,
            marginBottom: 16,
          }}>
            / contact
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 6vw, 72px)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            lineHeight: 1,
          }}>
            Get in touch.
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
            Open to fullstack roles, freelance projects, and interesting conversations.
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
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          based in La Plata, Buenos Aires &mdash; available remotely
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
        fontSize: 9,
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
          fontSize: 13,
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

interface NavBarProps {
  navLinks: { label: string; path: string }[]
  location: ReturnType<typeof useLocation>
  navigate: ReturnType<typeof useNavigate>
  theme: string
  toggle: () => void
}

function NavBar({ navLinks, location, navigate, theme, toggle }: NavBarProps) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px 8vw',
      borderBottom: '0.5px solid var(--border)',
      background: 'var(--bg)',
      zIndex: 10,
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-secondary)', letterSpacing: 2, fontWeight: 600,
      }}>
        BZ — {new Date().getFullYear()}
      </span>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {navLinks.map(link => {
          const isActive = location.pathname === link.path
          return (
            <span
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: 1, cursor: 'pointer',
                color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {link.label}
            </span>
          )
        })}
        <button
          onClick={toggle}
          style={{
            background: theme === 'dark' ? '#F2EDE4' : '#0E0F12',
            border: 'none',
            color: theme === 'dark' ? '#1A1A1A' : '#C8D4C0',
            padding: '4px 12px',
            borderRadius: 3,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: 1,
            fontWeight: 500,
          }}
        >
          {theme === 'dark' ? 'LIGHT' : 'DARK'}
        </button>
      </div>
    </nav>
  )
}

function LoadingSkeleton({ navLinks, location, navigate, theme, toggle }: NavBarProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar navLinks={navLinks} location={location} navigate={navigate} theme={theme} toggle={toggle} />
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
