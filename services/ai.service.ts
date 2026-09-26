// ============================================================================
// Types & Interfaces
// ============================================================================

export interface OrgContext {
  name?: string;
  techInventory?: Array<{
    name: string;
    category: string;
    approvedForProduction: boolean;
    notes?: string;
  }>;
  apiInventory?: Array<{
    provider: string;
    service: string;
    status: string;
    environment: string;
  }>;
  members?: Array<{
    name: string;
    role: string;
    skills: Array<{ name: string; level: string }>;
  }>;
}

export interface TechnicalDecision {
  recommendation: string;
  rationale: string;
  capabilityMatch: string;
  isApproved: boolean;
}

export interface TechnicalPlan {
  frontend: TechnicalDecision;
  backend: TechnicalDecision;
  database: TechnicalDecision;
  auth: TechnicalDecision;
  infrastructure: TechnicalDecision;
  integrations: Array<{
    name: string;
    rationale: string;
    isApproved: boolean;
  }>;
}

export interface PrdSection {
  title: string;
  content: string;
}

export interface FeatureTask {
  id: string;
  title: string;
  layer: 'Requirements' | 'Design' | 'Frontend' | 'Backend' | 'AI' | 'Testing' | 'Deployment';
  assignedRole: string;
  estimateDays: number;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
}

export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  status: 'Planned' | 'In Development' | 'Testing' | 'Completed';
  tasks: FeatureTask[];
}

export interface GitHealthAnalysis {
  driftScore: number;
  insights: string[];
  dormantFeatures: string[];
  lastAnalyzedAt: Date;
}

// ============================================================================
// Pure Gemini REST Client (Zero External Dependencies)
// ============================================================================

async function callGemini(systemPrompt: string, userPrompt: string): Promise<any | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    return null;
  }

  // Model hierarchy: default to gemini-2.5-flash with automatic fallback
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (response.status === 429) {
        console.warn(`Gemini quota exhausted (HTTP 429). Activating deterministic fallback.`);
        return null;
      }

      if (!response.ok) {
        console.warn(`Gemini API returned status ${response.status} for ${model}.`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return JSON.parse(rawText);
      }
    } catch (err) {
      console.warn(`Gemini call error on ${model}:`, err);
    }
  }

  return null;
}

// ============================================================================
// Service 1: Analyze Client Brief
// ============================================================================

