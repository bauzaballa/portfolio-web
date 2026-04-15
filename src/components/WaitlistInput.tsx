import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LangContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function WaitlistInput() {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  const submit = async () => {
    if (!email.includes('@')) return
    setState('loading')
    try {
      const res = await fetch(`${API}/api/v1/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 409) { setState('duplicate'); return }
      if (!res.ok) { setState('error'); return }
      setState('success')
      setEmail('')
    } catch {
      setState('error')
    }
  }

  const messages: Record<string, string> = {
    success: t("you're on the list.", 'estás en la lista.'),
    duplicate: t('already registered.', 'ya registrado.'),
    error: t('something went wrong.', 'algo salió mal.'),
  }

  return (
    <div style={{ marginTop: 40, maxWidth: 360 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-secondary)', letterSpacing: 2,
        marginBottom: 12, textTransform: 'uppercase',
      }}>
        {t("notify me when it's ready", 'te aviso cuando esté listo?')}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setState('idle') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder={t('your@email.com', 'tu@email.com')}
          disabled={state === 'loading' || state === 'success'}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            borderBottom: '0.5px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            padding: '8px 0',
            outline: 'none',
            caretColor: 'var(--accent-teal)',
          }}
        />
        <button
          onClick={submit}
          disabled={state === 'loading' || state === 'success' || !email.includes('@')}
          style={{
            background: 'none',
            border: '0.5px solid var(--border)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: 1,
            padding: '6px 14px',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.15s',
            opacity: (!email.includes('@') || state === 'success') ? 0.4 : 1,
          }}
        >
          {state === 'loading' ? '...' : '→'}
        </button>
      </div>

      <AnimatePresence>
        {messages[state] && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: state === 'success' ? 'var(--accent-teal)' : 'var(--accent-warm)',
              marginTop: 8,
            }}
          >
            {messages[state]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
