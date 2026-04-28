import { createContext, useContext, useState, useMemo, useEffect } from 'react'

export type Lang = 'en' | 'es'

interface LangContextType {
  lang: Lang
  hasUserChosen: boolean
  setLang: (l: Lang) => void
  toggle: () => void
  t: (en: string, es: string) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  hasUserChosen: false,
  setLang: () => {},
  toggle: () => {},
  t: (en) => en,
})

const STORAGE_KEY = 'portfolio_lang'

function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en'
  const langs = [navigator.language, ...(navigator.languages || [])]
  return langs.some(l => l?.toLowerCase().startsWith('es')) ? 'es' : 'en'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [hasUserChosen, setHasUserChosen] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) !== null
  })
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved === 'es' || saved === 'en') return saved
    return detectBrowserLang()
  })
  const setLang = (next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next)
    setHasUserChosen(true)
    setLangState(next)
  }
  const toggle = () => setLang(lang === 'en' ? 'es' : 'en')
  const t = (en: string, es: string) => lang === 'es' ? es : en

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, hasUserChosen, setLang, toggle, t }), [lang, hasUserChosen])
  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