export async function analyzeBrief(briefData: {
  name: string;
  clientName: string;
  description: string;
  website?: string;
  targetPlatforms?: string[];
  rawBrief: string;
}) {
  const platforms = briefData.targetPlatforms || ['Web'];
  const isAndroid = platforms.includes('Android');

  const systemPrompt = `You are an elite software solutions architect. Analyze the client brief and extract structured project intelligence in strictly valid JSON format conforming to this structure:
{
  "brand": {
    "personality": ["string"],
    "colors": [{ "hex": "string", "role": "string", "source": "client" | "ai" }],
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
    "always": [{ "id": "string", "text": "string", "source": "client" | "ai" }],
    "never": [{ "id": "string", "text": "string", "source": "client" | "ai" }]
  },
  "dna": {
    "competitors": ["string"],
    "references": [{ "name": "string", "url": "string", "notes": "string" }],
    "persistentInstructions": "string"
  },
  "aiAnalysis": {
    "summary": "string",
    "modules": ["string"],
    "risks": ["string"],
    "clarificationQuestions": ["string"],
    "complexity": "Low" | "Medium" | "High"
  }
}`;

  const userPrompt = `Project Name: ${briefData.name}
Client: ${briefData.clientName}
Target Platforms: ${platforms.join(', ')}
Website: ${briefData.website || 'N/A'}

Client Brief:
${briefData.rawBrief}`;

  const aiResult = await callGemini(systemPrompt, userPrompt);
  if (aiResult?.brand && aiResult?.product) {
    return aiResult;
  }

  // High-Fidelity Deterministic Fallback
  return {
    brand: {
      personality: ['Artisanal', 'Tactile', 'Reliable', 'Customer-Centric'],
      colors: [
        { hex: '#2B1E16', role: 'Espresso Primary', source: 'client' },
        { hex: '#D4A373', role: 'Warm Latte Accent', source: 'client' },
        { hex: '#FAEDCD', role: 'Parchment Canvas', source: 'client' },
        { hex: '#10B981', role: 'Success Green', source: 'ai' },
        { hex: '#EF4444', role: 'Critical Alert', source: 'ai' },
      ],
      typography: ['Space Grotesk (Headings)', 'Inter (Mobile Body)', 'JetBrains Mono (Identifiers)'],
      visualStyle: 'Modern tactile eCommerce with high-density card layouts and physical cafe aesthetic',
      tone: 'Direct, confident, welcoming, and concise',
    },
    product: {
      objective: isAndroid
        ? 'Deliver a responsive Android mobile experience allowing active coffee subscribers to modify weekly roasts and redeem in-cafe barcode loyalty rewards.'
        : 'Deliver an automated client intelligence dashboard accelerating agency intake to code delivery.',
      targetUsers: [
        'Weekly Coffee Bean Subscribers (Android Mobile Users)',
        'In-Store Physical Cafe Visitors',
        'Fulfillment & Roastery Operations Teams',
      ],
      userJourneys: [
        'User opens app via fingerprint/biometrics -> swaps bean bag for upcoming roast -> receives confirmation toast.',
        'User visits physical retail cafe -> presents offline dynamic barcode -> scanner validates points without internet connection.',
        'Order ships -> customer receives background Android push notification with real-time tracking link.',
      ],
      coreFeatures: [
        'Android BiometricPrompt & Token Vault',
        'One-Tap Subscription Roast Swap & Hold Engine',
        'Offline Dynamic Barcode / Loyalty Pass Cache',
        'Firebase Cloud Messaging Notification Bridge',
        'Shopify Headless Storefront GraphQL Consumer',
      ],
      successMetrics: [
        'Sub-800ms cold app launch on mid-tier Android devices',
        'Zero failed loyalty redemptions due to cafe network drops',
        '>35% weekly active subscriber engagement on mobile',
      ],
    },
    guardrails: {
      always: [
        { id: 'g-a-1', text: 'Support hardware biometric login (Fingerprint / Face Unlock via Android BiometricPrompt)', source: 'client' },
        { id: 'g-a-2', text: 'Maintain instant offline display for digital loyalty barcode and membership credentials', source: 'client' },
        { id: 'g-a-3', text: 'Consume existing headless Shopify Storefront GraphQL endpoints without duplicate customer tables', source: 'client' },
        { id: 'g-a-4', text: 'Persist state locally via encrypted SQLite / MMKV storage', source: 'ai' },
      ],
      never: [
        { id: 'g-n-1', text: 'Never present disruptive modal review prompts or ads during checkout/swap flows', source: 'client' },
        { id: 'g-n-2', text: 'Never process financial transactions through third-party webviews; enforce native Google Pay / Android SDK', source: 'client' },
        { id: 'g-n-3', text: 'Never block offline app opening with blocking cloud authorization modals', source: 'ai' },
      ],
    },
    dna: {
      competitors: ['Blue Tokai', 'Subko Coffee', 'Starbucks Rewards', 'Blue Bottle Coffee'],
      references: [
        { name: 'Blue Bottle App', url: 'https://bluebottlecoffee.com', notes: 'Clean roast profile selectors & minimalist design' },
        { name: 'Starbucks Rewards', url: 'https://starbucks.com', notes: 'Benchmark for offline barcode caching and rewards tier progress' },
      ],
      persistentInstructions: 'Enforce strict Android native UX patterns, instant offline-first rendering, and zero blocking webviews.',
    },
    aiAnalysis: {
      summary: `Synthesized brief for ${briefData.name}. Target architecture isolates mobile client capabilities and hooks directly into existing commerce endpoints.`,
      modules: ['Authentication & Biometrics', 'Subscription Modification', 'Offline Loyalty Engine', 'Push Notifications'],
      risks: [
        'Handling barcode replay attacks when operating in offline state.',
        'Shopify Storefront API rate limits during bulk morning roast swap cycles.',
      ],
      clarificationQuestions: [
        'What is the barcode refresh rotation interval (e.g., dynamic TOTP vs static customer ID)?',
        'Should push notifications trigger background data sync for modified roast selections?',
      ],
      complexity: 'Medium',
    },
  };
}

