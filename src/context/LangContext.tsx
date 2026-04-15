import { createContext, useContext, useState, useMemo } from 'react'

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

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const toggle = () => setLang(l => l === 'en' ? 'es' : 'en')
  const t = (en: string, es: string) => lang === 'es' ? es : en

  const value = useMemo(() => ({ lang, toggle, t }), [lang])
  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
