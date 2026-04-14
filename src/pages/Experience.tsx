import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Nav from '../components/Nav'

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

  const [experience, setExperience] = useState<ExperienceItem[]>([])
  const [education, setEducation] = useState<EducationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/v1/experience`).then(r => r.json()),
      fetch(`${API}/api/v1/education`).then(r => r.json()),
    ])
      .then(([expData, eduData]) => {
        setExperience((expData.data ?? expData).sort((a: ExperienceItem, b: ExperienceItem) => a.sortOrder - b.sortOrder))
        setEducation((eduData.data ?? eduData).sort((a: EducationItem, b: EducationItem) => a.sortOrder - b.sortOrder))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Nav />

      {/* PAGE HEADER */}
      <section style={{
        padding: '120px 8vw 40px',
        borderBottom: '0.5px solid var(--border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--text-muted)', letterSpacing: 3,
          marginBottom: 16,
        }}>
          / experience
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(40px, 6vw, 72px)',
          color: 'var(--text-primary)',
          fontWeight: 700,
          lineHeight: 1.05,
        }}>
          Work & education.
        </h1>
      </section>

      {/* EXPERIENCE TIMELINE */}
      <section style={{ padding: '60px 8vw', maxWidth: 800 }}>
        {loading && <SkeletonRows />}

        {error && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 13,
            color: 'var(--text-secondary)',
          }}>
            could not load experience
          </p>
        )}

        {!loading && !error && experience.map((item, i) => (
          <div key={item.id}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 32,
              }}
            >
              {/* Date column */}
              <div style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--text-muted)',
                lineHeight: 1.8,
                paddingTop: 4,
              }}>
                <div>{new Date(item.startDate).getFullYear()}</div>
                <div>—</div>
                <div>{item.isCurrent ? 'present' : item.endDate ? new Date(item.endDate).getFullYear() : ''}</div>
              </div>

              {/* Content column */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 24,
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
                  fontFamily: 'var(--font-serif)', fontSize: 16,
                  color: 'var(--text-secondary)', lineHeight: 1.8,
                  marginTop: 12, maxWidth: 560,
                }}>
                  {item.description}
                </div>
                {item.skills && item.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                    {item.skills.map(s => (
                      <span key={s.name} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11,
                        padding: '2px 6px',
                        border: '0.5px solid var(--border)',
                        color: 'var(--text-secondary)',
                        borderRadius: 2,
                      }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  onClick={() => navigate('/projects')}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--accent-teal)', marginTop: 16,
                    cursor: 'pointer', letterSpacing: 1,
                  }}
                >
                  view projects →
                </div>
              </div>
            </motion.div>

            {i < experience.length - 1 && (
              <div style={{
                borderTop: '0.5px solid var(--border)',
                margin: '40px 0',
              }} />
            )}
          </div>
        ))}
      </section>

      {/* EDUCATION SECTION */}
      <section style={{
        borderTop: '0.5px solid var(--border)',
        padding: '60px 8vw',
        maxWidth: 800,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)', fontSize: 32,
          color: 'var(--text-primary)', fontWeight: 700,
          marginBottom: 40,
        }}>
          Education & certifications.
        </h2>

        {loading && <SkeletonRows count={2} />}

        {!loading && !error && education.map((item, i) => (
          <div key={item.id}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 32,
              }}
            >
              {/* Date column */}
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

              {/* Content column */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontSize: 20,
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
                    certification
                  </div>
                )}
              </div>
            </motion.div>

            {i < education.length - 1 && (
              <div style={{
                borderTop: '0.5px solid var(--border)',
                margin: '40px 0',
              }} />
            )}
          </div>
        ))}
      </section>
    </div>
  )
}

function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 80,
            background: 'var(--bg-surface)',
            borderRadius: 2,
            animation: 'experiencePulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`@keyframes experiencePulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`}</style>
    </div>
  )
}