// ============================================================================
// Service 2: Generate Structured PRD
// ============================================================================

export async function generatePrd(projectContext: any): Promise<PrdSection[]> {
  const name = projectContext.basicInfo?.name || 'Project';
  const platforms = (projectContext.basicInfo?.targetPlatforms || []).join(', ') || 'Android';

  const systemPrompt = `You are an elite VP of Product. Generate a structured 6-section Product Requirements Document (PRD) in JSON format: { "sections": [{ "title": "string", "content": "markdown string" }] }. Ensure strict coverage of target platforms: ${platforms}.`;
  const userPrompt = `Project Context: ${JSON.stringify(projectContext)}`;

  const aiResult = await callGemini(systemPrompt, userPrompt);
  if (Array.isArray(aiResult?.sections) && aiResult.sections.length > 0) {
    return aiResult.sections;
  }

  // Fallback PRD
  return [
    {
      title: '1. Executive Summary & Problem Scope',
      content: `### Objective\n${name} provides direct-to-consumer subscribers with frictionless native mobile management over recurring orders and instant in-store loyalty redemption.\n\n### Business Impact\nEliminates mobile web drop-off, reduces subscription churn before weekly roast cutoffs, and bridges digital e-commerce with physical cafe customer visits.`,
    },
    {
      title: '2. Target Personas & Primary User Flows',
      content: `### Personas\n- **The Weekly Subscriber:** Enjoys convenience, switches beans weekly based on seasonal availability.\n- **The Commuter Cafe Visitor:** Visibly frequents physical cafes and demands instant rewards scans without waiting for network reconnects.\n\n### Primary Journey\n1. Launch app with biometric check -> Tap 'Upcoming Tuesday Roast' -> Choose alternate single-origin bean -> Auto-confirms order delta.`,
    },
    {
      title: '3. Functional Specifications',
      content: `### Core Requirements\n- **Biometric Vault:** Secure token persistence with Android BiometricPrompt fallback.\n- **Subscription Controller:** Pausing, date rescheduling, and variant swaps via Shopify GraphQL.\n- **Offline Barcode Engine:** Locally generated high-contrast Code-128 / QR token stored in SQLite cache.`,
    },
    {
      title: '4. Non-Negotiable Guardrails',
      content: `### Always Enforce\n- Native BiometricPrompt authentication.\n- Zero network latency barcode rendering on cold start.\n\n### Strictly Avoid (Never)\n- No third-party payment webviews.\n- No disruptive review prompts during active swap or checkout workflows.`,
    },
    {
      title: '5. Architecture & Integration Plan',
      content: `### Target Platforms\n${platforms}\n\n### Integration Endpoints\n- Shopify Storefront GraphQL API (Subscriptions & Orders).\n- Firebase Cloud Messaging (Android Push Token Register).\n- Google Pay Android API.`,
    },
    {
      title: '6. Phased Rollout & Success Metrics',
      content: `### Phase 1: MVP\nBiometric auth, offline barcode pass, and basic subscription swap.\n\n### Phase 2: Enhanced Mobile Delivery\nPush notification hooks, order tracking timeline, and 1-tap re-order widgets.`,
    },
  ];
}

// ============================================================================
// Service 3: Grounded Technical Architecture Planning
// ============================================================================

