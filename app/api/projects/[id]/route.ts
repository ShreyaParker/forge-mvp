import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../../models/Project';
import { calculateReadiness } from '../../../../lib/utils';

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
          });
          project.markModified('tasks');
          break;
        }

        case 'TASK_UPDATE': {
          const { taskId, title, ownerRole, priority, estimateDays, status, epic } = body.data || {};
          if (project.tasks && taskId) {
            const taskIndex = project.tasks.findIndex((t: any) => t.id === taskId);
            if (taskIndex !== -1) {
              if (title !== undefined) project.tasks[taskIndex].title = title.trim();
              if (ownerRole !== undefined) project.tasks[taskIndex].ownerRole = ownerRole;
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

        default:
          return NextResponse.json({ error: `Unknown mutation type: ${body.type}` }, { status: 400 });
      }
    } else {
      // Direct property assignment for backward compatibility
      Object.assign(project, body);
    }

    // Always recalculate readiness score on every mutation
    project.readinessScore = calculateReadiness(project);
    await project.save();

    return NextResponse.json(normalizeProject(project.toObject()));
  } catch (error: any) {
    console.error('PATCH /api/projects/[id] error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update project' }, { status: 500 });
  }
}
