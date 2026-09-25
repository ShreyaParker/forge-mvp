# Forge Masterplan & Execution Strategy

> **Status:** Active Roadmap  
> **Current Version:** Phase A Complete (Multi-Tenant Agency Foundation & Granular RBAC)  
> **Target Release:** Q4 2026 – Q1 2027  
> **Companion Document:** [doc/ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 1. Vision & Strategic Objectives

The strategic objective of Forge is to establish the industry-standard **AI Operating System for Agency Kickoffs**.

```
[ Multi-Tenant Agency Hub ] ──► [ Project DNA & AI Engine ] ──► [ Production Artifacts & Decisions ]
• Agency vs Individual Modes     • Brand Strategy & Tokens      • Complete 6-Section PRD
• Team Member Skills Roster      • Structured Guardrails        • 5-Layer System Architecture
• Approved Tech Inventory        • Competitor & Reference DNA   • Human Signed-Off Tech Stack
• API & Subscription Monitor     • Persistent Agency Directives • Assigned Dev Execution Backlog
• Granular RBAC Access Control   • Live Readiness Score Meter   • Scoped Projects Pipeline
```

---

## 2. Milestone Breakdown

### Milestone 1: Core Foundation & MVP Engine (Status: 100% Complete ✅)
- [x] Next.js 15 App Router architecture with strict TypeScript and Tailwind CSS v4.
- [x] Resilient MongoDB Mongoose schema with connection caching for serverless environments.
- [x] Official `@google/genai` integration with Gemini 2.5 Flash.
- [x] Structured JSON schema parsing via Zod.
- [x] Four-tier AI intelligence generation:
  1. Brand Strategy & Guardrails
  2. Product Requirements Document (PRD)
  3. Technical Architecture Plan
  4. Granular Dev Task Breakdown
- [x] Interactive Dev Execution Board with Kanban status transitions (`Todo` ➔ `In Progress` ➔ `Done`).
- [x] Live 11-point mathematical Project Readiness Score (0–100%).
- [x] Zero-crash mock fallback layer for offline resilience.
- [x] Git repository configured, security check verified, and pushed to GitHub main.

---

### Milestone 2: Build 1 — Human-in-the-Loop Intelligence & Project DNA (Status: 100% Complete ✅)
- [x] **Project DNA & Context:**
  - Competitor landscape tracking with interactive tag pills (add/remove).
  - Architecture & style reference links with automatic clean domain extraction (`linear.app`, `aimeleondore.com`).
  - Auto-saving persistent instructions / agency directives injected into downstream prompts.
- [x] **Granular Provenance & Guardrails:**
  - Structured `always` and `never` items with unique IDs.
  - Visual provenance badges: `CLIENT` (Slate), `AI RECOMMENDATION` (Blue), `HUMAN EDITED` (Emerald).
  - Interactive additions and deletions with instant database synchronization.
- [x] **5-Layer Architecture Sign-Offs & ADR Overrides:**
  - 5 core decision cards (Frontend, Backend, Database, Auth, Infrastructure) plus integrations.
  - "Approve Decision" / "Revoke Sign-Off" action button per layer with live visual progress bar.
  - Inline "Edit Decision" mode for technical leads to override recommendations and rationales.
  - Status badges: `APPROVED` (Green) vs `PENDING SIGN-OFF` (Amber).
- [x] **Dev Execution Board Power Actions:**
  - "+ Add Task" button on each Epic column header.
  - Global "Add Custom Task" modal with role assignments, priorities, and estimates.
  - Inline editing for task titles, assigned roles, priority badges, and estimates.
  - Granular task deletion with instant backlog metric recalculation.

---

### Milestone 3: Phase A — Multi-Tenant Agency Foundation & Granular RBAC (Status: 100% Complete ✅)
- [x] **Multi-Tenant Workspace Models:**
  - `User`: Member profiles, skill proficiencies (`Expert`, `Proficient`, `Working`), and git identities.
  - `Organization`: Dual workspace modes (`Agency` team vs `Individual` single-operator), services, specializations, approved tech inventory, and live API inventory.
  - `Membership`: Decoupled multi-workspace memberships with assigned roles, custom permissions, and availability (`Available`, `Partially Allocated`, `Fully Booked`).
  - `Project` Refactor: Scoped to `organizationId`, team allocations, and task member assignments.
- [x] **Granular RBAC & Permissions Engine (`lib/permissions.ts`):**
  - 14 granular permissions across projects, briefs, AI generation, PRDs, architecture, tasks, team, tech stack, integrations, and git.
  - Role-to-permission mapping matrix for 8 roles (`Owner`, `Admin`, `Project Manager`, `Strategist`, `Designer`, `Developer`, `AI Engineer`, `Viewer`).
- [x] **Session Context & Workspace Switcher:**
  - Cookie-backed session identifier providing user context and active `organizationId`.
  - Global header `WorkspaceSwitcher` dropdown with `AGENCY` / `INDIVIDUAL` badges and instant switching.
- [x] **Organization Intelligence Hub (`app/organization/page.tsx`):**
  - **Tab 1: Overview & Profile:** Core agency details, services, specializations, website, and headcount.
  - **Tab 2: Team & Skills:** Team roster displaying role badges, skill proficiencies, and current availability pills.
  - **Tab 3: Tech Inventory:** Category-grouped approved stack cards with toggles for production approval.
  - **Tab 4: API & Subscriptions:** Status monitor for LLM providers (Gemini, OpenAI, Anthropic), cloud services, and dev tools.
- [x] **Multi-Tenant Scoped APIs & Dashboard:**
  - `GET /api/projects` and dashboard filtered strictly by active `organizationId`.
  - `POST /api/projects` bound to active workspace with permission check (`projects:create`).
  - Scoped project deletion via `DELETE /api/projects/:id` with `projects:delete` permission check.
- [x] **Multi-Tenant Seed Dataset:**
  - Seed script updated with 3 users, 2 organizations (`Parker Studio` & `Solo Lab`), memberships, and 3 scoped demo projects.

---

### Milestone 4: Phase B — Agency Power Tools (Status: In Progress 🚀)

#### 4.1 One-Click Specification Export Package (MD / PDF) (Status: Active 🎯)
- **Problem:** Agencies need to share the extracted intelligence with external clients and non-technical stakeholders without granting direct database access.
- **Solution:** Add an "Export Specification" button in the project header.
- **Deliverables:**
  - Formatted Markdown file download containing all project sections (`PROJECT-SPEC.md`).
  - Printable/PDF-ready view with agency branding and clean page breaks.

#### 4.2 Dashboard Search, Filtering & Sorting
- **Problem:** As project volume scales, finding specific client workspaces becomes slow.
- **Solution:** Add instant client-side full-text search across:
  - Project Title & Client Organization.
  - Brief keywords and target platforms.
- **Filter Pills:** `All`, `Draft`, `Analyzed`, `Ready for Dev`.
- **Sorting:** By Readiness Score (descending/ascending) and Last Updated.

#### 4.3 Multimodal Brief Intake (PDF & Slide Deck Upload)
- **Problem:** Clients rarely type brief summaries directly into web forms; they attach 20-page RFP PDFs or pitch decks.
- **Solution:** Drag-and-drop file upload on `/projects/new` supporting `.pdf`, `.docx`, and `.txt`.
- **Engine:** Utilize Gemini's native document processing to extract requirements without manual transcription.

---

### Milestone 5: Phase C — Ecosystem Sync & Enterprise Integrations (Upcoming 🔮)

#### 5.1 Linear & GitHub Projects Exporter
- Two-way or one-way synchronization pushing generated tasks directly into project management platforms:
  - Linear API integration creating issues with epics, estimates, and labels.
  - GitHub Issues / Projects sync with automated milestone assignment.

#### 5.2 Figma Design Token Export
- Export generated brand personality and color palettes into:
  - Figma Tokens JSON format.
  - Tailwind CSS custom palette theme extensions.

#### 5.3 External Authentication & Enterprise SSO
- Integration with Clerk / Auth.js / Okta SAML for enterprise SSO and team invites via email.