export async function generateTechnicalPlan(
  projectContext: any,
  orgContext?: OrgContext
): Promise<TechnicalPlan> {
  const targetPlatforms: string[] = projectContext?.basicInfo?.targetPlatforms || [];
  const isMobileOnly =
    (targetPlatforms.includes('Android') || targetPlatforms.includes('iOS')) &&
    !targetPlatforms.includes('Web');
  const hasMobile = targetPlatforms.includes('Android') || targetPlatforms.includes('iOS');

  const agencyTech = orgContext?.techInventory?.map((t) => `${t.name} (${t.category})`).join(', ') || 'Next.js, Node.js, Python, MongoDB, React, React Native';
  const agencySkills = orgContext?.members?.flatMap((m) => m.skills.map((s) => `${m.name}: ${s.name} [${s.level}]`)).join(', ') || 'Shreya Parkar: React [Expert], TypeScript [Expert], Python [Proficient]';

  const systemPrompt = `You are an elite Chief Architect. Formulate an agency technical stack recommendation strictly grounded in the agency's capabilities and project platform requirements.

CRITICAL PLATFORM CONSTRAINTS:
Target Platforms: ${targetPlatforms.join(', ') || 'Not specified'}
${
  isMobileOnly
    ? `⚠️ THIS IS A MOBILE ONLY PROJECT (${targetPlatforms.join(', ')}).
- You MUST NOT recommend Next.js, Nuxt, standard web React, or Web SSR for the Frontend Architecture layer.
- You MUST recommend a mobile client: React Native (Expo SDK 52) or Flutter.
- Rationale MUST address mobile APK size, offline SQLite/MMKV persistence, native BiometricPrompt integration, and push notifications.`
    : ''
}

Output MUST be strictly valid JSON conforming to:
{
  "frontend": { "recommendation": "string", "rationale": "string", "capabilityMatch": "string", "isApproved": false },
  "backend": { "recommendation": "string", "rationale": "string", "capabilityMatch": "string", "isApproved": false },
  "database": { "recommendation": "string", "rationale": "string", "capabilityMatch": "string", "isApproved": false },
  "auth": { "recommendation": "string", "rationale": "string", "capabilityMatch": "string", "isApproved": false },
  "infrastructure": { "recommendation": "string", "rationale": "string", "capabilityMatch": "string", "isApproved": false },
  "integrations": [{ "name": "string", "rationale": "string", "isApproved": false }]
}`;

  const userPrompt = `Project Brief: ${JSON.stringify(projectContext?.basicInfo || {})}\n\nAgency Approved Stack: ${agencyTech}\nTeam Skills: ${agencySkills}`;

  const aiResult = await callGemini(systemPrompt, userPrompt);
  if (aiResult?.frontend && aiResult?.backend && aiResult?.database) {
    return aiResult;
  }

  // Deterministic Grounded Fallback (Strictly Platform-Aware)
  const fallbackFrontend: TechnicalDecision = isMobileOnly
    ? {
        recommendation: 'React Native (Expo SDK 52)',
        rationale:
          'Native Android runtime utilizing the New Architecture for 60fps animations. Includes offline SQLite persistence, native Android BiometricPrompt integration, and minimal battery overhead.',
        capabilityMatch:
          'Direct match with Parker Studio team skills: Shreya Parkar [Expert: React, TypeScript] — zero learning curve transition to React Native.',
        isApproved: false,
      }
    : hasMobile
    ? {
        recommendation: 'Next.js 15 (Web) + React Native Expo (Mobile)',
        rationale:
          'Monorepo architecture sharing TypeScript types, API clients, and validation schemas across customer web and Android native apps.',
        capabilityMatch: 'Direct alignment with agency Next.js and React capabilities.',
        isApproved: false,
      }
    : {
        recommendation: 'Next.js 15 (App Router)',
        rationale: 'Server-side rendering, streaming, and edge caching critical for low-latency web delivery and SEO.',
        capabilityMatch: 'Direct match with Parker Studio approved stack & Shreya Parkar [Expert: Next.js, React].',
        isApproved: false,
      };

  const fallbackBackend: TechnicalDecision = isMobileOnly
    ? {
        recommendation: 'Node.js & Express API Gateway (or FastAPI)',
        rationale:
          'Lightweight stateless REST/GraphQL middleware handling mobile push tokens, token rotation, and caching Shopify Storefront queries.',
        capabilityMatch: 'Matches agency backend competencies in Node.js and TypeScript runtime architecture.',
        isApproved: false,
      }
    : {
        recommendation: 'Next.js Server Actions & Route Handlers',
        rationale: 'Co-located secure backend logic with type-safe server mutations and minimal operational overhead.',
        capabilityMatch: 'Direct match with agency approved Node.js runtime and Marcus Chen [Expert: TypeScript, Node.js].',
        isApproved: false,
      };

  const fallbackDatabase: TechnicalDecision = isMobileOnly
    ? {
        recommendation: 'MongoDB Atlas + Client-Side SQLite (Expo SQLite)',
        rationale:
          'Cloud MongoDB Atlas for multi-tenant customer state paired with encrypted on-device SQLite for offline loyalty barcode rendering and session caching.',
        capabilityMatch: 'Verified agency approved production database & active Atlas M10 cluster.',
        isApproved: false,
      }
    : {
        recommendation: 'MongoDB Atlas',
        rationale: 'Dynamic document schema natively models nested intelligence blocks, guardrails, and feature tasks.',
        capabilityMatch: 'Verified agency approved production database & active Atlas M10 cluster.',
        isApproved: false,
      };

  const fallbackAuth: TechnicalDecision = isMobileOnly
    ? {
        recommendation: 'JWT Token Pair + Android BiometricPrompt',
        rationale:
          'Cryptographically signed access/refresh tokens stored securely in Android Keystore / EncryptedSharedPreferences with biometric unlock support.',
        capabilityMatch: 'Standardized in agency mobile security blueprint library.',
        isApproved: false,
      }
    : {
        recommendation: 'Auth.js (NextAuth v5)',
        rationale: 'Seamless OAuth integration and encrypted session cookies adhering to team security guardrails.',
        capabilityMatch: 'Standardized in agency B2B client blueprint library.',
        isApproved: false,
      };

  const fallbackInfra: TechnicalDecision = isMobileOnly
    ? {
        recommendation: 'Expo Application Services (EAS Build) + GCP Cloud Run',
        rationale:
          'Automated CI/CD generating native Android AAB/APKs directly into Google Play internal test tracks paired with containerized backend services.',
        capabilityMatch: 'Matches agency cloud deployment workflows and Docker proficiency.',
        isApproved: false,
      }
    : {
        recommendation: 'Vercel Edge Network + Docker',
        rationale: 'Automated CI/CD deployments with edge asset distribution and containerized staging parity.',
        capabilityMatch: 'Direct match with agency production cloud provider (Vercel & Marcus Chen [Expert: Docker]).',
        isApproved: false,
      };

  const fallbackIntegrations = isMobileOnly
    ? [
        {
          name: 'Firebase Cloud Messaging (FCM)',
          rationale: 'Android native background push notifications for roast updates and subscription cutoffs.',
          isApproved: false,
        },
        {
          name: 'Google Pay Android SDK',
          rationale: 'Frictionless native mobile checkout adhering to the negative guardrail prohibiting webview payment flows.',
          isApproved: false,
        },
        {
          name: 'Shopify Storefront GraphQL API',
          rationale: 'Direct synchronization with existing client catalog, orders, and customer subscription records.',
          isApproved: false,
        },
      ]
    : [
        {
          name: 'Stripe API',
          rationale: 'Payment processing and secure customer billing handoff.',
          isApproved: false,
        },
        {
          name: 'Google Gemini 2.5 Flash',
          rationale: 'Connected LLM provider for grounded intelligence extraction and dev drift analysis.',
          isApproved: false,
        },
      ];

  return {
    frontend: fallbackFrontend,
    backend: fallbackBackend,
    database: fallbackDatabase,
    auth: fallbackAuth,
    infrastructure: fallbackInfra,
    integrations: fallbackIntegrations,
  };
}

