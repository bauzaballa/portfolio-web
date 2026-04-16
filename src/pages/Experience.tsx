import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../context/LangContext'
import { useBreakpoint } from '../hooks/useBreakpoint'
import Nav from '../components/Nav'
import PageHeader from '../components/PageHeader'
import SkeletonLoader from '../components/SkeletonLoader'
import SkillChip from '../components/SkillChip'
import TextLink from '../components/TextLink'
import Divider from '../components/Divider'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ExperienceItem {
  id: number
  company: string
  role: string
  description: string
  startDate: string
  endDate: string | null
  isCurrent: boolean
  sortOrder: number
  skills?: { id: number; name: string; category: string }[]
  experienceId?: number
}

interface EducationItem {
  id: number
  institution: string
  degree: string
  field?: string
  startYear: number
  endYear?: number
  isCertification: boolean
  sortOrder: number
}

export default function Experience() {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const { isMobile } = useBreakpoint()

  const [experience, setExperience] = useState<ExperienceItem[]>([])
  const [education, setEducation] = useState<EducationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const cache = useRef<Record<string, any>>({})

  useEffect(() => {
    const expKey = `experience_${lang}`
    const eduKey = `education_${lang}`
    if (cache.current[expKey] && cache.current[eduKey]) {
      setExperience(cache.current[expKey])
      setEducation(cache.current[eduKey])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      fetch(`${API}/api/v1/experience?lang=${lang}`).then(r => r.json()),
      fetch(`${API}/api/v1/education?lang=${lang}`).then(r => r.json()),
    ])
      .then(([expData, eduData]) => {
        const exp = (expData.data ?? expData).sort((a: ExperienceItem, b: ExperienceItem) => a.sortOrder - b.sortOrder)
        const edu = (eduData.data ?? eduData).sort((a: EducationItem, b: EducationItem) => a.sortOrder - b.sortOrder)
        cache.current[expKey] = exp
        cache.current[eduKey] = edu
        setExperience(exp)
        setEducation(edu)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [lang])

  return (
    <div>
      <Nav />

      <PageHeader
        label={t('/ experience', '/ experiencia')}
        title={t('Work & education.', 'Experiencia y formación.')}
      />

      {/* EXPERIENCE TIMELINE */}
      <section style={{ padding: isMobile ? '40px 6vw' : '60px 8vw', maxWidth: 800 }}>
        {loading && <SkeletonLoader rows={3} />}

        {error && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            {t('could not load experience', 'no se pudo cargar la experiencia')}
          </p>
        )}

        {!loading && !error && experience.map((item, i) => (
          <div key={item.id}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={isMobile ? {
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              } : {
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 32,
              }}
            >
              {/* Date column */}
              {isMobile ? (
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--text-muted)',
                  display: 'flex', gap: 6,
                }}>
                  <span>{new Date(item.startDate).getFullYear()}</span>
                  <span>—</span>
                  <span>{item.isCurrent ? t('present', 'presente') : item.endDate ? new Date(item.endDate).getFullYear() : ''}</span>
                </div>
              ) : (
                <div style={{
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                  paddingTop: 4,
                }}>
                  <div>{new Date(item.startDate).getFullYear()}</div>
                  <div>—</div>
                  <div>{item.isCurrent ? t('present', 'presente') : item.endDate ? new Date(item.endDate).getFullYear() : ''}</div>
                </div>
              )}

              {/* Content column */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: isMobile ? 20 : 24,
                  color: 'var(--text-primary)', fontWeight: 700,
                }}>
                  {item.company}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--accent-teal)', letterSpacing: 1,
                  marginTop: 4,
                }}>
                  {item.role}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: isMobile ? 15 : 16,
                  color: 'var(--text-secondary)', lineHeight: 1.8,
                  marginTop: 12, maxWidth: 560,
                }}>
                  {item.description}
                </div>
                {item.skills && item.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                    {item.skills.map(s => (
                      <SkillChip key={s.name} name={s.name} />
                    ))}
                  </div>
                )}
                <TextLink
                  onClick={() => navigate('/projects')}
                  style={{ marginTop: 16, fontSize: 11, letterSpacing: 1 }}
                >
                  {t('view projects →', 'ver proyectos →')}
                </TextLink>
              </div>
            </motion.div>

            {i < experience.length - 1 && (
              <Divider style={{ margin: isMobile ? '28px 0' : '40px 0' }} />
            )}
          </div>
        ))}
      </section>

      {/* EDUCATION SECTION */}
      <section style={{
        borderTop: '0.5px solid var(--border)',
        padding: isMobile ? '40px 6vw' : '60px 8vw',
        maxWidth: 800,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 32,
          color: 'var(--text-primary)', fontWeight: 700,
          marginBottom: 40,
        }}>
          {t('Education & certifications.', 'Formación y certificaciones.')}
        </h2>

        {loading && <SkeletonLoader rows={2} />}

        {!loading && !error && education.map((item, i) => (
          <div key={item.id}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={isMobile ? {
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              } : {
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 32,
              }}
            >
              {/* Date column */}
              {isMobile ? (
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--text-muted)',
                }}>
                  {item.startYear === item.endYear || !item.endYear
                    ? item.startYear
                    : `${item.startYear} — ${item.endYear}`
                  }
                </div>
              ) : (
                <div style={{
                  textAlign: 'right',
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                  paddingTop: 4,
                }}>
                  {item.startYear === item.endYear || !item.endYear
                    ? item.startYear
                    : <>{item.startYear}<br />—<br />{item.endYear}</>
                  }
                </div>
              )}

              {/* Content column */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: isMobile ? 18 : 20,
                  color: 'var(--text-primary)',
                }}>
                  {item.institution}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  color: 'var(--accent-teal)', letterSpacing: 1,
                  marginTop: 4,
                }}>
                  {item.degree}
                </div>
                {item.field && (
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: 15,
                    color: 'var(--text-secondary)', marginTop: 6,
                  }}>
                    {item.field}
                  </div>
                )}
                {item.isCertification && (
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(61,107,98,0.12)',
                    color: 'var(--accent-teal)',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 2,
                    marginTop: 8,
                    letterSpacing: 1,
                  }}>
                    {t('certification', 'certificación')}
                  </div>
                )}
              </div>
            </motion.div>

            {i < education.length - 1 && (
              <Divider style={{ margin: isMobile ? '28px 0' : '40px 0' }} />
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
