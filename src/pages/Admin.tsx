import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { AdminInput, AdminSelect, AdminToggle, BilingualInput, BilingualTextarea } from '../components/admin/FormField'
import { FormCard, FormGrid, FormGroupLabel, FormDivider, FormActions } from '../components/admin/FormCard'
import { EditAction, DeleteAction, PrimaryButton, CancelButton, AddButton } from '../components/admin/AdminActions'
import ThemeToggle from '../components/ThemeToggle'
import { useToast } from '../context/ToastContext'
import './Admin.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type Section = 'overview' | 'projects' | 'experience' | 'skills' | 'profile'

interface Project {
  id: number
  slug: string
  title: string
  titleEs: string | null
  descriptionShort: string
  descriptionShortEs: string | null
  descriptionLong: string | null
  descriptionLongEs: string | null
  technicalDecisions: string | null
  technicalDecisionsEs: string | null
  challenges: string[] | null
  challengesEs: string[] | null
  type: string
  visibility: string
  company: string | null
  role: string | null
  roleEs: string | null
  teamSize: number | null
  participationFrontend: number | null
  participationBackend: number | null
  participationDesign: number | null
  periodStart: string | null
  periodEnd: string | null
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
  roleEs: string | null
  startDate: string
  endDate: string | null
  isCurrent: boolean
  description: string
  descriptionEs: string | null
  stack: string[]
  sortOrder: number
}

interface MediaItem {
  id: number
  url: string
  type: string
  caption: string | null
  sortOrder: number
}

interface Profile {
  name: string
  title: string
  titleEs: string
  bioShort: string
  bioShortEs: string
  bioLong: string
  bioLongEs: string
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
  const { toast } = useToast()
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
    const res = await fetch(url, {
      ...opts,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...opts?.headers,
      },
    })
    if (res.status === 401) {
      toast(t('session expired.', 'sesion expirada.'), 'error')
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
        <div className="admin-header__theme">
          <ThemeToggle />
        </div>
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
  const { toast } = useToast()
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
    }).catch(() => toast(t('failed to load data.', 'error al cargar datos.'), 'error'))
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
  title: '', titleEs: '', slug: '',
  descriptionShort: '', descriptionShortEs: '',
  descriptionLong: '', descriptionLongEs: '',
  technicalDecisions: '', technicalDecisionsEs: '',
  challenges: '', challengesEs: '',
  type: 'work', visibility: 'public',
  company: '', role: '', roleEs: '',
  teamSize: 0,
  participationFrontend: 0, participationBackend: 0, participationDesign: 0,
  periodStart: '', periodEnd: '',
  isFeatured: false, repoUrls: '', liveUrl: '', sortOrder: 0,
}

