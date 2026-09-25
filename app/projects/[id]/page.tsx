import dbConnect from '../../../lib/dbConnect';
import Project from '../../../models/Project';
import ClientWorkspace from './client-workspace';
import { calculateReadiness } from '../../../lib/utils';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const id = (await params).id;
  const projectDoc = await Project.findById(id).lean();
  
  if (!projectDoc) {
    notFound();
  }

  // Convert MongoDB document to plain JS object and calculate readiness
  const serialized = JSON.parse(JSON.stringify(projectDoc));
  const project = {
    ...serialized,
    _id: serialized._id.toString(),
    readinessScore: calculateReadiness(serialized),
  };

  return <ClientWorkspace initialProject={project} />;
}
