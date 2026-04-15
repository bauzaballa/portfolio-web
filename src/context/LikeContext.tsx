import { createContext, useContext, useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getVisitorId(): string {
  const key = 'portfolio_visitor_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

interface LikeState {
  count: number
  liked: boolean
  handleLike: () => Promise<void>
}

const LikeContext = createContext<LikeState | null>(null)

export function LikeProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    const visitorId = getVisitorId()
    fetch(`${API}/api/v1/likes`, {
      headers: { 'X-Visitor-Id': visitorId },
    })
      .then(r => r.json())
      .then(d => {
        setCount(d.data?.count ?? 0)
        setLiked(d.data?.hasLiked ?? false)
      })
      .catch(() => {})
  }, [])

  const handleLike = async () => {
    if (liked) return

    setLiked(true)
    setCount(c => c + 1)

    try {
      const visitorId = getVisitorId()
      const res = await fetch(`${API}/api/v1/likes`, {
        method: 'POST',
        headers: { 'X-Visitor-Id': visitorId },
      })
      const d = await res.json()
      if (d.data?.count != null) setCount(d.data.count)
    } catch {
      setLiked(false)
      setCount(c => c - 1)
    }
  }

  return (
    <LikeContext.Provider value={{ count, liked, handleLike }}>
      {children}
    </LikeContext.Provider>
  )
}

export function useLike(): LikeState {
  const ctx = useContext(LikeContext)
  if (!ctx) throw new Error('useLike must be used inside LikeProvider')
  return ctx
}
