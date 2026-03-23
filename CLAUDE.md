# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands must be run from the `petid-app/` directory:

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once

# Run a single test file
npx vitest run src/stores/pet-store.test.ts

# Run a single test by name
npx vitest run -t "should add a pet"
```

## Architecture

**Data flow:** React Components → Custom Hooks → Zustand Stores ↔ Services → Supabase

**Layers:**
- `src/app/` — Next.js App Router pages. Protected routes under `dashboard/`, public pet pages under `p/[id]/`
- `src/components/ui/` — Primitive UI components (Button, Card, Input, Label)
- `src/components/pet/` and `src/components/health-record/` — Domain-specific components
- `src/hooks/` — Custom hooks that bridge components to stores and services. All hooks exported from `hooks/index.ts`
- `src/stores/` — Zustand stores for global state (`pet-store.ts`, `health-record-store.ts`)
- `src/services/` — Supabase data operations (`pets-service.ts`, `health-record-service.ts`)
- `src/types/` — TypeScript types shared across layers
- `src/lib/supabase/` — `client.ts` for browser, `server.ts` for server-side Supabase clients

**State pattern:** Hooks own the integration between Zustand stores and services. Components consume hooks, not stores or services directly.

## Database Schema (Supabase)

Tables: `profiles`, `pets`, `health_records`, `found_reports`

- `pets`: id, user_id, name, species, breed, birthdate, color, weight, microchip_id, photo_url, owner_phone, emergency_contact
- `health_records`: id, pet_id, type (`'vaccine' | 'allergy' | 'medical_note'`), description, record_date

All tables use Row Level Security. When adding tables, enable RLS and add policies for authenticated users.

**Common issue:** "violates foreign key constraint" → ensure the user profile exists in `profiles` before inserting related data.

## Environment Variables

Required in `petid-app/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Code Conventions

- Use `'use client'` directive for client-side components
- Use `@/` path alias for absolute imports (e.g., `@/types/pet`, `@/stores/pet-store`)
- Use `import type` for type-only imports
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use semantic TailwindCSS color tokens from the design system (`bg-primary`, `text-danger`, etc.)
- Tests go alongside source files as `*.test.ts` / `*.spec.ts`
- Commit messages follow Conventional Commits: `feat(pets): add delete functionality`

## Before Committing

```bash
npm run build && npm run test:run && npm run lint
```
