import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/Project';
import { generateAiAnalysis } from '../../../../../services/ai.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const brief = project.basicInfo.description;
    const analysis = await generateAiAnalysis(brief);

    // Update project with analysis results
    project.brand = analysis.brand;
    project.product = analysis.product;
    project.guardrails = analysis.guardrails;
    project.aiAnalysis = analysis.aiAnalysis;
    project.status = 'Analyzed';
    
    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze project' }, { status: 500 });
  }
}
