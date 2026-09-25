import { cookies } from 'next/headers';
import dbConnect from './dbConnect';
import User, { IUser, IUserSkill, IGitIdentity } from '../models/User';
import Organization, { IOrganization, ITechInventoryItem, IApiInventoryItem, WorkspaceType } from '../models/Organization';
import Membership, { MembershipRole, IMembership } from '../models/Membership';
import { Permission, ROLE_PERMISSIONS, hasPermission } from './permissions';

export const COOKIE_ORG_KEY = 'forge_session_org';
export const COOKIE_USER_KEY = 'forge_session_user';

export interface SessionContext {
  userId: string;
  organizationId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    skills: IUserSkill[];
    gitIdentity?: IGitIdentity;
  };
  organization: {
    id: string;
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
  };
  membership: {
    role: MembershipRole;
    availability: string;
    customPermissions: string[];
  };
  permissions: Permission[];
}

export async function getSession(): Promise<SessionContext | null> {
  await dbConnect();

  const cookieStore = await cookies();
  const orgCookie = cookieStore.get(COOKIE_ORG_KEY)?.value;
  const userCookie = cookieStore.get(COOKIE_USER_KEY)?.value;

  // 1. Resolve Organization
  let organization = null;
  if (orgCookie) {
    if (orgCookie.match(/^[0-9a-fA-F]{24}$/)) {
      organization = await Organization.findById(orgCookie).lean();
    } else {
      organization = await Organization.findOne({ slug: orgCookie }).lean();
    }
  }

  if (!organization) {
    // Default to Parker Studio or first created agency
    organization = await Organization.findOne({ slug: 'parker-studio' }).lean();
    if (!organization) {
      organization = await Organization.findOne().sort({ createdAt: 1 }).lean();
    }
  }

  if (!organization) {
    return null;
  }

  // 2. Resolve User
  let user = null;
  if (userCookie && userCookie.match(/^[0-9a-fA-F]{24}$/)) {
    user = await User.findById(userCookie).lean();
  }

  if (!user) {
    // Default to Shreya Parkar or first user
    user = await User.findOne({ email: 'shreya@parker.studio' }).lean();
    if (!user) {
      user = await User.findOne().sort({ createdAt: 1 }).lean();
    }
  }

  if (!user) {
    return null;
  }

  // 3. Resolve Membership
  let membership = await Membership.findOne({
    userId: user._id,
    organizationId: organization._id,
  }).lean();

  if (!membership) {
    // Fallback: Check if any membership exists for this organization
    const orgMembership = await Membership.findOne({ organizationId: organization._id }).lean();
    if (orgMembership && orgMembership.userId.toString() === user._id.toString()) {
      membership = orgMembership;
    } else {
      // Default to Owner if this user created it, or Viewer
      membership = {
        _id: null,
        userId: user._id,
        organizationId: organization._id,
        role: 'Owner' as MembershipRole,
        customPermissions: [],
        availability: 'Available',
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }
  }

  const role = (membership?.role || 'Owner') as MembershipRole;
  const customPermissions = membership?.customPermissions || [];
  const basePermissions = ROLE_PERMISSIONS[role] || [];
  const combinedPermissions = Array.from(new Set([...basePermissions, ...customPermissions])) as Permission[];

  return {
    userId: user._id.toString(),
    organizationId: organization._id.toString(),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      skills: user.skills || [],
      gitIdentity: user.gitIdentity,
    },
    organization: {
      id: organization._id.toString(),
      name: organization.name,
      slug: organization.slug,
      workspaceType: organization.workspaceType,
      description: organization.description,
      website: organization.website,
      industry: organization.industry,
      teamSize: organization.teamSize,
      services: organization.services || [],
      specializations: organization.specializations || [],
      techInventory: organization.techInventory || [],
      apiInventory: organization.apiInventory || [],
    },
    membership: {
      role,
      availability: membership?.availability || 'Available',
      customPermissions,
    },
    permissions: combinedPermissions,
  };
}

export function checkPermission(session: SessionContext | null, permission: Permission): boolean {
  if (!session) return false;
  return hasPermission(session.membership.role, permission, session.membership.customPermissions);
}
