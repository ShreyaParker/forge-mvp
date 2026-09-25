import { Suspense } from 'react';
import dbConnect from '../../lib/dbConnect';
import Organization from '../../models/Organization';
import Membership from '../../models/Membership';
import User from '../../models/User';
import { getSession } from '../../lib/session';
import OrganizationHub from './organization-hub';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrganizationPage() {
  await dbConnect();
  const session = await getSession();

  if (!session) {
    notFound();
  }

  // Fetch full organization document
  const orgDoc = await Organization.findById(session.organizationId).lean();
  if (!orgDoc) {
    notFound();
  }

  // Fetch all members for this organization
  const memberships = await Membership.find({ organizationId: orgDoc._id }).lean();
  const userIds = memberships.map(m => m.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();

  const members = memberships.map(m => {
    const user = users.find(u => u._id.toString() === m.userId.toString());
    return {
      membershipId: m._id.toString(),
      userId: m.userId.toString(),
      role: m.role,
      availability: m.availability,
      customPermissions: m.customPermissions || [],
      joinedAt: m.joinedAt?.toISOString() || new Date().toISOString(),
      user: user
        ? {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            skills: user.skills || [],
            gitIdentity: user.gitIdentity,
          }
        : {
            id: m.userId.toString(),
            name: 'Unknown User',
            email: '',
            skills: [],
          },
    };
  });

  const serializedOrg = {
    ...orgDoc,
    _id: orgDoc._id.toString(),
    services: orgDoc.services || [],
    specializations: orgDoc.specializations || [],
    techInventory: orgDoc.techInventory || [],
    apiInventory: orgDoc.apiInventory || [],
  };

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-6 py-20 flex items-center justify-center text-zinc-500">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading Organization Intelligence Hub...
        </div>
      }
    >
      <OrganizationHub
        initialOrg={serializedOrg}
        initialMembers={members}
        userRole={session.membership.role}
      />
    </Suspense>
  );
}
