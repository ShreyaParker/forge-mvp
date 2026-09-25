# PRODUCT REQUIREMENTS DOCUMENT: FORGE MVP

## 1. Product Summary
- **Product Name:** Forge
- **Tagline:** From client vision to build-ready product.
- **Goal:** Transform unstructured client briefs and brand guidelines into persistent, structured Project Intelligence (Brand DNA, Product Models, Negative Guardrails, PRDs, Tech Recommendations, and Task Breakdowns) for digital agencies.

## 2. Technical Stack & Architecture
- **Framework:** Next.js 15+ (App Router, Server Components by default, Client Components only when interactive).
- **Language:** TypeScript (strict mode).
- **Styling & UI:** Tailwind CSS, zinc/slate monochromatic palette, Lucide React.
- **Database:** MongoDB via Mongoose.
- **Validation:** Zod schemas for all API payloads and AI outputs.
- **AI Integration:** OpenAI API with a resilient deterministic JSON fallback.

## 3. Data Models (`models/Project.ts`)
A single document encapsulates the entire project intelligence lifecycle:
- `basicInfo`: { name, clientName, description, website, targetPlatforms[] }
- `brand`: { personality[], colors: [{ hex, role, source: 'client' | 'ai' }], typography[], visualStyle, tone }
- `product`: { objective, targetUsers[], userJourneys[], coreFeatures[], successMetrics[] }
- `guardrails`: { always[], never[] }
- `aiAnalysis`: { summary, modules[], risks[], clarificationQuestions[], complexity: 'Low' | 'Medium' | 'High' }
- `prd`: { sections: [{ title, content }] }
- `technicalPlan`: { frontend: { recommendation, rationale }, backend: { recommendation, rationale }, database: { recommendation, rationale }, integrations: [{ name, rationale }] }
- `tasks`: [{ id, epic, title, ownerRole, priority, estimateDays, status: 'Todo' | 'In Progress' | 'Done' }]
- `readinessScore`: Number (calculated dynamically from filled intelligence blocks)
- `status`: 'Draft' | 'Analyzed' | 'Ready for Dev'

## 4. API Endpoints
- `GET /api/projects`: List all active projects.
- `POST /api/projects`: Create project record and initial brief.
- `GET /api/projects/[id]`: Retrieve single project workspace.
- `POST /api/projects/[id]/analyze`: Context builder -> AI Service -> Zod validation -> Update Project Document.
- `POST /api/projects/[id]/prd`: Generate structured 6-section PRD from stored Project Intelligence.
- `POST /api/projects/[id]/technical-plan`: Generate architecture recommendation with developer review flags.
- `POST /api/projects/[id]/tasks`: Decompose PRD into actionable engineering epics and tasks.
- `PATCH /api/projects/[id]/tasks`: Update individual task status (`Todo` -> `In Progress` -> `Done`).

## 5. UI Requirements & Screens
1. **Landing / Overview (`app/page.tsx`):** Minimal hero section introducing Forge and a 3-column grid displaying existing project cards.
2. **Project Creation Modal/Page (`app/projects/new/page.tsx`):** High-density form capturing client name, project name, website, target platforms, brand palette, and raw text brief.
3. **Workspace View (`app/projects/[id]/page.tsx`):**
   - **Header:** Project Name, Client Badge, Readiness Score Progress Ring, and Status Pill.
   - **Tab 1: Brand & Guardrails:** Visual color swatches distinguishing `CLIENT PROVIDED` from `AI RECOMMENDATION`. Green "Always" and red "Never" guardrail cards.
   - **Tab 2: Product & PRD:** Accordions for Target Users, Journeys, Specs, and generated PRD markdown with copy support.
   - **Tab 3: Tech Architecture:** Stack recommendations paired with rationales (Next.js, Node.js, MongoDB) and approval toggles.
   - **Tab 4: Dev Execution Board:** Task list grouped by Epics with interactive status toggles and dynamic progress percentage.