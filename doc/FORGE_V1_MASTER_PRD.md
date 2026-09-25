# FORGE v1: COMPLETE AGENCY OPERATING SYSTEM & PROJECT INTELLIGENCE PRD

## 1. Product Summary
- **Product Name:** Forge
- **Tagline:** The AI-Powered Agency Operating System: From Client Vision to Git-Tracked Delivery.
- **Vision:** Unify Organization Intelligence (team skills, technology inventory, active API subscriptions) with Project Intelligence (multimodal briefs, brand DNA, grounded PRD/architecture) and Engineering Execution (feature-first task breakdown, team member assignments, delivery estimates, Git activity, and AI drift detection).

---

## 2. Technical Stack & Infrastructure
- **Framework:** Next.js 15+ (App Router, strict TypeScript, async params).
- **Theming:** `next-themes` supporting Dark, Light, and System modes with Tailwind CSS monochromatic zinc/slate styling.
- **Database:** MongoDB via Mongoose with multi-tenant workspace isolation.
- **AI Engine:** Google Gemini 2.5 Flash with resilient deterministic mock fallbacks.
- **Validation:** Zod schemas on all API boundaries and AI structures.
- **Icons:** `lucide-react`.

---

## 3. Core Architecture & Data Models

### 3.1 Organization Intelligence Layer (`models/Organization.ts`, `models/User.ts`, `models/Membership.ts`)
- **User:** Profiles with git identity and categorized skill proficiencies (`Beginner`, `Working`, `Proficient`, `Expert`).
- **Organization:** Multi-tenant workspace (`Agency` or `Individual`) with service offerings, categorized `techInventory` with production approval toggles, and `apiInventory` with active connection monitors.
- **Membership:** Decoupled role-based access control (`Owner`, `Admin`, `Project Manager`, `Strategist`, `Designer`, `Developer`, `AI Engineer`, `Viewer`) with granular permission flags.

### 3.2 Unified Project Model (`models/Project.ts`)
A single document tracking the complete lifecycle:
- `organizationId`: ObjectId reference ensuring multi-tenant data isolation.
- `basicInfo`: `{ name, clientName, description, website, targetPlatforms[] }`.
- `dna`: `{ competitors[], references: [{ name, url, notes }], persistentInstructions }`.
- `brand`: `{ personality[], colors: [{ hex, role, source: 'client' | 'ai' | 'human_edited' }], typography[], visualStyle, tone }`.
- `product`: `{ objective, targetUsers[], userJourneys[], coreFeatures[], successMetrics[] }`.
- `guardrails`: `{ always: [{ id, text, source }], never: [{ id, text, source }] }`.
- `technicalPlan`: `{ frontend, backend, database, auth, infrastructure }` where each layer tracks:
  - `recommendation`, `rationale`, `isApproved: boolean`, and `capabilityMatch: string` (detailing match with agency tech/skills).
  - `integrations: [{ name, rationale, isApproved: boolean }]`.
- `features`: Array of feature-first engineering modules:
  - `id`, `name`, `description`, `status: 'Planned' | 'In Development' | 'Testing' | 'Completed'`.
  - `tasks`: `[{ id, title, layer: 'Requirements' | 'Design' | 'Frontend' | 'Backend' | 'AI' | 'Testing' | 'Deployment', assignedUserId?: ObjectId, assignedRole: string, estimateDays: number, priority: 'Low' | 'Medium' | 'High', status: 'Todo' | 'In Progress' | 'Done' }]`.
- `deliveryEstimate`: `{ totalDays: number, allocatedTeamSize: number, estimatedWeeks: number, riskNotes: string[] }`.
- `gitIntegration`:
  - `connected: boolean`, `repoUrl: string`, `branch: string`.
  - `commits: [{ hash, message, author, timestamp, featureId }]`.
  - `pullRequests: [{ id, title, status: 'Open' | 'Merged' | 'Closed', author, url }]`.
  - `aiHealthAnalysis`: `{ driftScore: number, insights: string[], dormantFeatures: string[], lastAnalyzedAt: Date }`.
