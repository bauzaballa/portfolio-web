# Personal Photo & Login Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace generic SVG avatars and placeholders with the user's actual photo, redesign login cards to minimal dark style, and add a nav avatar with context menu dropdown.

**Architecture:** Single static image asset served from `/public/bau.jpg`. No shared state or context — the path is used inline wherever needed. Three independent UI changes across OSEntry, About, and Nav.

**Tech Stack:** React 19, TypeScript, Framer Motion, Vite

---

## File map

| File | Change |
|------|--------|
| `public/bau.jpg` | New — photo asset copied from Downloads |
| `src/pages/OSEntry.tsx` | Delete BautistaAvatar, redesign UserCard, update PasswordForm |
| `src/pages/About.tsx` | Replace photo placeholder with `<img>` |
| `src/components/Nav.tsx` | Replace admin button with avatar + dropdown |

---

### Task 1: Copy photo asset

**Files:**
- Create: `public/bau.jpg`

- [ ] **Step 1: Copy image to public folder**

```bash
cp /Users/bauzaballa/Downloads/1012022682.jpg /Users/bauzaballa/Bau/portfolio/portfolio-web/public/bau.jpg
```

- [ ] **Step 2: Verify it exists**

```bash
ls -lh public/bau.jpg
```

Expected: file exists, size ~2-5 MB.

- [ ] **Step 3: Commit**

```bash
git add public/bau.jpg
git commit -m "feat: add personal photo asset"
```

---

### Task 2: Redesign OSEntry — login cards

**Files:**
- Modify: `src/pages/OSEntry.tsx`

- [ ] **Step 1: Delete BautistaAvatar and update GuestAvatar**

Replace the `BautistaAvatar` function (lines 47-66) and `GuestAvatar` function (lines 68-83) with:

```tsx
function GuestAvatar() {
  return (
    <div style={{
      width: 72, height: 72,
      borderRadius: '50%',
      background: '#1E2228',
      border: '1.5px solid rgba(30,40,32,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width={36} height={36} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="6" fill="#4A4A5A" />
        <ellipse cx="16" cy="28" rx="10" ry="7" fill="#3A3A4A" />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Replace UserCard with card-styled version**

Replace the `UserCard` function (lines 85-129):

```tsx
function UserCard({ name, avatar, onClick, isAdmin }: {
  name: string
  avatar: React.ReactNode
  onClick: () => void
  isAdmin?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        background: isAdmin ? 'rgba(20, 24, 20, 0.85)' : 'rgba(20, 24, 20, 0.5)',
        border: `1px solid ${hovered
          ? isAdmin ? 'rgba(196, 176, 144, 0.35)' : 'rgba(61, 107, 98, 0.3)'
          : isAdmin ? 'rgba(196, 176, 144, 0.15)' : 'rgba(30, 40, 32, 0.6)'}`,
        borderRadius: '8px',
        padding: '1.5rem 1rem',
        cursor: 'pointer',
        minWidth: '110px',
        transition: 'border-color 0.2s ease',
      }}
    >
      {avatar}
      <span style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
      }}>
        {name}
      </span>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        letterSpacing: '0.1em',
        color: isAdmin ? 'var(--accent-teal)' : 'var(--text-secondary)',
        padding: '0.15rem 0.4rem',
        border: `1px solid ${isAdmin ? 'rgba(61, 107, 98, 0.4)' : 'rgba(30, 40, 32, 0.6)'}`,
        borderRadius: '3px',
      }}>
        {isAdmin ? 'admin' : 'visitor'}
      </div>
    </motion.button>
  )
}
```

- [ ] **Step 3: Update PasswordForm — replace small BautistaAvatar with photo**

In `PasswordForm`, find `<BautistaAvatar size={40} />` (line 226) and replace with:

```tsx
<div style={{
  width: 40, height: 40,
  borderRadius: '50%',
  overflow: 'hidden',
  border: '1px solid rgba(196,176,144,0.3)',
  flexShrink: 0,
}}>
  <img
    src="/bau.jpg"
    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
  />
