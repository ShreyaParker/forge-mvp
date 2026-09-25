# Forge Masterplan & Execution Strategy

> **Status:** Active Roadmap  
> **Current Version:** Build 1 Complete (Human-in-the-Loop & Project DNA)  
> **Target Release:** Q4 2026 – Q1 2027  
> **Companion Document:** [doc/ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 1. Vision & Strategic Objectives

The strategic objective of Forge is to establish the industry-standard **AI Operating System for Agency Kickoffs**.

```
[ Unstructured Briefs & DNA ] ──► [ Forge Gemini Engine ] ──► [ Production Artifacts & Decisions ]
• Email threads                   • Brand Strategy & Tokens   • Complete 6-Section PRD
• Pitch Decks / PDFs              • Structured Guardrails     • 5-Layer System Architecture
• Meeting Transcripts             • Project DNA & Context     • Human Signed-Off Tech Stack
• Competitor & Style References   • Readiness Score Meter     • Linear / GitHub Ready Backlog
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

### Milestone 2: Agency Usability, Project DNA & Human-in-the-Loop (Status: Build 1 Complete ✅ / Phase In Progress 🚀)

#### 2.1 Project DNA & Market Context Ingestion (Status: 100% Complete ✅ — BUILD 1)
- **Problem:** AI prompts lack specific competitive positioning, benchmark references, and persistent agency rules.
- **Solution:** Added structured Project DNA to `models/Project.ts` and UI studio:
  - **Competitors:** Interactive tag pills with instant add/remove actions.
  - **Reference Benchmarks:** Link cards displaying target URLs, extracted clean domains (e.g., `aimeleondore.com`, `linear.app`), and architectural benchmark notes.
  - **Agency Directives & System Instructions:** Auto-saving persistent instructions textarea injected into all downstream prompt pipelines.

#### 2.2 Granular Provenance & Operational Guardrails (Status: 100% Complete ✅ — BUILD 1)
- **Problem:** Teams cannot distinguish between client-mandated constraints, AI-inferred suggestions, and human-edited rules.
- **Solution:**
  - Structured guardrail items with unique IDs and explicit provenance tags:
    - `CLIENT` (Slate badge)
    - `AI RECOMMENDATION` (Blue badge)
    - `HUMAN EDITED` (Emerald badge)
  - Interactive inputs to append custom "Always" and "Never" guardrails in real-time.
  - Delete triggers with instant optimistic UI removal and database sync via `PATCH /api/projects/:id`.

#### 2.3 Interactive Architecture Decision Cards & Sign-Offs (Status: 100% Complete ✅ — BUILD 1)
- **Problem:** Static text recommendations do not hold technical leads accountable for architectural decisions prior to engineering handoff.
- **Solution:**
  - Expanded technical plan into 5 core layers: **Frontend**, **Backend**, **Database**, **Authentication & Security**, and **Cloud Infrastructure & CDN**, plus **Third-Party Integrations**.
  - **Sign-Off Toggle:** "Approve Decision" / "Revoke Sign-Off" action button per layer with live visual progress bar (`X of 5 Layers Approved`).
  - **Inline ADR Override:** Ability for agency leads to edit recommendations and rationales directly if overriding AI proposals.
  - Clear visual states: `APPROVED` (green verification badge) vs `PENDING SIGN-OFF` (amber warning badge).

#### 2.4 Dev Execution Board Power Actions (Status: 100% Complete ✅ — BUILD 1)
- **Problem:** Teams need to insert missed engineering tasks, tweak day estimates, and adjust priorities on the fly.
- **Solution:**
  - "+ Add Task" button added to each Epic column header.
  - Global "Add Custom Task" modal with role assignments, priorities, and day estimates.
  - Inline edit mode for task titles, assigned roles, priority badges, and estimates.
  - Granular task deletion with instant backlog metric recalculation.

#### 2.5 One-Click Specification Export Package (MD / PDF) (Status: Next Up 🎯)
- **Problem:** Agencies need to share the extracted intelligence with external clients and non-technical stakeholders without granting direct database access.
- **Solution:** Add an "Export Specification" button in the project header.
- **Deliverables:**
  - Formatted Markdown file download containing all project sections (`PROJECT-SPEC.md`).
  - Printable/PDF-ready view with agency branding and clean page breaks.

#### 2.6 Dashboard Search, Filtering & Sorting (Status: Scheduled 🗓️)
- **Problem:** As project volume scales, finding specific client workspaces becomes slow.
- **Solution:** Add instant client-side full-text search across:
  - Project Title & Client Organization.
  - Brief keywords and target platforms.
- **Filter Pills:** `All`, `Draft`, `Analyzed`, `Ready for Dev`.
- **Sorting:** By Readiness Score (descending/ascending) and Last Updated.

#### 2.7 Multimodal Brief Intake (PDF & Slide Deck Upload) (Status: Scheduled 🗓️)
- **Problem:** Clients rarely type brief summaries directly into web forms; they attach 20-page RFP PDFs or pitch decks.
- **Solution:** Drag-and-drop file upload on `/projects/new` supporting `.pdf`, `.docx`, and `.txt`.
- **Engine:** Utilize Gemini's native document processing to extract requirements without manual transcription.

---

### Milestone 3: Ecosystem Sync & Enterprise Integrations (Upcoming 🔮)

#### 3.1 Linear & GitHub Projects Exporter
- Two-way or one-way synchronization pushing generated tasks directly into project management platforms:
  - Linear API integration creating issues with epics, estimates, and labels.
  - GitHub Issues / Projects sync with automated milestone assignment.

#### 3.2 Figma Design Token Export
- Export generated brand personality and color palettes into:
  - Figma Tokens JSON format.
  - Tailwind CSS custom palette theme extensions.

#### 3.3 Multi-Tenant Workspace & Authentication
- User authentication via Clerk or NextAuth.
- Team workspaces with role permissions:
  - `Admin`: Manage agency settings and API keys.
  - `Strategist`: Edit briefs, generate PRDs, tweak guardrails.
  - `Engineer`: View architecture, sign off decisions, update task statuses.
