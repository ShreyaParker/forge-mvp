import mongoose, { Schema, Document, Model } from 'mongoose';

export type WorkspaceType = 'Agency' | 'Individual';

export type TechCategory =
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'AI'
  | 'Cloud'
  | 'DevOps'
  | 'Design'
  | 'Other';

export interface ITechInventoryItem {
  name: string;
  category: TechCategory;
  approvedForProduction: boolean;
  notes?: string;
}

export type ApiStatus = 'Connected' | 'Available' | 'Not Connected' | 'Expiring';
export type ApiEnvironment = 'Development' | 'Staging' | 'Production';

export interface IApiInventoryItem {
  provider: string;
  service: string;
  status: ApiStatus;
  environment: ApiEnvironment;
  notes?: string;
}

export interface IOrganization extends Document {
  name: string;
  slug: string;
  workspaceType: WorkspaceType;
  description?: string;
  website?: string;
  industry?: string;
  teamSize?: number;
  services: string[];
  specializations: string[];
  techInventory: ITechInventoryItem[];
  apiInventory: IApiInventoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const TechInventorySchema = new Schema<ITechInventoryItem>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'AI', 'Cloud', 'DevOps', 'Design', 'Other'],
      default: 'Other',
    },
    approvedForProduction: { type: Boolean, default: true },
    notes: { type: String },
  },
  { _id: false }
);

const ApiInventorySchema = new Schema<IApiInventoryItem>(
  {
    provider: { type: String, required: true },
    service: { type: String, required: true },
    status: {
      type: String,
      enum: ['Connected', 'Available', 'Not Connected', 'Expiring'],
      default: 'Available',
    },
    environment: {
      type: String,
      enum: ['Development', 'Staging', 'Production'],
      default: 'Production',
    },
    notes: { type: String },
  },
  { _id: false }
);

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    workspaceType: {
      type: String,
      enum: ['Agency', 'Individual'],
      default: 'Agency',
      required: true,
    },
    description: { type: String },
    website: { type: String },
    industry: { type: String },
    teamSize: { type: Number, default: 1 },
    services: { type: [String], default: [] },
    specializations: { type: [String], default: [] },
    techInventory: { type: [TechInventorySchema], default: [] },
    apiInventory: { type: [ApiInventorySchema], default: [] },
  },
  {
    timestamps: true,
  }
);

const Organization: Model<IOrganization> =
  mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
