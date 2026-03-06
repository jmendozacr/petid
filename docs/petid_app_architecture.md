# PetID -- App Architecture

## Frontend

Framework - Next.js (App Router)

UI - TailwindCSS - shadcn/ui

Forms - React Hook Form

Validation - Zod

QR Generation - qrcode

## Backend

Supabase

Services used:

-   PostgreSQL database
-   Authentication
-   Storage (pet photos)

## Folder Structure

petid-app

/app /dashboard /pets /pets/new /pets/\[id\] /p/\[petId\]

/components PetCard PetForm QRCodeCard

/lib supabaseClient qrGenerator

/services petsService reportsService

/types pet.ts records.ts

## Data Flow

User → Next.js UI → Supabase Client → PostgreSQL

## Deployment

Frontend: Vercel

Backend: Supabase

Domain: petid.app
