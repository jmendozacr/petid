# PetID — Development Tasks

## Phase 1 — Project Setup
- [x] Initialize Next.js project
- [x] Configure TypeScript
- [x] Install TailwindCSS
- [x] Enable PWA (manifest.ts)
- [x] Setup Git repository

## Phase 2 — Backend
- [x] Create Supabase project
- [x] Configure authentication
- [x] Setup database tables
- [x] Configure storage bucket for pet images

## Phase 3 — Authentication
- [x] Login page
- [x] Signup page (with full_name and phone fields)
- [x] Protected dashboard routes
- [x] Google OAuth (via Supabase provider)
- [x] Auth callback route (`/auth/callback`)
- [x] Branded HTML email templates (signup confirmation, password reset)

## Phase 4 — Pet CRUD
- [x] Create pet form
- [x] Pet list dashboard
- [x] Edit pet
- [x] Delete pet (with confirmation modal)
- [x] Upload pet photo

## Phase 5 — Health Records
- [x] Add vaccine record
- [x] Add allergy record
- [x] Add medical note

## Phase 6 — QR Code
- [x] Generate QR code per pet
- [x] Display QR in dashboard

## Phase 7 — Public Pet Page

Route: `/p/[id]`

- [x] Photo, name, breed, color, allergies, emergency contact
- [x] Lost pet banner (shows when `is_lost = true`)

## Phase 8 — Found Pet Reports

Route: `/p/[id]/report`

- [x] Message field
- [x] Contact field
- [x] Optional location (geolocation)

## Phase 9 — UX / Quality
- [x] Toast notifications via Sonner (replaced all `alert()` calls)
- [x] Skeleton loaders in dashboard and pet detail
- [x] Optimistic updates for delete operations
- [x] Reusable `EmptyState` component
- [x] Reusable `PhotoDisplay` component
- [x] `Select` component for HealthRecordForm
- [x] `ErrorBoundary` component
- [x] Mobile menu

## Phase 10 — State Management
- [x] Zustand store for pets (`pet-store.ts`)
- [x] Custom hooks layer bridging components ↔ stores ↔ services
- [x] All hooks exported from `hooks/index.ts`

## Phase 11 — Lost Pet Feature
- [x] `is_lost`, `lost_since`, `lost_lat`, `lost_lng` columns on `pets`
- [x] `toggleLostPetStatus` server action (with ownership validation)
- [x] `LostPetToggleButton` component
- [x] `useLostPetToggle` hook
- [x] Geolocation capture on mark-as-lost (`lib/geolocation.ts`)

## Phase 12 — Notification Settings
- [x] `notify_nearby_lost_pets`, `notification_lat/lng` on `profiles`
- [x] `notification-settings-service.ts`
- [x] `useNotificationSettings` hook
- [x] Settings page UI with toggle + location capture

## Phase 13 — Owner Profile (Settings Page)

Route: `/dashboard/settings`

- [x] Edit full_name and phone
- [x] `profile-service.ts` (getProfile / updateProfile)
- [x] Profile pre-populated on signup via DB trigger

## Phase 14 — Internationalization
- [x] next-intl setup (locales: `en`, `es`, default: `en`)
- [x] `set-locale` server action (persists locale cookie)
- [x] Translation keys used across pages

## Phase 15 — Testing
- [x] Hooks: `usePets`, `usePet`, `useHealthRecords`, `usePetForm`, `useAuth`, `useReportForm`
- [x] Services: `pets-service.ts`, `health-record-service.ts`, `profile-service.ts`
- [x] Components: `PetCard`, `DeleteConfirmModal`, `LostPetToggleButton`
- [x] Server actions: `toggle-lost-pet-status`
- [x] Business invariants: `lost-pet-invariants.test.ts`
- [x] Auth callback route

## Phase 16 — Deploy
- [x] Deploy frontend to Vercel
- [x] Connect Supabase
- [ ] Configure domain petid.app
- [ ] Google OAuth credentials (Google Cloud Console + Supabase provider)
