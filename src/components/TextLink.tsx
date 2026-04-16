interface TextLinkProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  color?: string
  style?: React.CSSProperties
}

export default function TextLink({ children, onClick, href, color = 'var(--accent-teal)', style }: TextLinkProps) {
  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 12,
    color,
    cursor: 'pointer',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
    ...style,
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', ...baseStyle }}>
        {children}
      </a>
    )
  }

  return <span onClick={onClick} style={baseStyle}>{children}</span>
}
