import { useLang } from '../context/LangContext'

export default function LangToggle() {
  const { lang, toggle } = useLang()

  return (
    <button
      onClick={toggle}
      style={{
        background: 'none',
        border: 'none',
        borderRadius: 2,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        letterSpacing: 1,
        padding: '3px 0',
        width: 48,
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontWeight: 600,
      }}
    >
      <span style={{ color: lang === 'en' ? 'var(--accent-teal)' : 'var(--text-muted)' }}>EN</span>
      <span style={{ color: 'var(--border)', fontSize: 9 }}>|</span>
      <span style={{ color: lang === 'es' ? 'var(--accent-teal)' : 'var(--text-muted)' }}>ES</span>
    </button>
  )
}
