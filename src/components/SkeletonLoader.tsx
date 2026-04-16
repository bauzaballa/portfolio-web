const KEYFRAMES = `@keyframes skeletonPulse { 0%,100% { opacity: 0.4 } 50% { opacity: 0.8 } }`

interface SkeletonBlock {
  height: number
  width?: string | number
}

interface SkeletonLoaderProps {
  rows?: number
  blocks?: SkeletonBlock[]
  gap?: number
  style?: React.CSSProperties
}

export default function SkeletonLoader({ rows, blocks, gap = 8, style }: SkeletonLoaderProps) {
  const items: SkeletonBlock[] = blocks
    ?? Array.from({ length: rows ?? 3 }, () => ({ height: 80 }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {items.map((block, i) => (
        <div
          key={i}
          style={{
            height: block.height,
            width: block.width ?? '100%',
            background: 'var(--bg-surface)',
            borderRadius: 2,
            animation: 'skeletonPulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
      <style>{KEYFRAMES}</style>
    </div>
  )
}
