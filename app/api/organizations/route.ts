import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Organization from '../../../models/Organization';
import Membership from '../../../models/Membership';
import Project from '../../../models/Project';
import { getSession } from '../../../lib/session';

export async function GET() {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find memberships for this user
    const memberships = await Membership.find({ userId: session.userId }).lean();
    const orgIds = memberships.map(m => m.organizationId);

    let organizations = await Organization.find({
      _id: { $in: orgIds },
    }).lean();

    if (organizations.length === 0) {
      organizations = await Organization.find({}).lean();
    }

    const workspaces = await Promise.all(
      organizations.map(async (org) => {
        const projectCount = await Project.countDocuments({ organizationId: org._id });
        const member = memberships.find(m => m.organizationId.toString() === org._id.toString());
        return {
          ...org,
          _id: org._id.toString(),
          role: member ? member.role : 'Owner',
          projectCount,
          isCurrent: org._id.toString() === session.organizationId,
        };
      })
    );

    return NextResponse.json(workspaces);
  } catch (error: any) {
    console.error('GET /api/organizations error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      workspaceType = 'Agency',
      description,
      website,
      industry,
      teamSize = 1,
      services = [],
      specializations = [],
      techInventory = [],
      apiInventory = [],
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) || `org-${Date.now()}`;

    // Check if slug exists
    const existing = await Organization.findOne({ slug: finalSlug });
    if (existing) {
      return NextResponse.json({ error: `Slug "${finalSlug}" is already taken` }, { status: 409 });
    }

    const organization = await Organization.create({
      name: name.trim(),
      slug: finalSlug,
      workspaceType,
      description,
      website,
      industry,
      teamSize,
      services,
      specializations,
      techInventory,
      apiInventory,
    });

    // Create Owner membership for creator
    await Membership.create({
      userId: session.userId,
      organizationId: organization._id,
      role: 'Owner',
      customPermissions: [],
      availability: 'Available',
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/organizations error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create organization' }, { status: 500 });
  }
}
