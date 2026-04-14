# portfolio-web
Frontend for Bautista Zaballa's personal portfolio.
## Stack
- React 19 + Vite + TypeScript
- React Router v7, Framer Motion
- No UI library -- custom design system
## Design tokens
--bg: #0E0F12 dark / #F2EDE4 light
--text-primary: #C8D4C0 dark / #1A1A1A light
--text-secondary: #7A8A78 dark / #4A3F32 light
--accent-warm: #C4B090 dark / #8B5E2A light
--accent-teal: #3D6B62
--border: #1E2820 dark / #D8D0C0 light
--font-serif: Georgia, serif
--font-mono: JetBrains Mono, monospace
## Routes
/ ComingSoon | /entry OSEntry | /home Home
/projects Projects | /projects/:slug ProjectDetail
/experience | /about | /contact | /admin
## Code rules
- TypeScript strict, no any, functional components only
- CSS custom properties only -- no Tailwind, no inline hex
- Framer Motion for transitions
- Never read the same file twice
- Never modify files outside current task scope
## Context
Analog photography aesthetic. Dark mode primary.
Serif for titles, mono for labels, sans for body.
Grain via CSS body::before.
