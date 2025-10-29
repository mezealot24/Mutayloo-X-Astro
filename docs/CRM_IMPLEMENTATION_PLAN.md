# 🔮 Fortune Teller CRM Implementation Plan

> **Project**: Astrology Client Relationship Management System
> **Tech Stack**: Next.js 16 + TypeScript + PostgreSQL (Supabase) + ShadCN UI
> **Phase**: 1 - Core CRM Features

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Implementation Steps](#implementation-steps)
4. [File Structure](#file-structure)
5. [Technical Specifications](#technical-specifications)
6. [Security & Permissions](#security--permissions)

---

## 🎯 Overview

### System Purpose
CRM system for fortune tellers (astrologers) to manage client horoscope data across multiple astrology types:
- 🪔 Thai Astrology
- 🧧 Chinese Astrology
- 🔯 Vedic/Western Astrology
- 🃏 Tarot Readings

### Core Features (Phase 1)
1. **Input Side** - Data entry form for astrologers
2. **CRM Dashboard** - Search, filter, view client records
3. **Permission System** - Share clients between astrologers
4. **Multi-Astrology Support** - Dynamic forms per astrology type
5. **Tarot Session History** - Track multiple reading sessions

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
users (NextAuth)
  ↓
astrologers (1:1 with users)
  ↓
horoscope_clients (1:Many)
  ├── astrology_profiles (1:Many) - Thai/Chinese/Vedic/Western data
  ├── tarot_sessions (1:Many) - Reading history
  └── client_permissions (Many:Many) - Sharing between astrologers
```

### Table Definitions

#### 1. `astrologers`
Extension of user table for astrologer-specific data.

```sql
CREATE TABLE astrologers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specializations TEXT[], -- ['Thai', 'Chinese', 'Tarot', etc.]
  phone VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_astrologers_user_id ON astrologers(user_id);
CREATE INDEX idx_astrologers_email ON astrologers(email);
```

#### 2. `horoscope_clients`
Core client profile with birth information.

```sql
CREATE TABLE horoscope_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  gender VARCHAR(20), -- 'male', 'female', 'other', 'prefer_not_to_say'
  birth_date DATE NOT NULL,
  birth_time TIME, -- nullable if unknown
  birth_time_unknown BOOLEAN DEFAULT FALSE,
  birth_place VARCHAR(255),
  birth_latitude DECIMAL(10, 8),
  birth_longitude DECIMAL(11, 8),

  -- Contact info (private - only owner can see)
  phone VARCHAR(50),
  email VARCHAR(255),

  -- Astrology types this client has profiles for
  astrology_types TEXT[], -- ['Thai', 'Chinese', 'Vedic', 'Western', 'Tarot']

  -- Ownership & permissions
  owner_astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE, -- Allow all astrologers to view

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_reading_date TIMESTAMPTZ
);

CREATE INDEX idx_clients_owner ON horoscope_clients(owner_astrologer_id);
CREATE INDEX idx_clients_birth_date ON horoscope_clients(birth_date);
CREATE INDEX idx_clients_astrology_types ON horoscope_clients USING GIN(astrology_types);
CREATE INDEX idx_clients_name ON horoscope_clients(name);
```

#### 3. `astrology_profiles`
Stores astrology-specific data (Thai, Chinese, Vedic, Western).

```sql
CREATE TABLE astrology_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES horoscope_clients(id) ON DELETE CASCADE,
  astrology_type VARCHAR(50) NOT NULL, -- 'Thai', 'Chinese', 'Vedic', 'Western'

  -- Dynamic JSON data per astrology type
  profile_data JSONB NOT NULL,
  /*
    Thai: { lagna, rasi, planets: {...}, file_url }
    Chinese: { zodiac_year, element, yin_yang, four_pillars, file_url }
    Vedic: { ascendant, sun_sign, moon_sign, planets: {...}, file_url }
    Western: { sun_sign, moon_sign, ascendant, planets: {...}, file_url }
  */

  -- File attachment (chart image)
  chart_file_url TEXT,
  chart_file_name VARCHAR(255),

  -- Metadata
  created_by_astrologer_id UUID REFERENCES astrologers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_client ON astrology_profiles(client_id);
CREATE INDEX idx_profiles_type ON astrology_profiles(astrology_type);
CREATE INDEX idx_profiles_data ON astrology_profiles USING GIN(profile_data);
```

**Example `profile_data` structures:**

```json
// Thai Astrology
{
  "lagna": "Aries",
  "rasi": "Leo",
  "planets": {
    "sun": "Aries",
    "moon": "Taurus",
    "mars": "Gemini"
  },
  "notes": "Strong sun placement"
}

// Chinese Astrology
{
  "zodiac_year": "Dragon",
  "element": "Wood",
  "yin_yang": "Yang",
  "four_pillars": "甲辰年 丙寅月 戊午日 壬子時",
  "lucky_numbers": [3, 7, 9]
}
```

#### 4. `tarot_sessions`
Separate table for Tarot reading history (1 client can have many sessions).

```sql
CREATE TABLE tarot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES horoscope_clients(id) ON DELETE CASCADE,
  reader_astrologer_id UUID REFERENCES astrologers(id),

  -- Session details
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  question TEXT, -- What client asked
  topic VARCHAR(100), -- e.g., 'Love', 'Career', 'Health'

  -- Cards drawn
  cards_drawn JSONB, -- [{ name: 'The Fool', position: 'past', interpretation: '...' }]
  major_arcana TEXT[],
  minor_arcana TEXT[],

  -- Interpretation
  summary TEXT NOT NULL,
  detailed_interpretation TEXT,
  advice TEXT,

  -- Attachments
  cards_image_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tarot_client ON tarot_sessions(client_id);
CREATE INDEX idx_tarot_reader ON tarot_sessions(reader_astrologer_id);
CREATE INDEX idx_tarot_date ON tarot_sessions(session_date DESC);
```

#### 5. `client_permissions`
Permission sharing between astrologers.

```sql
CREATE TABLE client_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES horoscope_clients(id) ON DELETE CASCADE,
  shared_by_astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  shared_with_astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,

  -- Permission levels
  permission_level VARCHAR(20) DEFAULT 'view', -- 'view', 'edit', 'full'

  -- Restrictions
  can_view_contact_info BOOLEAN DEFAULT FALSE,
  can_view_tarot_sessions BOOLEAN DEFAULT TRUE,
  can_add_readings BOOLEAN DEFAULT FALSE,

  -- Metadata
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = no expiration

  UNIQUE(client_id, shared_with_astrologer_id)
);

CREATE INDEX idx_permissions_client ON client_permissions(client_id);
CREATE INDEX idx_permissions_shared_with ON client_permissions(shared_with_astrologer_id);
```

#### 6. `activity_logs` (Optional - for audit trail)

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES horoscope_clients(id) ON DELETE CASCADE,
  astrologer_id UUID REFERENCES astrologers(id),
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'viewed', 'shared', 'deleted'
  entity_type VARCHAR(50), -- 'client', 'profile', 'tarot_session', 'permission'
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_client ON activity_logs(client_id);
CREATE INDEX idx_logs_astrologer ON activity_logs(astrologer_id);
CREATE INDEX idx_logs_created ON activity_logs(created_at DESC);
```

---

## 🚀 Implementation Steps

### **Step 1: Database Setup** ✅ (Current)

#### 1.1 Create Migration Files
```bash
supabase/migrations/
├── 20250129_001_create_astrologers.sql
├── 20250129_002_create_horoscope_clients.sql
├── 20250129_003_create_astrology_profiles.sql
├── 20250129_004_create_tarot_sessions.sql
├── 20250129_005_create_client_permissions.sql
└── 20250129_006_create_activity_logs.sql
```

#### 1.2 Execute Migrations
- Option A: Via Supabase CLI `supabase db push`
- Option B: Direct SQL execution via postgres client

#### 1.3 Create Seed Data
```sql
-- Create test astrologer
-- Create test clients with various astrology types
-- Create sample tarot sessions
-- Create permission sharing examples
```

#### 1.4 Verification
- Check table creation
- Verify foreign key relationships
- Test JSONB queries
- Validate indexes

---

### **Step 2: TypeScript Definitions**

#### File: `app/lib/definitions-crm.ts`

```typescript
// Core Types
export type AstrologyType = 'Thai' | 'Chinese' | 'Vedic' | 'Western' | 'Tarot';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type PermissionLevel = 'view' | 'edit' | 'full';

export interface Astrologer {
  id: string;
  user_id: string;
  name: string;
  specializations: AstrologyType[];
  phone?: string;
  email: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface HoroscopeClient {
  id: string;
  name: string;
  nickname?: string;
  gender?: Gender;
  birth_date: Date;
  birth_time?: string;
  birth_time_unknown: boolean;
  birth_place?: string;
  birth_latitude?: number;
  birth_longitude?: number;
  phone?: string;
  email?: string;
  astrology_types: AstrologyType[];
  owner_astrologer_id: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  last_reading_date?: Date;
}

export interface AstrologyProfile {
  id: string;
  client_id: string;
  astrology_type: AstrologyType;
  profile_data: Record<string, any>;
  chart_file_url?: string;
  chart_file_name?: string;
  created_by_astrologer_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface TarotSession {
  id: string;
  client_id: string;
  reader_astrologer_id: string;
  session_date: Date;
  question?: string;
  topic?: string;
  cards_drawn: Array<{
    name: string;
    position: string;
    interpretation?: string;
  }>;
  major_arcana: string[];
  minor_arcana: string[];
  summary: string;
  detailed_interpretation?: string;
  advice?: string;
  cards_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClientPermission {
  id: string;
  client_id: string;
  shared_by_astrologer_id: string;
  shared_with_astrologer_id: string;
  permission_level: PermissionLevel;
  can_view_contact_info: boolean;
  can_view_tarot_sessions: boolean;
  can_add_readings: boolean;
  granted_at: Date;
  expires_at?: Date;
}

// Form State Types (for useActionState)
export interface ClientFormState {
  errors?: {
    name?: string[];
    birth_date?: string[];
    astrology_types?: string[];
  };
  message?: string;
}
```

---

### **Step 3: Data Layer Functions**

#### File: `app/lib/data-clients.ts`

Key functions to implement:
- `fetchClientById(id: string)`
- `fetchClientsByAstrologer(astrologerId: string, query?: string, page?: number)`
- `fetchSharedClients(astrologerId: string, query?: string, page?: number)`
- `fetchClientProfiles(clientId: string)`
- `fetchClientTarotSessions(clientId: string)`
- `canAccessClient(astrologerId: string, clientId: string)` - Permission check

#### File: `app/lib/data-astrology.ts`

- `fetchProfileByType(clientId: string, type: AstrologyType)`
- `fetchAllProfilesForClient(clientId: string)`

#### File: `app/lib/data-tarot.ts`

- `fetchTarotSessionById(id: string)`
- `fetchTarotSessionsByClient(clientId: string)`
- `fetchRecentSessions(astrologerId: string, limit?: number)`

---

### **Step 4: Server Actions**

#### File: `app/lib/actions-clients.ts`

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Validation schemas
const ClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birth_date: z.coerce.date(),
  birth_time: z.string().optional(),
  astrology_types: z.array(z.string()).min(1, 'Select at least one astrology type'),
  // ... other fields
});

