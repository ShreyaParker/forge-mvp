import { GoogleGenAI, Type, Schema } from '@google/genai';
import { aiAnalysisSchema, prdSchema, technicalPlanSchema, tasksSchema } from '../schemas/aiAnalysis';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Helper to call Gemini structured outputs or fallback to rich mock data
async function generateStructuredWithGemini<T>(
  prompt: string,
  responseSchema?: Schema
): Promise<T> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      ...(responseSchema ? { responseSchema } : {}),
      temperature: 0.2,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return JSON.parse(text) as T;
}

export async function generateAiAnalysis(brief: string): Promise<any> {
  try {
    const prompt = `You are a Principal Product Architect and Brand Strategist.
Analyze the following client brief and generate comprehensive project intelligence including brand attributes, product specs, operational guardrails, and project complexity analysis.

CLIENT BRIEF:
"""
${brief}
"""

Output valid JSON strictly adhering to this structure:
{
  "brand": {
    "personality": ["string"],
    "colors": [{ "hex": "#hexcode", "role": "Primary/Accent/Background/Text", "source": "ai" }],
    "typography": ["string"],
    "visualStyle": "string",
    "tone": "string"
  },
  "product": {
    "objective": "string",
    "targetUsers": ["string"],
    "userJourneys": ["string"],
    "coreFeatures": ["string"],
    "successMetrics": ["string"]
  },
  "guardrails": {
    "always": ["string"],
    "never": ["string"]
  },
  "aiAnalysis": {
    "summary": "string",
    "modules": ["string"],
    "risks": ["string"],
    "clarificationQuestions": ["string"],
    "complexity": "Low" | "Medium" | "High"
  }
}`;

    const res = await generateStructuredWithGemini<any>(prompt);
    // Validate with zod
    const parsed = aiAnalysisSchema.safeParse(res);
    if (parsed.success) {
      return parsed.data;
    }
    console.warn('Gemini response did not pass zod validation:', parsed.error);
    return res;
  } catch (e: any) {
    console.info('[AI Service] Using rich mock fallback for AI Analysis (Reason:', e?.message || e, ')');
    return {
      brand: {
        personality: ['Innovative', 'Reliable', 'Modern'],
        colors: [
          { hex: '#0f172a', role: 'Primary', source: 'ai' },
          { hex: '#3b82f6', role: 'Accent', source: 'ai' },
        ],
        typography: ['Inter', 'Roboto Mono'],
        visualStyle: 'Clean, minimalist B2B SaaS',
        tone: 'Professional and authoritative',
      },
      product: {
        objective: 'Streamline the core workflows for the target industry.',
        targetUsers: ['Admin', 'Manager', 'End User'],
        userJourneys: [
          'Onboarding: User signs up and configures their workspace.',
          'Daily Ops: User logs in to view dashboard and act on alerts.',
        ],
        coreFeatures: ['Role-based access control', 'Real-time dashboard', 'Automated reporting'],
        successMetrics: ['Reduce onboarding time by 50%', 'Increase daily active users by 20%'],
      },
      guardrails: {
        always: ['Use accessibility best practices (WCAG 2.1 AA)', 'Ensure mobile responsiveness'],
        never: ['Use modals for complex forms', 'Auto-play media'],
      },
      aiAnalysis: {
        summary: 'This project aims to build a robust SaaS platform addressing key inefficiencies in current workflows. High potential but requires careful architecture.',
        modules: ['Authentication', 'Dashboard', 'Reporting Engine', 'Settings'],
        risks: ['Scope creep in reporting engine', 'Complex role hierarchies'],
        clarificationQuestions: ['Do we need to support legacy data import?', 'What are the specific third-party integrations required?'],
        complexity: 'Medium',
      },
    };
  }
}

