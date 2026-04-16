interface ParticipationBarProps {
  label: string
  value: number
  color: string
}

export default function ParticipationBar({ label, value, color }: ParticipationBarProps) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-secondary)', marginBottom: 3,
      }}>
        {label} {value}%
      </div>
      <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, width: '100%' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 1 }} />
      </div>
    </div>
  )
}
