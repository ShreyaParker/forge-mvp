import { MembershipRole } from '../models/Membership';

export const ALL_PERMISSIONS = [
  'projects:create',
  'projects:view',
  'projects:edit',
  'projects:delete',
  'briefs:edit',
  'ai:generate',
  'prd:view',
  'prd:edit',
  'technical:view',
  'technical:edit',
  'tasks:create',
  'tasks:assign',
  'tasks:update',
  'team:view',
  'team:manage',
  'tech:view',
  'tech:manage',
  'integrations:view',
  'integrations:manage',
  'git:view',
  'git:manage',
  'settings:manage',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<MembershipRole, Permission[]> = {
  Owner: [
    'projects:create',
    'projects:view',
    'projects:edit',
    'projects:delete',
    'briefs:edit',
    'ai:generate',
    'prd:view',
    'prd:edit',
    'technical:view',
    'technical:edit',
    'tasks:create',
    'tasks:assign',
    'tasks:update',
    'team:view',
    'team:manage',
    'tech:view',
    'tech:manage',
    'integrations:view',
    'integrations:manage',
    'git:view',
    'git:manage',
    'settings:manage',
  ],
  Admin: [
    'projects:create',
    'projects:view',
    'projects:edit',
    'projects:delete',
    'briefs:edit',
    'ai:generate',
    'prd:view',
    'prd:edit',
    'technical:view',
    'technical:edit',
    'tasks:create',
    'tasks:assign',
    'tasks:update',
    'team:view',
    'team:manage',
    'tech:view',
    'tech:manage',
    'integrations:view',
    'integrations:manage',
    'git:view',
    'git:manage',
  ],
  'Project Manager': [
    'projects:create',
    'projects:view',
    'projects:edit',
    'briefs:edit',
    'prd:view',
    'prd:edit',
    'technical:view',
    'tasks:create',
    'tasks:assign',
    'tasks:update',
    'team:view',
    'git:view',
  ],
  Strategist: [
    'projects:view',
    'briefs:edit',
    'ai:generate',
    'prd:view',
    'prd:edit',
    'team:view',
  ],
  Designer: [
    'projects:view',
    'prd:view',
    'tasks:update',
    'team:view',
  ],
  Developer: [
    'projects:view',
    'technical:view',
    'technical:edit',
    'tasks:update',
    'git:view',
    'git:manage',
    'team:view',
  ],
  'AI Engineer': [
    'projects:view',
    'ai:generate',
    'technical:view',
    'technical:edit',
    'tasks:update',
    'git:view',
    'git:manage',
    'team:view',
  ],
  Viewer: [
    'projects:view',
    'prd:view',
    'technical:view',
    'team:view',
  ],
};

export function hasPermission(
  role: MembershipRole | string,
  permission: Permission,
  customPermissions: string[] = []
): boolean {
  if (customPermissions && customPermissions.includes(permission)) {
    return true;
  }
  const rolePerms = ROLE_PERMISSIONS[role as MembershipRole];
  if (!rolePerms) return false;
  return rolePerms.includes(permission);
}

export function can(
  role: MembershipRole | string,
  permission: Permission,
  customPermissions: string[] = []
): boolean {
  return hasPermission(role, permission, customPermissions);
}
