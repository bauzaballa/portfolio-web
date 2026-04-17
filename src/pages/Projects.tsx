import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import Nav from '../components/Nav'
import ProjectRow from '../components/ProjectRow'
import PageHeader from '../components/PageHeader'
import SkeletonLoader from '../components/SkeletonLoader'

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

const FILTER_LABELS: Record<string, { en: string; es: string }> = {
  all:      { en: 'ALL',      es: 'TODO'     },
  work:     { en: 'WORK',     es: 'TRABAJO'  },
  personal: { en: 'PERSONAL', es: 'PERSONAL' },
}

function filterLabel(type: string, lang: string): string {
  const entry = FILTER_LABELS[type]
  if (entry) return lang === 'es' ? entry.es : entry.en
  return type.toUpperCase()
}

function filterProjects(projects: Project[], filter: string): Project[] {
  if (filter === 'all') return projects
  return projects.filter(p => p.type === filter)
}

export default function Projects() {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const { isMobile } = useBreakpoint()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<string>('all')
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
      <PageHeader
        label="/ projects"
        title={t('Selected work.', 'Trabajos seleccionados.')}
        style={{ padding: isMobile ? '80px 6vw 24px' : '120px 8vw 40px' }}
      >
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          flexWrap: 'wrap',
          gap: isMobile ? 20 : 32,
        }}>
          {!loading && !error && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--text-secondary)', marginTop: 8,
            }}>
              {projects.length} {t('projects', 'proyectos')} &middot; 2024&ndash;2025
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', ...Array.from(new Set(projects.map(p => p.type)))].map(f => {
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setAnimKey(k => k + 1) }}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    letterSpacing: 1,
                    padding: isMobile ? '8px 14px' : '4px 12px',
                    borderRadius: 3,
                    cursor: 'pointer',
                    background: active ? 'rgba(61,107,98,0.15)' : 'transparent',
                    border: `0.5px solid ${active ? 'var(--accent-teal)' : 'var(--border)'}`,
                    color: active ? 'var(--accent-teal)' : 'var(--text-muted)',
                  }}
                >
                  {filterLabel(f, lang)}
                </button>
              )
            })}
          </div>
        </div>
      </PageHeader>

      {/* PROJECT LIST */}
      <section style={{ padding: isMobile ? '0 6vw 48px' : '0 8vw 80px' }}>
        {loading && <SkeletonLoader rows={3} style={{ paddingTop: 24 }} />}

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
