import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../../../../models/Project';
import { analyzeGitDrift } from '../../../../../../services/ai.service';
import { getSession } from '../../../../../../lib/session';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const features = project.features || [];
    const commits = project.gitIntegration?.commits || [];

    const healthAnalysis = await analyzeGitDrift(features, commits);

    if (!project.gitIntegration) {
      project.gitIntegration = {
        connected: true,
        repoUrl: 'https://github.com/agency/project-repo',
        branch: 'main',
        commits: [],
        pullRequests: [],
      };
    }

    project.gitIntegration.aiHealthAnalysis = {
      driftScore: healthAnalysis.driftScore,
      insights: healthAnalysis.insights,
      dormantFeatures: healthAnalysis.dormantFeatures,
      lastAnalyzedAt: new Date(),
    };

    project.markModified('gitIntegration');
    await project.save();

    return NextResponse.json({
      success: true,
      gitIntegration: project.gitIntegration,
      project: normalizeProject(project.toObject()),
    });
  } catch (error: any) {
    console.error('POST /api/projects/[id]/git/analyze error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze Git drift' },
      { status: 500 }
    );
  }
}
