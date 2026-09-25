import mongoose from 'mongoose';
import dbConnect from '../lib/dbConnect';
import Project, { normalizeProject } from '../models/Project';
import { calculateReadiness } from '../lib/utils';
import { getSession } from '../lib/session';
import DashboardClient from '../components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();
  const session = await getSession();

  let query: any = {};
  if (session?.organizationId) {
    query.$or = [
      { organizationId: session.organizationId },
      ...(session.organizationId.match(/^[0-9a-fA-F]{24}$/)
        ? [{ organizationId: new mongoose.Types.ObjectId(session.organizationId) }]
        : []),
    ];
  }

  let rawProjects = await Project.find(query).sort({ updatedAt: -1, createdAt: -1 }).lean();

  // If active org has 0 projects, but projects exist with no organizationId (legacy),
  // and this is the default agency (Parker Studio), optionally display them
  if (rawProjects.length === 0 && session?.organization?.slug === 'parker-studio') {
    const unassigned = await Project.find({ organizationId: { $exists: false } }).sort({ createdAt: -1 }).lean();
    if (unassigned.length > 0) {
      rawProjects = unassigned;
    }
  }

  // Clean up MongoDB _id and normalize project shape
  const projects = rawProjects.map(p => {
    const normalized = normalizeProject(p);
    const score = calculateReadiness(normalized);
    return {
      ...normalized,
      _id: normalized._id.toString(),
      readinessScore: score,
    };
  });

  return <DashboardClient initialProjects={projects} session={session} />;
}