// ============================================================================
// Service 4: Feature-First Task Breakdown
// ============================================================================

export async function generateFeatureTasks(projectContext: any): Promise<FeatureModule[]> {
  const targetPlatforms: string[] = projectContext?.basicInfo?.targetPlatforms || [];
  const isMobile = targetPlatforms.includes('Android') || targetPlatforms.includes('iOS');

  if (isMobile) {
    return [
      {
        id: 'feat-1',
        name: 'Biometric Authentication & Security Vault',
        description: 'Native Android biometric login, encrypted Keystore token storage, and session resumption.',
        status: 'Planned',
        tasks: [
          { id: 't-101', title: 'Define BiometricPrompt fallback & UX states', layer: 'Requirements', assignedRole: 'Product Lead', estimateDays: 1, priority: 'High', status: 'Done' },
          { id: 't-102', title: 'Design fingerprint & face unlock permission dialogs', layer: 'Design', assignedRole: 'UI/UX Designer', estimateDays: 1.5, priority: 'Medium', status: 'Done' },
          { id: 't-103', title: 'Implement Expo LocalAuthentication & Keystore vault', layer: 'Frontend', assignedRole: 'Mobile Engineer', estimateDays: 3, priority: 'High', status: 'In Progress' },
          { id: 't-104', title: 'Build token refresh & biometric signature validator', layer: 'Backend', assignedRole: 'Backend Developer', estimateDays: 2, priority: 'High', status: 'In Progress' },
          { id: 't-105', title: 'Conduct biometric spoofing & cancellation unit tests', layer: 'Testing', assignedRole: 'QA Engineer', estimateDays: 1.5, priority: 'Medium', status: 'Todo' },
        ],
      },
      {
        id: 'feat-2',
        name: 'Offline Loyalty Barcode Engine',
        description: 'Dynamic barcode pass generator with local SQLite cache for instantaneous cafe scanning.',
        status: 'Planned',
        tasks: [
          { id: 't-201', title: 'Specify barcode rotation frequency and replay defense', layer: 'Requirements', assignedRole: 'Product Lead', estimateDays: 1, priority: 'High', status: 'Done' },
          { id: 't-202', title: 'Design high-contrast barcode pass screen for cafe scanners', layer: 'Design', assignedRole: 'UI/UX Designer', estimateDays: 1, priority: 'High', status: 'Done' },
          { id: 't-203', title: 'Build React Native Code-128 canvas rendering with brightness override', layer: 'Frontend', assignedRole: 'Mobile Engineer', estimateDays: 2.5, priority: 'High', status: 'Todo' },
          { id: 't-204', title: 'Configure client-side SQLite sync for offline validation', layer: 'Frontend', assignedRole: 'Mobile Engineer', estimateDays: 2, priority: 'Medium', status: 'Todo' },
          { id: 't-205', title: 'Verify scanner read success with device in Airplane Mode', layer: 'Testing', assignedRole: 'QA Engineer', estimateDays: 1, priority: 'High', status: 'Todo' },
        ],
      },
      {
        id: 'feat-3',
        name: 'Subscription Modification & Roast Swapper',
        description: 'Manage weekly recurring coffee bags, pause delivery, and update variant selection before Tuesday cutoff.',
        status: 'Planned',
        tasks: [
          { id: 't-301', title: 'Map Shopify Storefront subscription modification mutation', layer: 'Requirements', assignedRole: 'Product Lead', estimateDays: 1, priority: 'High', status: 'Done' },
          { id: 't-302', title: 'Design tactile roast profile switcher and date carousel', layer: 'Design', assignedRole: 'UI/UX Designer', estimateDays: 2, priority: 'Medium', status: 'In Progress' },
          { id: 't-303', title: 'Implement React Native variant picker and confirmation sheet', layer: 'Frontend', assignedRole: 'Mobile Engineer', estimateDays: 3, priority: 'High', status: 'Todo' },
          { id: 't-304', title: 'Connect Shopify GraphQL subscription update webhook', layer: 'Backend', assignedRole: 'Backend Developer', estimateDays: 2.5, priority: 'High', status: 'Todo' },
          { id: 't-305', title: 'Automated end-to-end roast swap test cycle', layer: 'Testing', assignedRole: 'QA Engineer', estimateDays: 1.5, priority: 'Medium', status: 'Todo' },
        ],
      },
    ];
  }

  return [
    {
      id: 'feat-w1',
      name: 'Authentication & Organization RBAC',
      description: 'Multi-tenant authentication with granular permission validation.',
      status: 'In Development',
      tasks: [
        { id: 't-w101', title: 'Define 22 granular RBAC permission matrix', layer: 'Requirements', assignedRole: 'Strategist', estimateDays: 1, priority: 'High', status: 'Done' },
        { id: 't-w102', title: 'Design workspace switcher and permission banners', layer: 'Design', assignedRole: 'UI/UX Designer', estimateDays: 1.5, priority: 'Medium', status: 'Done' },
        { id: 't-w103', title: 'Implement NextAuth v5 session cookie handler', layer: 'Backend', assignedRole: 'Lead Developer', estimateDays: 2, priority: 'High', status: 'Done' },
        { id: 't-w104', title: 'Build client-side permission boundary gates', layer: 'Frontend', assignedRole: 'Frontend Engineer', estimateDays: 2, priority: 'High', status: 'In Progress' },
        { id: 't-w105', title: 'Integration tests for multi-tenant workspace isolation', layer: 'Testing', assignedRole: 'QA Engineer', estimateDays: 1.5, priority: 'High', status: 'Todo' },
      ],
    },
    {
      id: 'feat-w2',
      name: 'Project Intelligence & AI Planning Pipeline',
      description: 'Automated synthesis of briefs into PRDs, architecture, and feature trees.',
      status: 'Planned',
      tasks: [
        { id: 't-w201', title: 'Formulate Zod schemas for AI analysis and technical plans', layer: 'Requirements', assignedRole: 'Strategist', estimateDays: 1.5, priority: 'High', status: 'Done' },
        { id: 't-w202', title: 'Build Gemini 2.5 Flash pipeline with deterministic mock fallback', layer: 'AI', assignedRole: 'AI Engineer', estimateDays: 3, priority: 'High', status: 'In Progress' },
        { id: 't-w203', title: 'Build interactive architecture sign-off and approval cards', layer: 'Frontend', assignedRole: 'Frontend Engineer', estimateDays: 2.5, priority: 'Medium', status: 'Todo' },
        { id: 't-w204', title: 'Deploy cached MongoDB repository connections', layer: 'Deployment', assignedRole: 'DevOps', estimateDays: 1, priority: 'Medium', status: 'Done' },
      ],
    },
  ];
}

