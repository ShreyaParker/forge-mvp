import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/Project';
import { generatePrd } from '../../../../../services/ai.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const context = {
      basicInfo: project.basicInfo,
      product: project.product,
      guardrails: project.guardrails,
    };

    const prd = await generatePrd(context);
    project.prd = prd;
    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate PRD' }, { status: 500 });
  }
}
