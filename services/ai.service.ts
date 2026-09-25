import { GoogleGenAI, Schema } from '@google/genai';
import {
  aiAnalysisSchema,
  prdSchema,
  technicalPlanSchema,
  tasksSchema,
  featuresListSchema,
  gitDriftSchema,
} from '../schemas/aiAnalysis';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

async function generateStructuredWithGemini<T>(
  prompt: string,
  responseSchema?: Schema
): Promise<T> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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
    "always": [{ "id": "g-always-1", "text": "string", "source": "ai" }],
    "never": [{ "id": "g-never-1", "text": "string", "source": "ai" }]
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
          { hex: '#0f172a', role: 'Primary Dark', source: 'ai' },
          { hex: '#3b82f6', role: 'Accent Blue', source: 'ai' },
          { hex: '#f8fafc', role: 'Light Surface', source: 'ai' },
          { hex: '#10b981', role: 'Success Green', source: 'ai' },
        ],
        typography: ['Inter', 'Roboto Mono'],
        visualStyle: 'Clean, minimalist B2B SaaS with high data density',
        tone: 'Professional and authoritative',
      },
      product: {
        objective: 'Streamline the core workflows for the target industry and automate cross-team handoffs.',
        targetUsers: ['Admin', 'Manager', 'Technical Lead'],
        userJourneys: [
          'Onboarding: User signs up, configures their workspace, and invites team.',
          'Daily Ops: User logs in to view dashboard, monitor tasks, and action pipeline items.',
        ],
        coreFeatures: ['Role-based access control', 'Real-time telemetry dashboard', 'Automated spec export'],
        successMetrics: ['Reduce onboarding time by 50%', 'Increase daily operational velocity by 25%'],
      },
      guardrails: {
        always: [
          { id: 'g-always-1', text: 'Use accessibility best practices (WCAG 2.1 AA)', source: 'ai' },
          { id: 'g-always-2', text: 'Ensure mobile responsiveness and fast sub-second FCP', source: 'ai' },
          { id: 'g-always-3', text: 'Enforce strict schema validation on all API boundaries', source: 'ai' },
        ],
        never: [
          { id: 'g-never-1', text: 'Use intrusive popups or uncompressed asset bundles', source: 'ai' },
          { id: 'g-never-2', text: 'Store raw secrets or credentials in client bundles', source: 'ai' },
        ],
      },
      aiAnalysis: {
        summary: 'This project aims to build a robust SaaS platform addressing key inefficiencies in current workflows. High potential with clear technical milestones.',
        modules: ['Authentication & RBAC', 'Interactive Workspace', 'AI Analysis Engine', 'Git Pipeline Tracker'],
        risks: ['Scope creep in real-time sync', 'Multi-tenant authorization edge cases'],
        clarificationQuestions: ['What are the expected concurrent team users per tenant?', 'Are there specific compliance or air-gapped hosting requirements?'],
        complexity: 'High',
      },
    };
  }
}

