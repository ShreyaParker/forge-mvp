import mongoose, { Schema, Document, Model } from 'mongoose';
import { computeDeliveryEstimate } from '../lib/utils';

export type ProvenanceSource = 'client' | 'ai' | 'human_edited';

export interface IProjectReference {
  name: string;
  url: string;
  notes?: string;
}

export interface IProjectDNA {
  competitors: string[];
  references: IProjectReference[];
  persistentInstructions: string;
}

export interface IGuardrailItem {
  id: string;
  text: string;
  source: ProvenanceSource;
}

export interface ITechPlanLayer {
  recommendation: string;
  rationale: string;
  isApproved: boolean;
  capabilityMatch?: string;
}

export interface ITechIntegration {
  name: string;
  rationale: string;
  isApproved: boolean;
}

export interface IProjectTeamMember {
  userId: mongoose.Types.ObjectId | string;
  role: string;
  assignedAt: Date;
}

export type FeatureLayer =
  | 'Requirements'
  | 'Design'
  | 'Frontend'
  | 'Backend'
  | 'AI'
  | 'Testing'
  | 'Deployment';

export type FeatureStatus = 'Planned' | 'In Development' | 'Testing' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface IFeatureTask {
  id: string;
  title: string;
  layer: FeatureLayer;
  assignedUserId?: mongoose.Types.ObjectId | string;
  assignedRole: string;
  estimateDays: number;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface IProjectFeature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  tasks: IFeatureTask[];
}

export interface IDeliveryEstimate {
  totalDays: number;
  allocatedTeamSize: number;
  estimatedWeeks: number;
  riskNotes: string[];
}

export interface IGitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  featureId?: string;
}

export interface IGitPullRequest {
  id: string;
  title: string;
  status: 'Open' | 'Merged' | 'Closed';
  author: string;
  url: string;
}

export interface IAiHealthAnalysis {
  driftScore: number;
  insights: string[];
  dormantFeatures: string[];
  lastAnalyzedAt: Date;
}

export interface IGitIntegration {
  connected: boolean;
  repoUrl: string;
  branch: string;
  commits: IGitCommit[];
  pullRequests: IGitPullRequest[];
  aiHealthAnalysis?: IAiHealthAnalysis;
}

export interface IProjectTask {
  id: string;
  epic: string;
  title: string;
  ownerRole: string;
  assignedUserId?: string;
  priority: string;
  estimateDays: number;
  status: 'Todo' | 'In Progress' | 'Done';
}

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  team: IProjectTeamMember[];
  basicInfo: {
    name: string;
    clientName: string;
    description: string;
    website?: string;
    targetPlatforms: string[];
  };
  dna?: IProjectDNA;
  brand?: {
    personality: string[];
    colors: { hex: string; role: string; source: ProvenanceSource }[];
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
    always: IGuardrailItem[];
    never: IGuardrailItem[];
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
    frontend?: ITechPlanLayer;
    backend?: ITechPlanLayer;
    database?: ITechPlanLayer;
    auth?: ITechPlanLayer;
    infrastructure?: ITechPlanLayer;
    integrations?: ITechIntegration[];
  };
  features?: IProjectFeature[];
  deliveryEstimate?: IDeliveryEstimate;
  gitIntegration?: IGitIntegration;
  tasks?: IProjectTask[];
  readinessScore: number;
  status: 'Draft' | 'Analyzed' | 'Ready for Dev';
  createdAt: Date;
  updatedAt: Date;
}

export function normalizeGuardrailList(items: any[] | undefined, prefix: string): IGuardrailItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `${prefix}-${index + 1}`,
        text: item,
        source: 'ai' as ProvenanceSource,
      };
    }
    return {
      id: item.id || `${prefix}-${index + 1}`,
      text: item.text || '',
      source: (item.source || 'ai') as ProvenanceSource,
    };
  });
}

