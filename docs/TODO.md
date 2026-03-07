# PetID - Pending Tasks

## Database
- [ ] Re-configure foreign key constraint between pets and profiles with proper trigger
- [ ] Add trigger to auto-create profile when user signs up

## Testing
- [ ] Set up unit testing framework (Vitest + React Testing Library)
- [ ] Add tests for Zustand store
- [ ] Add tests for Pet CRUD components

## Phase 5 - Health Records
- [ ] Add vaccine record
- [ ] Add allergy record
- [ ] Add medical note

## Phase 6 - QR Code
- [ ] Generate QR code per pet
- [ ] Store public URL
- [ ] Display QR in dashboard

## Phase 7 - Public Pet Page
- [ ] Create route /p/[petId]
- [ ] Show pet photo, name, breed, allergies, emergency contact

## Phase 8 - Found Pet Reports
- [ ] Create route /p/[petId]/report
- [ ] Form with message, photo, location
- [ ] Store report in database

## Phase 9 - Deploy
- [ ] Deploy frontend to Vercel
- [ ] Connect Supabase
- [ ] Configure domain petid.app
