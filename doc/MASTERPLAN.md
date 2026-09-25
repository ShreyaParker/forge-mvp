# Forge Masterplan & Execution Strategy

> **Status:** Active Roadmap  
> **Target Release:** Q4 2026 – Q1 2027  
> **Companion Document:** [doc/ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 1. Vision & Strategic Objectives

The strategic objective of Forge is to establish the industry-standard **AI Operating System for Agency Kickoffs**.

```
[ Unstructured Briefs ] ──► [ Forge Gemini Engine ] ──► [ Production Artifacts ]
• Email threads             • Brand Strategy            • Complete PRD
• Pitch Decks / PDFs        • Operational Guardrails    • System Architecture
• Meeting Transcripts       • Technical Architecture    • Linear / GitHub Backlog
                            • Readiness Score Meter     • Figma Design Tokens
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

### Milestone 2: Agency Usability & Power Tools (Status: In Progress 🚀)

#### 2.1 One-Click Specification Export Package (MD / PDF)
- **Problem:** Agencies need to share the extracted intelligence with external clients and non-technical stakeholders without granting direct database access.
- **Solution:** Add an "Export Specification" button in the project header.
- **Deliverables:**
  - Formatted Markdown file download containing all project sections.
  - Printable/PDF-ready view with agency branding and clean page breaks.

#### 2.2 Dashboard Search, Filtering & Sorting
- **Problem:** As project volume scales, finding specific client workspaces becomes slow.
- **Solution:** Add instant client-side full-text search across:
  - Project Title
  - Client Organization
  - Brief keywords
  - Target platforms
- **Filter Pills:** `All`, `Draft`, `Analyzed`, `Ready for Dev`.
- **Sorting:** By Readiness Score (descending/ascending) and Last Updated.

#### 2.3 Workspace Inline Editing & Human-in-the-Loop Refinements
- **Problem:** AI outputs provide a 90% solution, but agency leads often need to tweak a color hex, edit a guardrail, or adjust a task estimate before handoff.
- **Solution:** Add edit triggers across all workspace tabs:
  - Add/remove "Always" and "Never" guardrails.
  - Edit or add color tokens and typography specifications.
  - Insert new custom tasks or adjust estimates directly on the execution board.
  - Sync all edits through `PATCH /api/projects/:id`.

#### 2.4 Multimodal Brief Intake (PDF & Slide Deck Upload)
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
  - `Engineer`: View architecture, update task statuses.
