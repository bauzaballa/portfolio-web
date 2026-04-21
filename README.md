<div align="center">

# portfolio-web

Frontend for [bauzaballa.com](https://bauzaballa.com)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

Personal portfolio for Bautista Zaballa — fullstack developer and visual communication designer. Bilingual (EN/ES), analog photography-inspired aesthetic, deployed on Vercel.

</div>

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Language | TypeScript 6 |
| Routing | React Router v7 |
| Animation | Framer Motion 12 |
| Styling | CSS Custom Properties (no Tailwind) |
| Admin UI | shadcn/ui (admin panel only) |

## Structure

```
src/
  main.tsx            entry point, context providers
  App.tsx             router + layout
  index.css           global styles, CSS variables, film grain
  pages/
    ComingSoon.tsx    public landing — waitlist + likes counter
    OSEntry.tsx       macOS lock screen-style login
    Home.tsx          featured projects, about snippet, skills
    Projects.tsx      editorial numbered list with filters
    ProjectDetail.tsx full project — media, decisions, challenges
    Experience.tsx    vertical timeline + education
    About.tsx         bio + photo gallery
    Contact.tsx       direct contact links
    Admin.tsx         JWT-protected CRUD
  components/
    Nav.tsx           global nav, theme + lang toggles
    LikeButton.tsx    visitor like counter
    ConsoleDrawer.tsx terminal-style API explorer (Ctrl+K)
    ProjectRow.tsx    project list item
    ParticipationBar.tsx  frontend/backend/design % bars
    ProtectedRoute.tsx    unlock or admin check
    ...               SkillChip, WaitlistInput, PageHeader, etc.
    admin/            shadcn/ui form wrappers for /admin
  context/
    ThemeContext.tsx   dark/light mode
    LangContext.tsx    EN/ES language
    AuthContext.tsx    JWT state, isAdmin flag
    PreviewContext.tsx portfolio unlock toggle
    ProfileContext.tsx profile data from API
    LikeContext.tsx    like state + visitor UUID
    ToastContext.tsx   notifications
    ConsoleContext.tsx terminal drawer state
  hooks/
    useApiData.ts     generic fetch with lang param + cache
    useBreakpoint.ts
```

## Pages & Access

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Coming soon — waitlist + likes |
| `/entry` | Public | Login: Guest or Bautista (macOS-style) |
| `/home` | Unlocked | Featured projects, about, skills |
| `/projects` | Unlocked | Numbered list with participation bars |
| `/projects/:slug` | Unlocked | Full project detail |
| `/experience` | Unlocked | Work timeline + education |
| `/about` | Unlocked | Bio + photo gallery |
| `/contact` | Unlocked | Direct links |
| `/admin` | Admin JWT | Full CRUD for all content |

**Unlock flow:** `/` is public. Everything else redirects to `/` unless the portfolio is unlocked (stored in `localStorage`) or the user is an authenticated admin.

## Design System

The aesthetic references analog film photography — Kodak Portra 400, Gold 200, Vision 250D.

**Themes:**

| | Background | Accent |
|--|------------|--------|
| Dark | `#0E0F12` | `--accent-teal` |
| Light | `#F2EDE4` (warm paper) | `--accent-warm` |

**Typography:**
- Serif (Georgia) — names, titles
- Monospace (JetBrains Mono) — labels, metadata
- Sans-serif — body text

**Film grain:** `body::before` with SVG `feTurbulence` filter applied as a fixed overlay.

**No UI library on public pages** — all components are hand-built to demonstrate CSS and design skills. shadcn/ui is used only in the `/admin` panel for speed.

## Context Architecture

Contexts wrap the entire app in `main.tsx`. Load order matters — some contexts depend on others (e.g. `ProfileContext` reads from `LangContext`).

```
ThemeContext
LangContext
AuthContext
PreviewContext
ProfileContext   ← fetches /api/v1/profile, re-fetches on lang change
LikeContext      ← manages visitor UUID + like state
ToastContext
ConsoleContext
```

## API Integration

Base URL comes from `VITE_API_URL`. All data fetching goes through `useApiData(path)` which appends `?lang=es|en` automatically.

**Visitor identification (likes):**
- UUID generated once via `crypto.randomUUID()`, stored in `localStorage` as `portfolio_visitor_id`
- Sent as `X-Visitor-Id` header on every request to `/api/v1/likes`
- One like per visitor, enforced server-side

**Authentication:**
- JWT stored in `localStorage`
- Set via cookie by the API on login
- `AuthContext` exposes `isAdmin` flag used by `ProtectedRoute`

## Features

**Console Easter Egg (Ctrl+K)**
Terminal-style drawer. Commands: `get projects`, `get profile`, `get skills`, `get experience`, `unlock portfolio`, `status`, `help`. Doubles as an API demo.

**Participation Bars**
Each project displays frontend%, backend%, and design% contribution. Color is `--accent-warm` for solo projects (100%), `--accent-teal` for team contributions.

**Bilingual Support**
`LangToggle` switches between EN/ES. Language state flows through `LangContext` to all fetches and display logic. API returns the appropriate field variant per language.

**macOS Login Screen**
`/entry` mimics a macOS lock screen. Two users: Guest (unlocks preview) and Bautista (triggers JWT login). Wrong password shows escalating error messages.

## Setup

```bash
cp .env.example .env
# set VITE_API_URL

npm install
npm run dev
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3001
```

## Scripts

```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc + vite build → dist/
npm run preview   # preview built output
npm run lint      # ESLint
```

## Deployment

- **Platform:** Vercel
- **Domain:** bauzaballa.com (Cloudflare DNS)
- **Build command:** `npm run build`
- **Output:** `dist/`
- Vercel config in `vercel.json`

## Related

- API: [portfolio-api](../portfolio-api) — Express 5 + PostgreSQL
- Live: [bauzaballa.com](https://bauzaballa.com)
