interface SectionLabelProps {
  children: React.ReactNode
  color?: 'teal' | 'muted'
  style?: React.CSSProperties
}

export default function SectionLabel({ children, color = 'muted', style }: SectionLabelProps) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 11,
      color: color === 'teal' ? 'var(--accent-teal)' : 'var(--text-muted)',
      letterSpacing: 3,
      textTransform: 'uppercase',
      marginBottom: 16,
      ...style,
    }}>
      {children}
    </div>
  )
}
