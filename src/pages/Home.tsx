import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import Nav from '../components/Nav'
import ProjectRow from '../components/ProjectRow'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Project {
  slug: string
  title: string
  descriptionShort: string
  type: string
  participationFrontend: number
  participationBackend: number
  participationDesign: number
  skills?: { name: string }[]
}

interface SkillGroup {
  category: string
  skills: string[]
}

export default function Home() {
  const { theme } = useTheme()
  const { lang, t } = useLang()
  const { isMobile } = useBreakpoint()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState(false)

  const [bio, setBio] = useState('')
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([])
  const cache = useRef<Record<string, any>>({})

  useEffect(() => {
    const featuredKey = `featured_${lang}`
    if (cache.current[featuredKey]) {
      setProjects(cache.current[featuredKey])
      setProjectsLoading(false)
    } else {
      setProjectsLoading(true)
      fetch(`${API}/api/v1/projects/featured?lang=${lang}`)
        .then(r => r.json())
        .then(d => {
          cache.current[featuredKey] = d.data
          setProjects(d.data)
        })
        .catch(() => setProjectsError(true))
        .finally(() => setProjectsLoading(false))
    }

    const profileKey = `profile_${lang}`
    if (cache.current[profileKey]) {
      setBio(cache.current[profileKey])
    } else {
      fetch(`${API}/api/v1/profile?lang=${lang}`)
        .then(r => r.json())
        .then(d => {
          cache.current[profileKey] = d.data.bioLong
          setBio(d.data.bioLong)
        })
        .catch(() => {})
    }

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
  }, [lang])

  return (
    <div>
      <Nav />

      {/* SECTION 1: HERO */}
      <section style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '0 6vw' : '0 8vw',
      }}>
        <div>
          {/* Label — blurred by scrim */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--accent-teal)', letterSpacing: 3,
              textTransform: 'uppercase', marginBottom: 20, fontWeight: 600,
            }}>
              {t('La Plata, AR', 'La Plata, AR')}
            </div>
          </motion.div>

          {/* Name — above scrim, never blurred */}
          <div style={{ position: 'relative', zIndex: 145 }}>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(52px, 8vw, 96px)',
                fontWeight: 700, lineHeight: 1.05,
                color: theme === 'dark' ? 'var(--text-primary)' : 'var(--accent-warm)',
                marginBottom: 12,
              }}
            >
              Bautista Zaballa.
            </motion.h1>
          </div>

          {/* Tagline + buttons — blurred by scrim */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(18px, 2vw, 22px)',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
            }}>
              {t('Fullstack dev with a design background.', 'Dev fullstack con formación en diseño.')}
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
              <button
                onClick={() => navigate('/projects')}
                style={{
                  background: 'var(--accent-teal)', color: '#fff',
                  border: 'none', fontFamily: 'var(--font-mono)',
                  fontSize: 12, letterSpacing: 1, padding: isMobile ? '14px 28px' : '10px 24px',
                  borderRadius: 3, cursor: 'pointer',
                }}
              >
                {t('view work', 'ver trabajos')}
              </button>
              <button
                onClick={() => navigate('/contact')}
                style={{
                  background: 'transparent',
                  border: '0.5px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12, letterSpacing: 1, padding: isMobile ? '14px 28px' : '10px 24px',
                  borderRadius: 3, cursor: 'pointer',
                }}
              >
                {t('contact', 'contacto')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: FEATURED PROJECTS */}
      <section style={{ padding: isMobile ? '48px 6vw' : '80px 8vw' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 32,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 32,
            color: 'var(--text-primary)', fontWeight: 400,
          }}>
            {t('selected work', 'trabajos seleccionados')}
          </h2>
          <span
            onClick={() => navigate('/projects')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--accent-teal)', cursor: 'pointer',
            }}
          >
            {t('view all ->', 'ver todos ->')}
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
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            {t('could not load projects', 'no se pudieron cargar los proyectos')}
          </p>
        )}

        {!projectsLoading && !projectsError && projects.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={i + 1} onClick={() => navigate(`/projects/${p.slug}`)} />
        ))}
      </section>

      {/* SECTION 3: ABOUT SNIPPET */}
      <section style={{
        padding: isMobile ? '48px 6vw' : '80px 8vw',
        borderTop: '0.5px solid var(--border)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 32 : 48,
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: isMobile ? 0 : 280 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--accent-teal)', letterSpacing: 3,
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            {t('about', 'sobre mí')}
          </div>
          {bio && (
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: isMobile ? 16 : 18,
              color: 'var(--text-secondary)', lineHeight: 1.8,
              maxWidth: 540,
            }}>
              {bio}
            </p>
          )}
          <span
            onClick={() => navigate('/about')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--accent-teal)', cursor: 'pointer',
              display: 'inline-block', marginTop: 24,
            }}
          >
            {t('read more ->', 'leer más ->')}
          </span>
        </div>

        {!isMobile && (
          <div style={{
            width: 300, height: 380,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              {t('[ photo ]', '[ foto ]')}
            </span>
          </div>
        )}
      </section>

      {/* SECTION 4: SKILLS PREVIEW */}
      <section style={{
        padding: isMobile ? '48px 6vw' : '80px 8vw',
        borderTop: '0.5px solid var(--border)',
      }}>
        {skillGroups.map(g => (
          <div key={g.category} style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 8 : 24,
            marginBottom: isMobile ? 24 : 20,
            alignItems: isMobile ? 'flex-start' : 'baseline',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--accent-teal)', letterSpacing: 2,
              textTransform: 'uppercase', minWidth: isMobile ? 0 : 120,
            }}>
              {g.category}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.skills.map(s => (
                <span key={s} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
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
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            bauzaballa@gmail.com
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            {t('github / linkedin', 'github / linkedin')}
          </span>
        </div>
      </section>
    </div>
  )
}
