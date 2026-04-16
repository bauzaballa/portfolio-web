import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { AdminInput, AdminSelect, AdminTextarea, AdminToggle } from '../components/admin/FormField'
import { FormCard, FormGrid, FormGroupLabel, FormDivider, FormActions } from '../components/admin/FormCard'
import { EditAction, DeleteAction, PrimaryButton, CancelButton, AddButton } from '../components/admin/AdminActions'
import './Admin.css'

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
  repoUrls: string[] | null
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

type AuthFetch = (url: string, opts?: RequestInit) => Promise<Response>

export default function Admin() {
  const { isAdmin, logout, loading } = useAuth()
  const navigate = useNavigate()
  const { t } = useLang()
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
    <div className="admin-layout">
      <AdminHeader
        section={section}
        setSection={setSection}
        navLabel={navLabel}
        onNavigate={navigate}
        onLogout={() => { logout(); navigate('/entry') }}
        t={t}
      />

      <main className="admin-main">
        {section === 'overview' && <OverviewSection authFetch={authFetch} onNavigate={setSection} />}
        {section === 'projects' && <ProjectsSection authFetch={authFetch} />}
        {section === 'experience' && <ExperienceSection authFetch={authFetch} />}
        {section === 'skills' && <SkillsSection authFetch={authFetch} />}
        {section === 'profile' && <ProfileSection authFetch={authFetch} />}
      </main>
    </div>
  )
}

// --- ADMIN HEADER ---

