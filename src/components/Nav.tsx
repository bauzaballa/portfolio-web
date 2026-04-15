import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import ConsoleDrawer from './ConsoleDrawer'
import ThemeToggle from './ThemeToggle'
import LangToggle from './LangToggle'
import LikeButton from './LikeButton'

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin, logout } = useAuth()
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const NAV_LINKS = [
    { label: t('home', 'inicio'), path: '/home' },
    { label: t('work', 'trabajos'), path: '/projects' },
    { label: t('experience', 'experiencia'), path: '/experience' },
    { label: t('about', 'sobre mí'), path: '/about' },
    { label: t('contact', 'contacto'), path: '/contact' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 8vw',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span
            onClick={() => navigate('/home')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--text-secondary)', letterSpacing: 2,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            BZ — {new Date().getFullYear()}
          </span>
          <LikeButton />
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {NAV_LINKS.map(link => {
            const isActive = location.pathname === link.path
            return (
              <span
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  letterSpacing: 1, cursor: 'pointer',
                  color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {link.label}
              </span>
            )
          })}

          {isAdmin && (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(196,176,144,0.4)',
                  boxShadow: '0 0 0 2px rgba(61,107,98,0.2)',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                }}
              >
                <img
                  src="/bau.jpg"
                  alt="Bautista Zaballa"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 36,
                      right: 0,
                      background: 'var(--bg)',
                      border: '1px solid rgba(196,176,144,0.15)',
                      borderRadius: 6,
                      padding: '0.4rem 0',
                      minWidth: 140,
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/admin') }}
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
                      onClick={() => { setMenuOpen(false); logout(); navigate('/entry') }}
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

      <ConsoleDrawer />
    </>
  )
}