</div>
```

- [ ] **Step 4: Update OSEntry render — use photo avatar for admin users, pass isAdmin prop**

In the `OSEntry` component (lines 353-368), replace the user card render and guest card:

```tsx
<UserCard
  name="Guest"
  avatar={<GuestAvatar />}
  onClick={handleGuestClick}
/>
{users.map((user) => (
  <UserCard
    key={user.username}
    name={user.username}
    avatar={
      <div style={{
        width: 72, height: 72,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1.5px solid rgba(196,176,144,0.3)',
      }}>
        <img
          src="/bau.jpg"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>
    }
    onClick={() => handleUserClick(user.username)}
    isAdmin={true}
  />
))}
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/OSEntry.tsx
git commit -m "feat: redesign login cards with minimal dark style and real photo avatar"
```

---

### Task 3: About page — replace photo placeholder

**Files:**
- Modify: `src/pages/About.tsx`

- [ ] **Step 1: Replace the photo placeholder div**

Find the right-column `motion.div` in the hero section (lines 120-155). Replace its inner content (the placeholder div with the circle and text) with an `<img>` tag, and update the container styles to remove flex alignment and add `overflow: hidden`:

Replace the entire `motion.div` inner style and children:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
  style={{
    width: 340, height: 440,
    border: '0.5px solid var(--border)',
    borderRadius: 2,
    overflow: 'hidden',
    flexShrink: 0,
  }}
>
  <img
    src="/bau.jpg"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center top',
      filter: 'sepia(0.08) contrast(1.02)',
      display: 'block',
    }}
  />
</motion.div>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/About.tsx
git commit -m "feat: add personal photo to about page"
```

---

### Task 4: Nav — avatar + context menu dropdown

**Files:**
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Add missing imports**

At the top of `Nav.tsx`, update imports:

```tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import ConsoleDrawer from './ConsoleDrawer'
import ThemeToggle from './ThemeToggle'
import LangToggle from './LangToggle'
import LikeButton from './LikeButton'
```

- [ ] **Step 2: Add state and click-outside logic**

Inside `Nav()`, after the existing `const { isAdmin } = useAuth()` line, add `logout` to the destructure and add state + ref + effect:

```tsx
const { isAdmin, logout } = useAuth()
const [menuOpen, setMenuOpen] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (!menuOpen) return
  const handler = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false)
    }
  }
  document.addEventListener('mousedown', handler)
  return () => document.removeEventListener('mousedown', handler)
}, [menuOpen])
```

- [ ] **Step 3: Replace the admin button with avatar + dropdown**

Find the `{isAdmin && (...)}` block (lines 66-81) and replace it:

```tsx
{isAdmin && (
  <div ref={menuRef} style={{ position: 'relative', zIndex: 200 }}>
    <button
      onClick={() => setMenuOpen(v => !v)}
      style={{
        width: 28, height: 28,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1.5px solid rgba(196,176,144,0.4)',
        boxShadow: '0 0 0 2px rgba(61,107,98,0.2)',
        cursor: 'pointer',
        padding: 0,
        background: 'none',
      }}
    >
      <img
        src="/bau.jpg"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
      />
    </button>

    <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            top: 36,
            right: 0,
            background: 'rgba(14,15,18,0.95)',
            border: '1px solid rgba(196,176,144,0.15)',
            borderRadius: 6,
            padding: '0.4rem 0',
            minWidth: 140,
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={() => { setMenuOpen(false); navigate('/admin') }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '0.4rem 0.8rem',
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--accent-warm)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            → {t('admin panel', 'panel admin')}
          </button>
          <div style={{ height: '0.5px', background: 'rgba(30,40,32,0.8)', margin: '0.3rem 0' }} />
          <button
            onClick={() => { setMenuOpen(false); logout(); navigate('/entry') }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '0.4rem 0.8rem',
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--text-secondary)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            × {t('logout', 'cerrar sesión')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: replace nav admin button with avatar dropdown menu"
```