function AdminHeader({
  section, setSection, navLabel, onNavigate, onLogout, t,
}: {
  section: Section
  setSection: (s: Section) => void
  navLabel: (s: Section) => string
  onNavigate: (path: string) => void
  onLogout: () => void
  t: (en: string, es: string) => string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <header className="admin-header">
      <div className="admin-header__brand">
        <span className="admin-header__label">admin</span>
        <span className="admin-header__title">portfolio.bz</span>
      </div>

      <div className="admin-header__nav" ref={ref}>
        <button
          className={`admin-nav-trigger${open ? ' admin-nav-trigger--open' : ''}`}
          onClick={() => setOpen(v => !v)}
        >
          {navLabel(section)}
          <span className="admin-nav-trigger__chevron">▼</span>
        </button>
        {open && (
          <div className="admin-nav-dropdown">
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                className={`admin-nav-dropdown__item${section === item ? ' admin-nav-dropdown__item--active' : ''}`}
                onClick={() => { setSection(item); setOpen(false) }}
              >
                {navLabel(item)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="admin-header__actions">
        <button
          className="admin-header__btn admin-header__btn--site"
          onClick={() => onNavigate('/home')}
        >
          {t('< site', '< sitio')}
        </button>
        <button
          className="admin-header__btn admin-header__btn--logout"
          onClick={onLogout}
        >
          {t('logout', 'salir')}
        </button>
      </div>
    </header>
  )
}

// --- SHARED ---

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="admin-section-header">
      <div className="admin-section-header__title">{title}</div>
      <div className="admin-section-header__subtitle">{subtitle}</div>
    </div>
  )
}

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

      <div className="admin-stat-grid">
        {cards.map(c => (
          <div key={c.label} className="admin-stat-card">
            <div className="admin-stat-card__label">{c.label}</div>
            <div className="admin-stat-card__value">{c.value}</div>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div className="admin-recent__label">RECENT PROJECTS</div>
          {recent.map(p => (
            <div key={p.id} className="admin-recent__item" onClick={() => onNavigate('projects')}>
              <div>
                <div className="admin-recent__title">{p.title}</div>
                <div className="admin-recent__type">{p.type}</div>
              </div>
              <span className="admin-recent__date">
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
  isFeatured: false, repoUrls: '', liveUrl: '', sortOrder: 0,
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
    const payload = {
      ...form,
      repoUrls: form.repoUrls
        ? form.repoUrls.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    }
    const body = JSON.stringify(payload)
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
      isFeatured: p.isFeatured, repoUrls: p.repoUrls ? p.repoUrls.join(', ') : '',
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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('title', 'titulo')}</th>
              <th>{t('type', 'tipo')}</th>
              <th style={{ textAlign: 'center' }}>featured</th>
              <th>{t('actions', 'acciones')}</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <React.Fragment key={p.id}>
                <tr>
                  <td className="admin-table__name">{p.title}</td>
                  <td>
                    <span className={`admin-badge ${p.type === 'work' ? 'admin-badge--teal' : 'admin-badge--warm'}`}>
                      {p.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }} onClick={() => toggleFeatured(p)}>
                    <span className={`admin-star ${p.isFeatured ? 'admin-star--active' : 'admin-star--inactive'}`}>
                      {p.isFeatured ? '\u2605' : '\u2606'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <EditAction onClick={() => startEdit(p)}>{t('edit', 'editar')}</EditAction>
                    <DeleteAction onClick={() => remove(p.id)}>{t('delete', 'eliminar')}</DeleteAction>
                  </td>
                </tr>
                {editingId === p.id && (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px 0' }}>
                      <ProjectForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <div style={{ marginTop: 16 }}>
          <ProjectForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
        </div>
      )}

      {!adding && !editingId && (
        <AddButton onClick={startAdd}>{t('+ add project', '+ agregar proyecto')}</AddButton>
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
    <FormCard>
      <FormGroupLabel>{t('General', 'General')}</FormGroupLabel>
      <FormGrid>
        <AdminInput label={t('Title', 'Titulo')} value={form.title} onChange={v => set('title', v)} />
        <AdminInput label="Slug" value={form.slug} onChange={v => set('slug', v)} />
        <AdminInput label={t('Description', 'Descripcion')} value={form.descriptionShort} onChange={v => set('descriptionShort', v)} className="admin-form-card__grid--full" />
        <AdminSelect
          label={t('Type', 'Tipo')}
          value={form.type}
          onChange={v => set('type', v)}
          options={[{ value: 'work', label: 'work' }, { value: 'personal', label: 'personal' }]}
        />
        <AdminSelect
          label={t('Visibility', 'Visibilidad')}
          value={form.visibility}
          onChange={v => set('visibility', v)}
          options={[
            { value: 'public', label: 'public' },
            { value: 'nda', label: 'nda' },
            { value: 'open-source', label: 'open-source' },
          ]}
        />
      </FormGrid>

      <FormDivider />
      <FormGroupLabel>{t('Team', 'Equipo')}</FormGroupLabel>
      <FormGrid>
        <AdminInput label={t('Company', 'Empresa')} value={form.company} onChange={v => set('company', v)} />
        <AdminInput label={t('Role', 'Rol')} value={form.role} onChange={v => set('role', v)} />
      </FormGrid>

      <FormDivider />
      <FormGroupLabel>{t('Participation', 'Participacion')}</FormGroupLabel>
      <FormGrid>
        <AdminInput label="Frontend %" type="number" min={0} max={100} value={form.participationFrontend} onChange={v => set('participationFrontend', v)} />
        <AdminInput label="Backend %" type="number" min={0} max={100} value={form.participationBackend} onChange={v => set('participationBackend', v)} />
        <AdminInput label="Design %" type="number" min={0} max={100} value={form.participationDesign} onChange={v => set('participationDesign', v)} />
        <AdminInput label={t('Sort Order', 'Orden')} type="number" value={form.sortOrder} onChange={v => set('sortOrder', v)} />
      </FormGrid>

      <FormDivider />
      <FormGroupLabel>{t('Links', 'Enlaces')}</FormGroupLabel>
      <FormGrid>
        <AdminInput label={t('Repo URLs (comma-separated)', 'URLs de repos (separadas por coma)')} value={form.repoUrls} onChange={v => set('repoUrls', v)} className="admin-form-card__grid--full" />
        <AdminInput label="Live URL" value={form.liveUrl} onChange={v => set('liveUrl', v)} />
        <AdminToggle label="Featured" checked={form.isFeatured} onChange={v => set('isFeatured', v)} />
      </FormGrid>

      <FormActions>
        <PrimaryButton onClick={onSave}>{t('save', 'guardar')}</PrimaryButton>
        <CancelButton onClick={onCancel}>{t('cancel', 'cancelar')}</CancelButton>
      </FormActions>
    </FormCard>
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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('name', 'nombre')}</th>
              <th>{t('category', 'categoria')}</th>
              <th>{t('level', 'nivel')}</th>
              <th>{t('actions', 'acciones')}</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(s => (
              <React.Fragment key={s.id}>
                <tr>
                  <td className="admin-table__name">{s.name}</td>
                  <td className="admin-table__meta">{s.category}</td>
                  <td>
                    <div className="admin-skill-dots">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`admin-skill-dot ${i < s.level ? 'admin-skill-dot--filled' : 'admin-skill-dot--empty'}`} />
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <EditAction onClick={() => startEdit(s)}>{t('edit', 'editar')}</EditAction>
                    <DeleteAction onClick={() => remove(s.id)}>{t('delete', 'eliminar')}</DeleteAction>
                  </td>
                </tr>
                {editingId === s.id && (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px 0' }}>
                      <SkillForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <div style={{ marginTop: 16 }}>
          <SkillForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
        </div>
      )}

      {!adding && !editingId && (
        <AddButton onClick={() => { setEditingId(null); setForm(emptySkill); setAdding(true) }}>
          + add skill
        </AddButton>
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
    <FormCard>
      <FormGrid>
        <AdminInput label={t('Name', 'Nombre')} value={form.name} onChange={v => set('name', v)} />
        <AdminSelect
          label={t('Category', 'Categoria')}
          value={form.category}
          onChange={v => set('category', v)}
          options={SKILL_CATEGORIES.map(c => ({ value: c, label: c }))}
        />
        <AdminInput label={t('Level (1-5)', 'Nivel (1-5)')} type="number" min={1} max={5} value={form.level} onChange={v => set('level', v)} />
        <AdminInput label={t('Sort Order', 'Orden')} type="number" value={form.sortOrder} onChange={v => set('sortOrder', v)} />
      </FormGrid>
      <FormActions>
        <PrimaryButton onClick={onSave}>{t('save', 'guardar')}</PrimaryButton>
        <CancelButton onClick={onCancel}>{t('cancel', 'cancelar')}</CancelButton>
      </FormActions>
    </FormCard>
  )
}

// --- EXPERIENCE ---

const emptyExperience = {
  company: '', role: '', startDate: '', endDate: '',
  isCurrent: false, description: '', stack: '', sortOrder: 0,
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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('company', 'empresa')}</th>
              <th>{t('role', 'rol')}</th>
              <th>{t('period', 'periodo')}</th>
              <th>{t('actions', 'acciones')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(e => (
              <React.Fragment key={e.id}>
                <tr>
                  <td className="admin-table__name">{e.company}</td>
                  <td className="admin-table__meta" style={{ fontSize: 12 }}>{e.role}</td>
                  <td className="admin-table__meta" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatPeriod(e)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <EditAction onClick={() => startEdit(e)}>{t('edit', 'editar')}</EditAction>
                    <DeleteAction onClick={() => remove(e.id)}>{t('delete', 'eliminar')}</DeleteAction>
                  </td>
                </tr>
                {editingId === e.id && (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px 0' }}>
                      <ExperienceForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {adding && (
        <div style={{ marginTop: 16 }}>
          <ExperienceForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} />
        </div>
      )}

      {!adding && !editingId && (
        <AddButton onClick={() => { setEditingId(null); setForm(emptyExperience); setAdding(true) }}>
          + add position
        </AddButton>
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
    <FormCard>
      <FormGroupLabel>{t('Position', 'Puesto')}</FormGroupLabel>
      <FormGrid>
        <AdminInput label={t('Company', 'Empresa')} value={form.company} onChange={v => set('company', v)} />
        <AdminInput label={t('Role', 'Rol')} value={form.role} onChange={v => set('role', v)} />
      </FormGrid>

      <FormDivider />
      <FormGroupLabel>{t('Dates', 'Fechas')}</FormGroupLabel>
      <FormGrid>
        <AdminInput label={t('Start Date', 'Fecha inicio')} value={form.startDate} onChange={v => set('startDate', v)} placeholder="YYYY-MM-DD" />
        <AdminInput label={t('End Date', 'Fecha fin')} value={form.endDate} onChange={v => set('endDate', v)} placeholder="YYYY-MM-DD" disabled={form.isCurrent} />
        <AdminToggle label={t('Current Position', 'Puesto actual')} checked={form.isCurrent} onChange={v => set('isCurrent', v)} />
        <AdminInput label={t('Sort Order', 'Orden')} type="number" value={form.sortOrder} onChange={v => set('sortOrder', v)} />
      </FormGrid>

      <FormDivider />
      <FormGroupLabel>{t('Details', 'Detalles')}</FormGroupLabel>
      <FormGrid>
        <AdminTextarea label={t('Description', 'Descripcion')} value={form.description} onChange={v => set('description', v)} className="admin-form-card__grid--full" />
        <AdminInput label={t('Stack (comma-separated)', 'Stack (separado por comas)')} value={form.stack} onChange={v => set('stack', v)} className="admin-form-card__grid--full" />
      </FormGrid>

      <FormActions>
        <PrimaryButton onClick={onSave}>{t('save', 'guardar')}</PrimaryButton>
        <CancelButton onClick={onCancel}>{t('cancel', 'cancelar')}</CancelButton>
      </FormActions>
    </FormCard>
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

      <FormCard>
        <FormGroupLabel>{t('Identity', 'Identidad')}</FormGroupLabel>
        <FormGrid>
          <AdminInput label={t('Name', 'Nombre')} value={form.name} onChange={v => set('name', String(v))} />
          <AdminInput label={t('Title', 'Titulo')} value={form.title} onChange={v => set('title', String(v))} />
          <AdminInput label={t('Short Bio', 'Bio corta')} value={form.bioShort} onChange={v => set('bioShort', String(v))} className="admin-form-card__grid--full" />
          <AdminTextarea label={t('Long Bio', 'Bio larga')} value={form.bioLong} onChange={v => set('bioLong', v)} rows={4} className="admin-form-card__grid--full" />
        </FormGrid>

        <FormDivider />
        <FormGroupLabel>{t('Contact', 'Contacto')}</FormGroupLabel>
        <FormGrid>
          <AdminInput label={t('Location', 'Ubicacion')} value={form.location} onChange={v => set('location', String(v))} />
          <AdminInput label="Email" value={form.email} onChange={v => set('email', String(v))} />
          <AdminInput label={t('Phone', 'Telefono')} value={form.phone} onChange={v => set('phone', String(v))} />
          <AdminInput label="Photo URL" value={form.photoUrl} onChange={v => set('photoUrl', String(v))} />
        </FormGrid>

        <FormDivider />
        <FormGroupLabel>{t('Social', 'Redes')}</FormGroupLabel>
        <FormGrid>
          <AdminInput label="GitHub URL" value={form.githubUrl} onChange={v => set('githubUrl', String(v))} />
          <AdminInput label="LinkedIn URL" value={form.linkedinUrl} onChange={v => set('linkedinUrl', String(v))} />
        </FormGrid>

        <FormActions>
          <PrimaryButton onClick={save}>{t('save', 'guardar')}</PrimaryButton>
          {saved && <span className="admin-saved">{t('saved.', 'guardado.')}</span>}
        </FormActions>
      </FormCard>
    </div>
  )
}
