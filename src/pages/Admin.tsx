import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type Section = 'overview' | 'projects' | 'experience' | 'skills' | 'profile'

interface Project {
  id: number
  slug: string
  title: string
  descriptionShort: string
  type: string
  visibility: string
  company: string | null
  role: string | null
  participationFrontend: number | null
  participationBackend: number | null
  participationDesign: number | null
  isFeatured: boolean
  githubUrl: string | null
  liveUrl: string | null
  sortOrder: number
  createdAt: string
}

interface SkillItem {
  id: number
  name: string
  category: string
  level: number
  sortOrder: number
}

interface Experience {
  id: number
  company: string
  role: string
  startDate: string
  endDate: string | null
  isCurrent: boolean
  description: string
  stack: string[]
  sortOrder: number
}

interface Profile {
  name: string
  title: string
  bioShort: string
  bioLong: string
  location: string
  email: string
  phone: string
  githubUrl: string
  linkedinUrl: string
  photoUrl: string
}

const NAV_ITEMS: Section[] = ['overview', 'projects', 'experience', 'skills', 'profile']

export default function Admin() {
  const { isAdmin, logout, loading } = useAuth()
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const [section, setSection] = useState<Section>('overview')

  const navLabel = (item: Section): string => ({
    overview: t('overview', 'resumen'),
    projects: t('projects', 'proyectos'),
    experience: t('experience', 'experiencia'),
    skills: t('skills', 'habilidades'),
    profile: t('profile', 'perfil'),
  }[item])

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/entry')
  }, [isAdmin, loading, navigate])

  const authFetch = useCallback(async (url: string, opts?: RequestInit) => {
    const currentToken = localStorage.getItem('portfolio_token')
    const res = await fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        ...opts?.headers,
      },
    })
    if (res.status === 401) {
      logout()
      navigate('/entry')
      throw new Error('unauthorized')
    }
    return res
  }, [logout, navigate])

  if (loading || !isAdmin) return null

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 220,
        minWidth: 220,
        background: 'var(--bg-surface)',
        borderRight: '0.5px solid var(--border)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--accent-teal)', letterSpacing: 3,
          }}>
            admin
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 18,
            color: 'var(--text-primary)', marginTop: 4,
          }}>
            portfolio.bz
          </div>
        </div>

        <nav>
          {NAV_ITEMS.map(item => {
            const active = section === item
            return (
              <div
                key={item}
                onClick={() => setSection(item)}
                style={{
                  padding: '10px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: active ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  background: active ? 'rgba(61,107,98,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent-teal)' : '2px solid transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLDivElement).style.color = 'var(--text-secondary)'
                }}
              >
                {navLabel(item)}
              </div>
            )
          })}
        </nav>

        <div style={{
          marginTop: 'auto',
          borderTop: '0.5px solid var(--border)',
        }}>
          <div
            onClick={() => navigate('/home')}
            style={{
              padding: '10px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 1,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              borderBottom: '0.5px solid var(--border)',
            }}
          >
            {t('← view site', '← ver sitio')}
          </div>
          <div style={{ padding: '16px 20px' }}>
          <span
            onClick={() => { logout(); navigate('/entry') }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-warm)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {t('logout', 'salir')}
          </span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
      }}>
        {section === 'overview' && <OverviewSection authFetch={authFetch} onNavigate={setSection} />}
        {section === 'projects' && <ProjectsSection authFetch={authFetch} />}
        {section === 'experience' && <ExperienceSection authFetch={authFetch} />}
        {section === 'skills' && <SkillsSection authFetch={authFetch} />}
        {section === 'profile' && <ProfileSection authFetch={authFetch} />}
      </main>
    </div>
  )
}

// --- SHARED ---

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{
      borderBottom: '0.5px solid var(--border)',
      paddingBottom: 20,
      marginBottom: 32,
    }}>
      <div style={{
        fontFamily: 'var(--font-serif)', fontSize: 28,
        color: 'var(--text-primary)',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-muted)', letterSpacing: 2, marginTop: 4,
      }}>
        {subtitle}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 13,
  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  borderBottom: '0.5px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-primary)',
  padding: '8px 0',
  width: '100%',
  outline: 'none',
}

