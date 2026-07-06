import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useProfile } from '../context/ProfileContext'
import { useWindowWidth } from '../hooks/useBreakpoint'
import { useConsole } from '../context/ConsoleContext'
import ConsoleDrawer from './ConsoleDrawer'
import ThemeToggle from './ThemeToggle'
import LangToggle from './LangToggle'
import LikeButton from './LikeButton'

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin, logout } = useAuth()
  const { t } = useLang()
  const { profile } = useProfile()
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { consoleOpen, setConsoleOpen } = useConsole()
  const adminMenuRef = useRef<HTMLDivElement>(null)
  const width = useWindowWidth()

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const isCompact = width <= 1024

  // Close admin dropdown on outside click
  useEffect(() => {
    if (!adminMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [adminMenuOpen])

  // Lock scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Escape key closes overlay
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  // Close overlay on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Hide terminal button at bottom of / (home) on mobile
  const [atBottom, setAtBottom] = useState(false)
  useEffect(() => {
    if (!isMobile || location.pathname !== '/') {
      setAtBottom(false)
      return
    }
    const handler = () => {
      const scrollY = window.scrollY + window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      setAtBottom(docHeight - scrollY < 100)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [isMobile, location.pathname])

  const NAV_LINKS = [
    { label: t('home', 'inicio'), path: '/' },
    { label: t('work', 'trabajos'), path: '/projects' },
    { label: t('experience', 'experiencia'), path: '/experience' },
    { label: t('about', 'sobre mí'), path: '/about' },
    { label: t('contact', 'contacto'), path: '/contact' },
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  // ─── Desktop (>1024px) ─────────────────────────────────────────────────────
  if (!isCompact) {
    return (
      <>
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px clamp(60px, 8vw, 140px)',
          borderBottom: '0.5px solid var(--border)',
          background: 'var(--bg)',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--text-secondary)', letterSpacing: 2,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              BZ — {new Date().getFullYear()}
            </button>
            <LikeButton />
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontFamily: 'var(--font-mono)', fontSize: 14,
                    letterSpacing: 1, cursor: 'pointer',
                    color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {link.label}
                </button>
              )
            })}

            {isAdmin && (
              <div ref={adminMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setAdminMenuOpen(v => !v)}
                  style={{
                    width: 28, height: 28,
                    borderRadius: '50%', overflow: 'hidden',
                    border: '1.5px solid rgba(196,176,144,0.4)',
                    boxShadow: '0 0 0 2px rgba(61,107,98,0.2)',
                    cursor: 'pointer', padding: 0, background: 'none',
                  }}
                >
                  <img
                    src={profile?.photoUrl ?? '/bau.jpg'}
                    alt={profile?.name ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                  />
                </button>

                <AnimatePresence>
                  {adminMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: 36, right: 0,
                        background: 'var(--bg)',
                        border: '1px solid rgba(196,176,144,0.15)',
                        borderRadius: 6, padding: '0.4rem 0',
                        minWidth: 140, backdropFilter: 'blur(12px)',
                      }}
                    >
                      <button
                        onClick={() => { setAdminMenuOpen(false); navigate('/admin') }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '0.4rem 0.8rem',
                          fontFamily: 'var(--font-mono)', fontSize: 11,
                          color: 'var(--accent-warm)',
                          background: 'none', border: 'none', cursor: 'pointer',
                        }}
                      >
                        → {t('admin panel', 'panel admin')}
                      </button>
                      <div style={{ height: '0.5px', background: 'var(--border)', margin: '0.3rem 0' }} />
                      <button
                        onClick={() => { setAdminMenuOpen(false); logout(); navigate('/login') }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '0.4rem 0.8rem',
                          fontFamily: 'var(--font-mono)', fontSize: 11,
                          color: 'var(--text-secondary)',
                          background: 'none', border: 'none', cursor: 'pointer',
                        }}
                      >
                        × {t('logout', 'cerrar sesión')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <LangToggle />
            <ThemeToggle />
          </div>
        </nav>

        <ConsoleDrawer open={consoleOpen} setOpen={setConsoleOpen} />
      </>
    )
  }

  // ─── Mobile & Tablet (≤1024px) ─────────────────────────────────────────────
  return (
    <>
      {/* Compact header bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 6vw',
        height: 56,
        borderBottom: mobileOpen ? 'none' : '0.5px solid var(--border)',
        background: 'var(--bg)',
        zIndex: mobileOpen ? 1001 : 100,
      }}>
        {/* Left: logo + like */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => handleNavigate('/')}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--text-secondary)', letterSpacing: 2,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            BZ — {new Date().getFullYear()}
          </button>
          <LikeButton />
        </div>

        {/* Right: tablet shows controls inline, both show hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isTablet && (
            <>
              <LangToggle />
              <ThemeToggle />
            </>
          )}

          {/* Hamburger → × morph */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{
              width: 44, height: 44,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              gap: 5,
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
            }}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{
                display: 'block', width: 18, height: 1,
                background: 'var(--text-secondary)',
                transformOrigin: 'center',
              }}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'block', width: 18, height: 1,
                background: 'var(--text-secondary)',
              }}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{
                display: 'block', width: 18, height: 1,
                background: 'var(--text-secondary)',
                transformOrigin: 'center',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0,
              background: 'var(--bg)',
              zIndex: 1000,
              display: 'flex', flexDirection: 'column',
              paddingTop: 56,
              overflowY: 'auto',
            }}
          >
            {/* Nav links */}
            <div style={{
              flex: 1,
              padding: isMobile ? '32px 6vw 0' : '40px 6vw 0',
            }}>
              {NAV_LINKS.map((link, i) => {
                const isActive = location.pathname === link.path
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.055, ease: 'easeOut' }}
                  >
                    <button
                      onClick={() => handleNavigate(link.path)}
                      style={{
                        display: 'flex', alignItems: 'baseline',
                        gap: isMobile ? 14 : 18,
                        width: '100%',
                        background: 'none', border: 'none',
                        cursor: 'pointer', padding: isMobile ? '13px 0' : '11px 0',
                        borderBottom: '0.5px solid var(--border)',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        letterSpacing: 1,
                        minWidth: 20,
                        lineHeight: 1,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? 26 : 20,
                        letterSpacing: 0.5,
                        color: isActive ? 'var(--accent-teal)' : 'var(--text-primary)',
                        fontWeight: isActive ? 600 : 400,
                        lineHeight: 1.15,
                        flex: 1,
                      }}>
                        {link.label}
                      </span>
                      {isActive && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 8,
                          color: 'var(--accent-teal)',
                          alignSelf: 'center',
                        }}>
                          ●
                        </span>
                      )}
                    </button>
                  </motion.div>
                )
              })}
            </div>

            {/* Bottom controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.32 }}
              style={{
                padding: isMobile ? '18px 6vw 32px' : '16px 6vw 28px',
                display: 'flex', flexDirection: 'column', gap: 12,
                borderTop: '0.5px solid var(--border)',
                marginTop: 20,
              }}
            >
              {/* Mobile: lang + theme + terminal inline */}
              {isMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <LangToggle />
                  <ThemeToggle />
                  <button
                    onClick={() => { setMobileOpen(false); setConsoleOpen(true) }}
                    style={{
                      marginLeft: 'auto',
                      background: 'var(--bg-surface)',
                      border: '0.5px solid var(--border)',
                      color: 'var(--accent-teal)',
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1,
                      padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
                    }}
                  >
                    terminal
                  </button>
                </div>
              )}

              {/* Tablet: terminal solo (lang+theme ya están en el header) */}
              {isTablet && (
                <div>
                  <button
                    onClick={() => { setMobileOpen(false); setConsoleOpen(true) }}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '0.5px solid var(--border)',
                      color: 'var(--accent-teal)',
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1,
                      padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
                    }}
                  >
                    terminal
                  </button>
                </div>
              )}

              {/* Admin section (conditional) */}
              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <button
                    onClick={() => handleNavigate('/admin')}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--accent-warm)', letterSpacing: 1,
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: '4px 0',
                    }}
                  >
                    → {t('admin panel', 'panel admin')}
                  </button>
                  <span style={{
                    color: 'var(--border)', fontSize: 10,
                    margin: '0 14px',
                  }}>
                    /
                  </span>
                  <button
                    onClick={() => { logout(); navigate('/login'); setMobileOpen(false) }}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--text-muted)', letterSpacing: 1,
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: '4px 0',
                    }}
                  >
                    × {t('logout', 'cerrar sesión')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConsoleDrawer open={consoleOpen} setOpen={setConsoleOpen} navOpen={mobileOpen} hideTrigger={atBottom} />
    </>
  )
}