export function normalizeProject(raw: any): any {
  if (!raw) return raw;
  const project = typeof raw.toObject === 'function' ? raw.toObject() : { ...raw };

  // Normalize DNA
  if (!project.dna) {
    project.dna = {
      competitors: [],
      references: [],
      persistentInstructions: '',
    };
  } else {
    project.dna.competitors = Array.isArray(project.dna.competitors) ? project.dna.competitors : [];
    project.dna.references = Array.isArray(project.dna.references) ? project.dna.references : [];
    project.dna.persistentInstructions = project.dna.persistentInstructions || '';
  }

  // Normalize Guardrails
  if (project.guardrails) {
    project.guardrails.always = normalizeGuardrailList(project.guardrails.always, 'always');
    project.guardrails.never = normalizeGuardrailList(project.guardrails.never, 'never');
  } else {
    project.guardrails = { always: [], never: [] };
  }

  // Normalize Technical Plan
  if (project.technicalPlan) {
    const layers = ['frontend', 'backend', 'database', 'auth', 'infrastructure'] as const;
    layers.forEach(layer => {
      if (project.technicalPlan[layer]) {
        project.technicalPlan[layer] = {
          recommendation: project.technicalPlan[layer].recommendation || '',
          rationale: project.technicalPlan[layer].rationale || '',
          isApproved: Boolean(project.technicalPlan[layer].isApproved),
          capabilityMatch: project.technicalPlan[layer].capabilityMatch || '',
        };
      }
    });

    if (Array.isArray(project.technicalPlan.integrations)) {
      project.technicalPlan.integrations = project.technicalPlan.integrations.map((integ: any) => ({
        name: integ.name || '',
        rationale: integ.rationale || '',
        isApproved: Boolean(integ.isApproved),
      }));
    } else {
      project.technicalPlan.integrations = [];
    }
  }

  // Normalize Features & Tasks
  project.features = Array.isArray(project.features)
    ? project.features.map((f: any) => ({
        id: f.id || `feat-${Date.now()}`,
        name: f.name || 'Feature',
        description: f.description || '',
        status: f.status || 'Planned',
        tasks: Array.isArray(f.tasks)
          ? f.tasks.map((t: any) => ({
              id: t.id || `task-${Date.now()}`,
              title: t.title || 'Task',
              layer: t.layer || 'Frontend',
              assignedUserId: t.assignedUserId?.toString ? t.assignedUserId.toString() : t.assignedUserId,
              assignedRole: t.assignedRole || 'Developer',
              estimateDays: Number(t.estimateDays) || 1,
              priority: t.priority || 'Medium',
              status: t.status || 'Todo',
            }))
          : [],
      }))
    : [];

  // Normalize Delivery Estimate
  const teamSize = Array.isArray(project.team) && project.team.length > 0 ? project.team.length : 2;
  if (!project.deliveryEstimate || !project.deliveryEstimate.totalDays) {
    project.deliveryEstimate = computeDeliveryEstimate(project.features, teamSize);
  }

  // Normalize Git Integration
  project.gitIntegration = {
    connected: Boolean(project.gitIntegration?.connected),
    repoUrl: project.gitIntegration?.repoUrl || '',
    branch: project.gitIntegration?.branch || 'main',
    commits: Array.isArray(project.gitIntegration?.commits)
      ? project.gitIntegration.commits.map((c: any) => ({
          hash: c.hash || '',
          message: c.message || '',
          author: c.author || '',
          timestamp: c.timestamp || new Date(),
          featureId: c.featureId,
        }))
      : [],
    pullRequests: Array.isArray(project.gitIntegration?.pullRequests)
      ? project.gitIntegration.pullRequests.map((pr: any) => ({
          id: pr.id || '',
          title: pr.title || '',
          status: pr.status || 'Open',
          author: pr.author || '',
          url: pr.url || '',
        }))
      : [],
    aiHealthAnalysis: project.gitIntegration?.aiHealthAnalysis
      ? {
          driftScore: Number(project.gitIntegration.aiHealthAnalysis.driftScore) || 100,
          insights: Array.isArray(project.gitIntegration.aiHealthAnalysis.insights)
            ? project.gitIntegration.aiHealthAnalysis.insights
            : [],
          dormantFeatures: Array.isArray(project.gitIntegration.aiHealthAnalysis.dormantFeatures)
            ? project.gitIntegration.aiHealthAnalysis.dormantFeatures
            : [],
          lastAnalyzedAt: project.gitIntegration.aiHealthAnalysis.lastAnalyzedAt || new Date(),
        }
      : undefined,
  };

  // Normalize legacy Tasks
  project.tasks = Array.isArray(project.tasks) ? project.tasks : [];

  // Normalize organizationId & team
  if (project.organizationId) {
    project.organizationId = project.organizationId.toString();
  }
  project.team = Array.isArray(project.team)
    ? project.team.map((t: any) => ({
        userId: t.userId?.toString ? t.userId.toString() : t.userId,
        role: t.role || '',
        assignedAt: t.assignedAt || new Date(),
      }))
    : [];

  return project;
}

const ProjectTeamSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GuardrailItemSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    source: {
      type: String,
      enum: ['client', 'ai', 'human_edited'],
      default: 'ai',
    },
  },
  { _id: false }
);

const TechLayerSchema = new Schema(
  {
    recommendation: { type: String, default: '' },
    rationale: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    capabilityMatch: { type: String, default: '' },
  },
  { _id: false }
);

const TechIntegrationSchema = new Schema(
  {
    name: { type: String, required: true },
    rationale: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
  },
  { _id: false }
);

const FeatureTaskSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    layer: {
      type: String,
      enum: ['Requirements', 'Design', 'Frontend', 'Backend', 'AI', 'Testing', 'Deployment'],
      default: 'Frontend',
    },
    assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedRole: { type: String, default: 'Developer' },
    estimateDays: { type: Number, default: 1 },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  },
  { _id: false }
);

const ProjectFeatureSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Planned', 'In Development', 'Testing', 'Completed'],
      default: 'Planned',
    },
    tasks: { type: [FeatureTaskSchema], default: [] },
  },
  { _id: false }
);

const DeliveryEstimateSchema = new Schema(
  {
    totalDays: { type: Number, default: 0 },
    allocatedTeamSize: { type: Number, default: 1 },
    estimatedWeeks: { type: Number, default: 0 },
    riskNotes: { type: [String], default: [] },
  },
  { _id: false }
);

const GitCommitSchema = new Schema(
  {
    hash: { type: String, required: true },
    message: { type: String, required: true },
    author: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    featureId: { type: String },
  },
  { _id: false }
);

const GitPullRequestSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Merged', 'Closed'], default: 'Open' },
    author: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const AiHealthAnalysisSchema = new Schema(
  {
    driftScore: { type: Number, default: 100 },
    insights: { type: [String], default: [] },
    dormantFeatures: { type: [String], default: [] },
    lastAnalyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GitIntegrationSchema = new Schema(
  {
    connected: { type: Boolean, default: false },
    repoUrl: { type: String, default: '' },
    branch: { type: String, default: 'main' },
    commits: { type: [GitCommitSchema], default: [] },
    pullRequests: { type: [GitPullRequestSchema], default: [] },
    aiHealthAnalysis: { type: AiHealthAnalysisSchema },
  },
  { _id: false }
);

const ProjectSchema: Schema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    team: {
      type: [ProjectTeamSchema],
      default: [],
    },
    basicInfo: {
      name: { type: String, required: true },
      clientName: { type: String, required: true },
      description: { type: String, required: true },
      website: { type: String },
      targetPlatforms: [{ type: String }],
    },
    dna: {
      competitors: [{ type: String }],
      references: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          notes: { type: String },
        },
      ],
      persistentInstructions: { type: String, default: '' },
    },
    brand: {
      personality: [{ type: String }],
      colors: [
        {
          hex: { type: String },
          role: { type: String },
          source: { type: String, enum: ['client', 'ai', 'human_edited'], default: 'ai' },
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
      always: [GuardrailItemSchema],
      never: [GuardrailItemSchema],
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
      frontend: TechLayerSchema,
      backend: TechLayerSchema,
      database: TechLayerSchema,
      auth: TechLayerSchema,
      infrastructure: TechLayerSchema,
      integrations: [TechIntegrationSchema],
    },
    features: {
      type: [ProjectFeatureSchema],
      default: [],
    },
    deliveryEstimate: {
      type: DeliveryEstimateSchema,
    },
    gitIntegration: {
      type: GitIntegrationSchema,
    },
    tasks: [
      {
        id: { type: String, required: true },
        epic: { type: String, required: true },
        title: { type: String, required: true },
        ownerRole: { type: String, required: true },
        assignedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        priority: { type: String, required: true },
        estimateDays: { type: Number, required: true },
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

// Backward compatibility: pre-init hook transforms raw data if legacy formats exist
ProjectSchema.pre('init', function (raw: any) {
  if (raw && raw.guardrails) {
    if (Array.isArray(raw.guardrails.always)) {
      raw.guardrails.always = raw.guardrails.always.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { id: `always-${idx + 1}`, text: item, source: 'ai' };
        }
        return item;
      });
    }
    if (Array.isArray(raw.guardrails.never)) {
      raw.guardrails.never = raw.guardrails.never.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { id: `never-${idx + 1}`, text: item, source: 'ai' };
        }
        return item;
      });
    }
  }
});

// Force refresh compiled model in development
if (mongoose.models.Project) {
  delete (mongoose.models as any).Project;
}

const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