const submitBtnStyle: React.CSSProperties = {
  background: 'var(--accent-teal)', color: 'white',
  fontFamily: 'var(--font-mono)', fontSize: 12,
  padding: '8px 20px', borderRadius: 2,
  border: 'none', cursor: 'pointer',
}

const cancelBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11,
  color: 'var(--text-muted)', cursor: 'pointer',
  background: 'none', border: 'none', marginLeft: 12,
}

const tableHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11,
  color: 'var(--text-muted)', letterSpacing: 2,
  textTransform: 'uppercase' as const,
  borderBottom: '0.5px solid var(--border)',
  padding: '8px 0',
}

type AuthFetch = (url: string, opts?: RequestInit) => Promise<Response>

// --- OVERVIEW ---

function OverviewSection({ authFetch, onNavigate }: { authFetch: AuthFetch; onNavigate: (s: Section) => void }) {
  const { lang, t } = useLang()
  const [counts, setCounts] = useState({ projects: 0, skills: 0, positions: 0, education: 0 })
  const [recent, setRecent] = useState<Project[]>([])

  useEffect(() => {
    Promise.all([
      authFetch(`${API}/api/v1/projects?lang=${lang}`).then(r => r.json()),
      authFetch(`${API}/api/v1/skills?lang=${lang}`).then(r => r.json()),
      authFetch(`${API}/api/v1/experience?lang=${lang}`).then(r => r.json()),
      authFetch(`${API}/api/v1/education?lang=${lang}`).then(r => r.json()),
    ]).then(([proj, skills, exp, edu]) => {
      const projData = proj.data ?? proj
      const skillsData = skills.data ?? skills
      const expData = exp.data ?? exp
      const eduData = edu.data ?? edu
      setCounts({
        projects: Array.isArray(projData) ? projData.length : 0,
        skills: Array.isArray(skillsData) ? skillsData.length : 0,
        positions: Array.isArray(expData) ? expData.length : 0,
        education: Array.isArray(eduData) ? eduData.length : 0,
      })
      if (Array.isArray(projData)) {
        const sorted = [...projData].sort((a: Project, b: Project) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setRecent(sorted.slice(0, 3))
      }
    }).catch(() => {})
  }, [authFetch, lang])

  const cards = [
    { label: 'projects', value: counts.projects },
    { label: 'skills', value: counts.skills },
    { label: 'positions', value: counts.positions },
    { label: 'education', value: counts.education },
  ]

  return (
    <div>
      <SectionHeader title={t('overview', 'resumen')} subtitle="DASHBOARD" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {cards.map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 4,
            padding: 20,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--text-muted)',
            }}>
              {c.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: 36,
              color: 'var(--text-primary)',
            }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-muted)', letterSpacing: 2,
            marginBottom: 16,
          }}>
            RECENT PROJECTS
          </div>
          {recent.map(p => (
            <div
              key={p.id}
              onClick={() => onNavigate('projects')}
              style={{
                borderTop: '0.5px solid var(--border)',
                padding: '12px 0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 15,
                  color: 'var(--text-primary)',
                }}>
                  {p.title}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text-secondary)', marginTop: 2,
                }}>
                  {p.type}
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--text-muted)',
              }}>
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- PROJECTS ---

const emptyProject = {
  title: '', slug: '', descriptionShort: '', type: 'work',
  visibility: 'public', company: '', role: '',
  participationFrontend: 0, participationBackend: 0, participationDesign: 0,
  isFeatured: false, githubUrl: '', liveUrl: '', sortOrder: 0,
}

