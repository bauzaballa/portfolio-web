import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import ConsoleDrawer from '../components/ConsoleDrawer'
import ThemeToggle from '../components/ThemeToggle'
import WaitlistInput from '../components/WaitlistInput'

export default function ComingSoon() {
  const { theme } = useTheme()
  const [progress] = useState(42)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '0 8vw',
      }}>
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 8vw',
          borderBottom: '0.5px solid var(--border)',
          background: 'var(--bg)',
          zIndex: 10,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 2, fontWeight: 600 }}>
            BZ — {new Date().getFullYear()}
          </span>
          <ThemeToggle />
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ paddingTop: 80 }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            color: 'var(--accent-teal)', letterSpacing: 3,
            marginBottom: 20, textTransform: 'uppercase'
          }}>
            Fullstack Developer — La Plata, AR
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 700, lineHeight: 1,
            color: theme === 'dark' ? 'var(--text-primary)' : 'var(--accent-warm)', marginBottom: 8
          }}>
            Bautista
          </h1>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 8vw, 96px)',
            fontWeight: 700, lineHeight: 1,
            color: theme === 'dark' ? 'var(--text-primary)' : 'var(--accent-warm)', marginBottom: 32
          }}>
            Zaballa.
          </h1>

          <p style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 2vw, 24px)',
            color: 'var(--text-secondary)', marginBottom: 48,
            fontStyle: 'italic', maxWidth: 480
          }}>
            building something.
          </p>

          <div style={{ width: 'min(320px, 80vw)', marginBottom: 12 }}>
            <div style={{
              width: '100%', height: 2,
              background: 'var(--border)', borderRadius: 1
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                style={{
                  height: '100%', background: 'var(--accent-teal)',
                  borderRadius: 1
                }}
              />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            color: 'var(--text-secondary)', letterSpacing: 1
          }}>
            {progress}% — React · Node.js · PostgreSQL · TypeScript
          </div>
          <WaitlistInput />
        </motion.div>
      </main>

      <ConsoleDrawer />
    </div>
  )
}
