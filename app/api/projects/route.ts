import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../models/Project';
import { calculateReadiness } from '../../../lib/utils';
import { getSession, checkPermission } from '../../../lib/session';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const requestedOrgId = searchParams.get('orgId') || session?.organizationId;

    let query: any = {};
    if (requestedOrgId) {
      query.$or = [
        { organizationId: requestedOrgId },
        ...(requestedOrgId.match(/^[0-9a-fA-F]{24}$/) ? [{ organizationId: new mongoose.Types.ObjectId(requestedOrgId) }] : [])
      ];
    }

    const rawProjects = await Project.find(query).sort({ createdAt: -1 });
    const projects = rawProjects.map(p => normalizeProject(p.toObject()));
    return NextResponse.json(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const session = await getSession();
    if (session && !checkPermission(session, 'projects:create')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to create projects' }, { status: 403 });
    }

    const body = await req.json();
    const targetOrgId = body.organizationId || session?.organizationId;

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization ID is required to create a project' }, { status: 400 });
    }

    const team = session?.userId
      ? [
          {
            userId: session.userId,
            role: session.membership.role,
            assignedAt: new Date(),
          },
        ]
      : [];

    const newProjectData = {
      organizationId: targetOrgId,
      team,
      basicInfo: {
        name: body.name,
        clientName: body.clientName,
        description: body.description,
        website: body.website,
        targetPlatforms: body.targetPlatforms || [],
      },
      dna: {
        competitors: [],
        references: [],
        persistentInstructions: '',
      },
      guardrails: {
        always: [],
        never: [],
      },
      status: 'Draft' as const,
    };

    const score = calculateReadiness(newProjectData);
    const project = await Project.create({
      ...newProjectData,
      readinessScore: score,
    });

    return NextResponse.json(normalizeProject(project.toObject()), { status: 201 });
  } catch (error: any) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create project' }, { status: 500 });
  }
}
