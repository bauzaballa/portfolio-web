import { createContext, useContext, useState, useMemo, useEffect } from 'react'

export type Lang = 'en' | 'es'

interface LangContextType {
  lang: Lang
  toggle: () => void
  t: (en: string, es: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  toggle: () => {},
  t: (en) => en,
})

const STORAGE_KEY = 'portfolio_lang'

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    return saved === 'es' ? 'es' : 'en'
  })
  const toggle = () => setLang(l => {
    const next = l === 'en' ? 'es' : 'en'
    localStorage.setItem(STORAGE_KEY, next)
    return next
  })
  const t = (en: string, es: string) => lang === 'es' ? es : en

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, toggle, t }), [lang])
  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