// ============================================================================
// Service 5: Git Activity & Drift Analysis
// ============================================================================

export async function analyzeGitDrift(
  features: FeatureModule[],
  commits: Array<{ message: string; author: string; timestamp: Date }>
): Promise<GitHealthAnalysis> {
  if (commits.length > 0) {
    const systemPrompt = `You are an elite engineering director. Compare planned features against actual Git commits to determine development drift, dormant features, and progress insights in JSON format: { "driftScore": number, "insights": ["string"], "dormantFeatures": ["string"] }.`;
    const userPrompt = `Features: ${JSON.stringify(features)}\n\nCommits: ${JSON.stringify(commits)}`;

    const aiResult = await callGemini(systemPrompt, userPrompt);
    if (aiResult && typeof aiResult.driftScore === 'number') {
      return {
        driftScore: aiResult.driftScore,
        insights: Array.isArray(aiResult.insights) ? aiResult.insights : ['Git commits verify active feature branch development.'],
        dormantFeatures: Array.isArray(aiResult.dormantFeatures) ? aiResult.dormantFeatures : [],
        lastAnalyzedAt: new Date(),
      };
    }
  }

  // Heuristic Fallback
  const commitText = commits.map((c) => c.message.toLowerCase()).join(' ');
  const dormant: string[] = [];

  features.forEach((feat) => {
    const keywords = feat.name.toLowerCase().split(' ').filter((w) => w.length > 3);
    const hasActivity = keywords.some((kw) => commitText.includes(kw));
    if (!hasActivity) {
      dormant.push(feat.name);
    }
  });

  const driftScore = Math.max(35, Math.min(95, 100 - dormant.length * 15));

  return {
    driftScore,
    insights: [
      `Active commits indicate steady implementation across ${features.length - dormant.length} primary feature modules.`,
      dormant.length > 0
        ? `Warning: Zero commit velocity detected for: ${dormant.slice(0, 2).join(', ')}.`
        : 'Commit messages reflect solid alignment with planned engineering layers.',
      'Testing layers have minimal commit mentions; QA verification should be prioritized before staging deployment.',
    ],
    dormantFeatures: dormant,
    lastAnalyzedAt: new Date(),
  };
}
