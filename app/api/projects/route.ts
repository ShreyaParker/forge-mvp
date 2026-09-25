import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../models/Project';
import { calculateReadiness } from '../../../lib/utils';

export async function GET() {
  await dbConnect();
  try {
    const rawProjects = await Project.find({}).sort({ createdAt: -1 });
    const projects = rawProjects.map(p => normalizeProject(p.toObject()));
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const newProjectData = {
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
