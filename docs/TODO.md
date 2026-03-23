# PetID - Pending Tasks

## Deploy
- [ ] Configure domain petid.app

## Database
- [ ] Add `contact` column to `found_reports` table in Supabase
- [ ] Update `useReportForm.ts` to include `contact` field in INSERT after column is added

## UX / Notifications
- [ ] Replace `alert()` calls with toasts (e.g. sonner) in `dashboard/pets/[id]/page.tsx` (photo upload and delete errors)
- [ ] Add skeleton loaders in dashboard and pet detail (currently only shows "Loading..." text)
- [ ] Add optimistic updates for delete operations

## Testing
- [ ] Add tests for hooks: `usePets`, `usePet`, `useHealthRecords`, `usePetForm`, `useAuth`, `useReportForm`
- [ ] Add tests for services: `pets-service.ts`, `health-record-service.ts`
- [ ] Add tests for Pet CRUD components

## Code Quality
- [ ] Create reusable `EmptyState` component (dashboard and pet detail repeat the same pattern)
- [ ] Create reusable `PhotoDisplay` component (pet photo with SVG fallback appears in 3 places)
- [ ] Create `Select` component for `HealthRecordForm` (currently uses a raw `<select>` without a Label)
- [ ] Add `Error Boundary` component to catch render errors
