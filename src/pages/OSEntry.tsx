import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import ThemeToggle from '../components/ThemeToggle'
import LangPicker from '../components/LangPicker'

function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{ textAlign: 'center', marginBottom: '2.5rem' }}
    >
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(3.5rem, 10vw, 6rem)',
        fontWeight: 300,
        fontStyle: 'italic',
        color: 'var(--text-primary)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '0.05em',
      }}>
        <span>{hh}</span>
        <span style={{
          color: 'var(--accent-warm)',
          fontSize: '0.75em',
        }}>:</span>
        <span>{mm}</span>
      </div>

      <div style={{
        width: 32,
        height: '0.5px',
        background: 'var(--border)',
        margin: '1rem auto 0.75rem',
      }} />

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        color: 'var(--text-secondary)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        {weekday} · {dateStr}
      </div>
    </motion.div>
  )
}

function GuestAvatar() {
  return (
    <div style={{
      width: 72, height: 72,
      borderRadius: '50%',
      background: 'var(--bg-surface)',
      border: '1.5px solid rgba(30,40,32,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width={36} height={36} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="6" fill="#4A4A5A" />
        <ellipse cx="16" cy="28" rx="10" ry="7" fill="#3A3A4A" />
      </svg>
    </div>
  )
}

function UserCard({ name, avatar, onClick, isAdmin }: {
  name: string
  avatar: React.ReactNode
  onClick: () => void
  isAdmin?: boolean
}) {
  return (
    <motion.button
      whileHover={{
        y: -4,
        scale: 1.02,
        borderColor: 'rgba(196, 176, 144, 0.35)',
      }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'var(--bg-surface)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(196, 176, 144, 0.15)',
        borderRadius: '8px',
        padding: '1.5rem 1rem',
        cursor: 'pointer',
        minWidth: '110px',
      }}
    >
      {avatar}
      <span style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
      }}>
        {name}
      </span>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        letterSpacing: '0.1em',
        color: isAdmin ? 'var(--accent-teal)' : 'var(--text-secondary)',
        padding: '0.15rem 0.4rem',
        border: `1px solid ${isAdmin ? 'rgba(61, 107, 98, 0.4)' : 'rgba(30, 40, 32, 0.6)'}`,
        borderRadius: '3px',
      }}>
        {isAdmin ? 'admin' : 'visitor'}
      </div>
    </motion.button>
  )
}

const errorMessages = [
  'nope.',
  'still no.',
  'bro.',
  'ok you can stop now.',
]

function PasswordForm({ username, onCancel, onSuccess }: {
  username: string
  onCancel: () => void
  onSuccess: () => void
}) {
  const { profile } = useProfile()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    if (!password.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const attempt = attempts + 1
        setAttempts(attempt)
        const msg = attempt <= 3 ? errorMessages[attempt - 1] : errorMessages[3]
        setError(msg)
        setPassword('')

        if (attempt >= 3) {
          setShake(true)
          setTimeout(() => setShake(false), 500)
        }
      }
    } catch {
      setError('connection failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      key="password-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        x: shake ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={shake ? { x: { duration: 0.5 } } : { duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '320px',
        position: 'relative',
      }}
    >
      <button
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          cursor: 'pointer',
          padding: '0.25rem 0',
        }}
      >
        back
      </button>

      <div style={{
        width: 40, height: 40,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1px solid rgba(196,176,144,0.3)',
        flexShrink: 0,
      }}>
        <img
          src={profile?.photoUrl ?? '/bau.jpg'}
          alt={profile?.name ?? ''}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>

      <span style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1rem',
        color: 'var(--text-primary)',
        marginTop: '-0.75rem',
      }}>
        {username}
      </span>

      <div style={{ width: '100%' }}>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="password"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            padding: '0.5rem 0',
            outline: 'none',
            textAlign: 'center',
            letterSpacing: '0.15em',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key={error + attempts}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--accent-warm)',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function OSEntry() {
  const [selected, setSelected] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { profile } = useProfile()
  const { isMobile } = useBreakpoint()
  const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || profile?.name || ''

  const handleGuestClick = () => navigate('/home')
  const handleUserClick = (username: string) => setSelected(username)

  const handleLoginSuccess = () => {
    login()
    navigate('/admin')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: isMobile ? '0 6vw' : 0,
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          zIndex: 100,
        }}
      >
        <ThemeToggle />
      </motion.div>

      <AnimatePresence mode="wait">
        {selected === null ? (
          <motion.div
            key="user-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Clock />
            <div style={{
              display: 'flex',
              gap: isMobile ? '1.5rem' : '3rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <UserCard
                name="Guest"
                avatar={<GuestAvatar />}
                onClick={handleGuestClick}
              />
              <UserCard
                name={adminUsername}
                avatar={
                  <div style={{
                    width: 72, height: 72,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(196,176,144,0.3)',
                  }}>
                    <img
                      src={profile?.photoUrl ?? '/bau.jpg'}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    />
                  </div>
                }
                onClick={() => handleUserClick(adminUsername)}
                isAdmin={true}
              />
            </div>
            <LangPicker variant="entry" />
          </motion.div>
        ) : (
          <PasswordForm
            username={selected}
            onCancel={() => setSelected(null)}
            onSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          opacity: 0.5,
          letterSpacing: '0.1em',
        }}
      >
        guest mode · modo invitado
      </motion.div>
    </div>
  )
}
