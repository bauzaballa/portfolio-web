import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Nav from '../components/Nav'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Skill {
  id: number
  name: string
  category: string
}

interface Project {
  id: number
  slug: string
  title: string
  descriptionShort: string
  descriptionLong: string | null
  type: string
  company: string | null
  role: string | null
  visibility: string | null
  nda: boolean
  periodStart: string | null
  periodEnd: string | null
  githubUrl: string | null
  liveUrl: string | null
  technicalDecisions: string | null
  challenges: string[] | null
  media: { url: string; type: string }[] | null
  participationFrontend: number | null
  participationBackend: number | null
  participationDesign: number | null
  skills?: Skill[]
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/v1/projects/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(d => setProject(d.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div>
        <Nav />
        <div style={{ padding: '120px 8vw 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 14, width: 80, background: 'var(--bg-surface)', borderRadius: 2, animation: 'detailPulse 1.2s ease-in-out infinite' }} />
          <div style={{ height: 48, width: 400, background: 'var(--bg-surface)', borderRadius: 2, animation: 'detailPulse 1.2s ease-in-out infinite' }} />
          <div style={{ height: 16, width: 560, background: 'var(--bg-surface)', borderRadius: 2, animation: 'detailPulse 1.2s ease-in-out infinite' }} />
          <div style={{ height: 16, width: 480, background: 'var(--bg-surface)', borderRadius: 2, animation: 'detailPulse 1.2s ease-in-out infinite' }} />
          <div style={{ height: 280, width: '100%', background: 'var(--bg-surface)', borderRadius: 2, marginTop: 32, animation: 'detailPulse 1.2s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes detailPulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div>
        <Nav />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            project not found.
          </span>
        </div>
      </div>
    )
  }

  const isSolo = project.participationFrontend === 100 && project.participationBackend === 100
  const barColor = isSolo ? 'var(--accent-warm)' : 'var(--accent-teal)'

  const bars: { label: string; value: number }[] = []
  if (project.participationFrontend) bars.push({ label: 'frontend', value: project.participationFrontend })
  if (project.participationBackend) bars.push({ label: 'backend', value: project.participationBackend })
  if (project.participationDesign) bars.push({ label: 'design', value: project.participationDesign })

  const formatPeriod = () => {
    if (!project.periodStart) return null
    const start = new Date(project.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const end = project.periodEnd
      ? new Date(project.periodEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'present'
    return `${start} - ${end}`
  }

  const visibilityBadge = () => {
    if (project.nda) return { label: 'NDA', color: '#C47070' }
    if (project.visibility === 'open-source') return { label: 'open source', color: 'var(--accent-teal)' }
    return { label: 'personal', color: 'var(--text-muted)' }
  }

  const badge = visibilityBadge()

  return (
    <div>
      <Nav />

      {/* BACK BUTTON */}
      <div style={{ padding: '100px 8vw 0' }}>
        <span
          onClick={() => navigate(-1)}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          &larr; back to work
        </span>
      </div>

      {/* HERO SECTION */}
      <section style={{
        padding: '20px 8vw 60px',
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 48,
        borderBottom: '0.5px solid var(--border)',
      }}>
        {/* LEFT COLUMN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--accent-teal)', textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            {project.type}
          </span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            marginTop: 12,
            lineHeight: 1.1,
          }}>
            {project.title}
          </h1>
          {project.descriptionLong && (
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 18,
              color: 'var(--text-secondary)', lineHeight: 1.8,
              marginTop: 20, maxWidth: 560,
            }}>
              {project.descriptionLong}
            </p>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--accent-teal)', marginTop: 24, textDecoration: 'none',
            }}>
              view code &rarr;
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--accent-warm)', marginTop: 8, textDecoration: 'none',
            }}>
              live demo &rarr;
            </a>
          )}
        </motion.div>

        {/* RIGHT SIDEBAR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ position: 'sticky', top: 100, alignSelf: 'start' }}
        >
          <div style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 4,
            padding: 24,
          }}>
            {/* Info rows */}
            {project.company && (
              <div style={{ borderBottom: '0.5px solid var(--border)', padding: '12px 0' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>company</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>{project.company}</div>
              </div>
            )}
            {formatPeriod() && (
              <div style={{ borderBottom: '0.5px solid var(--border)', padding: '12px 0' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>period</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>{formatPeriod()}</div>
              </div>
            )}
            {project.role && (
              <div style={{ borderBottom: '0.5px solid var(--border)', padding: '12px 0' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>role</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>{project.role}</div>
              </div>
            )}
            <div style={{ borderBottom: '0.5px solid var(--border)', padding: '12px 0' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>type</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>{project.type}</div>
            </div>
            <div style={{ padding: '12px 0', borderBottom: bars.length > 0 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>visibility</div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: badge.color,
              }}>
                {badge.label}
              </span>
            </div>

            {/* Participation bars */}
            {bars.length > 0 && (
              <div style={{ padding: '12px 0', borderBottom: (project.skills ?? []).length > 0 ? '0.5px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>participation</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {bars.map(b => (
                    <div key={b.label}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)', marginBottom: 3 }}>
                        {b.label} {b.value}%
                      </div>
                      <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, width: '100%' }}>
                        <div style={{ height: '100%', width: `${b.value}%`, background: barColor, borderRadius: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills chips */}
            {(project.skills ?? []).length > 0 && (
              <div style={{ padding: '12px 0 0' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
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
            )}
          </div>
        </motion.div>
      </section>

      {/* MEDIA SECTION */}
      {project.media && project.media.length > 0 ? (
        <section style={{ padding: '40px 8vw', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {project.media.map((m, i) =>
            m.type === 'video' ? (
              <iframe key={i} src={m.url} style={{ width: '100%', height: 280, border: '0.5px solid var(--border)', borderRadius: 4 }} />
            ) : (
              <img key={i} src={m.url} alt="" style={{ width: '100%', height: 'auto', border: '0.5px solid var(--border)', borderRadius: 4, display: 'block' }} />
            )
          )}
        </section>
      ) : (
        <div style={{
          margin: '40px 8vw',
          height: 400,
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 4,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            [ media coming soon ]
          </span>
        </div>
      )}

      {/* CONTENT SECTIONS */}
      <div style={{ padding: '0 8vw 40px', maxWidth: 680 }}>
        {project.technicalDecisions && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-teal)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              technical decisions
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {project.technicalDecisions}
            </p>
          </div>
        )}

        {project.challenges && project.challenges.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-teal)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              challenges
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.challenges.map((c, i) => (
                <div key={i} style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <span style={{ color: 'var(--accent-warm)', marginRight: 8 }}>&mdash;</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
