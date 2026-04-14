import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

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
  type: string
  company: string | null
  participationFrontend: number | null
  participationBackend: number | null
  participationDesign: number | null
  skills?: Skill[]
}

type Filter = 'ALL' | 'FULLSTACK' | 'PERSONAL' | 'E-COMMERCE'

const FILTERS: Filter[] = ['ALL', 'FULLSTACK', 'PERSONAL', 'E-COMMERCE']

function filterProjects(projects: Project[], filter: Filter): Project[] {
  switch (filter) {
    case 'ALL': return projects
    case 'FULLSTACK': return projects.filter(p => p.type === 'work')
    case 'PERSONAL': return projects.filter(p => p.type === 'personal')
    case 'E-COMMERCE': return projects.filter(p => p.company === 'Galarreta Consultora E-Commerce')
  }
}

export default function Projects() {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    fetch(`${API}/api/v1/projects?withSkills=true`)
      .then(r => r.json())
      .then(d => setProjects(d.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filterProjects(projects, filter)

  const navLinks = [
    { label: 'home', path: '/home' },
    { label: 'work', path: '/projects' },
    { label: 'experience', path: '/experience' },
    { label: 'about', path: '/about' },
    { label: 'contact', path: '/contact' },
  ]

  return (
    <div>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 8vw',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg)',
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--text-secondary)', letterSpacing: 2, fontWeight: 600,
        }}>
          BZ — {new Date().getFullYear()}
        </span>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <span
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: 1, cursor: 'pointer',
                  color: isActive ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {link.label}
              </span>
            )
          })}
          <button
            onClick={toggle}
            style={{
              background: theme === 'dark' ? '#F2EDE4' : '#0E0F12',
              border: 'none',
              color: theme === 'dark' ? '#1A1A1A' : '#C8D4C0',
              padding: '4px 12px',
              borderRadius: 3,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 1,
              fontWeight: 500,
            }}
          >
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <section style={{
        padding: '120px 8vw 40px',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 32,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)', letterSpacing: 3,
            marginBottom: 16,
          }}>
            / projects
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 6vw, 72px)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            lineHeight: 1.05,
          }}>
            Selected work.
          </h1>
          {!loading && !error && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--text-secondary)', marginTop: 8,
            }}>
              {projects.length} projects &middot; 2024&ndash;2025
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {FILTERS.map(f => {
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => { setFilter(f); setAnimKey(k => k + 1) }}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: 1,
                  padding: '4px 12px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: active ? 'rgba(61,107,98,0.15)' : 'transparent',
                  border: `0.5px solid ${active ? 'var(--accent-teal)' : 'var(--border)'}`,
                  color: active ? 'var(--accent-teal)' : 'var(--text-muted)',
                }}
              >
                {f}
              </button>
            )
          })}
        </div>
      </section>

      {/* PROJECT LIST */}
      <section style={{ padding: '0 8vw 80px' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 24 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  height: 80,
                  background: 'var(--bg-surface)',
                  borderRadius: 2,
                  animation: 'projectsPulse 1.2s ease-in-out infinite',
                }}
              />
            ))}
            <style>{`@keyframes projectsPulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
          </div>
        )}

        {error && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--text-secondary)', paddingTop: 40,
          }}>
            could not load projects
          </p>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key={animKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.length === 0 ? (
                <div style={{
                  textAlign: 'center', paddingTop: 80, paddingBottom: 80,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                    fontSize: 18,
                  }}>
                    nothing here yet.
                  </span>
                </div>
              ) : (
                filtered.map((p, i) => (
                  <motion.div
                    key={p.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProjectRow
                      project={p}
                      index={i + 1}
                      onClick={() => navigate(`/projects/${p.slug}`)}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  )
}

function ProjectRow({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const isSolo = project.participationFrontend === 100 && project.participationBackend === 100
  const barColor = isSolo ? 'var(--accent-warm)' : 'var(--accent-teal)'

  const bars: { label: string; value: number }[] = []
  if (project.participationFrontend) bars.push({ label: 'frontend', value: project.participationFrontend })
  if (project.participationBackend) bars.push({ label: 'backend', value: project.participationBackend })
  if (project.participationDesign) bars.push({ label: 'design', value: project.participationDesign })

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
