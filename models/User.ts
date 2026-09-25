import mongoose, { Schema, Document, Model } from 'mongoose';

export type SkillLevel = 'Beginner' | 'Working' | 'Proficient' | 'Expert';

export interface IUserSkill {
  name: string;
  level: SkillLevel;
}

export interface IGitIdentity {
  username: string;
  provider: 'github' | 'gitlab' | string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  skills: IUserSkill[];
  gitIdentity?: IGitIdentity;
  createdAt: Date;
  updatedAt: Date;
}

const UserSkillSchema = new Schema<IUserSkill>(
  {
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Working', 'Proficient', 'Expert'],
      default: 'Working',
    },
  },
  { _id: false }
);

const GitIdentitySchema = new Schema<IGitIdentity>(
  {
    username: { type: String, required: true },
    provider: { type: String, default: 'github' },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    avatarUrl: { type: String },
    bio: { type: String },
    skills: { type: [UserSkillSchema], default: [] },
    gitIdentity: { type: GitIdentitySchema },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
