# Personal Photo & Login Redesign

**Date:** 2026-04-14
**Scope:** OSEntry login, About page, Nav admin button

---

## Overview

Replace generic SVG avatars and placeholder images with the user's actual photo (`bau.jpg`). Redesign the login user cards to a "minimal dark" card style. Replace the nav admin text button with a circular avatar that opens a dropdown context menu.

---

## 1. Photo asset

- Copy `/Users/bauzaballa/Downloads/1012022682.jpg` to `/public/bau.jpg`
- Referenced everywhere as the string `"/bau.jpg"` — no context, no abstraction needed
- Used in three places: OSEntry, About, Nav

---

## 2. OSEntry — login redesign

### Avatar

- Delete `BautistaAvatar` SVG component entirely
- Replace all usages with a circular `<img src="/bau.jpg">`:
  - `UserCard` for the admin user: 72px diameter circle, `object-fit: cover`, `object-position: center top`
  - `PasswordForm` small avatar (40px): same treatment

### UserCard — minimal dark card style

Current: bare button with avatar + name, no background.

New: each user wrapped in a styled card:

```
background: rgba(20, 24, 20, 0.85)
border: 1px solid rgba(196, 176, 144, 0.15)   // warm subtle — admin card
border: 1px solid rgba(30, 40, 32, 0.6)        // cool subtle — guest card
border-radius: 8px
padding: 1.5rem 1rem
display: flex / flex-direction: column / align-items: center / gap: 0.75rem
```

Card anatomy (top to bottom):
1. Avatar (72px circle) — photo for admin, generic SVG for guest
2. Name — `font-family: var(--font-serif)`, 0.85rem, `color: var(--text-primary)`
3. Role badge — `font-family: var(--font-mono)`, 0.55rem, letter-spacing 0.1em
   - Admin: color `var(--accent-teal)`, border `rgba(61,107,98,0.4)`
   - Guest: color `var(--text-secondary)`, border `rgba(30,40,32,0.6)`

Hover: `y: -4, scale: 1.02` (Framer Motion), border brightens slightly via inline style `onMouseEnter/Leave`

The `delay` prop on `UserCard` is unused in the current implementation — remove it.

---

## 3. About page — photo placeholder

The right column of the hero section currently shows a `[ photo ]` placeholder div (340x440).

Replace its contents with:
```jsx
<img
  src="/bau.jpg"
  style={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    borderRadius: 2,
    filter: 'sepia(0.08) contrast(1.02)',  // subtle analog feel
    display: 'block',
  }}
/>
```

The outer container (`width: 340, height: 440, border, borderRadius: 2`) keeps its sizing and border. Remove the existing `display: flex / alignItems / justifyContent` and add `overflow: hidden` so the image fills it cleanly and the border-radius clips it.

---

## 4. Nav — avatar + context menu

### Replace admin button

Current: `<span onClick={() => navigate('/admin')}>admin</span>` shown when `isAdmin`.

New: circular avatar button (28px) shown when `isAdmin`.

```
width: 28px, height: 28px
border-radius: 50%
overflow: hidden
border: 1.5px solid rgba(196, 176, 144, 0.4)
box-shadow: 0 0 0 2px rgba(61, 107, 98, 0.2)
cursor: pointer
```

### Context menu

- State: `const [menuOpen, setMenuOpen] = useState(false)` — local to Nav
- Toggle on avatar click
- Close on click-outside via `useEffect` with a `mousedown` listener on `document`
- Positioned: `position: absolute, top: 36px, right: 0` relative to a wrapper div
- Animated with Framer Motion `AnimatePresence`: `initial={{ opacity: 0, y: -4 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, y: -4 }}`, duration 0.15

Menu styles:
```
background: rgba(14, 15, 18, 0.95)
border: 1px solid rgba(196, 176, 144, 0.15)
border-radius: 6px
padding: 0.4rem 0
min-width: 140px
backdrop-filter: blur(12px)
z-index: 200
```

Menu items:
1. `→ admin panel` — `color: var(--accent-warm)`, navigates to `/admin`, closes menu
2. Divider: `height: 0.5px, background: rgba(30, 40, 32, 0.8), margin: 0.3rem 0`
3. `× logout` — `color: var(--text-secondary)`, calls `logout()` then `navigate('/entry')`, closes menu

Item styles: `font-family: var(--font-mono)`, `font-size: 11px`, `padding: 0.4rem 0.8rem`, cursor pointer. Hover: color brightens (inline `onMouseEnter/Leave`).

The wrapper div around the avatar + menu needs `position: relative` and `z-index: 200`.

---

## Files touched

| File | Change |
|------|--------|
| `public/bau.jpg` | New — copy of photo asset |
| `src/pages/OSEntry.tsx` | Delete BautistaAvatar, redesign UserCard, update PasswordForm |
| `src/pages/About.tsx` | Replace photo placeholder with `<img>` |
| `src/components/Nav.tsx` | Replace admin button with avatar + dropdown menu |

---

## Out of scope

- No new context or shared state for the photo path
- No changes to AuthContext
- No changes to any other page
