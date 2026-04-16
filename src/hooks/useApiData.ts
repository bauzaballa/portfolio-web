import { useEffect, useRef, useState } from 'react'
import { useLang } from '../context/LangContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface UseApiDataOptions {
  langAware?: boolean
  deps?: any[]
}

export function useApiData<T>(
  path: string,
  opts: UseApiDataOptions = {}
): { data: T | null; loading: boolean; error: boolean } {
  const { lang } = useLang()
  const { langAware = true, deps = [] } = opts

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const cache = useRef<Record<string, T>>({})

  const url = langAware ? `${API}${path}${path.includes('?') ? '&' : '?'}lang=${lang}` : `${API}${path}`
  const cacheKey = `${path}_${langAware ? lang : '_'}`

  useEffect(() => {
    if (cache.current[cacheKey]) {
      setData(cache.current[cacheKey])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(d => {
        const value = d.data ?? d
        cache.current[cacheKey] = value
        setData(value)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [lang, ...deps])

  return { data, loading, error }
}