export async function generatePrd(projectContext: any): Promise<any> {
  try {
    const prompt = `You are a Principal Product Manager.
Create a production-grade Product Requirements Document (PRD) markdown sections based on the following project context:
${JSON.stringify(projectContext, null, 2)}

Provide JSON matching:
{
  "sections": [
    {
      "title": "1. Executive Summary",
      "content": "detailed markdown content"
    },
    {
      "title": "2. User Personas",
      "content": "detailed markdown content"
    },
    {
      "title": "3. Functional Requirements",
      "content": "detailed markdown content"
    },
    {
      "title": "4. Non-Functional Requirements",
      "content": "detailed markdown content"
    },
    {
      "title": "5. Out of Scope",
      "content": "detailed markdown content"
    },
    {
      "title": "6. Milestones",
      "content": "detailed markdown content"
    }
  ]
}`;

    const res = await generateStructuredWithGemini<any>(prompt);
    const parsed = prdSchema.safeParse(res);
    if (parsed.success) {
      return parsed.data;
    }
    return res;
  } catch (e: any) {
    console.info('[AI Service] Using rich mock fallback for PRD (Reason:', e?.message || e, ')');
    return {
      sections: [
        { title: '1. Executive Summary', content: 'The product is a next-generation platform designed to optimize workflow management.' },
        { title: '2. User Personas', content: '**Admin:** Manages settings and permissions.\n**User:** Day-to-day operator.' },
        { title: '3. Functional Requirements', content: '- User Authentication (OAuth)\n- Dashboard with analytics\n- Data Export (CSV/PDF)' },
        { title: '4. Non-Functional Requirements', content: '- 99.9% Uptime\n- Page load < 2s\n- GDPR Compliance' },
        { title: '5. Out of Scope', content: '- Mobile Native App (React Native/iOS)\n- Machine Learning predictive analytics (Phase 2)' },
        { title: '6. Milestones', content: '1. Design Handoff - Week 2\n2. Alpha Release - Week 6\n3. Beta Launch - Week 10' },
      ],
    };
  }
}

export async function generateTechnicalPlan(projectContext: any): Promise<any> {
  try {
    const prompt = `You are a Principal Software Architect.
Produce a comprehensive Technical Architecture and Stack Recommendation for this project:
${JSON.stringify(projectContext, null, 2)}

Output JSON strictly adhering to:
{
  "frontend": { "recommendation": "string", "rationale": "string" },
  "backend": { "recommendation": "string", "rationale": "string" },
  "database": { "recommendation": "string", "rationale": "string" },
  "integrations": [
    { "name": "string", "rationale": "string" }
  ]
}`;

    const res = await generateStructuredWithGemini<any>(prompt);
    const parsed = technicalPlanSchema.safeParse(res);
    if (parsed.success) {
      return parsed.data;
    }
    return res;
  } catch (e: any) {
    console.info('[AI Service] Using rich mock fallback for Tech Plan (Reason:', e?.message || e, ')');
    return {
      frontend: { recommendation: 'Next.js 15 (App Router)', rationale: 'Provides excellent performance, SEO, and developer experience for React applications.' },
      backend: { recommendation: 'Next.js API Routes + Node.js', rationale: 'Simplifies infrastructure by co-locating backend logic with the frontend in a serverless environment.' },
      database: { recommendation: 'MongoDB via Mongoose', rationale: 'Flexible document schema fits the dynamic nature of project intelligence and rapid iteration.' },
      integrations: [
        { name: 'Stripe', rationale: 'Industry standard for subscription billing and invoicing.' },
        { name: 'SendGrid', rationale: 'Reliable transactional email delivery.' },
      ],
    };
  }
}

export async function generateTasks(prdContext: any): Promise<any> {
  try {
    const prompt = `You are a Technical Lead and Scrum Master.
Deconstruct the following PRD and architecture into an actionable execution task backlog:
${JSON.stringify(prdContext, null, 2)}

Return a JSON array of tasks strictly in this structure:
[
  {
    "id": "TASK-1",
    "epic": "Authentication | Core | Dashboard | Integrations",
    "title": "string",
    "ownerRole": "Frontend Eng | Backend Eng | Full Stack | DevOps",
    "priority": "High | Medium | Low",
    "estimateDays": number,
    "status": "Todo" | "In Progress" | "Done"
  }
]`;

    const res = await generateStructuredWithGemini<any>(prompt);
    const parsed = tasksSchema.safeParse(res);
    if (parsed.success) {
      return parsed.data;
    }
    return res;
  } catch (e: any) {
    console.info('[AI Service] Using rich mock fallback for Tasks (Reason:', e?.message || e, ')');
    return [
      { id: 'TASK-1', epic: 'Authentication', title: 'Implement JWT Auth', ownerRole: 'Backend Eng', priority: 'High', estimateDays: 3, status: 'Todo' },
      { id: 'TASK-2', epic: 'Authentication', title: 'Build Login UI', ownerRole: 'Frontend Eng', priority: 'High', estimateDays: 2, status: 'Todo' },
      { id: 'TASK-3', epic: 'Dashboard', title: 'Design DB Schema for Metrics', ownerRole: 'Backend Eng', priority: 'Medium', estimateDays: 1, status: 'Todo' },
      { id: 'TASK-4', epic: 'Dashboard', title: 'Implement Chart Components', ownerRole: 'Frontend Eng', priority: 'Medium', estimateDays: 4, status: 'Todo' },
    ];
  }
}