export async function generatePrd(projectContext: any): Promise<any> {
  try {
    const prompt = `You are a Principal Product Manager.
Create a production-grade Product Requirements Document (PRD) markdown sections based on the following project context and project DNA directives:
${JSON.stringify(projectContext, null, 2)}

Provide JSON matching:
{
  "sections": [
    { "title": "1. Executive Summary", "content": "detailed markdown content" },
    { "title": "2. User Personas", "content": "detailed markdown content" },
    { "title": "3. Functional Requirements", "content": "detailed markdown content" },
    { "title": "4. Non-Functional Requirements", "content": "detailed markdown content" },
    { "title": "5. Out of Scope", "content": "detailed markdown content" },
    { "title": "6. Milestones", "content": "detailed markdown content" }
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
        {
          title: '1. Executive Summary',
          content: 'The product is a next-generation platform designed to optimize workflow management, structured brief intake, and engineering delivery for modern teams.',
        },
        {
          title: '2. User Personas',
          content: '### Primary Personas\n- **Agency Lead / Architect:** Establishes standards, approves architecture layers, and oversees team allocation.\n- **Staff Engineer:** Implements feature-first modules, connects Git commits, and manages deployment stability.\n- **Client Stakeholder:** Inspects readiness scores and reviews exported specifications.',
        },
        {
          title: '3. Functional Requirements',
          content: '- **Multimodal Intake:** Parse text, markdown, and document briefs directly into structured intelligence.\n- **Grounded Technical Decisions:** Match architecture choices against approved organization stack.\n- **Feature Execution Board:** Track tasks across Engineering layers with dynamic assignee linking.\n- **Git Health Monitoring:** Automated drift calculation between planned features and repository commits.',
        },
        {
          title: '4. Non-Functional Requirements',
          content: '- **Performance:** Page load under 1.2s; instantaneous client-side filter and search.\n- **Resilience:** Deterministic mock fallbacks for all AI endpoints.\n- **Security:** Granular RBAC, session cookie isolation, and input sanitization.',
        },
        {
          title: '5. Out of Scope',
          content: '- Native mobile applications for iOS/Android (Web responsive is primary).\n- Direct credit card processing within intake flows.',
        },
        {
          title: '6. Milestones',
          content: '1. **Sprint 1:** Architecture Approval & Brand Guardrails (Week 1)\n2. **Sprint 2:** Core Feature Engine & Layered Tasks (Weeks 2-3)\n3. **Sprint 3:** Git Integration, Drift Health & Client Spec Export (Weeks 4-5)',
        },
      ],
    };
  }
}

export async function generateTechnicalPlan(projectContext: any, orgContext?: any): Promise<any> {
  try {
    const prompt = `You are a Principal Software Architect.
Produce a comprehensive Technical Architecture and Stack Recommendation for this project.

IMPORTANT INSTRUCTION:
You MUST ground your stack recommendations in the Agency's approved technology inventory, active API subscriptions, and team skills provided in the organization context below:

AGENCY ORGANIZATION CONTEXT:
${JSON.stringify(orgContext || {}, null, 2)}

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}

For each layer, explain how the recommendation aligns with the agency's capabilities in the "capabilityMatch" field (e.g., "Direct match with Parker Studio approved stack (Next.js) & Shreya Parkar [Expert]").

Output JSON strictly adhering to:
{
  "frontend": { "recommendation": "string", "rationale": "string", "isApproved": false, "capabilityMatch": "string" },
  "backend": { "recommendation": "string", "rationale": "string", "isApproved": false, "capabilityMatch": "string" },
  "database": { "recommendation": "string", "rationale": "string", "isApproved": false, "capabilityMatch": "string" },
  "auth": { "recommendation": "string", "rationale": "string", "isApproved": false, "capabilityMatch": "string" },
  "infrastructure": { "recommendation": "string", "rationale": "string", "isApproved": false, "capabilityMatch": "string" },
  "integrations": [
    { "name": "string", "rationale": "string", "isApproved": false }
  ]
}`;

    const res = await generateStructuredWithGemini<any>(prompt);
    const parsed = technicalPlanSchema.safeParse(res);
    if (parsed.success) {
      return parsed.data;
    }
    return res;
  } catch (e: any) {
    console.info('[AI Service] Using rich mock fallback for Grounded Tech Plan (Reason:', e?.message || e, ')');
    const orgName = orgContext?.name || 'Parker Studio';
    return {
      frontend: {
        recommendation: 'Next.js 15 (App Router)',
        rationale: 'Server-side rendering, streaming, and edge caching critical for low-latency delivery and SEO.',
        isApproved: true,
        capabilityMatch: `Direct match with ${orgName} approved stack & Shreya Parkar [Expert: Next.js, React]`,
      },
      backend: {
        recommendation: 'Next.js Server Actions & Route Handlers',
        rationale: 'Co-located secure backend logic with type-safe server mutations and minimal operational overhead.',
        isApproved: true,
        capabilityMatch: `Direct match with ${orgName} approved runtime (Node.js) & Marcus Chen [Expert: TypeScript, Node.js]`,
      },
      database: {
        recommendation: 'MongoDB Atlas',
        rationale: 'Dynamic document schema natively models nested intelligence blocks, guardrails, and feature tasks.',
        isApproved: true,
        capabilityMatch: `Verified ${orgName} approved production database & active connected Atlas M10 cluster`,
      },
      auth: {
        recommendation: 'Auth.js (NextAuth v5)',
        rationale: 'Seamless OAuth integration and encrypted session cookies adhering to team security guardrails.',
        isApproved: false,
        capabilityMatch: `Standardized in ${orgName} B2B client blueprint library`,
      },
      infrastructure: {
        recommendation: 'Vercel Edge Network + Docker',
        rationale: 'Automated CI/CD deployments with edge asset distribution and containerized staging parity.',
        isApproved: true,
        capabilityMatch: `Direct match with ${orgName} production cloud provider (Vercel) & Marcus Chen [Expert: Docker]`,
      },
      integrations: [
        {
          name: 'Google Gemini 2.5 Flash',
          rationale: 'Connected LLM provider for grounded intelligence extraction and live Git drift analysis.',
          isApproved: true,
        },
        {
          name: 'Stripe API',
          rationale: 'Payment processing and client billing handoff.',
          isApproved: false,
        },
      ],
    };
  }
}

export async function generateFeaturesAndTasks(prdContext: any, orgContext?: any): Promise<any[]> {
  try {
    const prompt = `You are a Technical Lead and Scrum Master.
Deconstruct the following PRD and Architecture into 4 to 6 Feature-First modules.
Each Feature must contain 3 to 5 layered engineering tasks spanning:
'Requirements' | 'Design' | 'Frontend' | 'Backend' | 'AI' | 'Testing' | 'Deployment'.

AGENCY CONTEXT:
${JSON.stringify(orgContext || {}, null, 2)}

PRD CONTEXT:
${JSON.stringify(prdContext, null, 2)}

Output JSON as an array of features strictly matching:
[
  {
    "id": "feat-1",
    "name": "string",
    "description": "string",
    "status": "Planned",
    "tasks": [
      {
        "id": "task-1",
        "title": "string",
        "layer": "Requirements" | "Design" | "Frontend" | "Backend" | "AI" | "Testing" | "Deployment",
        "assignedRole": "string",
        "estimateDays": number,
        "priority": "High" | "Medium" | "Low",
        "status": "Todo"
      }
    ]
  }
]`;

    const res = await generateStructuredWithGemini<any>(prompt);
    const parsed = featuresListSchema.safeParse(res);
    if (parsed.success) {
      return parsed.data;
    }
    return res;
  } catch (e: any) {
    console.info('[AI Service] Using rich mock fallback for Features & Tasks (Reason:', e?.message || e, ')');
    return [
      {
        id: 'feat-1',
        name: 'Authentication & Session RBAC',
        description: 'Multi-tenant session cookie resolution and role-based permission validation.',
        status: 'In Development',
        tasks: [
          { id: 'task-1', title: 'Define Granular RBAC Permission Matrix', layer: 'Requirements', assignedRole: 'Strategist', estimateDays: 1, priority: 'High', status: 'Done' },
          { id: 'task-2', title: 'Implement Cookie-Backed Session Middleware', layer: 'Backend', assignedRole: 'Full Stack', estimateDays: 2, priority: 'High', status: 'In Progress' },
          { id: 'task-3', title: 'Build Workspace Switcher Dropdown Component', layer: 'Frontend', assignedRole: 'Frontend Eng', estimateDays: 2, priority: 'Medium', status: 'Done' },
        ],
      },
      {
        id: 'feat-2',
        name: 'Grounded Technical Architecture Engine',
        description: 'AI-assisted architecture generation matching agency stack capabilities.',
        status: 'Planned',
        tasks: [
          { id: 'task-4', title: 'Ground Gemini Prompts in Org Tech Inventory', layer: 'AI', assignedRole: 'AI Engineer', estimateDays: 2, priority: 'High', status: 'Todo' },
          { id: 'task-5', title: 'Interactive Stack Cards with Approval Toggles', layer: 'Frontend', assignedRole: 'Frontend Eng', estimateDays: 2, priority: 'Medium', status: 'Todo' },
          { id: 'task-6', title: 'Audit Trail for Lead Architect Approval', layer: 'Backend', assignedRole: 'Backend Eng', estimateDays: 1, priority: 'Low', status: 'Todo' },
        ],
      },
      {
        id: 'feat-3',
        name: 'Feature-First Execution Board',
        description: 'Interactive execution tasks grouped by feature with live delivery estimates.',
        status: 'Planned',
        tasks: [
          { id: 'task-7', title: 'Design Layer-Specific Badge Color System', layer: 'Design', assignedRole: 'Designer', estimateDays: 1, priority: 'Low', status: 'Done' },
          { id: 'task-8', title: 'Dynamic Team Assignee Dropdown Integration', layer: 'Frontend', assignedRole: 'Frontend Eng', estimateDays: 2, priority: 'High', status: 'Todo' },
          { id: 'task-9', title: 'Live Velocity & Risk Formula Computation', layer: 'Backend', assignedRole: 'Full Stack', estimateDays: 1, priority: 'High', status: 'Todo' },
        ],
      },
      {
        id: 'feat-4',
        name: 'Git Telemetry & AI Health Monitor',
        description: 'Track commit history and detect project drift against specifications.',
        status: 'Planned',
        tasks: [
          { id: 'task-10', title: 'Repository Commit Ingestion & Parsing', layer: 'Backend', assignedRole: 'Backend Eng', estimateDays: 3, priority: 'High', status: 'Todo' },
          { id: 'task-11', title: 'Gemini Drift Score Calculation & Insights Engine', layer: 'AI', assignedRole: 'AI Engineer', estimateDays: 2, priority: 'Medium', status: 'Todo' },
          { id: 'task-12', title: 'CI/CD Webhook Receiver on Edge Network', layer: 'Deployment', assignedRole: 'DevOps', estimateDays: 1, priority: 'Medium', status: 'Todo' },
        ],
      },
    ];
  }
}

export async function analyzeGitDrift(features: any[], commits: any[]): Promise<{
  driftScore: number;
  insights: string[];
  dormantFeatures: string[];
}> {
  try {
    const prompt = `You are a Principal Technical Lead and Code Auditor.
Analyze the alignment between the planned project features and actual Git commit activity:

PLANNED FEATURES:
${JSON.stringify(features || [], null, 2)}

RECENT GIT COMMITS:
${JSON.stringify(commits || [], null, 2)}

Calculate a drift score from 0% to 100% (100% means perfect alignment where commits map directly to planned features; low score indicates development has drifted from specification).
Identify any "dormantFeatures" that have received 0 relevant commits.
Provide exactly 3 actionable, concrete development insights for the engineering lead.

Output valid JSON:
{
  "driftScore": number,
  "insights": ["string", "string", "string"],
  "dormantFeatures": ["string"]
}`;

    const res = await generateStructuredWithGemini<any>(prompt);
    const parsed = gitDriftSchema.safeParse(res);
    if (parsed.success) {
      return parsed.data;
    }
    return res;
  } catch (e: any) {
    console.info('[AI Service] Using deterministic fallback for Git Drift Analysis (Reason:', e?.message || e, ')');

    // Deterministic drift calculation algorithm
    const totalFeatures = Array.isArray(features) ? features.length : 0;
    if (totalFeatures === 0 || !Array.isArray(commits) || commits.length === 0) {
      return {
        driftScore: 100,
        insights: [
          'Initial repository baseline established; waiting for continuous feature commits.',
          'Feature specification backlog is populated and ready for sprint assignment.',
          'Verify commit message format includes feature tags (e.g., "feat(auth): ...").',
        ],
        dormantFeatures: [],
      };
    }

    const featureNames = features.map(f => f.name.toLowerCase());
    const touchedFeatures = new Set<string>();

    for (const commit of commits) {
      const msg = (commit.message || '').toLowerCase();
      for (const name of featureNames) {
        const keywords = name.split(/\s+/).filter((w: string) => w.length > 3);
        if (keywords.some((k: string) => msg.includes(k))) {
          touchedFeatures.add(name);
        }
      }
    }

    const matchedCount = touchedFeatures.size;
    const coverageRatio = matchedCount / totalFeatures;
    const baseScore = Math.round(coverageRatio * 70 + (commits.length > 5 ? 25 : commits.length * 5));
    const driftScore = Math.min(100, Math.max(30, baseScore));

    const dormantFeatures = features
      .filter(f => !touchedFeatures.has(f.name.toLowerCase()))
      .map(f => f.name);

    const insights = [
      `Feature alignment tracking at ${driftScore}%. Active commit stream aligns with ${matchedCount} of ${totalFeatures} core features.`,
      dormantFeatures.length > 0
        ? `Attention needed on ${dormantFeatures.length} dormant module(s): "${dormantFeatures.slice(0, 2).join('", "')}" has no recent commit velocity.`
        : 'Zero dormant features detected; development workload is evenly distributed across planned architecture.',
      commits.length > 8
        ? 'High commit frequency indicates robust developer velocity on active sprint epics.'
        : 'Recommend increasing PR review frequency to maintain architectural guardrail compliance.',
    ];

    return {
      driftScore,
      insights,
      dormantFeatures,
    };
  }
}

export function extractBriefIntake(rawText: string): {
  name: string;
  clientName: string;
  description: string;
  targetPlatforms: string[];
} {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let name = '';
  let clientName = '';
  let description = rawText.trim();
  const targetPlatforms: string[] = [];

  // Heuristic extraction for common brief headers
  for (const line of lines) {
    if (/^project\s*(name|title)?\s*[:=-]/i.test(line)) {
      name = line.replace(/^project\s*(name|title)?\s*[:=-]\s*/i, '').trim();
    } else if (/^client\s*(name)?\s*[:=-]/i.test(line)) {
      clientName = line.replace(/^client\s*(name)?\s*[:=-]\s*/i, '').trim();
    }
  }

  // Detect platforms
  const lower = rawText.toLowerCase();
  if (lower.includes('ios') || lower.includes('iphone') || lower.includes('apple')) targetPlatforms.push('iOS');
  if (lower.includes('android')) targetPlatforms.push('Android');
  if (lower.includes('web') || lower.includes('browser') || lower.includes('saas') || lower.includes('portal')) targetPlatforms.push('Web');
  if (lower.includes('desktop') || lower.includes('macos') || lower.includes('windows')) targetPlatforms.push('Desktop');
  if (targetPlatforms.length === 0) targetPlatforms.push('Web');

  if (!name) {
    name = lines[0]?.replace(/^[#*-]\s*/, '').slice(0, 45) || 'New Project Intelligence';
  }
  if (!clientName) {
    clientName = 'Enterprise Client';
  }

  return {
    name,
    clientName,
    description,
    targetPlatforms,
  };
}
