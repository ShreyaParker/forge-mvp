import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  basicInfo: {
    name: string;
    clientName: string;
    description: string;
    website?: string;
    targetPlatforms: string[];
  };
  brand?: {
    personality: string[];
    colors: { hex: string; role: string; source: 'client' | 'ai' }[];
    typography: string[];
    visualStyle: string;
    tone: string;
  };
  product?: {
    objective: string;
    targetUsers: string[];
    userJourneys: string[];
    coreFeatures: string[];
    successMetrics: string[];
  };
  guardrails?: {
    always: string[];
    never: string[];
  };
  aiAnalysis?: {
    summary: string;
    modules: string[];
    risks: string[];
    clarificationQuestions: string[];
    complexity: 'Low' | 'Medium' | 'High';
  };
  prd?: {
    sections: { title: string; content: string }[];
  };
  technicalPlan?: {
    frontend: { recommendation: string; rationale: string };
    backend: { recommendation: string; rationale: string };
    database: { recommendation: string; rationale: string };
    integrations: { name: string; rationale: string }[];
  };
  tasks?: {
    id: string;
    epic: string;
    title: string;
    ownerRole: string;
    priority: string;
    estimateDays: number;
    status: 'Todo' | 'In Progress' | 'Done';
  }[];
  readinessScore: number;
  status: 'Draft' | 'Analyzed' | 'Ready for Dev';
}

const ProjectSchema: Schema = new Schema(
  {
    basicInfo: {
      name: { type: String, required: true },
      clientName: { type: String, required: true },
      description: { type: String, required: true },
      website: { type: String },
      targetPlatforms: [{ type: String }],
    },
    brand: {
      personality: [{ type: String }],
      colors: [
        {
          hex: { type: String },
          role: { type: String },
          source: { type: String, enum: ['client', 'ai'] },
        },
      ],
      typography: [{ type: String }],
      visualStyle: { type: String },
      tone: { type: String },
    },
    product: {
      objective: { type: String },
      targetUsers: [{ type: String }],
      userJourneys: [{ type: String }],
      coreFeatures: [{ type: String }],
      successMetrics: [{ type: String }],
    },
    guardrails: {
      always: [{ type: String }],
      never: [{ type: String }],
    },
    aiAnalysis: {
      summary: { type: String },
      modules: [{ type: String }],
      risks: [{ type: String }],
      clarificationQuestions: [{ type: String }],
      complexity: { type: String, enum: ['Low', 'Medium', 'High'] },
    },
    prd: {
      sections: [
        {
          title: { type: String },
          content: { type: String },
        },
      ],
    },
    technicalPlan: {
      frontend: { recommendation: String, rationale: String },
      backend: { recommendation: String, rationale: String },
      database: { recommendation: String, rationale: String },
      integrations: [
        {
          name: { type: String },
          rationale: { type: String },
        },
      ],
    },
    tasks: [
      {
        id: { type: String },
        epic: { type: String },
        title: { type: String },
        ownerRole: { type: String },
        priority: { type: String },
        estimateDays: { type: Number },
        status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
      },
    ],
    readinessScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Draft', 'Analyzed', 'Ready for Dev'],
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from compiling the model multiple times in development
const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
