# PetID — App Architecture

## Frontend

Framework — Next.js (App Router)

UI — TailwindCSS, shadcn/ui

Forms — React Hook Form

Validation — Zod

QR Generation — qrcode

State Management — Zustand

Notifications — Sonner (toasts)

Internationalization — next-intl (locales: `en`, `es`, default: `en`)

## Backend

Supabase

Services used:

- PostgreSQL database
- Authentication (email/password + Google OAuth)
- Storage (pet photos)

## Folder Structure

```
petid-app/src/
├── app/
│   ├── actions/
│   │   ├── set-locale.ts             # Server action — persists locale cookie
│   │   └── toggle-lost-pet-status.ts # Server action — marks pet as lost/found
│   ├── auth/callback/route.ts        # OAuth callback handler
│   ├── dashboard/
│   │   ├── layout.tsx                # Protected layout (auth guard)
│   │   ├── page.tsx                  # Pet list
│   │   ├── pets/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── delete/page.tsx
│   │   └── settings/page.tsx         # Owner profile + notification settings
│   ├── p/[id]/
│   │   ├── page.tsx                  # Public pet profile
│   │   └── report/page.tsx           # Found pet report form
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── manifest.ts
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── empty-state.tsx           # Reusable empty state pattern
│   │   ├── photo-display.tsx         # Pet photo with SVG fallback
│   │   └── mobile-menu.tsx
│   ├── pet/
│   │   ├── PetCard.tsx
│   │   ├── PetFormFields.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   └── lost-pet-toggle-button.tsx
│   ├── health-record/
│   │   ├── HealthRecordForm.tsx
│   │   └── HealthRecordItem.tsx
│   ├── qr-code.tsx
│   └── error-boundary.tsx
├── hooks/
│   ├── index.ts                      # Re-exports all hooks
│   ├── useAuth.ts
│   ├── usePets.ts
│   ├── usePet.ts
│   ├── usePetForm.ts
│   ├── useHealthRecords.ts
│   ├── useReportForm.ts
│   ├── useLostPetToggle.ts
│   └── useNotificationSettings.ts
├── stores/
│   ├── pet-store.ts                  # Zustand store for pets list
│   └── health-record-store.ts        # Zustand store for health records
├── services/
│   ├── pets-service.ts
│   ├── health-record-service.ts
│   ├── profile-service.ts
│   └── notification-settings-service.ts
├── types/
│   ├── pet.ts
│   ├── health-record.ts
│   └── profile.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   └── server.ts                 # Server-side Supabase client
│   ├── geolocation.ts                # Wrapper for browser Geolocation API
│   └── utils.ts
└── i18n/
    ├── config.ts                     # Locale list and default locale
    └── request.ts                    # next-intl request config
```

## Data Flow

```
React Components
    ↓
Custom Hooks (hooks/)
    ↓              ↓
Zustand Stores ←→ Services (Supabase calls)
                      ↓
                  Supabase (PostgreSQL + Auth + Storage)
```

- **Components** consume hooks only — never stores or services directly
- **Hooks** orchestrate between stores and services
- **Server Actions** (`app/actions/`) handle mutations that require server-side auth validation

## Database Schema

### profiles
- id (references auth.users)
- full_name
- phone
- notify_nearby_lost_pets (boolean)
- notification_lat / notification_lng
- notification_location_updated_at

### pets
- id, user_id, name, species, breed, birthdate, color, weight
- microchip_id, photo_url, owner_phone, emergency_contact
- is_lost (boolean), lost_since, lost_lat, lost_lng
- created_at

### health_records
- id, pet_id
- type (`'vaccine' | 'allergy' | 'medical_note'`)
- description, record_date

### found_reports
- id, pet_id, message, contact, photo_url, lat, lng, created_at

All tables use Row Level Security.

## Deployment

Frontend: Vercel

Backend: Supabase

Domain: petid.app
