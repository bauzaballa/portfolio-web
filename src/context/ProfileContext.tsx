import { createContext, useContext, useEffect, useState } from 'react'
import { useLang } from './LangContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface Profile {
  name: string
  title: string
  titleEs: string
  bioShort: string
  bioShortEs: string
  bioLong: string
  bioLongEs: string
  location: string
  email: string
  phone?: string
  githubUrl?: string
  linkedinUrl?: string
  photoUrl?: string
}

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  error: boolean
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: false,
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`${API}/api/v1/profile?lang=${lang}`)
      .then(r => r.json())
      .then(data => setProfile(data.data ?? data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [lang])

  return (
    <ProfileContext.Provider value={{ profile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
