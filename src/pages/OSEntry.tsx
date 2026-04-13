import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{ textAlign: 'center', marginBottom: '4rem' }}
    >
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '4rem',
        fontWeight: 300,
        color: 'var(--text-primary)',
        letterSpacing: '0.1em',
      }}>
        {time}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        marginTop: '0.5rem',
        letterSpacing: '0.05em',
      }}>
        {date}
      </div>
    </motion.div>
  )
}

function BautistaAvatar({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <clipPath id="bau-clip">
          <circle cx="40" cy="40" r="39" />
        </clipPath>
      </defs>
      <circle cx="40" cy="40" r="39" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="0.5" />
      <g clipPath="url(#bau-clip)">
        <rect x="28" y="28" width="24" height="28" rx="10" fill="#C4A882" />
        <path d="M24 22c0-8 6-14 16-14s16 6 16 14c0 4-2 6-4 7-1-4-5-8-12-8s-11 4-12 8c-2-1-4-3-4-7z" fill="#1A1008" />
        <path d="M36 46q4 2.5 8 0" stroke="#1A1008" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <rect x="22" y="62" width="36" height="20" rx="4" fill="#0E0E10" />
        <path d="M22 66l8-4h20l8 4v16H22z" fill="#8B7355" />
        <rect x="26" y="64" width="28" height="18" rx="2" fill="#0E0E10" />
      </g>
    </svg>
  )
}

function GuestAvatar({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <clipPath id="guest-clip">
          <circle cx="40" cy="40" r="39" />
        </clipPath>
      </defs>
      <circle cx="40" cy="40" r="39" fill="var(--bg-surface)" stroke="var(--border)" strokeWidth="0.5" />
      <g clipPath="url(#guest-clip)">
        <circle cx="40" cy="32" r="12" fill="#4A4A5A" />
        <ellipse cx="40" cy="72" rx="22" ry="18" fill="#3A3A4A" />
      </g>
    </svg>
  )
}

function UserCard({ name, avatar, onClick, delay }: {
  name: string
  avatar: React.ReactNode
  onClick: () => void
  delay: number
}) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.03 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '1rem',
      }}
    >
      <div style={{
        borderRadius: '50%',
        transition: 'box-shadow 0.3s ease',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61, 107, 98, 0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {avatar}
      </div>
      <span style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '0.9rem',
        color: 'var(--text-primary)',
      }}>
        {name}
      </span>
    </motion.button>
  )
}

const errorMessages = [
  'nope.',
  'still no.',
  'bro.',
  'ok you can stop now.',
]

function PasswordForm({ onCancel, onSuccess }: {
  onCancel: () => void
  onSuccess: (token: string) => void
}) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        const data = await res.json()
        onSuccess(data.token)
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

      <BautistaAvatar size={40} />

      <span style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1rem',
        color: 'var(--text-primary)',
        marginTop: '-0.75rem',
      }}>
        Bautista
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
  const [selected, setSelected] = useState<'bautista' | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleGuestClick = () => navigate('/home')
  const handleBautistaClick = () => setSelected('bautista')

  const handleLoginSuccess = (token: string) => {
    login(token)
    navigate('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
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
              gap: '3rem',
              alignItems: 'center',
            }}>
              <UserCard
                name="Guest"
                avatar={<GuestAvatar />}
                onClick={handleGuestClick}
                delay={0.6}
              />
              <UserCard
                name="Bautista"
                avatar={<BautistaAvatar />}
                onClick={handleBautistaClick}
                delay={0.75}
              />
            </div>
          </motion.div>
        ) : (
          <PasswordForm
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
        guest mode available
      </motion.div>
    </div>
  )
}