export async function createClient(prevState: any, formData: FormData) {
  // Validation with Zod
  // SQL insert
  // revalidatePath + redirect
}

export async function updateClient(id: string, prevState: any, formData: FormData) {
  // Similar pattern
}

export async function deleteClient(id: string) {
  // Check permissions
  // Delete + revalidate
}
```

#### File: `app/lib/actions-astrology.ts`

- `createProfile(clientId, type, data)`
- `updateProfile(id, data)`
- `uploadChartImage(profileId, file)`

#### File: `app/lib/actions-tarot.ts`

- `createTarotSession(clientId, data)`
- `updateTarotSession(id, data)`

#### File: `app/lib/actions-permissions.ts`

- `shareClient(clientId, astrologerId, permissions)`
- `revokeAccess(permissionId)`
- `updatePermissions(permissionId, newPermissions)`

---

### **Step 5: Input Form UI** (Data Entry)

#### Route: `app/dashboard/clients/create/page.tsx`

Layout:
1. **General Info Section** (always visible)
   - Name, Nickname, Gender
   - Birth Date, Birth Time, Birth Place
   - Contact info (optional)
   - Permission toggle (is_public)

2. **Astrology Type Selector** (multi-select checkboxes)
   - Thai, Chinese, Vedic, Western, Tarot

3. **Dynamic Pop-down Panels** (conditional rendering)
   - Show/hide based on selected astrology types
   - Each panel has its own form section

#### Components to create:

```
app/ui/clients/
├── client-form.tsx (main form wrapper)
├── general-info-section.tsx
├── astrology-type-selector.tsx
├── panels/
│   ├── thai-astrology-panel.tsx
│   ├── chinese-astrology-panel.tsx
│   ├── vedic-western-panel.tsx
│   └── tarot-initial-session.tsx
├── file-upload.tsx (reusable for chart images)
└── form-buttons.tsx (Submit/Cancel)
```

#### Thai Astrology Panel Fields:
- Lagna (Ascendant) - Dropdown
- Rasi (Moon Sign) - Dropdown
- Planetary positions - Optional grid
- Upload chart image
- Notes field

#### Chinese Astrology Panel Fields:
- Chinese Zodiac Year - Dropdown
- Element - Dropdown (Wood, Fire, Earth, Metal, Water)
- Yin/Yang - Radio buttons
- Four Pillars - Text input (optional)
- Upload chart image

#### Vedic/Western Panel Fields:
- Ascendant/Lagna - Text input
- Sun Sign - Dropdown
- Moon Sign - Dropdown
- Planetary details - Textarea (optional)
- Upload chart

#### Tarot Initial Session:
- Question/Topic - Text input
- Cards drawn - Multi-select or JSON input
- Interpretation summary - Textarea
- Upload cards image

---

### **Step 6: CRM Dashboard**

#### Route: `app/dashboard/clients/page.tsx`

Features:
- **Search bar** (name, birth date, lagna, zodiac)
- **Filter panel**: Astrology type, Gender, Permission status
- **View toggle**: "My Clients" vs "Shared with Me"
- **Result table**: Name, Birth Date, Lagna/Zodiac, Astrology Types, Owner, Actions
- **Pagination**: 10 clients per page

#### Components:

```
app/ui/clients/
├── clients-table.tsx
├── client-search.tsx
├── client-filters.tsx
├── client-row.tsx
├── view-toggle.tsx (My Clients / Shared)
└── pagination.tsx (reuse existing)
```

#### Table Columns:
| Column | Description |
|--------|-------------|
| Avatar/Name | Client profile image + name |
| Birth Date | DD/MM/YYYY format |
| Lagna/Zodiac | Primary astrology marker |
| Types | Badges: Thai, Chinese, Tarot, etc. |
| Owner | Astrologer name (or "You") |
| Last Reading | Date of last session |
| Actions | View / Edit (if permitted) |

---

### **Step 7: Client Detail Page**

#### Route: `app/dashboard/clients/[id]/page.tsx`

Layout sections:
1. **Header**: Name, birth info, edit button (if owner)
2. **Tabs**: Overview | Astrology Profiles | Tarot History | Permissions
3. **Overview Tab**: Summary cards
4. **Astrology Profiles Tab**: Accordion for each type
5. **Tarot History Tab**: Timeline of sessions
6. **Permissions Tab**: List of shared astrologers

#### Components:

```
app/ui/clients/
├── client-detail-header.tsx
├── client-tabs.tsx
├── overview-cards.tsx
├── astrology-profile-accordion.tsx
├── tarot-timeline.tsx
├── permissions-list.tsx
└── share-client-modal.tsx
```

---

### **Step 8: Permission Management**

#### Modal: Share Client

Trigger: Button on client detail page

Fields:
- Astrologer search/select
- Permission level: View / Edit / Full
- Toggle: Allow view contact info
- Toggle: Allow add readings
- Expiration date (optional)

Action: `shareClient()` server action

---

### **Step 9: ShadCN UI Integration**

Install ShadCN components:

```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add tabs
npx shadcn@latest add accordion
npx shadcn@latest add calendar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add avatar
```

Use in forms and dashboard for consistent, accessible UI.

---

### **Step 10: File Upload (Supabase Storage)**

Setup:
1. Create bucket: `astrology-charts`
2. Configure RLS policies
3. Implement upload helper in `app/lib/storage.ts`

```typescript
export async function uploadChartImage(file: File, clientId: string, type: string) {
  const fileName = `${clientId}/${type}/${Date.now()}_${file.name}`;
  // Upload to Supabase Storage
  // Return public URL
}
```

---

## 📁 File Structure (Complete)

```
app/
├── dashboard/
│   ├── clients/
│   │   ├── page.tsx (List view)
│   │   ├── create/
│   │   │   └── page.tsx (Create form)
│   │   ├── [id]/
│   │   │   ├── page.tsx (Detail view)
│   │   │   ├── edit/
│   │   │   │   └── page.tsx (Edit form)
│   │   │   └── loading.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── tarot/
│   │   ├── page.tsx (All sessions)
│   │   └── [clientId]/
│   │       └── new/
│   │           └── page.tsx (New session form)
│   └── shared/
│       └── page.tsx (Shared clients dashboard)
├── lib/
│   ├── definitions-crm.ts
│   ├── data-clients.ts
│   ├── data-astrology.ts
│   ├── data-tarot.ts
│   ├── data-permissions.ts
│   ├── actions-clients.ts
│   ├── actions-astrology.ts
│   ├── actions-tarot.ts
│   ├── actions-permissions.ts
│   ├── storage.ts
│   └── permissions.ts (helper for access checks)
└── ui/
    ├── clients/
    │   ├── client-form.tsx
    │   ├── general-info-section.tsx
    │   ├── astrology-type-selector.tsx
    │   ├── clients-table.tsx
    │   ├── client-search.tsx
    │   ├── client-filters.tsx
    │   ├── client-detail-header.tsx
    │   ├── client-tabs.tsx
    │   ├── overview-cards.tsx
    │   ├── astrology-profile-accordion.tsx
    │   ├── tarot-timeline.tsx
    │   ├── permissions-list.tsx
    │   ├── share-client-modal.tsx
    │   ├── file-upload.tsx
    │   └── panels/
    │       ├── thai-astrology-panel.tsx
    │       ├── chinese-astrology-panel.tsx
    │       ├── vedic-western-panel.tsx
    │       └── tarot-session-panel.tsx
    └── shared/
        └── permission-badge.tsx

