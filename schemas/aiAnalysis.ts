import { z } from 'zod';

export const guardrailItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  source: z.enum(['client', 'ai', 'human_edited']),
});

export const aiAnalysisSchema = z.object({
  brand: z.object({
    personality: z.array(z.string()),
    colors: z.array(
      z.object({
        hex: z.string(),
        role: z.string(),
        source: z.enum(['client', 'ai', 'human_edited']),
      })
    ),
    typography: z.array(z.string()),
    visualStyle: z.string(),
    tone: z.string(),
  }),
  product: z.object({
    objective: z.string(),
    targetUsers: z.array(z.string()),
    userJourneys: z.array(z.string()),
    coreFeatures: z.array(z.string()),
    successMetrics: z.array(z.string()),
  }),
  guardrails: z.object({
    always: z.union([z.array(z.string()), z.array(guardrailItemSchema)]),
    never: z.union([z.array(z.string()), z.array(guardrailItemSchema)]),
  }),
  aiAnalysis: z.object({
    summary: z.string(),
    modules: z.array(z.string()),
    risks: z.array(z.string()),
    clarificationQuestions: z.array(z.string()),
    complexity: z.enum(['Low', 'Medium', 'High']),
  }),
});

export const prdSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  ),
});

const techLayerZod = z.object({
  recommendation: z.string(),
  rationale: z.string(),
  isApproved: z.boolean().optional().default(false),
});

export const technicalPlanSchema = z.object({
  frontend: techLayerZod,
  backend: techLayerZod,
  database: techLayerZod,
  auth: techLayerZod.optional().default({
    recommendation: 'NextAuth.js / Auth.js',
    rationale: 'Secure session handling and OAuth provider integration.',
    isApproved: false,
  }),
  infrastructure: techLayerZod.optional().default({
    recommendation: 'Vercel + MongoDB Atlas',
    rationale: 'Serverless deployment with managed database resilience.',
    isApproved: false,
  }),
  integrations: z.array(
    z.object({
      name: z.string(),
      rationale: z.string(),
      isApproved: z.boolean().optional().default(false),
    })
  ).default([]),
});

export const tasksSchema = z.array(
  z.object({
    id: z.string(),
    epic: z.string(),
    title: z.string(),
    ownerRole: z.string(),
    priority: z.string(),
    estimateDays: z.number(),
    status: z.enum(['Todo', 'In Progress', 'Done']),
  })
);
