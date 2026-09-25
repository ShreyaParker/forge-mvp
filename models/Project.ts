import mongoose, { Schema, Document, Model } from 'mongoose';

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
}

export interface ITechIntegration {
  name: string;
  rationale: string;
  isApproved: boolean;
}

export interface IProjectTask {
  id: string;
  epic: string;
  title: string;
  ownerRole: string;
  priority: string;
  estimateDays: number;
  status: 'Todo' | 'In Progress' | 'Done';
}

export interface IProject extends Document {
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
  tasks?: IProjectTask[];
  readinessScore: number;
  status: 'Draft' | 'Analyzed' | 'Ready for Dev';
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

  // Normalize Tasks
  project.tasks = Array.isArray(project.tasks) ? project.tasks : [];

  return project;
}

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

const ProjectSchema: Schema = new Schema(
  {
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
    tasks: [
      {
        id: { type: String, required: true },
        epic: { type: String, required: true },
        title: { type: String, required: true },
        ownerRole: { type: String, required: true },
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

// Prevent mongoose from compiling the model multiple times in development
const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
