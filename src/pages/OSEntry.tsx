import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

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

function GuestAvatar() {
  return (
    <div style={{
      width: 72, height: 72,
      borderRadius: '50%',
      background: '#1E2228',
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
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        background: isAdmin ? 'rgba(20, 24, 20, 0.85)' : 'rgba(20, 24, 20, 0.5)',
        border: `1px solid ${hovered
          ? isAdmin ? 'rgba(196, 176, 144, 0.35)' : 'rgba(61, 107, 98, 0.3)'
          : isAdmin ? 'rgba(196, 176, 144, 0.15)' : 'rgba(30, 40, 32, 0.6)'}`,
        borderRadius: '8px',
        padding: '1.5rem 1rem',
        cursor: 'pointer',
        minWidth: '110px',
        transition: 'border-color 0.2s ease',
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
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        const data = await res.json()
        onSuccess(data.data.token)
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
          src="/bau.jpg"
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
  const [users, setUsers] = useState<{ username: string }[]>([])
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/v1/auth/users')
      .then(res => res.json())
      .then(data => {
        if (data?.data) {
          setUsers(data.data)
        }
      })
      .catch(console.error)
  }, [])

  const handleGuestClick = () => navigate('/home')
  const handleUserClick = (username: string) => setSelected(username)

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
              gap: '3rem',
              alignItems: 'center',
            }}>
              <UserCard
                name="Guest"
                avatar={<GuestAvatar />}
                onClick={handleGuestClick}
              />
              {users.map((user) => (
                <UserCard
                  key={user.username}
                  name={user.username}
                  avatar={
                    <div style={{
                      width: 72, height: 72,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1.5px solid rgba(196,176,144,0.3)',
                    }}>
                      <img
                        src="/bau.jpg"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    </div>
                  }
                  onClick={() => handleUserClick(user.username)}
                  isAdmin={true}
                />
              ))}
            </div>
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
        guest mode available
      </motion.div>
    </div>
  )
}
