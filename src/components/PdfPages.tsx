import { useEffect, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function PdfPages({ url, isMobile }: { url: string; isMobile: boolean }) {
  const [pages, setPages] = useState<string[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setPages([])
    setError(false)

    async function load() {
      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise
        const imgs: string[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext('2d')!
          await page.render({ canvasContext: ctx, viewport, canvas }).promise
          imgs.push(canvas.toDataURL('image/png'))
          if (cancelled) return
          setPages([...imgs])
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [url])

  if (error) {
    return (
      <div style={{
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        failed to load pdf
      </div>
    )
  }

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        gap: isMobile ? 16 : 20,
        overflow: 'auto',
        maxHeight: '92vh',
        maxWidth: '96vw',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: isMobile ? '48px 6vw' : '40px 24px',
      }}
    >
      {pages.length === 0 && (
        <div style={{
          color: 'rgba(255,255,255,0.45)',
          fontFamily: 'var(--font-mono)', fontSize: 11,
        }}>
          loading...
        </div>
      )}
      {pages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`page ${i + 1}`}
          style={{
            height: isMobile ? 'auto' : 'min(70vh, 720px)',
            width: isMobile ? 'min(70vw, 480px)' : 'auto',
            boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
            background: '#fff',
          }}
        />
      ))}
    </div>
  )
}
