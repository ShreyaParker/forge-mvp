import Link from 'next/link';
import { Plus, Folder, ArrowRight, Activity } from 'lucide-react';
import dbConnect from '../lib/dbConnect';
import Project from '../models/Project';
import { calculateReadiness } from '../lib/utils';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await dbConnect();
  const rawProjects = await Project.find({}).sort({ createdAt: -1 }).lean();
  
  // Clean up MongoDB _id to string id for React components
  const projects = rawProjects.map(p => {
    const proj = { ...p, _id: p._id.toString() };
    const score = calculateReadiness(proj);
    return { ...proj, readinessScore: score };
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Agency Dashboard</h1>
          <p className="text-zinc-400 text-lg">Manage your project intelligence and readiness pipeline.</p>
        </div>
        <Link 
          href="/projects/new" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          <Plus size={20} />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl p-12 text-center bg-zinc-900/30 flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400">
            <Folder size={32} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
          <p className="text-zinc-400 max-w-md mb-6">Create your first project to start extracting intelligence and building your PRD.</p>
          <Link 
            href="/projects/new" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-md font-medium hover:bg-zinc-700 transition-colors"
          >
            <Plus size={18} />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link href={`/projects/${project._id}`} key={project._id} className="group flex flex-col border border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 transition-all p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 to-zinc-700 group-hover:from-white group-hover:to-zinc-400 transition-all"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{project.basicInfo?.clientName}</div>
                  <h3 className="text-xl font-bold text-white group-hover:text-zinc-100 transition-colors">{project.basicInfo?.name}</h3>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  project.status === 'Ready for Dev' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  project.status === 'Analyzed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                  'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                }`}>
                  {project.status}
                </div>
              </div>

              <div className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                {project.basicInfo?.description}
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-zinc-500" />
                  <div className="text-sm font-medium text-zinc-300">
                    {project.readinessScore}% Ready
                  </div>
                </div>
                <ArrowRight size={18} className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
