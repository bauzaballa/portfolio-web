export default function SkillChip({ name }: { name: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 11,
      padding: '2px 6px',
      border: '0.5px solid var(--border)',
      color: 'var(--text-secondary)',
      borderRadius: 2,
    }}>
      {name}
    </span>
  )
}
