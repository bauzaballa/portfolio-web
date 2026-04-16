interface InfoRowProps {
  label: string
  children: React.ReactNode
  borderBottom?: boolean
}

export default function InfoRow({ label, children, borderBottom = true }: InfoRowProps) {
  return (
    <div style={{
      borderBottom: borderBottom ? '0.5px solid var(--border)' : 'none',
      padding: '12px 0',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-muted)', letterSpacing: 2,
        textTransform: 'uppercase', marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-primary)' }}>
        {children}
      </div>
    </div>
  )
}
