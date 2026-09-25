# FORGE v1 — PHASE A: MULTI-TENANT AGENCY FOUNDATION & GRANULAR RBAC

## 1. Objectives
- Establish a multi-tenant workspace architecture supporting two modes: `Agency` (collaborative team with role hierarchies) and `Individual` (streamlined single-operator workspace).
- Implement decoupled, granular permission-based Role-Based Access Control (RBAC) rather than hardcoded UI roles.
- Model the Organization Intelligence layer: Agency Profile, Team Member Skills, Approved Tech Stack, and Active API/Subscription Inventories.
- Refactor the existing `Project` schema to bind projects to an `organizationId` while maintaining zero regression across existing AI analysis, PRD, and Kanban routes.

---

## 2. Core Domain Models

### 2.1 User (`models/User.ts`)
- `name`: string
- `email`: string (unique, indexed)
- `avatarUrl`?: string
- `bio`?: string
- `skills`: `[{ name: string, level: 'Beginner' | 'Working' | 'Proficient' | 'Expert' }]`
- `gitIdentity`?: { username: string, provider: 'github' | 'gitlab' }
- `createdAt`: Date

### 2.2 Organization (`models/Organization.ts`)
- `name`: string
- `slug`: string (unique, indexed)
- `workspaceType`: `'Agency' | 'Individual'`
- `description`?: string
- `website`?: string
- `industry`?: string
- `teamSize`?: number
- `services`: string[]
- `specializations`: string[]
- `techInventory`: `[{`
    `name: string,`
    `category: 'Frontend' | 'Backend' | 'Database' | 'AI' | 'Cloud' | 'DevOps' | 'Design' | 'Other',`
    `approvedForProduction: boolean,`
    `notes?: string`
  `}]`
- `apiInventory`: `[{`
    `provider: string,`
    `service: string,`
    `status: 'Connected' | 'Available' | 'Not Connected' | 'Expiring',`
    `environment: 'Development' | 'Staging' | 'Production',`
    `notes?: string`
  `}]`
- `createdAt`: Date

### 2.3 Membership (`models/Membership.ts`)
Decouples users from organizations to support multi-workspace memberships:
- `userId`: ObjectId (ref: User, indexed)
- `organizationId`: ObjectId (ref: Organization, indexed)
- `role`: `'Owner' | 'Admin' | 'Project Manager' | 'Strategist' | 'Designer' | 'Developer' | 'AI Engineer' | 'Viewer'`
- `customPermissions`?: string[] (optional role overrides)
- `availability`: `'Available' | 'Partially Allocated' | 'Fully Booked'`
- `joinedAt`: Date

### 2.4 Project Refactor (`models/Project.ts`)
- Add `organizationId`: ObjectId (ref: Organization, indexed, required)
- Add `team`: `[{ userId: ObjectId, role: string, assignedAt: Date }]`
- Update task assignments to optionally link to a specific `userId` in addition to `ownerRole`.

---

## 3. RBAC & Permissions Engine (`lib/permissions.ts`)

Granular permission strings categorize all actions:
- `projects:create`, `projects:view`, `projects:edit`, `projects:delete`
- `briefs:edit`, `ai:generate`
- `prd:view`, `prd:edit`
- `technical:view`, `technical:edit`
- `tasks:create`, `tasks:assign`, `tasks:update`
- `team:view`, `team:manage`
- `tech:view`, `tech:manage`
- `integrations:view`, `integrations:manage`
- `git:view`, `git:manage`
- `settings:manage`

### Role-to-Permission Mapping Matrix
- **Owner**: All permissions.
- **Admin**: All permissions except workspace deletion/billing transfer.
- **Project Manager**: `projects:*`, `briefs:edit`, `prd:*`, `technical:view`, `tasks:*`, `team:view`, `git:view`.
- **Strategist**: `projects:view`, `briefs:edit`, `ai:generate`, `prd:*`, `team:view`.
- **Designer**: `projects:view`, `prd:view`, `tasks:update` (Design tasks), `team:view`.
- **Developer**: `projects:view`, `technical:*`, `tasks:update`, `git:*`, `team:view`.
- **AI Engineer**: `projects:view`, `ai:generate`, `technical:*`, `tasks:update`, `git:*`, `team:view`.
- **Viewer**: `projects:view`, `prd:view`, `technical:view`, `team:view`.

---

## 4. API Endpoints

### 4.1 Authentication & Session
- `POST /api/auth/session`: Get or switch active workspace context.
- Lightweight cookie-backed session identifier providing `userId` and active `organizationId`.

### 4.2 Organization & Team
- `GET /api/organizations`: List user's accessible workspaces.
- `POST /api/organizations`: Create new Agency or Individual workspace.
- `GET /api/organizations/[orgId]`: Organization overview, tech stack, and API inventories.
- `PATCH /api/organizations/[orgId]`: Update profile, tech stack inventory, and API inventories.
- `GET /api/organizations/[orgId]/members`: List members, skill tags, roles, and availability.
- `POST /api/organizations/[orgId]/members`: Add/invite member with assigned role and skill profile.

### 4.3 Multi-tenant Project Scoping
- Update `GET /api/projects` and `POST /api/projects` to scope queries strictly to `organizationId`.

---

## 5. UI Requirements & Views
1. **Global App Header / Workspace Switcher:**
   - Dropdown switcher showing the active organization (with an "Agency" or "Freelancer" badge) and quick-switch capabilities.
2. **Organization Intelligence Hub (`app/organization/page.tsx`):**
   - **Tab 1: Overview & Profile:** Core agency details, services, specializations, and team headcount.
   - **Tab 2: Team & Skills:** Member roster displaying role badges, skill tags with proficiency indicators (`Expert`, `Proficient`, `Working`), and current availability pills.
   - **Tab 3: Tech Inventory:** Category-grouped approved stack cards with toggles for production approval.
   - **Tab 4: API & Subscriptions:** Status monitor for LLM providers (Gemini, OpenAI), cloud services, and dev tools showing connectivity indicators.
3. **Scoped Projects Dashboard (`app/page.tsx`):**
   - Dashboard scoped to the active workspace.