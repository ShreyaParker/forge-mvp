import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../../../models/Project';
import { generateTechnicalPlan } from '../../../../../services/ai.service';
import { calculateReadiness } from '../../../../../lib/utils';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const context = {
      basicInfo: project.basicInfo,
      dna: project.dna,
      product: project.product,
      prd: project.prd,
      guardrails: project.guardrails,
    };

    const plan = await generateTechnicalPlan(context);
    project.technicalPlan = plan;
    project.readinessScore = calculateReadiness(project);
    await project.save();

    return NextResponse.json(normalizeProject(project.toObject()));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate technical plan' }, { status: 500 });
  }
}
