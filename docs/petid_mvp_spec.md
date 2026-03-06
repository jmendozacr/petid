
# PetID – Unified MVP Product Specification

This document merges the previous **PetID MVP Spec** and **Pet Health App MVP Plan**
into a single reference so that **any AI agent or developer can immediately understand
the product, goals, architecture, and MVP scope**.

---

# 1. Product Vision

PetID is a **digital identity and health record for pets**.

It allows pet owners to:

- Store all important pet information in one place
- Access medical information quickly during emergencies
- Share pet information instantly through a **QR code**
- Avoid losing vaccination cards or health documents

Each pet has:

• A **PetID profile**  
• A **public QR page**  
• A **private owner dashboard**

The QR code can be attached to the pet’s collar.  
When scanned, it opens a **public pet profile** containing essential information.

---

# 2. Problem

Pet owners commonly face problems such as:

- Losing the physical vaccination card
- Forgetting vaccine dates
- Not having medical information during emergencies
- Needing to share pet information with vets or pet hotels
- Managing multiple pets without organization

These issues create stress, inefficiency, and risk during emergencies.

---

# 3. Solution

A **simple web application (PWA)** where pet owners:

1. Create a pet profile
2. Store health and identity information
3. Generate a QR code
4. Attach the QR to the pet collar
5. Anyone scanning it can see essential public information

Private information remains accessible only to the owner.

---

# 4. Target Users

## Primary Users

- Pet owners with 1+ pets
- People who travel frequently
- Owners that leave pets in hotels or daycare
- Owners who want organized pet health data

## Secondary Users (Future)

- Veterinarians
- Pet hotels / pet sitters
- Animal shelters

---

# 5. Core Value Proposition

**"Your pet's health record in one place."**

Benefits:

- Centralized pet information
- Instant emergency access
- Shareable pet profile
- No more lost vaccination cards
- Better organization for multiple pets

---

# 6. MVP Features

The MVP should be **extremely simple**.

## Authentication

- Email login
- Magic link or password
- Owner account

## Pet Management

Owner can:

- Create pet profile
- Edit pet profile
- Delete pet profile
- View all pets

Pet fields:

- Name
- Photo
- Species (dog, cat, other)
- Breed
- Birthdate
- Weight
- Color
- Microchip ID
- Owner phone
- Emergency contact

---

## Health Records

Basic health tracking:

- Vaccines
- Allergies
- Medications
- Medical notes
- Vet contact

Fields:

- Record type
- Date
- Description
- File attachment (future)

---

## QR Code

Each pet automatically receives:

- Unique public URL
- QR code

Example:

petid.app/p/{petId}

The QR code opens the **public profile**.

---

# 7. Public Pet Profile

Accessible by scanning the QR.

Public fields:

- Pet name
- Photo
- Breed
- Color
- Allergies
- Emergency contact
- Owner phone

Optional:

- “If found please call” message

---

# 8. Private Owner Dashboard

Owner-only view with:

- Full pet profile
- Medical history
- Vaccines
- Medications
- Editing capabilities

---

# 9. Technical Architecture

Recommended **simple indie-dev architecture**.

## Frontend

Next.js (App Router)

Features:

- PWA support
- Mobile-first UI
- QR page rendering
- Dashboard UI

Libraries:

- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod

---

## Backend

Option A (fastest):

Supabase

Includes:

- PostgreSQL
- Auth
- Storage
- API

Option B:

Next.js API + PostgreSQL

---

## Database

Core tables:

### users

- id
- email
- created_at

### pets

- id
- user_id
- name
- species
- breed
- birthdate
- color
- weight
- microchip_id
- photo_url
- created_at

### health_records

- id
- pet_id
- type
- date
- description

---

# 10. URL Structure

Public profile:

/p/{petId}

Dashboard:

/dashboard

Pet details:

/dashboard/pets/{petId}

---

# 11. Monetization (Future)

Possible monetization:

Freemium model.

Free:

- 1–2 pets
- QR profile
- Basic records

Premium ($3–5/month):

- Unlimited pets
- File uploads
- Vaccine reminders
- Vet sharing
- Lost pet alerts

---

# 12. Future Features

After MVP validation:

- Vaccine reminders
- Lost pet alert system
- Vet accounts
- Pet hotel integration
- Health document uploads
- NFC pet tags
- Mobile app

---

# 13. MVP Development Plan

Week 1

- Project setup
- Database schema
- Auth

Week 2

- Pet CRUD
- Dashboard

Week 3

- Public pet page
- QR generation

Week 4

- Health records
- Basic UI polish
- Deploy

---

# 14. Deployment

Recommended stack:

Frontend:
Vercel

Backend / DB:
Supabase

Domain:

petid.app

---

# 15. Success Metrics

Measure early traction:

- Users created
- Pets registered
- QR scans
- Weekly active users

---

# 16. Guiding Principle

**Keep it extremely simple.**

The MVP goal is:

• Validate demand  
• Get real users  
• Iterate quickly

Not to build a perfect product.

---

End of Unified MVP Spec.
