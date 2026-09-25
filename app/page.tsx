import Link from 'next/link';
import mongoose from 'mongoose';
import { Plus, Folder, ArrowRight, Activity, Building2, User, Sparkles } from 'lucide-react';
import dbConnect from '../lib/dbConnect';
import Project from '../models/Project';
import { calculateReadiness } from '../lib/utils';
import { getSession } from '../lib/session';

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

  let rawProjects = await Project.find(query).sort({ createdAt: -1 }).lean();

  // If active org has 0 projects, but projects exist with no organizationId (legacy),
  // and this is the default agency (Parker Studio), optionally display them or keep strict
  if (rawProjects.length === 0 && session?.organization?.slug === 'parker-studio') {
    const unassigned = await Project.find({ organizationId: { $exists: false } }).sort({ createdAt: -1 }).lean();
    if (unassigned.length > 0) {
      rawProjects = unassigned;
    }
  }

  // Clean up MongoDB _id to string id for React components
  const projects = rawProjects.map(p => {
    const proj = { ...p, _id: p._id.toString() };
    const score = calculateReadiness(proj);
    return { ...proj, readinessScore: score };
  });

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${
                session?.organization?.workspaceType === 'Individual'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              {session?.organization?.workspaceType === 'Individual' ? (
                <User size={12} className="text-sky-400" />
              ) : (
                <Building2 size={12} className="text-zinc-300" />
              )}
              {session?.organization?.name || 'Agency'}
            </span>

            <span className="text-xs text-zinc-500 font-mono">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Projects Dashboard
          </h1>
          <p className="text-zinc-400 text-base max-w-xl">
            {session?.organization?.description || 'Manage your project intelligence and readiness pipeline.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/organization"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-lg font-medium hover:bg-zinc-800 hover:text-white transition-colors text-sm"
          >
            Organization Intelligence
          </Link>
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.12)] text-sm"
          >
            <Plus size={18} />
            New Project
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="border border-zinc-800 rounded-2xl p-16 text-center bg-zinc-900/30 flex flex-col items-center max-w-2xl mx-auto shadow-inner">
          <div className="w-16 h-16 bg-zinc-800/80 border border-zinc-700/60 rounded-2xl flex items-center justify-center mb-5 text-zinc-400 shadow-md">
            <Folder size={30} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            No projects in {session?.organization?.name || 'this workspace'}
          </h2>
          <p className="text-zinc-400 max-w-md mb-8 text-sm leading-relaxed">
            Create your first project brief to analyze requirements, structure PRD documents, generate technical plans, and track execution tasks.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link
              href={`/projects/${project._id}`}
              key={project._id}
              className="group flex flex-col border border-zinc-800/80 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all p-6 relative overflow-hidden shadow-sm hover:shadow-lg"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-400 group-hover:from-white group-hover:to-zinc-300 transition-all"></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    {project.basicInfo?.clientName}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-zinc-100 transition-colors">
                    {project.basicInfo?.name}
                  </h3>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    project.status === 'Ready for Dev'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : project.status === 'Analyzed'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                  }`}
                >
                  {project.status}
                </div>
              </div>

              <div className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                {project.basicInfo?.description}
              </div>

              {/* Target Platforms */}
              {project.basicInfo?.targetPlatforms && project.basicInfo.targetPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.basicInfo.targetPlatforms.map((plat: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px] font-mono"
                    >
                      {plat}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-zinc-500" />
                  <div className="text-sm font-semibold text-zinc-300">
                    {project.readinessScore}% Ready
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
