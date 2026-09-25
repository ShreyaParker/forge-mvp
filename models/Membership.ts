import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type MembershipRole =
  | 'Owner'
  | 'Admin'
  | 'Project Manager'
  | 'Strategist'
  | 'Designer'
  | 'Developer'
  | 'AI Engineer'
  | 'Viewer';

export type MemberAvailability = 'Available' | 'Partially Allocated' | 'Fully Booked';

export interface IMembership extends Document {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  role: MembershipRole;
  customPermissions: string[];
  availability: MemberAvailability;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    role: {
      type: String,
      enum: [
        'Owner',
        'Admin',
        'Project Manager',
        'Strategist',
        'Designer',
        'Developer',
        'AI Engineer',
        'Viewer',
      ],
      required: true,
      default: 'Viewer',
    },
    customPermissions: { type: [String], default: [] },
    availability: {
      type: String,
      enum: ['Available', 'Partially Allocated', 'Fully Booked'],
      default: 'Available',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

MembershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

const Membership: Model<IMembership> =
  mongoose.models.Membership || mongoose.model<IMembership>('Membership', MembershipSchema);

export default Membership;
