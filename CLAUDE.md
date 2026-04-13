# portfolio-web

Frontend for Bautista Zaballa's personal portfolio.

## Stack
- React 19 + Vite + TypeScript
- React Router v7
- Framer Motion
- No UI library -- custom design system

## Design tokens (src/index.css)
--bg: #0E0F12 (dark) / #F2EDE4 (light)
--bg-surface: #141A18 (dark) / #EAE4D8 (light)
--text-primary: #C8D4C0 (dark) / #1A1A1A (light)
--text-secondary: #7A8A78 (dark) / #4A3F32 (light)
--accent-warm: #C4B090 (dark) / #8B5E2A (light)
--accent-teal: #3D6B62
--border: #1E2820 (dark) / #D8D0C0 (light)
--font-serif: Georgia, Times New Roman, serif
--font-mono: JetBrains Mono, Fira Code, monospace
--font-sans: system-ui, sans-serif

## Contexts
- ThemeContext: useTheme() -> { theme, toggle }
- AuthContext: useAuth() -> { token, login, logout, isAdmin }

## Routes
/ -- ComingSoon (current landing)
/entry -- OSEntry (OS-style login screen)
/home -- Home
/projects -- Projects list
/projects/:slug -- Project detail
/experience -- Timeline
/about -- About + photos
/contact -- Contact
/admin -- JWT-protected CRUD

## API
VITE_API_URL=http://localhost:3001
All endpoints: GET /api/v1/{resource}
Auth header: Authorization: Bearer {token}

## Code rules
- TypeScript strict mode
- No any types
- Functional components only
- CSS custom properties only -- no Tailwind, no inline hex colors
- Framer Motion for all page transitions
- Never read the same file twice
- Never modify files outside current task scope

## Context
Analog photography aesthetic. Dark mode primary, light mode secondary.
Serif for titles, mono for labels/metadata, sans for body.
Grain texture via CSS pseudo-element on body::before.
