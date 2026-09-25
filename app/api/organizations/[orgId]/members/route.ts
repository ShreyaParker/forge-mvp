import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Organization from '../../../../../models/Organization';
import Membership from '../../../../../models/Membership';
import User from '../../../../../models/User';
import { getSession, checkPermission } from '../../../../../lib/session';

export async function GET(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  await dbConnect();
  try {
    const { orgId } = await params;
    let organization;
    if (orgId.match(/^[0-9a-fA-F]{24}$/)) {
      organization = await Organization.findById(orgId).lean();
    } else {
      organization = await Organization.findOne({ slug: orgId }).lean();
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const memberships = await Membership.find({ organizationId: organization._id }).lean();
    const userIds = memberships.map(m => m.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();

    const members = memberships.map(membership => {
      const user = users.find(u => u._id.toString() === membership.userId.toString());
      return {
        membershipId: membership._id.toString(),
        userId: membership.userId.toString(),
        role: membership.role,
        availability: membership.availability,
        customPermissions: membership.customPermissions || [],
        joinedAt: membership.joinedAt,
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
              id: membership.userId.toString(),
              name: 'Unknown User',
              email: '',
              skills: [],
            },
      };
    });

    return NextResponse.json(members);
  } catch (error: any) {
    console.error('GET /api/organizations/[orgId]/members error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canManageTeam = checkPermission(session, 'team:manage');
    if (!canManageTeam) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to manage team members' }, { status: 403 });
    }

    const { orgId } = await params;
    let organization;
    if (orgId.match(/^[0-9a-fA-F]{24}$/)) {
      organization = await Organization.findById(orgId);
    } else {
      organization = await Organization.findOne({ slug: orgId });
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, role = 'Developer', skills = [], availability = 'Available', bio, avatarUrl } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find or create User
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        name: (name || email.split('@')[0]).trim(),
        email: email.toLowerCase().trim(),
        skills,
        bio,
        avatarUrl,
      });
    } else {
      // If skills provided and user has none, add them
      if (skills && skills.length > 0) {
        user.skills = skills;
        await user.save();
      }
    }

    // Check if membership already exists
    let membership = await Membership.findOne({
      userId: user._id,
      organizationId: organization._id,
    });

    if (membership) {
      membership.role = role;
      membership.availability = availability;
      await membership.save();
    } else {
      membership = await Membership.create({
        userId: user._id,
        organizationId: organization._id,
        role,
        availability,
        customPermissions: [],
      });

      // Update teamSize in organization
      const count = await Membership.countDocuments({ organizationId: organization._id });
      organization.teamSize = count;
      await organization.save();
    }

    return NextResponse.json(
      {
        membershipId: membership._id.toString(),
        userId: user._id.toString(),
        role: membership.role,
        availability: membership.availability,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          skills: user.skills || [],
          gitIdentity: user.gitIdentity,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/organizations/[orgId]/members error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to add member' }, { status: 500 });
  }
}
