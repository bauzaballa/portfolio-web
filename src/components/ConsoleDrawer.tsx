import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type ConsoleEntry = {
  id: number
  type: 'input' | 'output' | 'error'
  content: string
}

const COMMANDS: Record<string, string> = {
  'get-projects': '/api/v1/projects',
  'get-profile': '/api/v1/profile',
  'get-skills': '/api/v1/skills',
  'get-experience': '/api/v1/experience',
  'get-education': '/api/v1/education',
  'exit': '',
  'clear': '',
  'help': '',
}

export default function ConsoleDrawer() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    { id: 0, type: 'output', content: 'portfolio console v0.1 — type "help" for commands' }
  ])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
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
      setOpen(false)
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
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        animate={{ right: open ? 474 : 24 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', bottom: 24, zIndex: 200,
          background: open ? 'var(--accent-teal)' : 'none',
          border: `0.5px solid ${open ? 'var(--accent-teal)' : 'var(--border)'}`,
          color: open ? '#fff' : 'var(--text-secondary)',
          padding: '4px 12px', borderRadius: 3, cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, fontWeight: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? 'CLOSE' : 'CONSOLE'} <span style={{ opacity: 0.5 }}>ctrl+k</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.15)',
                backdropFilter: 'blur(2px)',
                zIndex: 140,
              }}
            />
            <motion.aside
              initial={{ x: 450, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 450, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 450,
              background: 'var(--bg-surface)',
              borderLeft: '0.5px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              zIndex: 150,
            }}
          >
            <div style={{
              padding: '21px 20px',
              borderBottom: '0.5px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ color: 'var(--accent-teal)', fontSize: 10, letterSpacing: 2, fontWeight: 600 }}>
                PORTFOLIO CONSOLE — API: {API}
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12,
                  padding: '2px 6px'
                }}
              >
                ✕
              </button>
            </div>

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

            <div style={{
              borderTop: '0.5px solid var(--border)',
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
        </>
        )}
      </AnimatePresence>
    </>
  )
}
