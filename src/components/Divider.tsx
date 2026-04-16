export default function Divider({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      borderTop: '0.5px solid var(--border)',
      ...style,
    }} />
  )
}
