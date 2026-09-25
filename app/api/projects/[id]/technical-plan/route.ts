import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/Project';
import { generateTechnicalPlan } from '../../../../../services/ai.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const context = {
      basicInfo: project.basicInfo,
      product: project.product,
      prd: project.prd,
    };

    const plan = await generateTechnicalPlan(context);
    project.technicalPlan = plan;
    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate technical plan' }, { status: 500 });
  }
}
