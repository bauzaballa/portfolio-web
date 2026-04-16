import { useBreakpoint } from '../hooks/useBreakpoint'
import SectionLabel from './SectionLabel'

interface PageHeaderProps {
  label: string
  title: string
  children?: React.ReactNode
  borderBottom?: boolean
  style?: React.CSSProperties
}

export default function PageHeader({ label, title, children, borderBottom = true, style }: PageHeaderProps) {
  const { isMobile } = useBreakpoint()

  return (
    <section style={{
      padding: isMobile ? '80px 6vw 32px' : '120px 8vw 40px',
      borderBottom: borderBottom ? '0.5px solid var(--border)' : 'none',
      ...style,
    }}>
      <SectionLabel>{label}</SectionLabel>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(40px, 6vw, 96px)',
        color: 'var(--text-primary)',
        fontWeight: 700,
        lineHeight: 1.05,
      }}>
        {title}
      </h1>
      {children}
    </section>
  )
}
