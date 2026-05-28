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

## Phase 17 — Completar flujos existentes

- [x] **Foto en reporte de mascota encontrada**: `found_reports.photo_url` existe en el schema pero el formulario `/p/[id]/report` no lo usa. Agregar upload de imagen opcional.
- [x] **Flujo de recuperación confirmada**: al marcar como encontrada, mostrar pantalla de cierre + notificar al usuario que reportó haberla visto (usando `found_reports.contact`).
- [ ] **Radio de alerta configurable**: el radio de 5km está hardcodeado en la Edge Function `notify-lost-pet`. Exponer configuración por usuario (1km / 5km / 10km) en settings.

## Phase 18 — Features de alto valor

- [ ] **Recordatorios de vacunas**: agregar campo `next_due_date` a `health_records` para tipo `vaccine`. Enviar email automático N días antes via Supabase cron o Edge Function.
- [ ] **Notificaciones push (web push / PWA)**: para alertas de mascota perdida, reemplazar o complementar email con push notifications. Mayor urgencia, menor latencia.
- [ ] **Compartir alerta en redes**: al marcar mascota como perdida, ofrecer botón de compartir en WhatsApp / X con foto + link público. Difusión orgánica sin costo.
- [ ] **Edad de la mascota visible**: calcular y mostrar la edad a partir de `birthdate` en la pet card y en la página pública.

## Phase 19 — Features de mayor escala

- [ ] **SMS via Twilio**: agregar canal SMS a la Edge Function `notify-lost-pet`. Paralelo a email, mayor tasa de apertura para emergencias.
- [ ] **Historial de ubicaciones**: guardar coordenadas históricas al actualizar `lost_lat/lost_lng` en lugar de sobrescribir. Permite mostrar área de búsqueda si hay múltiples reportes.
- [ ] **Tarjeta imprimible con QR**: generar PDF descargable con QR, foto y datos de contacto listos para imprimir y poner en collar o chapita.

---

## Harness Audit — Mejoras Pendientes

> Detectadas en revisión contra los standards de Harness (2026-05-24).
> Ordenadas por prioridad.

### 🔴 CRITICAL — violaciones de skills

- [x] **React Compiler**: habilitado en `next.config.ts` (`experimental.reactCompiler: true`)
- [x] **Eliminar `useCallback` en páginas**: `dashboard/pets/[id]/page.tsx`, `dashboard/pets/new/page.tsx`, `p/[id]/report/page.tsx`
- [x] **Eliminar `useCallback` en hooks**: `usePets.ts`, `useHealthRecords.ts`
- [x] **`HealthRecordType`**: reemplazado por `HEALTH_RECORD_TYPE` const object; tipo derivado con `(typeof ...)[keyof typeof ...]`
- [x] **`species` en `pet.ts`**: se mantiene `string | null` — es input libre, no enum (decisión deliberada)
- [x] **Full store subscription**: `usePetStore()` en `dashboard/pets/[id]/page.tsx` → `usePetStore((s) => s.updatePet)`

### 🟡 MEDIUM — arquitectura y calidad

- [x] **Resolver ambigüedad de `health-record-store`**: eliminados tipos huérfanos `HealthRecordState/Actions/Store`; health records son local state por decisión (no requieren store global)
- [x] **Cobertura de tests**: `@vitest/coverage-v8` instalado, thresholds 80% configurados en `vitest.config.ts`
- [x] **`usePets.ts`**: consolidadas 6 subscripciones separadas con `useShallow`
- [x] **Fix test roto**: `useAuth.test.ts` actualizado para reflejar el flujo de signup por metadata (se removió `updateProfile`)
- [x] **`/p/[id]` — ISR + metadata**: ya era Server Component; agregado `revalidate=60`, `generateMetadata` con OG/Twitter cards, y `React.cache` para deduplicar queries entre metadata y page
- [x] **Fix build**: `reactCompiler` movido a top-level en `next.config.ts` (Next.js 16 breaking change)
- [x] **Fix loop infinito**: `loadPets` movido dentro del `useEffect` en `usePets.ts`; tests actualizados

### 🔵 LOW — polish y accesibilidad

- [x] **`aria-hidden` en SVGs decorativos**: el SVG del `EmptyState` en dashboard necesita `aria-hidden="true"`
- [ ] **Tests E2E con Playwright**: cubrir el flujo crítico QR scan → ver pet → reportar encontrado
