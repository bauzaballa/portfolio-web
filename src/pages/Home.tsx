import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Project {
  slug: string
  title: string
  description: string
  type: string
  stack: string[]
  participation: number
  frontend: number
  backend: number
  design: number
  skills?: { name: string }[]
}

interface SkillGroup {
  category: string
  skills: string[]
}

export default function Home() {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState(false)

  const [bio, setBio] = useState('')
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([])

  useEffect(() => {
    fetch(`${API}/api/v1/projects/featured`)
      .then(r => r.json())
      .then(d => setProjects(d.data))
      .catch(() => setProjectsError(true))
      .finally(() => setProjectsLoading(false))

    fetch(`${API}/api/v1/profile`)
      .then(r => r.json())
      .then(d => setBio(d.data.bioLong))
      .catch(() => {})

    fetch(`${API}/api/v1/skills`)
      .then(r => r.json())
      .then(d => {
        const grouped: Record<string, string[]> = {}
        for (const s of d.data) {
          if (!grouped[s.category]) grouped[s.category] = []
          grouped[s.category].push(s.name)
        }
        setSkillGroups(Object.entries(grouped).map(([category, skills]) => ({ category, skills })))
      })
      .catch(() => {})
  }, [])

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
      </nav>

      {/* SECTION 1: HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8vw',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--accent-teal)', letterSpacing: 3,
            textTransform: 'uppercase', marginBottom: 20, fontWeight: 600,
          }}>
            Fullstack Developer — La Plata, AR
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(52px, 8vw, 96px)',
            fontWeight: 700, lineHeight: 1.05,
            color: theme === 'dark' ? 'var(--text-primary)' : 'var(--accent-warm)',
            marginBottom: 12,
          }}>
            Bautista Zaballa.
          </h1>

          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(18px, 2vw, 22px)',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}>
            Fullstack dev with a design background.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            <button
              onClick={() => navigate('/projects')}
              style={{
                background: 'var(--accent-teal)', color: '#fff',
                border: 'none', fontFamily: 'var(--font-mono)',
                fontSize: 11, letterSpacing: 1, padding: '10px 24px',
                borderRadius: 3, cursor: 'pointer',
              }}
            >
              view work
            </button>
            <button
              onClick={() => navigate('/contact')}
              style={{
                background: 'transparent',
                border: '0.5px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11, letterSpacing: 1, padding: '10px 24px',
                borderRadius: 3, cursor: 'pointer',
              }}
            >
              contact
            </button>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: FEATURED PROJECTS */}
      <section style={{ padding: '80px 8vw' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 32,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 32,
            color: 'var(--text-primary)', fontWeight: 400,
          }}>
            selected work
          </h2>
          <span
            onClick={() => navigate('/projects')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--accent-teal)', cursor: 'pointer',
            }}
          >
            view all -&gt;
          </span>
        </div>

        {projectsLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  height: 80, background: 'var(--bg-surface)', borderRadius: 2,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
            <style>{`@keyframes pulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
          </div>
        )}

        {projectsError && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--text-secondary)',
          }}>
            could not load projects
          </p>
        )}

        {!projectsLoading && !projectsError && projects.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={i + 1} onClick={() => navigate(`/projects/${p.slug}`)} />
        ))}
      </section>

      {/* SECTION 3: ABOUT SNIPPET */}
      <section style={{
        padding: '80px 8vw',
        borderTop: '0.5px solid var(--border)',
        display: 'flex', gap: 48, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--accent-teal)', letterSpacing: 3,
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            about
          </div>
          {bio && (
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 18,
              color: 'var(--text-secondary)', lineHeight: 1.8,
              maxWidth: 540,
            }}>
              {bio}
            </p>
          )}
          <span
            onClick={() => navigate('/about')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--accent-teal)', cursor: 'pointer',
              display: 'inline-block', marginTop: 24,
            }}
          >
            read more -&gt;
          </span>
        </div>

        <div style={{
          width: 300, height: 380,
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            [ photo ]
          </span>
        </div>
      </section>

      {/* SECTION 4: SKILLS PREVIEW */}
      <section style={{
        padding: '80px 8vw',
        borderTop: '0.5px solid var(--border)',
      }}>
        {skillGroups.map(g => (
          <div key={g.category} style={{
            display: 'flex', gap: 24, marginBottom: 20, alignItems: 'baseline',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--accent-teal)', letterSpacing: 2,
              textTransform: 'uppercase', minWidth: 120,
            }}>
              {g.category}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.skills.map(s => (
                <span key={s} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-secondary)',
                  padding: '3px 10px',
                  border: '0.5px solid var(--border)',
                  borderRadius: 2,
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}

        <hr style={{
          border: 'none', borderTop: '0.5px solid var(--border)',
          marginTop: 48, marginBottom: 24,
        }} />

        <div style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)',
          }}>
            bauzaballa@gmail.com
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)',
          }}>
            github / linkedin
          </span>
        </div>
      </section>
    </div>
  )
}

function ProjectRow({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const isSolo = project.participation === 100
  const barColor = isSolo ? 'var(--accent-warm)' : 'var(--accent-teal)'

  const bars: { label: string; value: number }[] = []
  if (project.frontend > 0) bars.push({ label: 'frontend', value: project.frontend })
  if (project.backend > 0) bars.push({ label: 'backend', value: project.backend })
  if (project.design > 0) bars.push({ label: 'design', value: project.design })

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderTop: '0.5px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: '48px 1fr 220px',
        alignItems: 'center',
        padding: '20px 0',
        cursor: 'pointer',
        background: hovered ? 'rgba(61, 107, 98, 0.03)' : 'transparent',
        transition: 'background 0.2s ease',
      }}
    >
      {/* number */}
      <span style={{
        fontFamily: 'var(--font-serif)', fontSize: 36,
        color: hovered ? 'var(--accent-teal)' : 'var(--text-muted)',
        transition: 'color 0.2s ease',
      }}>
        {String(index).padStart(2, '0')}
      </span>

      {/* content */}
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
          {project.description}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {(project.skills ?? []).map((s: { name: string }) => (
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

      {/* participation sidebar */}
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
