import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { usePreview } from '../context/PreviewContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type ConsoleEntry = {
  id: number
  type: 'input' | 'output' | 'success' | 'error'
  content: string
}

const COMMANDS: Record<string, string> = {
  'get-projects': '/api/v1/projects',
  'get-profile': '/api/v1/profile',
  'get-skills': '/api/v1/skills',
  'get-experience': '/api/v1/experience',
  'get-education': '/api/v1/education',
  'lang-es': '',
  'lang-en': '',
  'logout': '',
  'exit': '',
  'clear': '',
  'help': '',
  'unlock-portfolio': '',
  'lock-portfolio': '',
  'status': '',
}

const FETCH_COMMANDS = ['get-projects', 'get-profile', 'get-skills', 'get-experience', 'get-education']

const FETCH_LABELS: Record<string, { en: string; es: string }> = {
  'get-projects':   { en: 'projects fetched',   es: 'proyectos obtenidos' },
  'get-profile':    { en: 'profile fetched',     es: 'perfil obtenido' },
  'get-skills':     { en: 'skills fetched',      es: 'skills obtenidos' },
  'get-experience': { en: 'experience fetched',  es: 'experiencia obtenida' },
  'get-education':  { en: 'education fetched',   es: 'educación obtenida' },
}

const HELP_EN = `get-projects    get-profile     get-skills
get-experience  get-education
lang-en         lang-es
logout          clear           exit
status`

const HELP_ES = `get-projects    get-profile     get-skills
get-experience  get-education
lang-en         lang-es
logout          clear           salir
status`

function useWindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return width
}

interface ConsoleDrawerProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  navOpen?: boolean
  hideTrigger?: boolean
}