function ProjectsSection({ authFetch }: { authFetch: AuthFetch }) {
  const { lang, t } = useLang()
  const [projects, setProjects] = useState<Project[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyProject)

  const load = useCallback(() => {
    authFetch(`${API}/api/v1/projects?lang=${lang}`).then(r => r.json()).then(d => {
      setProjects(d.data ?? d)
    }).catch(() => {})
  }, [authFetch, lang])

  useEffect(() => { load() }, [load])

  const save = async () => {
    const body = JSON.stringify(form)
    if (editingId) {
      await authFetch(`${API}/api/v1/projects/${editingId}`, { method: 'PATCH', body })
    } else {
      await authFetch(`${API}/api/v1/projects`, { method: 'POST', body })
    }
    setEditingId(null)
    setAdding(false)
    setForm(emptyProject)
    load()
  }

  const toggleFeatured = async (p: Project) => {
    await authFetch(`${API}/api/v1/projects/${p.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured: !p.isFeatured }),
    })
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this project?')) return
    await authFetch(`${API}/api/v1/projects/${id}`, { method: 'DELETE' })
    load()
  }

  const startEdit = (p: Project) => {
    setAdding(false)
    setEditingId(p.id)
    setForm({
      title: p.title, slug: p.slug, descriptionShort: p.descriptionShort,
      type: p.type, visibility: p.visibility, company: p.company ?? '',
      role: p.role ?? '',
      participationFrontend: p.participationFrontend ?? 0,
      participationBackend: p.participationBackend ?? 0,
      participationDesign: p.participationDesign ?? 0,
      isFeatured: p.isFeatured, githubUrl: p.githubUrl ?? '',
      liveUrl: p.liveUrl ?? '', sortOrder: p.sortOrder,
    })
  }

  const startAdd = () => {
    setEditingId(null)
    setForm(emptyProject)
    setAdding(true)
  }

  const cancelForm = () => {
    setEditingId(null)
    setAdding(false)
    setForm(emptyProject)
  }

  return (
    <div>
      <SectionHeader title={t('projects', 'proyectos')} subtitle="MANAGE PROJECTS" />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>title</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>type</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>featured</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <>
              <tr key={p.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-primary)' }}>
                  {p.title}
                </td>
                <td style={{ padding: '10px 0' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    padding: '2px 6px', borderRadius: 2,
                    background: p.type === 'work' ? 'rgba(61,107,98,0.12)' : 'rgba(196,176,144,0.12)',
                    color: p.type === 'work' ? 'var(--accent-teal)' : 'var(--accent-warm)',
                  }}>
                    {p.type}
                  </span>
                </td>
                <td style={{ padding: '10px 0', textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleFeatured(p)}>
                  <span style={{ color: p.isFeatured ? 'var(--accent-warm)' : 'var(--text-muted)' }}>
                    {p.isFeatured ? '\u2605' : '\u2606'}
                  </span>
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>
                  <span
                    onClick={() => startEdit(p)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--accent-teal)', cursor: 'pointer',
                    }}
                  >
                    {t('edit', 'editar')}
                  </span>
                  <span
                    onClick={() => remove(p.id)}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 12,
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c44')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {t('delete', 'eliminar')}
                  </span>
                </td>
              </tr>
              {editingId === p.id && (
                <tr key={`edit-${p.id}`}>
                  <td colSpan={4} style={{ padding: '16px 0' }}>
                    <ProjectForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {adding && (
        <div style={{ marginTop: 16 }}>
          <ProjectForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
        </div>
      )}

      {!adding && !editingId && (
        <div
          onClick={startAdd}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--accent-teal)', cursor: 'pointer',
            marginTop: 16,
          }}
        >
          {t('+ add project', '+ agregar proyecto')}
        </div>
      )}
    </div>
  )
}

function ProjectForm({
  form, setForm, onSave, onCancel, t,
}: {
  form: typeof emptyProject
  setForm: React.Dispatch<React.SetStateAction<typeof emptyProject>>
  onSave: () => void
  onCancel: () => void
  t: (en: string, es: string) => string
}) {
  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
      <input style={inputStyle} placeholder="title" value={form.title} onChange={e => set('title', e.target.value)} />
      <input style={inputStyle} placeholder="slug" value={form.slug} onChange={e => set('slug', e.target.value)} />
      <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="short description" value={form.descriptionShort} onChange={e => set('descriptionShort', e.target.value)} />
      <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
        <option value="work">work</option>
        <option value="personal">personal</option>
      </select>
      <select style={inputStyle} value={form.visibility} onChange={e => set('visibility', e.target.value)}>
        <option value="public">public</option>
        <option value="nda">nda</option>
        <option value="open-source">open-source</option>
      </select>
      <input style={inputStyle} placeholder="company" value={form.company} onChange={e => set('company', e.target.value)} />
      <input style={inputStyle} placeholder="role" value={form.role} onChange={e => set('role', e.target.value)} />
      <input style={inputStyle} placeholder="frontend %" type="number" min={0} max={100} value={form.participationFrontend} onChange={e => set('participationFrontend', +e.target.value)} />
      <input style={inputStyle} placeholder="backend %" type="number" min={0} max={100} value={form.participationBackend} onChange={e => set('participationBackend', +e.target.value)} />
      <input style={inputStyle} placeholder="design %" type="number" min={0} max={100} value={form.participationDesign} onChange={e => set('participationDesign', +e.target.value)} />
      <input style={inputStyle} placeholder="sort order" type="number" value={form.sortOrder} onChange={e => set('sortOrder', +e.target.value)} />
      <input style={inputStyle} placeholder="github url" value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} />
      <input style={inputStyle} placeholder="live url" value={form.liveUrl} onChange={e => set('liveUrl', e.target.value)} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
        <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
        featured
      </label>
      <div />
      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
        <button style={submitBtnStyle} onClick={onSave}>{t('save', 'guardar')}</button>
        <button style={cancelBtnStyle} onClick={onCancel}>{t('cancel', 'cancelar')}</button>
      </div>
    </div>
  )
}

// --- SKILLS ---

const emptySkill = { name: '', category: 'frontend', level: 3, sortOrder: 0 }
const SKILL_CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'design', 'other']

function SkillsSection({ authFetch }: { authFetch: AuthFetch }) {
  const { lang, t } = useLang()
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptySkill)

  const load = useCallback(() => {
    authFetch(`${API}/api/v1/skills?lang=${lang}`).then(r => r.json()).then(d => {
      setSkills(d.data ?? d)
    }).catch(() => {})
  }, [authFetch, lang])

  useEffect(() => { load() }, [load])

  const save = async () => {
    const body = JSON.stringify(form)
    if (editingId) {
      await authFetch(`${API}/api/v1/skills/${editingId}`, { method: 'PATCH', body })
    } else {
      await authFetch(`${API}/api/v1/skills`, { method: 'POST', body })
    }
    setEditingId(null)
    setAdding(false)
    setForm(emptySkill)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this skill?')) return
    await authFetch(`${API}/api/v1/skills/${id}`, { method: 'DELETE' })
    load()
  }

  const startEdit = (s: SkillItem) => {
    setAdding(false)
    setEditingId(s.id)
    setForm({ name: s.name, category: s.category, level: s.level, sortOrder: s.sortOrder })
  }

  const cancelForm = () => { setEditingId(null); setAdding(false); setForm(emptySkill) }

  return (
    <div>
      <SectionHeader title={t('skills', 'habilidades')} subtitle="MANAGE SKILLS" />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>name</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>category</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>level</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map(s => (
            <>
              <tr key={s.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-primary)' }}>
                  {s.name}
                </td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                  {s.category}
                </td>
                <td style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: i < s.level ? 'var(--accent-teal)' : 'var(--border)',
                        display: 'inline-block',
                      }} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>
                  <span onClick={() => startEdit(s)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-teal)', cursor: 'pointer' }}>{t('edit', 'editar')}</span>
                  <span
                    onClick={() => remove(s.id)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 12, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c44')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >{t('delete', 'eliminar')}</span>
                </td>
              </tr>
              {editingId === s.id && (
                <tr key={`edit-${s.id}`}>
                  <td colSpan={4} style={{ padding: '16px 0' }}>
                    <SkillForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {adding && (
        <div style={{ marginTop: 16 }}>
          <SkillForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
        </div>
      )}

      {!adding && !editingId && (
        <div onClick={() => { setEditingId(null); setForm(emptySkill); setAdding(true) }} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-teal)', cursor: 'pointer', marginTop: 16 }}>
          + add skill
        </div>
      )}
    </div>
  )
}

function SkillForm({
  form, setForm, onSave, onCancel, t,
}: {
  form: typeof emptySkill
  setForm: React.Dispatch<React.SetStateAction<typeof emptySkill>>
  onSave: () => void
  onCancel: () => void
  t: (en: string, es: string) => string
}) {
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
      <input style={inputStyle} placeholder="name" value={form.name} onChange={e => set('name', e.target.value)} />
      <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
        {SKILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input style={inputStyle} placeholder="level (1-5)" type="number" min={1} max={5} value={form.level} onChange={e => set('level', +e.target.value)} />
      <input style={inputStyle} placeholder="sort order" type="number" value={form.sortOrder} onChange={e => set('sortOrder', +e.target.value)} />
      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
        <button style={submitBtnStyle} onClick={onSave}>{t('save', 'guardar')}</button>
        <button style={cancelBtnStyle} onClick={onCancel}>{t('cancel', 'cancelar')}</button>
      </div>
    </div>
  )
}

// --- EXPERIENCE ---

const emptyExperience = {
  company: '', role: '', startDate: '', endDate: '',
  isCurrent: false, description: '', stack: '',  sortOrder: 0,
}

function ExperienceSection({ authFetch }: { authFetch: AuthFetch }) {
  const { lang, t } = useLang()
  const [items, setItems] = useState<Experience[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyExperience)

  const load = useCallback(() => {
    authFetch(`${API}/api/v1/experience?lang=${lang}`).then(r => r.json()).then(d => {
      setItems(d.data ?? d)
    }).catch(() => {})
  }, [authFetch, lang])

  useEffect(() => { load() }, [load])

  const save = async () => {
    const payload = {
      ...form,
      endDate: form.isCurrent ? null : form.endDate,
      stack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
    }
    const body = JSON.stringify(payload)
    if (editingId) {
      await authFetch(`${API}/api/v1/experience/${editingId}`, { method: 'PATCH', body })
    } else {
      await authFetch(`${API}/api/v1/experience`, { method: 'POST', body })
    }
    setEditingId(null)
    setAdding(false)
    setForm(emptyExperience)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this position?')) return
    await authFetch(`${API}/api/v1/experience/${id}`, { method: 'DELETE' })
    load()
  }

  const startEdit = (e: Experience) => {
    setAdding(false)
    setEditingId(e.id)
    setForm({
      company: e.company, role: e.role, startDate: e.startDate,
      endDate: e.endDate ?? '', isCurrent: e.isCurrent,
      description: e.description, stack: e.stack.join(', '), sortOrder: e.sortOrder,
    })
  }

  const cancelForm = () => { setEditingId(null); setAdding(false); setForm(emptyExperience) }

  const formatPeriod = (e: Experience) => {
    const start = new Date(e.startDate).getFullYear()
    const end = e.isCurrent ? 'present' : (e.endDate ? new Date(e.endDate).getFullYear() : '')
    return `${start} - ${end}`
  }

  return (
    <div>
      <SectionHeader title={t('experience', 'experiencia')} subtitle="MANAGE POSITIONS" />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>company</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>role</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>period</th>
            <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(e => (
            <>
              <tr key={e.id} style={{ borderBottom: '0.5px solid var(--border)' }}>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-primary)' }}>
                  {e.company}
                </td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {e.role}
                </td>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                  {formatPeriod(e)}
                </td>
                <td style={{ padding: '10px 0', textAlign: 'right' }}>
                  <span onClick={() => startEdit(e)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-teal)', cursor: 'pointer' }}>{t('edit', 'editar')}</span>
                  <span
                    onClick={() => remove(e.id)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 12, transition: 'color 0.15s' }}
                    onMouseEnter={ev => (ev.currentTarget.style.color = '#c44')}
                    onMouseLeave={ev => (ev.currentTarget.style.color = 'var(--text-muted)')}
                  >{t('delete', 'eliminar')}</span>
                </td>
              </tr>
              {editingId === e.id && (
                <tr key={`edit-${e.id}`}>
                  <td colSpan={4} style={{ padding: '16px 0' }}>
                    <ExperienceForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {adding && (
        <div style={{ marginTop: 16 }}>
          <ExperienceForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
        </div>
      )}

      {!adding && !editingId && (
        <div onClick={() => { setEditingId(null); setForm(emptyExperience); setAdding(true) }} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-teal)', cursor: 'pointer', marginTop: 16 }}>
          + add position
        </div>
      )}
    </div>
  )
}

function ExperienceForm({
  form, setForm, onSave, onCancel, t,
}: {
  form: typeof emptyExperience
  setForm: React.Dispatch<React.SetStateAction<typeof emptyExperience>>
  onSave: () => void
  onCancel: () => void
  t: (en: string, es: string) => string
}) {
  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
      <input style={inputStyle} placeholder="company" value={form.company} onChange={e => set('company', e.target.value)} />
      <input style={inputStyle} placeholder="role" value={form.role} onChange={e => set('role', e.target.value)} />
      <input style={inputStyle} placeholder="start date (YYYY-MM-DD)" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
      <input style={inputStyle} placeholder="end date (YYYY-MM-DD)" value={form.endDate} onChange={e => set('endDate', e.target.value)} disabled={form.isCurrent} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
        <input type="checkbox" checked={form.isCurrent} onChange={e => set('isCurrent', e.target.checked)} />
        current position
      </label>
      <input style={inputStyle} placeholder="sort order" type="number" value={form.sortOrder} onChange={e => set('sortOrder', +e.target.value)} />
      <textarea
        style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: 60, resize: 'vertical' }}
        placeholder="description"
        value={form.description}
        onChange={e => set('description', e.target.value)}
      />
      <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="stack (comma-separated)" value={form.stack} onChange={e => set('stack', e.target.value)} />
      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
        <button style={submitBtnStyle} onClick={onSave}>{t('save', 'guardar')}</button>
        <button style={cancelBtnStyle} onClick={onCancel}>{t('cancel', 'cancelar')}</button>
      </div>
    </div>
  )
}

// --- PROFILE ---

const emptyProfile: Profile = {
  name: '', title: '', bioShort: '', bioLong: '',
  location: '', email: '', phone: '',
  githubUrl: '', linkedinUrl: '', photoUrl: '',
}

function ProfileSection({ authFetch }: { authFetch: AuthFetch }) {
  const { lang, t } = useLang()
  const [form, setForm] = useState<Profile>(emptyProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    authFetch(`${API}/api/v1/profile?lang=${lang}`).then(r => r.json()).then(d => {
      const data = d.data ?? d
      setForm({ ...emptyProfile, ...data })
    }).catch(() => {})
  }, [authFetch, lang])

  const set = (k: keyof Profile, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    await authFetch(`${API}/api/v1/profile`, {
      method: 'PATCH',
      body: JSON.stringify(form),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <SectionHeader title={t('profile', 'perfil')} subtitle="PERSONAL INFORMATION" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', maxWidth: 640 }}>
        <input style={inputStyle} placeholder="name" value={form.name} onChange={e => set('name', e.target.value)} />
        <input style={inputStyle} placeholder="title" value={form.title} onChange={e => set('title', e.target.value)} />
        <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="short bio" value={form.bioShort} onChange={e => set('bioShort', e.target.value)} />
        <textarea
          style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: 80, resize: 'vertical' }}
          placeholder="long bio"
          value={form.bioLong}
          onChange={e => set('bioLong', e.target.value)}
        />
        <input style={inputStyle} placeholder="location" value={form.location} onChange={e => set('location', e.target.value)} />
        <input style={inputStyle} placeholder="email" value={form.email} onChange={e => set('email', e.target.value)} />
        <input style={inputStyle} placeholder="phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <input style={inputStyle} placeholder="photo url" value={form.photoUrl} onChange={e => set('photoUrl', e.target.value)} />
        <input style={inputStyle} placeholder="github url" value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} />
        <input style={inputStyle} placeholder="linkedin url" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} />
        <div style={{ gridColumn: '1 / -1', marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={submitBtnStyle} onClick={save}>{t('save', 'guardar')}</button>
          {saved && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-teal)' }}>
              {t('saved.', 'guardado.')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