function ProjectsSection({ authFetch }: { authFetch: AuthFetch }) {
  const { t } = useLang()
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyProject)

  const load = useCallback(() => {
    authFetch(`${API}/api/v1/projects`).then(r => r.json()).then(d => {
      setProjects(d.data ?? d)
    }).catch(() => toast(t('failed to load projects.', 'error al cargar proyectos.'), 'error'))
  }, [authFetch])

  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      const splitLines = (s: string) =>
        s.split('\n').map(line => line.trim()).filter(Boolean)
      const emptyToNull = (s: string) => (s.trim() === '' ? null : s)

      const payload = {
        title: form.title,
        titleEs: emptyToNull(form.titleEs),
        slug: form.slug,
        descriptionShort: form.descriptionShort,
        descriptionShortEs: emptyToNull(form.descriptionShortEs),
        descriptionLong: emptyToNull(form.descriptionLong),
        descriptionLongEs: emptyToNull(form.descriptionLongEs),
        technicalDecisions: emptyToNull(form.technicalDecisions),
        technicalDecisionsEs: emptyToNull(form.technicalDecisionsEs),
        challenges: form.challenges ? splitLines(form.challenges) : [],
        challengesEs: form.challengesEs ? splitLines(form.challengesEs) : [],
        type: form.type,
        visibility: form.visibility,
        company: form.company || null,
        role: form.role || null,
        roleEs: emptyToNull(form.roleEs),
        teamSize: form.teamSize || null,
        participationFrontend: form.participationFrontend,
        participationBackend: form.participationBackend,
        participationDesign: form.participationDesign,
        periodStart: form.periodStart || null,
        periodEnd: form.periodEnd || null,
        isFeatured: form.isFeatured,
        repoUrls: form.repoUrls
          ? form.repoUrls.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        liveUrl: form.liveUrl || null,
        sortOrder: form.sortOrder,
      }
      const body = JSON.stringify(payload)
      if (editingId) {
        await authFetch(`${API}/api/v1/projects/${editingId}`, { method: 'PATCH', body })
      } else {
        await authFetch(`${API}/api/v1/projects`, { method: 'POST', body })
      }
      toast(t(editingId ? 'project updated.' : 'project created.', editingId ? 'proyecto actualizado.' : 'proyecto creado.'))
      setEditingId(null)
      setAdding(false)
      setForm(emptyProject)
      load()
    } catch {
      toast(t('failed to save project.', 'error al guardar proyecto.'), 'error')
    }
  }

  const toggleFeatured = async (p: Project) => {
    try {
      await authFetch(`${API}/api/v1/projects/${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured: !p.isFeatured }),
      })
      toast(t(
        p.isFeatured ? 'removed from featured.' : 'marked as featured.',
        p.isFeatured ? 'quitado de destacados.' : 'marcado como destacado.',
      ))
      load()
    } catch {
      toast(t('failed to update project.', 'error al actualizar proyecto.'), 'error')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this project?')) return
    try {
      await authFetch(`${API}/api/v1/projects/${id}`, { method: 'DELETE' })
      toast(t('project deleted.', 'proyecto eliminado.'))
      load()
    } catch {
      toast(t('failed to delete project.', 'error al eliminar proyecto.'), 'error')
    }
  }

  const startEdit = (p: Project) => {
    setAdding(false)
    setEditingId(p.id)
    setForm({
      title: p.title,
      titleEs: p.titleEs ?? '',
      slug: p.slug,
      descriptionShort: p.descriptionShort,
      descriptionShortEs: p.descriptionShortEs ?? '',
      descriptionLong: p.descriptionLong ?? '',
      descriptionLongEs: p.descriptionLongEs ?? '',
      technicalDecisions: p.technicalDecisions ?? '',
      technicalDecisionsEs: p.technicalDecisionsEs ?? '',
      challenges: p.challenges ? p.challenges.join('\n') : '',
      challengesEs: p.challengesEs ? p.challengesEs.join('\n') : '',
      type: p.type,
      visibility: p.visibility,
      company: p.company ?? '',
      role: p.role ?? '',
      roleEs: p.roleEs ?? '',
      teamSize: p.teamSize ?? 0,
      participationFrontend: p.participationFrontend ?? 0,
      participationBackend: p.participationBackend ?? 0,
      participationDesign: p.participationDesign ?? 0,
      periodStart: p.periodStart ?? '',
      periodEnd: p.periodEnd ?? '',
      isFeatured: p.isFeatured,
      repoUrls: p.repoUrls ? p.repoUrls.join(', ') : '',
      liveUrl: p.liveUrl ?? '',
      sortOrder: p.sortOrder,
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
                      <ProjectForm form={form} setForm={setForm} onSave={save} onCancel={cancelForm} t={t} projectId={p.id} authFetch={authFetch} />
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
  form, setForm, onSave, onCancel, t, projectId, authFetch,
}: {
  form: typeof emptyProject
  setForm: React.Dispatch<React.SetStateAction<typeof emptyProject>>
  onSave: () => void
  onCancel: () => void
  t: (en: string, es: string) => string
  projectId?: number
  authFetch?: AuthFetch
}) {
  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  return (
    <FormCard>
      <FormGroupLabel>{t('General', 'General')}</FormGroupLabel>
      <FormGrid>
        <BilingualInput
          labelEn="Title (EN)"
          labelEs="Titulo (ES)"
          valueEn={form.title}
          valueEs={form.titleEs}
          onChangeEn={v => set('title', v)}
          onChangeEs={v => set('titleEs', v)}
        />
        <AdminInput label="Slug" value={form.slug} onChange={v => set('slug', v)} />
        <BilingualInput
          labelEn="Description (EN)"
          labelEs="Descripcion (ES)"
          valueEn={form.descriptionShort}
          valueEs={form.descriptionShortEs}
          onChangeEn={v => set('descriptionShort', v)}
          onChangeEs={v => set('descriptionShortEs', v)}
        />
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
        <BilingualInput
          labelEn="Role (EN)"
          labelEs="Rol (ES)"
          valueEn={form.role}
          valueEs={form.roleEs}
          onChangeEn={v => set('role', v)}
          onChangeEs={v => set('roleEs', v)}
        />
        <AdminInput label={t('Team Size', 'Tamano equipo')} type="number" min={0} value={form.teamSize} onChange={v => set('teamSize', v)} />
      </FormGrid>

      <FormDivider />
      <FormGroupLabel>{t('Period', 'Periodo')}</FormGroupLabel>
      <FormGrid>
        <AdminInput label={t('Start Date', 'Fecha inicio')} value={form.periodStart} onChange={v => set('periodStart', v)} placeholder="YYYY-MM-DD" />
        <AdminInput label={t('End Date', 'Fecha fin')} value={form.periodEnd} onChange={v => set('periodEnd', v)} placeholder="YYYY-MM-DD" />
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
      <FormGroupLabel>{t('Long-form', 'Texto largo')}</FormGroupLabel>
      <FormGrid>
        <BilingualTextarea
          labelEn="Long Description (EN)"
          labelEs="Descripcion larga (ES)"
          valueEn={form.descriptionLong}
          valueEs={form.descriptionLongEs}
          onChangeEn={v => set('descriptionLong', v)}
          onChangeEs={v => set('descriptionLongEs', v)}
          rows={4}
        />
        <BilingualTextarea
          labelEn="Technical Decisions (EN)"
          labelEs="Decisiones tecnicas (ES)"
          valueEn={form.technicalDecisions}
          valueEs={form.technicalDecisionsEs}
          onChangeEn={v => set('technicalDecisions', v)}
          onChangeEs={v => set('technicalDecisionsEs', v)}
          rows={4}
        />
        <BilingualTextarea
          labelEn="Challenges (EN, one per line)"
          labelEs="Desafios (ES, uno por linea)"
          valueEn={form.challenges}
          valueEs={form.challengesEs}
          onChangeEn={v => set('challenges', v)}
          onChangeEs={v => set('challengesEs', v)}
          rows={4}
        />
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

      {projectId && authFetch && (
        <MediaManager projectId={projectId} authFetch={authFetch} t={t} />
      )}
    </FormCard>
  )
}

// --- MEDIA MANAGER ---

const emptyMediaForm = { url: '', type: 'image', caption: '', sortOrder: 0 }

function MediaManager({
  projectId, authFetch, t,
}: {
  projectId: number
  authFetch: AuthFetch
  t: (en: string, es: string) => string
}) {
  const { toast } = useToast()
  const [items, setItems] = useState<MediaItem[]>([])
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyMediaForm)

  const load = useCallback(() => {
    authFetch(`${API}/api/v1/media/${projectId}`)
      .then(r => r.json())
      .then(d => setItems(d.data ?? []))
      .catch(() => {})
  }, [projectId, authFetch])

  useEffect(() => { load() }, [load])

  const saveItem = async () => {
    try {
      const body = JSON.stringify({ ...form, projectId })
      if (editingId) {
        await authFetch(`${API}/api/v1/media/${editingId}`, { method: 'PATCH', body })
      } else {
        await authFetch(`${API}/api/v1/media`, { method: 'POST', body })
      }
      toast(t(editingId ? 'media updated.' : 'media added.', editingId ? 'media actualizado.' : 'media agregado.'))
      setEditingId(null)
      setAdding(false)
      setForm(emptyMediaForm)
      load()
    } catch {
      toast(t('failed to save media.', 'error al guardar media.'), 'error')
    }
  }

  const removeItem = async (id: number) => {
    if (!confirm('Delete this media item?')) return
    try {
      await authFetch(`${API}/api/v1/media/${id}`, { method: 'DELETE' })
      toast(t('media deleted.', 'media eliminado.'))
      load()
    } catch {
      toast(t('failed to delete media.', 'error al eliminar media.'), 'error')
    }
  }

  const startEdit = (m: MediaItem) => {
    setAdding(false)
    setEditingId(m.id)
    setForm({ url: m.url, type: m.type, caption: m.caption ?? '', sortOrder: m.sortOrder })
  }

  const cancelForm = () => {
    setEditingId(null)
    setAdding(false)
    setForm(emptyMediaForm)
  }

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: 2,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        paddingBottom: 12,
        borderBottom: '0.5px solid var(--border)',
        marginBottom: 16,
      }}>
        media
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map(m => (
            <React.Fragment key={m.id}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 0',
                borderBottom: '0.5px solid var(--border)',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 64,
                  height: 44,
                  flexShrink: 0,
                  border: '0.5px solid var(--border)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {m.type === 'video' ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-muted)' }}>▶</span>
                  ) : (
                    <img src={m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {m.url}
                  </div>
                  {m.caption && (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {m.caption}
                    </div>
                  )}
                </div>

                {/* Sort */}
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}>
                  #{m.sortOrder}
                </div>

                {/* Actions */}
                <div style={{ flexShrink: 0 }}>
                  <EditAction onClick={() => startEdit(m)}>{t('edit', 'editar')}</EditAction>
                  <DeleteAction onClick={() => removeItem(m.id)}>{t('delete', 'eliminar')}</DeleteAction>
                </div>
              </div>

              {editingId === m.id && (
                <div style={{ padding: '12px 0' }}>
                  <MediaForm form={form} set={set} onSave={saveItem} onCancel={cancelForm} t={t} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {adding && (
        <div style={{ marginTop: items.length > 0 ? 12 : 0 }}>
          <MediaForm form={form} set={set} onSave={saveItem} onCancel={cancelForm} t={t} />
        </div>
      )}

      {!adding && !editingId && (
        <AddButton onClick={() => { setEditingId(null); setForm(emptyMediaForm); setAdding(true) }}>
          {t('+ add media', '+ agregar media')}
        </AddButton>
      )}
    </div>
  )
}

function MediaForm({
  form, set, onSave, onCancel, t,
}: {
  form: typeof emptyMediaForm
  set: (k: string, v: string | number) => void
  onSave: () => void
  onCancel: () => void
  t: (en: string, es: string) => string
}) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '0.5px solid var(--border)',
      borderRadius: 4,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <AdminInput
        label="URL"
        value={form.url}
        onChange={v => set('url', v)}
        placeholder="https://..."
        className="admin-form-card__grid--full"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px', gap: 12 }}>
        <AdminSelect
          label={t('Type', 'Tipo')}
          value={form.type}
          onChange={v => set('type', v)}
          options={[{ value: 'image', label: 'image' }, { value: 'video', label: 'video' }]}
        />
        <AdminInput
          label={t('Caption', 'Leyenda')}
          value={form.caption}
          onChange={v => set('caption', v)}
          placeholder={t('optional', 'opcional')}
        />
        <AdminInput
          label={t('Order', 'Orden')}
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={v => set('sortOrder', v)}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <PrimaryButton onClick={onSave}>{t('save', 'guardar')}</PrimaryButton>
        <CancelButton onClick={onCancel}>{t('cancel', 'cancelar')}</CancelButton>
      </div>
    </div>
  )
}

// --- SKILLS ---

const emptySkill = { name: '', category: 'frontend', level: 3, sortOrder: 0 }
const SKILL_CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'design', 'other']

function SkillsSection({ authFetch }: { authFetch: AuthFetch }) {
  const { lang, t } = useLang()
  const { toast } = useToast()
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptySkill)

  const load = useCallback(() => {
    authFetch(`${API}/api/v1/skills?lang=${lang}`).then(r => r.json()).then(d => {
      setSkills(d.data ?? d)
    }).catch(() => toast(t('failed to load skills.', 'error al cargar habilidades.'), 'error'))
  }, [authFetch, lang])

  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      const body = JSON.stringify(form)
      if (editingId) {
        await authFetch(`${API}/api/v1/skills/${editingId}`, { method: 'PATCH', body })
      } else {
        await authFetch(`${API}/api/v1/skills`, { method: 'POST', body })
      }
      toast(t(editingId ? 'skill updated.' : 'skill created.', editingId ? 'habilidad actualizada.' : 'habilidad creada.'))
      setEditingId(null)
      setAdding(false)
      setForm(emptySkill)
      load()
    } catch {
      toast(t('failed to save skill.', 'error al guardar habilidad.'), 'error')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this skill?')) return
    try {
      await authFetch(`${API}/api/v1/skills/${id}`, { method: 'DELETE' })
      toast(t('skill deleted.', 'habilidad eliminada.'))
      load()
    } catch {
      toast(t('failed to delete skill.', 'error al eliminar habilidad.'), 'error')
    }
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
  company: '', role: '', roleEs: '',
  startDate: '', endDate: '',
  isCurrent: false,
  description: '', descriptionEs: '',
  stack: '', sortOrder: 0,
}

function ExperienceSection({ authFetch }: { authFetch: AuthFetch }) {
  const { t } = useLang()
  const { toast } = useToast()
  const [items, setItems] = useState<Experience[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(emptyExperience)

  const load = useCallback(() => {
    authFetch(`${API}/api/v1/experience`).then(r => r.json()).then(d => {
      setItems(d.data ?? d)
    }).catch(() => toast(t('failed to load positions.', 'error al cargar puestos.'), 'error'))
  }, [authFetch])

  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      const emptyToNull = (s: string) => (s.trim() === '' ? null : s)
      const payload = {
        company: form.company,
        role: form.role,
        roleEs: emptyToNull(form.roleEs),
        startDate: form.startDate,
        endDate: form.isCurrent ? null : (form.endDate || null),
        isCurrent: form.isCurrent,
        description: form.description,
        descriptionEs: emptyToNull(form.descriptionEs),
        stack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
        sortOrder: form.sortOrder,
      }
      const body = JSON.stringify(payload)
      if (editingId) {
        await authFetch(`${API}/api/v1/experience/${editingId}`, { method: 'PATCH', body })
      } else {
        await authFetch(`${API}/api/v1/experience`, { method: 'POST', body })
      }
      toast(t(editingId ? 'position updated.' : 'position created.', editingId ? 'puesto actualizado.' : 'puesto creado.'))
      setEditingId(null)
      setAdding(false)
      setForm(emptyExperience)
      load()
    } catch {
      toast(t('failed to save position.', 'error al guardar puesto.'), 'error')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this position?')) return
    try {
      await authFetch(`${API}/api/v1/experience/${id}`, { method: 'DELETE' })
      toast(t('position deleted.', 'puesto eliminado.'))
      load()
    } catch {
      toast(t('failed to delete position.', 'error al eliminar puesto.'), 'error')
    }
  }

  const startEdit = (e: Experience) => {
    setAdding(false)
    setEditingId(e.id)
    setForm({
      company: e.company,
      role: e.role,
      roleEs: e.roleEs ?? '',
      startDate: e.startDate,
      endDate: e.endDate ?? '',
      isCurrent: e.isCurrent,
      description: e.description,
      descriptionEs: e.descriptionEs ?? '',
      stack: e.stack.join(', '),
      sortOrder: e.sortOrder,
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
        <BilingualInput
          labelEn="Role (EN)"
          labelEs="Rol (ES)"
          valueEn={form.role}
          valueEs={form.roleEs}
          onChangeEn={v => set('role', v)}
          onChangeEs={v => set('roleEs', v)}
        />
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
        <BilingualTextarea
          labelEn="Description (EN)"
          labelEs="Descripcion (ES)"
          valueEn={form.description}
          valueEs={form.descriptionEs}
          onChangeEn={v => set('description', v)}
          onChangeEs={v => set('descriptionEs', v)}
          rows={4}
        />
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
  name: '',
  title: '', titleEs: '',
  bioShort: '', bioShortEs: '',
  bioLong: '', bioLongEs: '',
  location: '', email: '', phone: '',
  githubUrl: '', linkedinUrl: '', photoUrl: '',
}

function ProfileSection({ authFetch }: { authFetch: AuthFetch }) {
  const { t } = useLang()
  const { toast } = useToast()
  const [form, setForm] = useState<Profile>(emptyProfile)

  useEffect(() => {
    authFetch(`${API}/api/v1/profile`).then(r => r.json()).then(d => {
      const data = d.data ?? d
      setForm({
        ...emptyProfile,
        ...data,
        titleEs: data?.titleEs ?? '',
        bioShortEs: data?.bioShortEs ?? '',
        bioLongEs: data?.bioLongEs ?? '',
      })
    }).catch(() => toast(t('failed to load profile.', 'error al cargar perfil.'), 'error'))
  }, [authFetch])

  const set = (k: keyof Profile, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    try {
      const emptyToNull = (s: string) => (s.trim() === '' ? null : s)
      const payload = {
        ...form,
        titleEs: emptyToNull(form.titleEs),
        bioShortEs: emptyToNull(form.bioShortEs),
        bioLongEs: emptyToNull(form.bioLongEs),
      }
      await authFetch(`${API}/api/v1/profile`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      toast(t('profile saved.', 'perfil guardado.'))
    } catch {
      toast(t('failed to save profile.', 'error al guardar perfil.'), 'error')
    }
  }

  return (
    <div>
      <SectionHeader title={t('profile', 'perfil')} subtitle="PERSONAL INFORMATION" />

      <FormCard>
        <FormGroupLabel>{t('Identity', 'Identidad')}</FormGroupLabel>
        <FormGrid>
          <AdminInput label={t('Name', 'Nombre')} value={form.name} onChange={v => set('name', String(v))} />
          <BilingualInput
            labelEn="Title (EN)"
            labelEs="Titulo (ES)"
            valueEn={form.title}
            valueEs={form.titleEs}
            onChangeEn={v => set('title', v)}
            onChangeEs={v => set('titleEs', v)}
          />
          <BilingualInput
            labelEn="Short Bio (EN)"
            labelEs="Bio corta (ES)"
            valueEn={form.bioShort}
            valueEs={form.bioShortEs}
            onChangeEn={v => set('bioShort', v)}
            onChangeEs={v => set('bioShortEs', v)}
          />
          <BilingualTextarea
            labelEn="Long Bio (EN)"
            labelEs="Bio larga (ES)"
            valueEn={form.bioLong}
            valueEs={form.bioLongEs}
            onChangeEn={v => set('bioLong', v)}
            onChangeEs={v => set('bioLongEs', v)}
            rows={4}
          />
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
        </FormActions>
      </FormCard>
    </div>
  )
}
