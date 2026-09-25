import { z } from 'zod';

export const aiAnalysisSchema = z.object({
  brand: z.object({
    personality: z.array(z.string()),
    colors: z.array(
      z.object({
        hex: z.string(),
        role: z.string(),
        source: z.enum(['client', 'ai']),
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
    always: z.array(z.string()),
    never: z.array(z.string()),
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

export const technicalPlanSchema = z.object({
  frontend: z.object({ recommendation: z.string(), rationale: z.string() }),
  backend: z.object({ recommendation: z.string(), rationale: z.string() }),
  database: z.object({ recommendation: z.string(), rationale: z.string() }),
  integrations: z.array(z.object({ name: z.string(), rationale: z.string() })),
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
