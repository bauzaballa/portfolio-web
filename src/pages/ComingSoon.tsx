import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type ConsoleEntry = {
  id: number
  type: 'input' | 'output' | 'error'
  content: string
}

const COMMANDS: Record<string, string> = {
  'get projects': '/api/v1/projects',
  'get profile': '/api/v1/profile',
  'get skills': '/api/v1/skills',
  'get experience': '/api/v1/experience',
  'get education': '/api/v1/education',
  'exit': '',
  'clear': '',
  'help': '',
}

export default function ComingSoon() {
  const { theme, toggle } = useTheme()
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    { id: 0, type: 'output', content: 'portfolio console v0.1 — type "help" for commands' }
  ])
  const [progress] = useState(42)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setConsoleOpen(o => !o) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const runCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    const next = (entry: Omit<ConsoleEntry, 'id'>) =>
      setEntries(e => [...e, { ...entry, id: Date.now() }])

    next({ type: 'input', content: `> ${cmd}` })

    if (trimmed === 'help') {
      next({ type: 'output', content: Object.keys(COMMANDS).filter(k => k !== 'help').join(' | ') })
      return
    }

    if (trimmed === 'clear') {
      setEntries([{ id: Date.now(), type: 'output', content: 'cleared.' }])
      return
    }

    if (trimmed === 'exit') {
      setConsoleOpen(false)
      return
    }

    const path = COMMANDS[trimmed]
    if (!path) {
      next({ type: 'error', content: `unknown command: "${trimmed}". type "help"` })
      return
    }

    try {
      const res = await fetch(`${API}${path}`)
      const json = await res.json()
      next({ type: 'output', content: JSON.stringify(json.data, null, 2) })
    } catch {
      next({ type: 'error', content: 'connection failed. is the API running?' })
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      {/* MAIN */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '0 8vw',
        transition: 'margin-right 0.3s ease',
        marginRight: consoleOpen ? '380px' : '0',
      }}>

        {/* nav */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: consoleOpen ? 380 : 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 8vw',
          borderBottom: `0.5px solid var(--border)`,
          background: 'var(--bg)',
          zIndex: 10,
          transition: 'right 0.3s ease',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 2, fontWeight: '600' }}>
            BZ — {new Date().getFullYear()}
          </span>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
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
            <button
              onClick={() => setConsoleOpen(o => !o)}
              style={{
                background: consoleOpen ? 'var(--accent-teal)' : 'none',
                border: `0.5px solid ${consoleOpen ? 'var(--accent-teal)' : 'var(--border)'}`,
                color: consoleOpen ? '#fff' : 'var(--text-secondary)',
                padding: '4px 12px', borderRadius: 3, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, fontWeight: '600',
              }}
            >
              {consoleOpen ? 'CLOSE' : 'CONSOLE'} <span style={{ opacity: 0.5 }}>ctrl+k</span>
            </button>
          </div>
        </nav>

        {/* hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ paddingTop: 80 }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: '600',
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

          {/* progress bar */}
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
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: '600',
            color: 'var(--text-secondary)', letterSpacing: 1
          }}>
            {progress}% — React · Node.js · PostgreSQL · TypeScript
          </div>
        </motion.div>
      </main>

      {/* CONSOLE SIDEBAR */}
      <AnimatePresence>
        {consoleOpen && (
          <motion.aside
            initial={{ x: 450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 450,
              background: 'var(--bg-surface)',
              borderLeft: `0.5px solid var(--border)`,
              display: 'flex', flexDirection: 'column',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              zIndex: 20,
            }}
          >
            {/* console header */}
            <div style={{
              padding: '21px 20px',
              borderBottom: `0.5px solid var(--border)`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ color: 'var(--accent-teal)', fontSize: 10, letterSpacing: 2, fontWeight: '600' }}>
                PORTFOLIO CONSOLE — API: {API}
              </span>
              <button
                onClick={() => setConsoleOpen(false)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12,
                  padding: '2px 6px'
                }}
              >
                ✕
              </button>
            </div>

            {/* output */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '12px 20px',
              display: 'flex', flexDirection: 'column', gap: 4
            }}>
              {entries.map(e => (
                <div key={e.id} style={{
                  color: e.type === 'input' ? 'var(--accent-warm)'
                    : e.type === 'error' ? '#E24B4A'
                      : 'var(--text-primary)',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  lineHeight: 1.6, fontSize: e.type === 'output' ? 11 : 12
                }}>
                  {e.content}
                </div>
              ))}
            </div>

            {/* input */}
            <div style={{
              borderTop: `0.5px solid var(--border)`,
              padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ color: 'var(--accent-teal)' }}>{'>'}</span>
              <input
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && input.trim()) {
                    runCommand(input)
                    setInput('')
                  }
                }}
                placeholder="type a command..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                  fontSize: 12, caretColor: 'var(--accent-teal)'
                }}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  )
}
