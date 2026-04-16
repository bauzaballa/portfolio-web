import Nav from './Nav'

interface ErrorStateProps {
  message: string
  withNav?: boolean
}

export default function ErrorState({ message, withNav = true }: ErrorStateProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {withNav && <Nav />}
      <div style={{
        padding: '200px 0',
        textAlign: 'center',
        fontFamily: 'var(--font-serif)',
        fontSize: 18,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}>
        {message}
      </div>
    </div>
  )
}