- `prd`: `{ sections: [{ title, content }] }`.
- `readinessScore`: Number (dynamically computed from completed intelligence blocks).
- `status`: `'Draft' | 'Analyzed' | 'Ready for Dev'`.

---

## 4. API Endpoints

1. **Workspace & Authentication:**
   - `GET /api/auth/session`: Active workspace, current user, permissions, and available orgs.
   - `POST /api/auth/session`: Switch active workspace cookie.
2. **Projects & Intake:**
   - `GET /api/projects`: List projects scoped to active organization with search, status, and sort filters.
   - `POST /api/projects`: Create project record with optional brief file intake parsing.
   - `GET /api/projects/[id]`: Project workspace retrieval with populated member names.
   - `PATCH /api/projects/[id]`: Granular updates (DNA, Guardrails, Tech Approvals, Feature Tasks, Assignees).
3. **Intelligence & Planning Engines:**
   - `POST /api/projects/[id]/analyze`: Synthesize brief, brand, guardrails, and project risks.
   - `POST /api/projects/[id]/technical-plan`: Ingest project requirements **plus** agency `techInventory`, `apiInventory`, and team `skills` to generate grounded architecture with capability match scores.
   - `POST /api/projects/[id]/prd`: Generate structured 6-section PRD.
   - `POST /api/projects/[id]/tasks`: Decompose PRD into feature-first structures across engineering layers.
4. **Execution, Git & Export:**
   - `POST /api/projects/[id]/git/analyze`: Compare Git commit history against planned features to compute drift score and dormant features.
   - `GET /api/projects/[id]/export`: Returns dynamic, formatted `PROJECT-SPEC.md` markdown file download.
   - `GET /api/projects/[id]/export/print`: Clean, printable HTML view formatted for client-facing PDF generation.

---

## 5. UI Requirements & Views

1. **Global App Header (`components/Navbar.tsx`):**
   - **Theme Switcher:** Clean Dark / Light / System dropdown or segmented toggle (`Sun`, `Moon`, `Monitor` icons).
   - **Workspace Switcher:** Display active org with `Agency` vs `Individual` badge and quick-switching modal.
   - **Navigation:** Scoped links to `Projects`, `Organization`, and `Agency Stack`.
2. **Dashboard Overview (`app/page.tsx`):**
   - Instant client-side search by project name or client name.
   - Status filters: `All`, `Draft`, `Analyzed`, `Ready for Dev`.
   - Sort dropdown: `Highest Readiness`, `Lowest Readiness`, `Recently Updated`.
   - Multimodal Brief Intake modal with drag-and-drop file upload (`.txt`, `.md`, `.json`, `.pdf` extract) parsing text directly into the brief textarea.
3. **Workspace View (`app/projects/[id]/page.tsx`):**
   - **Header:** Project title, client tag, readiness score progress ring, delivery estimate pill (`Est: 4.5 wks • 32 dev-days`), and action buttons:
     - `Export Specification` (downloads `PROJECT-SPEC.md`).
     - `Print / PDF View` (opens print-optimized specification view).
   - **Tab 1: Brand DNA & Guardrails:** Visual color chips with provenance badges (`CLIENT`, `AI RECOMMENDATION`, `HUMAN EDITED`), editable "Always" / "Never" cards, and Project DNA competitor/reference links.
   - **Tab 2: Product & PRD:** Accordions for target users, journeys, and full PRD generator with copy-to-clipboard support.
   - **Tab 3: Grounded Tech Architecture:** Stack cards showing agency capability match ratings, AI rationales grounded in team skills, and lead engineer approval toggles.
   - **Tab 4: Feature Execution Board:**
     - Accordion grouped by Features, broken down across engineering layers (`Requirements`, `Design`, `Frontend`, `Backend`, `AI`, `Testing`, `Deployment`).
     - Interactive task checkboxes, estimate day inputs, and an **Assignee Dropdown** populated dynamically from organization team members.
     - Live delivery estimation summary card calculating duration and risk factors.
   - **Tab 5: Git Activity & AI Drift:**
     - Repository connection metadata and commit history feed.
     - AI Health Monitor: Drift score percentage meter, actionable alignment insights, and dormant feature warnings.