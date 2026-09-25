import { NextResponse } from 'next/server';
import { getSession, COOKIE_ORG_KEY, COOKIE_USER_KEY } from '../../../../lib/session';
import dbConnect from '../../../../lib/dbConnect';
import Organization from '../../../../models/Organization';
import Membership from '../../../../models/Membership';
import Project from '../../../../models/Project';

export async function GET() {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // Get list of all workspaces user belongs to
    const memberships = await Membership.find({ userId: session.userId }).lean();
    const orgIds = memberships.map(m => m.organizationId);

    // If user has memberships, fetch those orgs, else fetch all organizations
    let accessibleOrgs = await Organization.find({
      _id: { $in: orgIds },
    }).lean();

    // If accessibleOrgs is empty (e.g. initial setup), return all organizations
    if (accessibleOrgs.length === 0) {
      accessibleOrgs = await Organization.find({}).sort({ createdAt: 1 }).lean();
    }

    // Get project counts per organization
    const orgsWithMeta = await Promise.all(
      accessibleOrgs.map(async (org) => {
        const projectCount = await Project.countDocuments({ organizationId: org._id });
        const memberInfo = memberships.find(m => m.organizationId.toString() === org._id.toString());
        return {
          id: org._id.toString(),
          name: org.name,
          slug: org.slug,
          workspaceType: org.workspaceType,
          description: org.description,
          role: memberInfo ? memberInfo.role : 'Owner',
          projectCount,
          isCurrent: org._id.toString() === session.organizationId,
        };
      })
    );

    return NextResponse.json({
      session,
      availableWorkspaces: orgsWithMeta,
    });
  } catch (error: any) {
    console.error('GET /api/auth/session error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch session' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { organizationId, userId } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    // Verify organization exists
    const org = await Organization.findById(organizationId).lean();
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      activeOrganizationId: org._id.toString(),
      activeOrganizationName: org.name,
    });

    // Set cookie for 30 days
    response.cookies.set(COOKIE_ORG_KEY, org._id.toString(), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    if (userId) {
      response.cookies.set(COOKIE_USER_KEY, userId, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error: any) {
    console.error('POST /api/auth/session error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update session' }, { status: 500 });
  }
}
