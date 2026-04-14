import { useState } from 'react'

interface Project {
  slug: string
  title: string
  descriptionShort: string
  type: string
  participationFrontend: number | null
  participationBackend: number | null
  participationDesign: number | null
  skills?: { name: string }[]
}

export default function ProjectRow({ project, index, onClick }: {
  project: Project
  index: number
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isSolo = project.participationFrontend === 100 && project.participationBackend === 100
  const barColor = isSolo ? 'var(--accent-warm)' : 'var(--accent-teal)'

  const bars: { label: string; value: number }[] = []
  if (project.participationFrontend != null && project.participationFrontend > 0)
    bars.push({ label: 'frontend', value: project.participationFrontend })
  if (project.participationBackend != null && project.participationBackend > 0)
    bars.push({ label: 'backend', value: project.participationBackend })
  if (project.participationDesign != null && project.participationDesign > 0)
    bars.push({ label: 'design', value: project.participationDesign })

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderTop: index === 1 ? 'none' : '0.5px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: '48px 1fr 220px',
        alignItems: 'center',
        padding: '20px 0',
        cursor: 'pointer',
        background: hovered ? 'rgba(61, 107, 98, 0.03)' : 'transparent',
        transition: 'background 0.2s ease',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-serif)', fontSize: 36,
        color: hovered ? 'var(--accent-teal)' : 'var(--text-muted)',
        transition: 'color 0.2s ease',
      }}>
        {String(index).padStart(2, '0')}
      </span>

      <div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'var(--accent-teal)', textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          {project.type}
        </span>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: 20,
          color: 'var(--text-primary)', marginTop: 2,
        }}>
          {project.title}
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-secondary)',
          marginTop: 4, maxWidth: 420,
        }}>
          {project.descriptionShort}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {(project.skills ?? []).map(s => (
            <span key={s.name} style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              padding: '2px 6px',
              border: '0.5px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: 2,
            }}>
              {s.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        borderLeft: '0.5px solid var(--border)',
        paddingLeft: 16,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {bars.map(b => (
          <div key={b.label}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              color: 'var(--text-secondary)', marginBottom: 3,
            }}>
              {b.label} {b.value}%
            </div>
            <div style={{
              height: 2, background: 'var(--border)', borderRadius: 1, width: '100%',
            }}>
              <div style={{
                height: '100%', width: `${b.value}%`,
                background: barColor, borderRadius: 1,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