supabase/
├── migrations/
│   ├── 20250129_001_create_astrologers.sql
│   ├── 20250129_002_create_horoscope_clients.sql
│   ├── 20250129_003_create_astrology_profiles.sql
│   ├── 20250129_004_create_tarot_sessions.sql
│   ├── 20250129_005_create_client_permissions.sql
│   └── 20250129_006_create_activity_logs.sql
└── seed.sql

docs/
└── CRM_IMPLEMENTATION_PLAN.md (this file)
```

---

## 🔒 Security & Permissions

### Access Control Rules

1. **Client Ownership**
   - Owner has full access (view, edit, delete)
   - Contact info only visible to owner

2. **Shared Access**
   - Must have explicit permission record
   - Permission levels enforced in server actions
   - Contact info visibility controlled by `can_view_contact_info` flag

3. **Public Clients**
   - If `is_public = true`, all astrologers can view (read-only)
   - Cannot edit or add readings unless explicitly shared

4. **Tarot Sessions**
   - Session creator has full access
   - Client owner can view all sessions
   - Shared astrologers can view if `can_view_tarot_sessions = true`

### Implementation Pattern

```typescript
// In every server action
export async function updateClient(id: string, data: any) {
  const session = await auth(); // Get current user
  const astrologer = await getAstrologerByUserId(session.user.id);

  // Check permission
  const hasAccess = await canAccessClient(astrologer.id, id, 'edit');
  if (!hasAccess) {
    throw new Error('Unauthorized');
  }

  // Proceed with update
}
```

---

## 🧪 Testing Checklist

### Database
- [ ] All tables created successfully
- [ ] Foreign keys working
- [ ] JSONB queries functional
- [ ] Indexes improving query performance
- [ ] Seed data inserted

### Forms
- [ ] Client creation with all astrology types
- [ ] Validation errors display correctly
- [ ] File upload working
- [ ] Dynamic panels show/hide correctly
- [ ] Auto-save (if implemented)

### Dashboard
- [ ] Search returns correct results
- [ ] Filters work (astrology type, gender, owner)
- [ ] Pagination working
- [ ] Edit button only shows for permitted users
- [ ] Shared clients appear in correct view

### Permissions
- [ ] Owner can do everything
- [ ] Shared user respects permission level
- [ ] Public clients viewable by all
- [ ] Contact info hidden for non-owners
- [ ] Tarot sessions visible based on permission

### UI/UX
- [ ] Responsive on mobile
- [ ] Loading states appear
- [ ] Error boundaries catch errors
- [ ] ShadCN components styled correctly
- [ ] Accessible (keyboard navigation, ARIA labels)

---

## 📊 Success Metrics (Phase 1)

- [ ] Astrologer can create client with Thai + Chinese profiles in < 3 minutes
- [ ] Search returns results in < 500ms
- [ ] Dashboard loads 10 clients in < 1 second
- [ ] File upload completes in < 5 seconds
- [ ] Permission sharing takes < 30 seconds
- [ ] Zero permission bypass vulnerabilities
- [ ] Mobile responsive score > 90

---

## 🚦 Phase 2 Ideas (Future)

- Calendar integration for appointments
- Client portal (clients can view their own readings)
- Advanced analytics dashboard
- Compatibility matching between clients
- Bulk import/export (CSV)
- Email notifications for follow-ups
- Multi-language support (Thai/English)
- WhatsApp integration
- Payment tracking
- Report generation (PDF)

---

## 🛠️ Tech Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.0.1-canary |
| Language | TypeScript | 5.7.3 |
| Database | PostgreSQL (Supabase) | Latest |
| ORM/Query | `postgres` npm package | 3.4.6 |
| Auth | NextAuth | 5.0.0-beta.25 |
| UI Library | ShadCN UI + Tailwind CSS | Latest |
| Validation | Zod | 3.25.17 |
| Icons | HeroIcons | 2.2.0 |
| File Storage | Supabase Storage | - |
| Deployment | Vercel (recommended) | - |

---

## 📝 Notes

- All timestamps use `TIMESTAMPTZ` for timezone awareness
- JSONB columns allow flexible schema per astrology type
- PostgreSQL arrays (`TEXT[]`) enable multi-select without junction tables
- Server actions preferred over API routes for security
- RLS (Row Level Security) can be added later for defense-in-depth

---

**Created by**: Tukta AI Assistant 🤖
**Owner**: Q <siliconwarin@gmail.com>
**Last Updated**: 2025-01-29
