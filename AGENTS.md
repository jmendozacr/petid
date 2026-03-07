# AGENTS.md - PetID Development Guidelines

This document provides guidelines for AI agents working on the PetID project.

## Project Overview

PetID is a Next.js web application for managing pet identity and health records with QR codes. The project uses:
- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **Testing**: Vitest + React Testing Library

---

## Commands

### Development
```bash
cd petid-app

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run all tests in watch mode
npm run test

# Run all tests once
npm run test:run
```

### Linting
```bash
npm run lint
```

---

## Code Style Guidelines

### TypeScript
- Use explicit types for function parameters and return types
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use the `type` keyword for importing types: `import type { Pet } from '@/types/pet'`

### Imports
- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Order imports: external → internal → relative
- Group: React imports → other external → internal (@/) → relative

```typescript
// Correct order
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { usePetStore } from '@/stores/pet-store'
import { Button } from '@/components/ui/button'
import type { Pet } from '@/types/pet'
import styles from './component.module.css'
```

### Naming Conventions
- **Components**: PascalCase (e.g., `PetCard`, `DashboardLayout`)
- **Files**: kebab-case (e.g., `pet-store.ts`, `health-record.ts`)
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Interfaces**: PascalCase with meaningful names

### React Components
- Use `'use client'` directive for client-side components
- Prefer function components with hooks over class components
- Extract reusable logic into custom hooks
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)

### Error Handling
- Use try-catch for async operations
- Display user-friendly error messages in UI
- Log errors appropriately for debugging

### Accessibility (A11y)
- Always include `alt` text for images
- Connect form labels to inputs using `htmlFor` and `id`
- Use ARIA attributes for dynamic content (`role="alert"`, `aria-live`)
- Ensure keyboard navigation works for all interactive elements

### TailwindCSS
- Use semantic color tokens from design system (`bg-primary`, `text-danger`, etc.)
- Use `focus-visible` for focus states instead of removing outline
- Prefer Tailwind's utility classes over custom CSS

---

## Project Structure

```
petid-app/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── dashboard/       # Protected dashboard routes
│   │   ├── login/           # Auth pages
│   │   └── ...
│   ├── components/
│   │   └── ui/              # Reusable UI components (Button, Card, Input)
│   ├── lib/
│   │   └── supabase/        # Supabase client (client.ts, server.ts)
│   ├── services/            # API/data services
│   ├── stores/              # Zustand stores
│   ├── test/                # Test setup and mocks
│   └── types/               # TypeScript type definitions
├── vitest.config.ts         # Test configuration
└── package.json
```

---

## Database (Supabase)

### Tables
- `profiles` - User profiles (linked to auth.users)
- `pets` - Pet records
- `health_records` - Health records (vaccines, allergies, medical notes)
- `found_reports` - Reports for lost/found pets

### RLS Policies
All tables have Row Level Security enabled. When adding new tables:
1. Enable RLS on the table
2. Create appropriate policies for authenticated users
3. Test that unauthorized access is blocked

---

## Testing Guidelines

### Writing Tests
- Place tests alongside source files with `.test.ts` or `.spec.ts` extension
- Use descriptive test names: `it('should add a pet to the store')`
- Test behavior, not implementation details
- Follow AAA pattern: Arrange → Act → Assert

### Running Tests
```bash
# Single test file
npx vitest run src/stores/pet-store.test.ts

# Single test
npx vitest run -t "should add a pet"
```

---

## Git Workflow

### Commit Messages
Use Conventional Commits format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `chore:` Maintenance

Example: `feat(pets): add delete pet functionality`

### Before Committing
1. Run `npm run build` to ensure no build errors
2. Run `npm run test:run` to ensure tests pass
3. Run `npm run lint` to check code style

---

## Common Issues

### Supabase Foreign Key Error
If you get "violates foreign key constraint", ensure the user profile exists in the `profiles` table before inserting related data.

### Environment Variables
Required in `petid-app/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Dependencies

Key packages:
- `@supabase/ssr`, `@supabase/supabase-js` - Supabase client
- `zustand` - State management
- `vitest`, `@testing-library/react` - Testing
- `tailwindcss` v4 - Styling
- `class-variance-authority` - Component variants

---

For questions about this document, refer to the project documentation in `/docs`.
