# BUILD 1 IMPLEMENTATION PLAN: HUMAN-IN-THE-LOOP & PROJECT DNA

## 1. Objectives
- Expand `models/Project.ts` with explicit Project DNA fields: `competitors`, `references`, and `persistentInstructions`.
- Add explicit provenance indicators across the entire workspace (`client` | `ai` | `human_edited`).
- Enable granular editing, additions, and deletions across Guardrails, Brand, Product Intelligence, and Technical Architecture.
- Introduce technical decision sign-offs (`approvedByHuman: boolean`) to lock architecture choices prior to development handoff.

---

## 2. Schema Enhancements (`models/Project.ts`)

### 2.1 Project DNA Fields
Extend the root schema:
- `dna`:
  - `competitors`: `string[]`
  - `references`: `[{ name: string, url: string, notes?: string }]`
  - `persistentInstructions`: `string` (Global negative/positive styling or domain rules fed into every downstream AI prompt)

### 2.2 Provenance & Approval Enhancements
- `brand.colors`: Keep `{ hex: string, role: string, source: 'client' | 'ai' | 'human_edited' }`.
- `guardrails`: Update to structured objects:
  - `always`: `[{ id: string, text: string, source: 'client' | 'ai' | 'human_edited' }]`
  - `never`: `[{ id: string, text: string, source: 'client' | 'ai' | 'human_edited' }]`
- `technicalPlan`:
  - `frontend`: `{ recommendation: string, rationale: string, isApproved: boolean }`
  - `backend`: `{ recommendation: string, rationale: string, isApproved: boolean }`
  - `database`: `{ recommendation: string, rationale: string, isApproved: boolean }`
  - `auth`: `{ recommendation: string, rationale: string, isApproved: boolean }`
  - `infrastructure`: `{ recommendation: string, rationale: string, isApproved: boolean }`
  - `integrations`: `[{ name: string, rationale: string, isApproved: boolean }]`

---

## 3. API Updates

### 3.1 Workspace Mutations (`app/api/projects/[id]/route.ts`)
- Support granular `PATCH` operations targeting individual intelligence blocks:
  - `PATCH /api/projects/[id]` with sub-payloads:
    - `{ type: "DNA_UPDATE", data: { competitors, references, persistentInstructions } }`
    - `{ type: "GUARDRAILS_UPDATE", data: { always, never } }`
    - `{ type: "TECH_DECISION_TOGGLE", data: { layer: "frontend" | "backend" | "database" | "auth" | "infrastructure", isApproved: boolean, rationale?: string } }`
    - `{ type: "TASK_CREATE", data: { epic, title, ownerRole, priority, estimateDays } }`
    - `{ type: "TASK_UPDATE", data: { taskId, title, ownerRole, priority, estimateDays } }`
    - `{ type: "TASK_DELETE", data: { taskId } }`

---

## 4. UI / Workspace Interaction Updates

### 4.1 Tab 1: Brand & Guardrails (`app/projects/[id]/components/BrandGuardrailsTab.tsx`)
- **Guardrail Action Controls:**
  - Add inline inputs to append custom "Always" and "Never" guardrails tagged as `human_edited`.
  - Add delete buttons on existing chips.
  - Display distinct color-coded badges for provenance:
    - Slate Badge: `CLIENT`
    - Blue Badge: `AI INFERRED`
    - Emerald Badge: `APPROVED / HUMAN`

### 4.2 Tab 2: Product & DNA (`app/projects/[id]/components/ProductPrdTab.tsx`)
- **Project DNA Card:**
  - Collapsible drawer or persistent card containing:
    - Competitor chips (with add/delete actions).
    - Inspiration/Reference links (clickable external links + notes).
    - Persistent Agency Directives textarea (auto-saves on blur).

### 4.3 Tab 3: Tech Architecture Review (`app/projects/[id]/components/TechPlanTab.tsx`)
- Transform read-only cards into editable review blocks:
  - **Approval Toggle:** "Approve Decision" switch per layer.
  - **Inline Editing:** Ability to edit the recommendation and rationale directly if the lead engineer overrides the AI's suggestion.
  - Unapproved items display an amber warning status; approved items display a green verification badge.

### 4.4 Tab 4: Dev Execution Board (`app/projects/[id]/components/TasksTab.tsx`)
- **Task Management Modal/Bar:**
  - "Add Custom Task" button allowing engineers to insert missed engineering tasks into any Epic.
  - Inline edit support for task priority (`Low`, `Medium`, `High`), owner role, and day estimates.