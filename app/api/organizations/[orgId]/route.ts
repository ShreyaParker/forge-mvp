import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Organization from '../../../../models/Organization';
import { getSession, checkPermission } from '../../../../lib/session';

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

    return NextResponse.json({
      ...organization,
      _id: organization._id.toString(),
    });
  } catch (error: any) {
    console.error('GET /api/organizations/[orgId] error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch organization' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check permission to update
    const canManageSettings = checkPermission(session, 'settings:manage');
    const canManageTech = checkPermission(session, 'tech:manage');
    const canManageIntegrations = checkPermission(session, 'integrations:manage');

    const body = await req.json();

    // Check specific fields or granular mutation types
    if (body.type === 'TECH_INVENTORY_UPDATE') {
      if (!canManageTech && !canManageSettings) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions for tech stack updates' }, { status: 403 });
      }
      organization.techInventory = body.techInventory;
    } else if (body.type === 'API_INVENTORY_UPDATE') {
      if (!canManageIntegrations && !canManageSettings) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions for API inventory updates' }, { status: 403 });
      }
      organization.apiInventory = body.apiInventory;
    } else if (body.type === 'PROFILE_UPDATE') {
      if (!canManageSettings) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions for organization settings' }, { status: 403 });
      }
      const { name, description, website, industry, teamSize, services, specializations, workspaceType } = body.data || {};
      if (name !== undefined) organization.name = name;
      if (description !== undefined) organization.description = description;
      if (website !== undefined) organization.website = website;
      if (industry !== undefined) organization.industry = industry;
      if (teamSize !== undefined) organization.teamSize = teamSize;
      if (services !== undefined) organization.services = services;
      if (specializations !== undefined) organization.specializations = specializations;
      if (workspaceType !== undefined) organization.workspaceType = workspaceType;
    } else {
      // General patch
      if (body.techInventory !== undefined) {
        if (!canManageTech && !canManageSettings) {
          return NextResponse.json({ error: 'Forbidden: Insufficient permissions for tech inventory' }, { status: 403 });
        }
        organization.techInventory = body.techInventory;
      }
      if (body.apiInventory !== undefined) {
        if (!canManageIntegrations && !canManageSettings) {
          return NextResponse.json({ error: 'Forbidden: Insufficient permissions for API inventory' }, { status: 403 });
        }
        organization.apiInventory = body.apiInventory;
      }
      if (body.name !== undefined || body.description !== undefined || body.services !== undefined || body.specializations !== undefined || body.website !== undefined || body.industry !== undefined) {
        if (!canManageSettings) {
          return NextResponse.json({ error: 'Forbidden: Insufficient permissions for organization settings' }, { status: 403 });
        }
        if (body.name !== undefined) organization.name = body.name;
        if (body.description !== undefined) organization.description = body.description;
        if (body.website !== undefined) organization.website = body.website;
        if (body.industry !== undefined) organization.industry = body.industry;
        if (body.teamSize !== undefined) organization.teamSize = body.teamSize;
        if (body.services !== undefined) organization.services = body.services;
        if (body.specializations !== undefined) organization.specializations = body.specializations;
        if (body.workspaceType !== undefined) organization.workspaceType = body.workspaceType;
      }
    }

    await organization.save();
    return NextResponse.json({
      ...organization.toObject(),
      _id: organization._id.toString(),
    });
  } catch (error: any) {
    console.error('PATCH /api/organizations/[orgId] error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update organization' }, { status: 500 });
  }
}
