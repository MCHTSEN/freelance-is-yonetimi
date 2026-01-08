# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Freelance OS is an all-in-one dashboard for freelancers to manage clients, proposals, meetings, credentials, and finances. It features a dark-themed "Operating System" aesthetic.

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server on port 3000
npm run build  # Build for production
npm run preview # Preview production build
```

## Architecture

**Tech Stack:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (via CDN in index.html)
- Supabase (planned backend - env vars configured)

**Project Structure:**
```
/
├── App.tsx              # Main layout with sidebar navigation
├── index.tsx            # React entry point
├── index.html           # Tailwind config, fonts, custom styles
├── screens/             # Feature modules (each is a standalone view)
│   ├── SalesKanban.tsx
│   ├── CreateProposal.tsx
│   ├── MeetingNotes.tsx
│   ├── CustomerCredentials.tsx
│   ├── FinanceDashboard.tsx
│   └── CodeSnippets.tsx  # Not linked to nav yet
└── vite.config.ts       # Path alias @ → project root
```

**Navigation Pattern:**
- `App.tsx` uses a `Screen` enum with `useState` for routing
- Sidebar "NavItem" buttons switch between screen components
- No router library - simple conditional rendering

**Styling:**
- Tailwind loaded from CDN with custom theme in `index.html`
- Custom colors: `primary`, `background-dark`, `surface-dark`, `text-secondary`, `border-dark`
- Fonts: Inter (display), Fira Code (mono)
- Icons: Google Material Symbols

**Path Alias:**
- `@/` resolves to project root (configured in both vite.config.ts and tsconfig.json)

## Current State

The app is a UI shell with static/mock data. Key items from ROADMAP.md to implement:
- Supabase integration for persistence (env vars already in .env)
- Auth system
- Drag-and-drop Kanban (dnd-kit)
- Rich text editor (TipTap/Monaco)
- PDF export (react-pdf)

## Environment Variables

Use `VITE_` prefix for client-accessible env vars:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
