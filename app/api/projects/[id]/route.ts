import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../../models/Project';
import { calculateReadiness, computeDeliveryEstimate } from '../../../../lib/utils';
import { getSession, checkPermission } from '../../../../lib/session';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(normalizeProject(project.toObject()));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const body = await req.json();
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Validate project access against active organization if project is assigned to an org
    const session = await getSession();
    if (session && project.organizationId) {
      if (project.organizationId.toString() !== session.organizationId) {
        return NextResponse.json(
          { error: 'Forbidden: Project does not belong to the active workspace' },
          { status: 403 }
        );
      }
    }

    // Handle granular mutations by type
    if (body.type) {
      switch (body.type) {
        case 'DNA_UPDATE': {
          const { competitors, references, persistentInstructions } = body.data || {};
          if (!project.dna) {
            project.dna = { competitors: [], references: [], persistentInstructions: '' };
          }
          if (competitors !== undefined) project.dna.competitors = competitors;
          if (references !== undefined) project.dna.references = references;
          if (persistentInstructions !== undefined) project.dna.persistentInstructions = persistentInstructions;
          project.markModified('dna');
          break;
        }

        case 'GUARDRAILS_UPDATE': {
          const { always, never } = body.data || {};
          if (!project.guardrails) {
            project.guardrails = { always: [], never: [] };
          }
          if (always !== undefined) project.guardrails.always = always;
          if (never !== undefined) project.guardrails.never = never;
          project.markModified('guardrails');
          break;
        }

        case 'GUARDRAIL_ADD': {
          const { category, text, source } = body.data || {};
          if (!category || !text) {
            return NextResponse.json({ error: 'category and text are required' }, { status: 400 });
          }
          if (!project.guardrails) {
            project.guardrails = { always: [], never: [] };
          }
          const cat = category as 'always' | 'never';
          if (!Array.isArray(project.guardrails[cat])) {
            project.guardrails[cat] = [];
          }
          const newId = `g-${cat}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          project.guardrails[cat].push({
            id: newId,
            text: text.trim(),
            source: source || 'human_edited',
          });
          project.markModified('guardrails');
          break;
        }

        case 'GUARDRAIL_DELETE': {
          const { category, id: guardrailId } = body.data || {};
          if (project.guardrails && category) {
            const cat = category as 'always' | 'never';
            if (Array.isArray(project.guardrails[cat])) {
              project.guardrails[cat] = project.guardrails[cat].filter((g: any) => g.id !== guardrailId);
              project.markModified('guardrails');
            }
          }
          break;
        }

        case 'TECH_DECISION_TOGGLE': {
          const { layer, isApproved, recommendation, rationale } = body.data || {};
          const validLayers = ['frontend', 'backend', 'database', 'auth', 'infrastructure'] as const;
          type ValidLayer = typeof validLayers[number];
          if (!project.technicalPlan) {
            project.technicalPlan = {};
          }
          if (validLayers.includes(layer as ValidLayer)) {
            const targetLayer = layer as ValidLayer;
            if (!project.technicalPlan[targetLayer]) {
              project.technicalPlan[targetLayer] = { recommendation: '', rationale: '', isApproved: false };
            }
            const currentLayer = project.technicalPlan[targetLayer]!;
            if (isApproved !== undefined) currentLayer.isApproved = Boolean(isApproved);
            if (recommendation !== undefined) currentLayer.recommendation = recommendation;
            if (rationale !== undefined) currentLayer.rationale = rationale;
            project.markModified('technicalPlan');
          }
          break;
        }

        case 'TECH_INTEGRATION_UPDATE': {
          const { integrations } = body.data || {};
          if (!project.technicalPlan) {
            project.technicalPlan = {};
          }
          if (integrations !== undefined) {
            project.technicalPlan.integrations = integrations;
            project.markModified('technicalPlan');
          }
          break;
        }

        case 'TASK_CREATE': {
          const { epic, title, ownerRole, priority, estimateDays, status } = body.data || {};
          if (!project.tasks) {
            project.tasks = [];
          }
          let maxNum = 0;
          for (const t of project.tasks) {
            const match = t.id?.match(/TASK-(\d+)/i);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            }
          }
          const newTaskId = `TASK-${maxNum + 1}`;
          project.tasks.push({
            id: newTaskId,
            epic: epic?.trim() || 'General',
            title: title?.trim() || 'New Task',
            ownerRole: ownerRole || 'Full Stack',
            priority: priority || 'Medium',
            estimateDays: Number(estimateDays) || 1,
            status: status || 'Todo',
            assignedUserId: body.data?.assignedUserId,
          });
          project.markModified('tasks');
          break;
        }

        case 'TASK_UPDATE': {
          const { taskId, title, ownerRole, assignedUserId, priority, estimateDays, status, epic } = body.data || {};
          if (project.tasks && taskId) {
            const taskIndex = project.tasks.findIndex((t: any) => t.id === taskId);
            if (taskIndex !== -1) {
              if (title !== undefined) project.tasks[taskIndex].title = title.trim();
              if (ownerRole !== undefined) project.tasks[taskIndex].ownerRole = ownerRole;
              if (assignedUserId !== undefined) project.tasks[taskIndex].assignedUserId = assignedUserId;
              if (priority !== undefined) project.tasks[taskIndex].priority = priority;
              if (estimateDays !== undefined) project.tasks[taskIndex].estimateDays = Number(estimateDays);
              if (status !== undefined) project.tasks[taskIndex].status = status;
              if (epic !== undefined) project.tasks[taskIndex].epic = epic.trim();
              project.markModified('tasks');
            }
          }
          break;
        }

        case 'TASK_DELETE': {
          const { taskId } = body.data || {};
          if (project.tasks && taskId) {
            project.tasks = project.tasks.filter((t: any) => t.id !== taskId);
            project.markModified('tasks');
          }
          break;
        }

        case 'TEAM_UPDATE': {
          const { team } = body.data || {};
          if (Array.isArray(team)) {
            project.team = team;
            project.markModified('team');
          }
          break;
        }

        case 'FEATURE_TASK_TOGGLE': {
          const { featureId, taskId, status } = body.data || {};
          if (Array.isArray(project.features)) {
            for (const feat of project.features) {
              if (!featureId || feat.id === featureId) {
                const t = feat.tasks.find((task: any) => task.id === taskId);
                if (t && status) {
                  t.status = status;
                  project.markModified('features');
                  break;
                }
              }
            }
          }
          if (Array.isArray(project.tasks)) {
            const t = project.tasks.find((task: any) => task.id === taskId);
            if (t && status) {
              t.status = status;
              project.markModified('tasks');
            }
          }
          break;
        }

        case 'FEATURE_TASK_ASSIGN': {
          const { featureId, taskId, assignedUserId, assignedRole } = body.data || {};
          if (Array.isArray(project.features)) {
            for (const feat of project.features) {
              if (!featureId || feat.id === featureId) {
                const t = feat.tasks.find((task: any) => task.id === taskId);
                if (t) {
                  if (assignedUserId !== undefined) t.assignedUserId = assignedUserId;
                  if (assignedRole !== undefined) t.assignedRole = assignedRole;
                  project.markModified('features');
                  break;
                }
              }
            }
          }
          if (Array.isArray(project.tasks)) {
            const t = project.tasks.find((task: any) => task.id === taskId);
            if (t) {
              if (assignedUserId !== undefined) t.assignedUserId = assignedUserId;
              if (assignedRole !== undefined) t.ownerRole = assignedRole;
              project.markModified('tasks');
            }
          }
          break;
        }

        case 'FEATURE_TASK_CREATE': {
          const { featureId, title, layer, assignedRole, assignedUserId, priority, estimateDays } = body.data || {};
          if (Array.isArray(project.features) && featureId && title) {
            const feat = project.features.find((f: any) => f.id === featureId);
            if (feat) {
              const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
              feat.tasks.push({
                id: newTaskId,
                title: title.trim(),
                layer: layer || 'Frontend',
                assignedRole: assignedRole || 'Developer',
                assignedUserId: assignedUserId || undefined,
                priority: priority || 'Medium',
                estimateDays: Number(estimateDays) || 1,
                status: 'Todo',
              });
              project.markModified('features');
            }
          }
          break;
        }

        case 'TECH_APPROVAL_TOGGLE': {
          const { layer, isApproved } = body.data || {};
          if (project.technicalPlan && layer && (project.technicalPlan as any)[layer]) {
            (project.technicalPlan as any)[layer].isApproved = Boolean(isApproved);
            project.markModified('technicalPlan');
          }
          break;
        }

        case 'GUARDRAIL_MUTATE': {
          const { always, never } = body.data || {};
          if (!project.guardrails) project.guardrails = { always: [], never: [] };
          if (always !== undefined) project.guardrails.always = always;
          if (never !== undefined) project.guardrails.never = never;
          project.markModified('guardrails');
          break;
        }

        default:
          return NextResponse.json({ error: `Unknown mutation type: ${body.type}` }, { status: 400 });
      }
    } else {
      // Direct property assignment for backward compatibility
      Object.assign(project, body);
    }

    // Always recalculate delivery estimate and readiness score on every mutation
    const teamSize = project.team?.length || 2;
    project.deliveryEstimate = computeDeliveryEstimate(project.features, teamSize);
    project.readinessScore = calculateReadiness(project);
    await project.save();

    return NextResponse.json(normalizeProject(project.toObject()));
  } catch (error: any) {
    console.error('PATCH /api/projects/[id] error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const session = await getSession();
    if (session && !checkPermission(session, 'projects:delete')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to delete project' }, { status: 403 });
    }
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (session && project.organizationId && project.organizationId.toString() !== session.organizationId) {
      return NextResponse.json({ error: 'Forbidden: Project does not belong to active workspace' }, { status: 403 });
    }
    await Project.findByIdAndDelete(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete project' }, { status: 500 });
  }
}
