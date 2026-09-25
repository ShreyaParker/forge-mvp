# Forge — AI Project Intelligence Platform

> Transform unstructured client briefs into production-ready product specs, brand guidelines, technical architecture, and dev backlogs in seconds.

Built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, **MongoDB (Mongoose)**, and powered by **Google Gemini 2.5 Flash**.

---

## ✨ Features

- **Project Intake & Ingestion:** Input raw client briefs, websites, and targeted deployment platforms.
- **Gemini AI Intelligence Engine:**
  - **Brand Strategy:** Personality attributes, curated hex color palettes (with client vs AI tags), typography pairings, visual tone.
  - **Product Strategy:** User personas, user journeys, core features, and measurable success KPIs.
  - **Operational Guardrails:** Categorized "Always" and "Never" constraints for design and engineering teams.
  - **Dynamic PRD Generator:** 6-section production-grade Product Requirements Document formatted in GitHub markdown.
  - **Technical Architecture Planner:** Recommended frontend, backend, database, and 3rd-party integrations with architectural rationales.
  - **Dev Execution Board:** Epics, user stories, task assignments by engineering role, priority badges, day estimates, and interactive status tracking (`Todo` ➔ `In Progress` ➔ `Done`).
- **Real-Time Project Readiness Score:** Dynamic weighted completion score calculating when a project is genuinely ready for developer handoff.
- **Resilient Fallback Mode:** Seamless mock data fallback if keys are missing or offline, ensuring zero UI breakage.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org) + React 19
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) (Monochromatic Slate/Zinc theme with high-contrast accents)
- **Database:** [MongoDB](https://www.mongodb.com) with [Mongoose](https://mongoosejs.com)
- **AI Engine:** [Google Gemini 2.5 Flash](https://aistudio.google.com) via `@google/genai`
- **Validation:** [Zod](https://zod.dev)
- **Icons:** [Lucide React](https://lucide.dev)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB instance (Local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Google AI Studio API key ([Get one here](https://aistudio.google.com/))

### 2. Installation & Setup

Clone the repository:
```bash
git clone https://github.com/ShreyaParker/forge-mvp.git
cd forge-mvp
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Seed Sample Data (Optional)
To test the workspace immediately with high-fidelity sample projects:
```bash
npx tsx scripts/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT
