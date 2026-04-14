import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConsoleDrawer from './ConsoleDrawer'
import ThemeToggle from './ThemeToggle'
import LikeButton from './LikeButton'

const NAV_LINKS = [
  { label: 'home', path: '/home' },
  { label: 'work', path: '/projects' },
  { label: 'experience', path: '/experience' },
  { label: 'about', path: '/about' },
  { label: 'contact', path: '/contact' },
]

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin } = useAuth()

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
        <span
          onClick={() => navigate('/home')}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-secondary)', letterSpacing: 2,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          BZ — {new Date().getFullYear()}
        </span>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {NAV_LINKS.map(link => {
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

          {isAdmin && (
            <span
              onClick={() => navigate('/admin')}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: 1, cursor: 'pointer',
                color: 'var(--accent-warm)',
                padding: '3px 8px',
                border: '0.5px solid var(--accent-warm)',
                borderRadius: 2,
              }}
            >
              admin
            </span>
          )}

          <LikeButton />
          <ThemeToggle />
        </div>
      </nav>

      <ConsoleDrawer />
    </>
  )
}
