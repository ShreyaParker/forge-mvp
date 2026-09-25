import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Project from '../../../../../models/Project';
import { generateTasks } from '../../../../../services/ai.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const context = {
      prd: project.prd,
      technicalPlan: project.technicalPlan,
    };

    const tasks = await generateTasks(context);
    project.tasks = tasks;
    project.status = 'Ready for Dev'; // Update overall status as this is the final step
    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    const id = (await params).id;
    const { taskId, status } = await req.json();

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (!project.tasks) return NextResponse.json({ error: 'No tasks found' }, { status: 400 });

    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    project.tasks[taskIndex].status = status;
    await project.save();

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
