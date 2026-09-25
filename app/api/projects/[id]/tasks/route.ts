import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../../../models/Project';
import Organization from '../../../../../models/Organization';
import { generateFeaturesAndTasks } from '../../../../../services/ai.service';
import { calculateReadiness, computeDeliveryEstimate } from '../../../../../lib/utils';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let orgContext: any = null;
    if (project.organizationId) {
      const org = await Organization.findById(project.organizationId).lean();
      if (org) {
        orgContext = {
          name: org.name,
          techInventory: org.techInventory?.filter((t: any) => t.approvedForProduction) || [],
          apiInventory: org.apiInventory?.filter((a: any) => a.status === 'Connected') || [],
        };
      }
    }

    const context = {
      basicInfo: project.basicInfo,
      dna: project.dna,
      prd: project.prd,
      technicalPlan: project.technicalPlan,
    };

    const features = await generateFeaturesAndTasks(context, orgContext);
    project.features = features;

    // Flatten into legacy tasks for backward compatibility
    const flatTasks: any[] = [];
    for (const f of features) {
      if (Array.isArray(f.tasks)) {
        for (const t of f.tasks) {
          flatTasks.push({
            id: t.id,
            epic: f.name,
            title: t.title,
            ownerRole: t.assignedRole || 'Developer',
            assignedUserId: t.assignedUserId,
            priority: t.priority || 'Medium',
            estimateDays: t.estimateDays || 1,
            status: t.status || 'Todo',
          });
        }
      }
    }
    project.tasks = flatTasks;

    const teamSize = project.team?.length || 2;
    project.deliveryEstimate = computeDeliveryEstimate(project.features, teamSize);
    project.status = 'Ready for Dev';
    project.readinessScore = calculateReadiness(project);
    await project.save();

    return NextResponse.json(normalizeProject(project.toObject()));
  } catch (error) {
    console.error('POST /api/projects/[id]/tasks error:', error);
    return NextResponse.json({ error: 'Failed to generate features and tasks' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const { taskId, featureId, status, assignedUserId, assignedRole } = await req.json();

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Update in features
    if (project.features && Array.isArray(project.features)) {
      for (const feat of project.features) {
        if (!featureId || feat.id === featureId) {
          const t = feat.tasks.find((task: any) => task.id === taskId);
          if (t) {
            if (status !== undefined) t.status = status;
            if (assignedUserId !== undefined) t.assignedUserId = assignedUserId;
            if (assignedRole !== undefined) t.assignedRole = assignedRole;
            project.markModified('features');
            break;
          }
        }
      }
    }

    // Update in legacy tasks
    if (project.tasks && Array.isArray(project.tasks)) {
      const taskIndex = project.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        if (status !== undefined) project.tasks[taskIndex].status = status;
        if (assignedUserId !== undefined) project.tasks[taskIndex].assignedUserId = assignedUserId;
        if (assignedRole !== undefined) project.tasks[taskIndex].ownerRole = assignedRole;
        project.markModified('tasks');
      }
    }

    const teamSize = project.team?.length || 2;
    project.deliveryEstimate = computeDeliveryEstimate(project.features, teamSize);
    project.readinessScore = calculateReadiness(project);
    await project.save();

    return NextResponse.json(normalizeProject(project.toObject()));
  } catch (error) {
    console.error('PATCH /api/projects/[id]/tasks error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
