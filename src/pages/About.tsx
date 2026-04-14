import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import Nav from '../components/Nav'

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

  if (loading) return <LoadingSkeleton />

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
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

  return (
    <div>
      <Nav />

      {/* HERO SECTION */}
      <section style={{
        padding: '120px 8vw 80px',
        borderBottom: '0.5px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 80,
        alignItems: 'start',
      }}>
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: 3,
            marginBottom: 16,
          }}>
            / about
          </div>

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

        {/* Right column — photo placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
          style={{
            width: 340, height: 440,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 60, height: 60,
            background: 'var(--border)',
            borderRadius: '50%',
            marginBottom: 16,
          }} />
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            [ photo ]
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)', marginTop: 8,
          }}>
            analog photo coming soon
          </div>
        </motion.div>
      </section>

      {/* DETAILS SECTION */}
      <section style={{
        padding: '60px 8vw',
        borderBottom: '0.5px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 40,
      }}>
        {/* Location */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            location
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 16,
            color: 'var(--text-primary)',
          }}>
            {profile?.location}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            contact
          </div>
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
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            elsewhere
          </div>
          {profile?.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{
              display: 'block',
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--accent-teal)',
              textDecoration: 'none',
            }}>
              github -&gt;
            </a>
          )}
          {profile?.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{
              display: 'block',
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--accent-teal)',
              textDecoration: 'none', marginTop: 4,
            }}>
              linkedin -&gt;
            </a>
          )}
        </div>
      </section>

      {/* ANALOG PHOTOS SECTION */}
      <section style={{ padding: '60px 8vw', borderBottom: '0.5px solid var(--border)' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 28,
            color: 'var(--text-primary)',
          }}>
            analog.
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 18,
            color: 'var(--text-secondary)', fontStyle: 'italic',
            marginTop: 4,
          }}>
            some frames.
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 40,
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

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ padding: '120px 8vw 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[200, 120, 80, 320, 60].map((w, i) => (
          <div key={i} style={{
            height: i === 0 ? 72 : i === 3 ? 100 : 20,
            width: `min(${w * 2}px, ${w / 5}%)`,
            background: 'var(--bg-surface)',
            borderRadius: 2,
            animation: 'aboutPulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.12}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes aboutPulse { 0%,100% { opacity: 0.3 } 50% { opacity: 0.7 } }`}</style>
    </div>
  )
}
