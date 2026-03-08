# PetID - Pending Tasks

## Database
- [x] Re-configure foreign key constraint between pets and profiles with proper trigger
- [x] Add trigger to auto-create profile when user signs up

## Testing
- [x] Set up unit testing framework (Vitest + React Testing Library)
- [x] Add tests for Zustand store
- [ ] Add tests for Pet CRUD components

## Phase 5 - Health Records
- [x] Add vaccine record
- [x] Add allergy record
- [x] Add medical note

## Phase 6 - QR Code
- [x] Generate QR code per pet
- [x] Store public URL
- [x] Display QR in dashboard

## Phase 7 - Public Pet Page
- [x] Create route /p/[petId]
- [x] Show pet photo, name, breed, allergies, emergency contact

## Phase 8 - Found Pet Reports
- [x] Create route /p/[petId]/report
- [x] Form with message, photo, location
- [x] Store report in database

## Phase 9 - Deploy
- [x] Deploy frontend to Vercel
- [x] Connect Supabase
- [ ] Configure domain petid.app
