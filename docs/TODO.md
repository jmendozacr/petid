# PetID - Pending Tasks

## Deploy
- [ ] Configure domain petid.app

## Database
- [x] Add `contact` column to `found_reports` table in Supabase
- [x] Update `useReportForm.ts` to include `contact` field in INSERT after column is added

## UX / Notifications
- [x] Replace `alert()` calls with toasts (e.g. sonner) in `dashboard/pets/[id]/page.tsx` (photo upload and delete errors)
- [x] Add skeleton loaders in dashboard and pet detail (currently only shows "Loading..." text)
- [x] Add optimistic updates for delete operations

## Testing
- [x] Add tests for hooks: `usePets`, `usePet`, `useHealthRecords`, `usePetForm`, `useAuth`, `useReportForm`
- [x] Add tests for services: `pets-service.ts`, `health-record-service.ts`
- [x] Add tests for Pet CRUD components

## Code Quality
- [x] Create reusable `EmptyState` component (dashboard and pet detail repeat the same pattern)
- [x] Create reusable `PhotoDisplay` component (pet photo with SVG fallback appears in 3 places)
- [x] Create `Select` component for `HealthRecordForm` (currently uses a raw `<select>` without a Label)
- [x] Add `Error Boundary` component to catch render errors
