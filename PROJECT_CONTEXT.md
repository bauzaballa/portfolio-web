# portfolio-web — Project Context

## What this is
Personal portfolio frontend for Bautista Zaballa (bauzaballa.com).
Fullstack developer with a Visual Communication Design background.
The site is currently in "coming soon" mode — only / is publicly accessible.
The full portfolio is accessible via a console command: "unlock portfolio"

## Design philosophy
The aesthetic is inspired by analog photography — specifically Kodak Portra 400,
Gold 200, and Vision 250D film stocks shot by the developer himself.
Dark mode primary (#0E0F12 background with green-tinted surfaces),
light mode secondary (#F2EDE4 warm paper tone).
Typography: serif (Georgia) for names and titles, monospace (JetBrains Mono) for
labels and metadata, sans-serif for body text.
Film grain applied via CSS body::before pseudo-element with SVG feTurbulence filter.

## Technical decisions

### No UI library on public pages
All public-facing components are hand-built. This was a deliberate choice to:
1. Demonstrate CSS and component design skills to recruiters
2. Maintain full control over the analog/editorial aesthetic
3. Avoid fighting a library's design system

shadcn/ui is used only in the /admin panel where speed matters over aesthetics.

### React 19 + Vite over Next.js
No SSR needed for a portfolio — all data is public and non-critical for SEO at this stage.
Vite gives faster dev experience and simpler deployment to Vercel.
React Router v7 handles routing client-side.

### Framer Motion for all transitions
Page transitions and entrance animations use Framer Motion consistently.
No CSS animation keyframes for component transitions — keeps animation logic in JS
where it can respond to state.

### CSS custom properties over Tailwind
The design system is token-based (--accent-teal, --text-secondary, etc.) and
changes with data-theme attribute. Tailwind's purging and JIT don't play well
with dynamic theming without extra configuration. Plain CSS variables are simpler here.

### Context architecture
Three contexts:
- ThemeContext: dark/light toggle, persists via data-theme on documentElement
- AuthContext: JWT token storage in localStorage, isAdmin flag
- PreviewContext: unlocks full portfolio via console command, persists in localStorage

### Component structure
src/components/
  Nav.tsx — global navigation with theme toggle, admin badge, active state
  ThemeToggle.tsx — isolated toggle component with custom CSS animation
  ConsoleDrawer.tsx — terminal-style API explorer, available on all pages
  ProjectRow.tsx — reusable project list item with participation bars
  ProtectedRoute.tsx — redirects to / if preview not unlocked and not admin

### The OS entry screen (/entry)
Inspired by macOS lock screen. Two users: Guest (navigates to /home) and Bautista
(triggers JWT login). Wrong password shows progressive funny messages.
Entrance/exit transitions use Framer Motion AnimatePresence.

### Console easter egg
A terminal drawer (ctrl+k) available on all pages lets visitors query the API directly.
Commands: get projects, get profile, get skills, get experience, unlock portfolio, status, help.
Doubles as a developer demo — showing the API is real and queryable.

### Participation bars
Each project shows percentage bars per area (frontend/backend/design).
Color coding: --accent-teal for team projects, --accent-warm for solo (100%).
This is an honest representation of contribution that differentiates this portfolio
from ones that just list technologies.

## Pages
/ — Coming soon with waitlist, likes counter, and console
/entry — OS-style login screen
/home — Hero, featured projects, about snippet, skills
/projects — Editorial numbered list with filters and participation bars
/projects/:slug — Full project detail with media, technical decisions, challenges
/experience — Vertical timeline with education section
/about — Bio, analog photo gallery placeholder
/contact — Direct links, no form
/admin — JWT-protected CRUD panel for all content

## Deployment
- Platform: Vercel
- Domain: bauzaballa.com (Cloudflare DNS)
- Environment: VITE_API_URL
- Only / is publicly accessible — all other routes require preview unlock or admin JWT

## Stack summary
React 19 · Vite · TypeScript · React Router v7 · Framer Motion ·
CSS Custom Properties · No UI library (public) · shadcn/ui (admin)
