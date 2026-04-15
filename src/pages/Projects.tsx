import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LangContext'
import Nav from '../components/Nav'
import ProjectRow from '../components/ProjectRow'

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
  const navigate = useNavigate()
  const { lang, t } = useLang()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [animKey, setAnimKey] = useState(0)
  const cache = useRef<Record<string, any>>({})

  useEffect(() => {
    const cacheKey = `projects_${lang}`
    if (cache.current[cacheKey]) {
      setProjects(cache.current[cacheKey])
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`${API}/api/v1/projects?withSkills=true&lang=${lang}`)
      .then(r => r.json())
      .then(d => {
        cache.current[cacheKey] = d.data
        setProjects(d.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [lang])

  const filtered = filterProjects(projects, filter)

  return (
    <div>
      <Nav />

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
            fontFamily: 'var(--font-mono)', fontSize: 11,
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
            {t('Selected work.', 'Trabajos seleccionados.')}
          </h1>
          {!loading && !error && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--text-secondary)', marginTop: 8,
            }}>
              {projects.length} {t('projects', 'proyectos')} &middot; 2024&ndash;2025
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
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  letterSpacing: 1,
                  padding: '4px 12px',
                  borderRadius: 3,
                  cursor: 'pointer',
                  background: active ? 'rgba(61,107,98,0.15)' : 'transparent',
                  border: `0.5px solid ${active ? 'var(--accent-teal)' : 'var(--border)'}`,
                  color: active ? 'var(--accent-teal)' : 'var(--text-muted)',
                }}
              >
                {f === 'ALL' ? t('ALL', 'TODO') : f}
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
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--text-secondary)', paddingTop: 40,
          }}>
            {t('could not load projects', 'no se pudieron cargar los proyectos')}
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
                    {t('nothing here yet.', 'nada por aquí todavía.')}
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