export default function ConsoleDrawer({ open, setOpen, navOpen = false, hideTrigger = false }: ConsoleDrawerProps) {
  const { lang, toggle: toggleLang } = useLang()
  const { logout, isAdmin } = useAuth()
  const { unlocked, unlock, lock } = usePreview()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<ConsoleEntry[]>([
    {
      id: 0, type: 'output',
      content: lang === 'es'
        ? 'terminal del portfolio v0.1 — escribí "help" para ver comandos'
        : 'portfolio console v0.1 — type "help" for commands'
    }
  ])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const width = useWindowWidth()

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const isDesktop = width > 1024

  const buildUrl = (path: string) => `${API}${path}${path.includes('?') ? '&' : '?'}lang=${lang}`

  // Ctrl+K shortcut (desktop only)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setOpen(o => !o) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Scroll to bottom on new entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  // Auto-focus input when drawer opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  // Lock body scroll when open on mobile/tablet
  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = open ? 'hidden' : ''
      return () => { document.body.style.overflow = '' }
    }
  }, [open, isDesktop])

  const runCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    const next = (entry: Omit<ConsoleEntry, 'id'>) =>
      setEntries(e => [...e, { ...entry, id: Date.now() + Math.random() }])

    next({ type: 'input', content: cmd })

    if (trimmed === 'unlock-portfolio') {
      unlock()
      next({ type: 'output', content: 'portfolio unlocked. navigate to /home' })
      return
    }

    if (trimmed === 'lock-portfolio') {
      lock()
      next({ type: 'output', content: 'portfolio locked.' })
      return
    }

    if (trimmed === 'status') {
      next({ type: 'output', content: `preview: ${unlocked ? 'unlocked' : 'locked'}` })
      return
    }

    if (trimmed === 'lang-es' || trimmed === 'lang-en') {
      const target = trimmed === 'lang-es' ? 'es' : 'en'
      if (lang === target) {
        next({ type: 'output', content: lang === 'es' ? 'ya estás en español.' : 'already in english.' })
        return
      }
      toggleLang()
      next({ type: 'success', content: target === 'es' ? 'idioma cambiado a español.' : 'language changed to english.' })
      return
    }

    if (trimmed === 'help') {
      next({ type: 'output', content: lang === 'es' ? HELP_ES : HELP_EN })
      return
    }

    if (trimmed === 'clear') {
      setEntries([{ id: Date.now(), type: 'success', content: 'cleared.' }])
      return
    }

    if (trimmed === 'exit' || trimmed === 'salir') {
      setOpen(false)
      return
    }

    if (trimmed === 'logout') {
      if (!isAdmin) {
        next({ type: 'error', content: lang === 'es'
          ? 'no iniciaste sesión. ¿logout de qué exactamente?'
          : 'not logged in. logout from what exactly?'
        })
        return
      }
      logout()
      navigate('/entry')
      next({ type: 'success', content: lang === 'es' ? 'sesión cerrada.' : 'logged out.' })
      return
    }

    const path = COMMANDS[trimmed]
    if (!path) {
      next({ type: 'error', content: lang === 'es'
        ? `comando desconocido: "${trimmed}". escribí "help"`
        : `unknown command: "${trimmed}". type "help"`
      })
      return
    }

    if (FETCH_COMMANDS.includes(trimmed)) {
      try {
        const res = await fetch(buildUrl(path))
        const json = await res.json()
        const data = json.data
        const count = Array.isArray(data) ? data.length : 1
        const label = FETCH_LABELS[trimmed]
        next({ type: 'success', content: `${count} ${lang === 'es' ? label.es : label.en}` })
        next({ type: 'output', content: JSON.stringify(data, null, 2) })
      } catch {
        next({ type: 'error', content: lang === 'es'
          ? 'error de conexión. ¿está corriendo la API?'
          : 'connection failed. is the API running?'
        })
      }
    }
  }

  // ─── Shared JSX fragments ──────────────────────────────────────────────────
  const outputArea = (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {entries.map((e, i) => {
        const prev = i > 0 ? entries[i - 1] : null
        const showSpacer = prev && prev.type !== 'input' && e.type === 'input'
        return (
          <div key={e.id}>
            {showSpacer && <div style={{ height: 4 }} />}
            {e.type === 'input' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--accent-teal)' }}>~</span>
                <span style={{ color: 'var(--accent-warm)' }}>{e.content}</span>
              </div>
            ) : (
              <div style={{
                paddingLeft: 16,
                color: e.type === 'success' ? 'var(--accent-teal)'
                  : e.type === 'error' ? '#9B4A4A'
                  : 'var(--text-secondary)',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                lineHeight: 1.6, fontSize: 11,
              }}>
                {e.content}
              </div>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )

  const inputRow = (
    <div style={{
      borderTop: '0.5px solid var(--border)',
      padding: '10px 16px',
      paddingBottom: isMobile ? 'max(10px, env(safe-area-inset-bottom))' : '10px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ color: 'var(--accent-teal)' }}>~</span>
      <input
        ref={inputRef}
        className="console-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && input.trim()) {
            runCommand(input)
            setInput('')
          }
        }}
        placeholder={lang === 'es' ? 'escribí un comando...' : 'type a command...'}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--accent-warm)', fontFamily: 'var(--font-mono)', fontSize: 12,
          caretColor: 'var(--accent-teal)',
        }}
      />
    </div>
  )

  const panelHeader = (showClose: boolean) => (
    <div style={{
      background: 'var(--bg-surface)',
      padding: '12px 20px',
      borderBottom: '0.5px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2 }}>
        Terminal
      </span>
      {showClose && (
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12,
            padding: '4px 6px', lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )

  return (
    <>
      <style>{`.console-input::placeholder { color: #2A3830; }`}</style>

      {/* ─── Trigger button ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(!isMobile || !open) && !navOpen && !hideTrigger && (
          <motion.button
            key="trigger"
            initial={false}
            animate={{ right: isDesktop && open ? 564 : 24 }}
            exit={isMobile ? { opacity: 0, scale: 0.8 } : undefined}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setOpen(o => !o)}
            style={{
              position: 'fixed', bottom: 24, zIndex: 200,
              background: 'var(--bg-surface)',
              border: `0.5px solid ${open ? 'var(--accent-teal)' : 'var(--border)'}`,
              color: 'var(--accent-teal)',
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1,
              padding: '6px 14px', borderRadius: 3, cursor: 'pointer',
            }}
          >
            {open && !isMobile ? '✕' : (isDesktop ? 'Terminal  ctrl+k' : 'terminal')}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {/* ─── Backdrop ─────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.15)',
                backdropFilter: 'blur(2px)',
                zIndex: 140,
              }}
            />

            {/* ─── Mobile: bottom sheet ─────────────────────────────────────── */}
            {isMobile && (
              <motion.aside
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => inputRef.current?.focus()}
                style={{
                  position: 'fixed', bottom: 0, left: 0, right: 0,
                  height: '72dvh',
                  background: 'var(--bg)',
                  borderTop: '0.5px solid var(--border)',
                  borderRadius: '12px 12px 0 0',
                  display: 'flex', flexDirection: 'column',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  zIndex: 150,
                  overflow: 'hidden',
                }}
              >
                {/* Drag handle */}
                <div style={{
                  display: 'flex', justifyContent: 'center',
                  padding: '10px 0 4px',
                  background: 'var(--bg-surface)',
                }}>
                  <div style={{
                    width: 32, height: 3,
                    background: 'var(--border)',
                    borderRadius: 2,
                  }} />
                </div>

                {panelHeader(true)}
                {outputArea}
                {inputRow}
              </motion.aside>
            )}

            {/* ─── Tablet: right drawer, adapted width ──────────────────────── */}
            {isTablet && (
              <motion.aside
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => inputRef.current?.focus()}
                style={{
                  position: 'fixed', top: 0, right: 0, bottom: 0,
                  width: 'min(440px, 88vw)',
                  background: 'var(--bg)',
                  borderLeft: '0.5px solid var(--border)',
                  display: 'flex', flexDirection: 'column',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  zIndex: 150,
                }}
              >
                {panelHeader(true)}
                {outputArea}
                {inputRow}
              </motion.aside>
            )}

            {/* ─── Desktop: right drawer, original behavior ─────────────────── */}
            {isDesktop && (
              <motion.aside
                initial={{ x: 540, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 540, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => inputRef.current?.focus()}
                style={{
                  position: 'fixed', top: 0, right: 0, bottom: 0,
                  width: 540,
                  background: 'var(--bg)',
                  borderLeft: '0.5px solid var(--border)',
                  display: 'flex', flexDirection: 'column',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  zIndex: 150,
                }}
              >
                {panelHeader(false)}
                {outputArea}
                {inputRow}
              </motion.aside>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  )
}
