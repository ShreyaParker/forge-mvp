'use client';

import { useState } from 'react';
import { 
  CheckCircle2, Circle, Loader2, Sparkles, Copy, 
  Terminal, ShieldAlert, Palette, ListTodo, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function ReadinessRing({ score }: { score: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle cx="24" cy="24" r={radius} className="stroke-zinc-800" strokeWidth="4" fill="none" />
        <circle 
          cx="24" 
          cy="24" 
          r={radius} 
          className="stroke-white transition-all duration-1000 ease-in-out" 
          strokeWidth="4" 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
        />
      </svg>
      <span className="absolute text-xs font-bold">{score}%</span>
    </div>
  );
}

export default function ClientWorkspace({ initialProject }: { initialProject: any }) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState('brand');
  const [loading, setLoading] = useState('');

  const triggerAction = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/projects/${project._id}/${action}`, { method: 'POST' });
      const updated = await res.json();
      // recalculate readiness score locally to update immediately without refresh
      const attrs = [
        updated.basicInfo?.name, updated.basicInfo?.clientName, updated.basicInfo?.description,
        updated.brand?.personality, updated.brand?.colors, updated.product?.objective,
        updated.guardrails?.always, updated.aiAnalysis?.summary, updated.prd?.sections,
        updated.technicalPlan?.frontend, updated.tasks?.length > 0 ? true : undefined,
      ];
      const score = Math.round((attrs.filter(Boolean).length / attrs.length) * 100);
      setProject({ ...updated, readinessScore: score });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading('');
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = { 'Todo': 'In Progress', 'In Progress': 'Done', 'Done': 'Todo' };
    const nextStatus = nextStatusMap[currentStatus];
    
    // optimistic update
    const newTasks = project.tasks.map((t: any) => t.id === taskId ? { ...t, status: nextStatus } : t);
    setProject({ ...project, tasks: newTasks });

    try {
      await fetch(`/api/projects/${project._id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: nextStatus }),
      });
    } catch (e) {
      // revert on error
      setProject({ ...project, tasks: project.tasks });
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-zinc-800 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-md uppercase tracking-wider">
              {project.basicInfo.clientName}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              project.status === 'Ready for Dev' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              project.status === 'Analyzed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
            }`}>
              {project.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">{project.basicInfo.name}</h1>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">Project Readiness</div>
            <div className="text-sm text-zinc-300">Readiness determines dev handoff</div>
          </div>
          <ReadinessRing score={project.readinessScore} />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => triggerAction('analyze')} disabled={loading !== ''} className="btn-action">
          {loading === 'analyze' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Extract Intelligence
        </button>
        <button onClick={() => triggerAction('prd')} disabled={!project.brand || loading !== ''} className="btn-action">
          {loading === 'prd' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Generate PRD
        </button>
        <button onClick={() => triggerAction('technical-plan')} disabled={!project.prd || loading !== ''} className="btn-action">
          {loading === 'technical-plan' ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
          Tech Architecture
        </button>
        <button onClick={() => triggerAction('tasks')} disabled={!project.technicalPlan || loading !== ''} className="btn-action">
          {loading === 'tasks' ? <Loader2 size={16} className="animate-spin" /> : <ListTodo size={16} />}
          Breakdown Tasks
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto">
        {[
          { id: 'brand', icon: Palette, label: 'Brand & Guardrails' },
          { id: 'prd', icon: FileText, label: 'Product & PRD' },
          { id: 'tech', icon: Terminal, label: 'Tech Architecture' },
          { id: 'tasks', icon: ListTodo, label: 'Execution Board' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: BRAND & GUARDRAILS */}
        {activeTab === 'brand' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {project.brand ? (
              <>
                <section>
                  <h3 className="text-lg font-semibold text-white mb-4">Brand Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {project.brand.colors.map((c: any, i: number) => (
                      <div key={i} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
                        <div className="h-24 w-full" style={{ backgroundColor: c.hex }}></div>
                        <div className="p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-sm">{c.hex}</span>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${c.source === 'client' ? 'bg-zinc-200 text-zinc-900' : 'bg-purple-500/20 text-purple-400'}`}>
                              {c.source}
                            </span>
                          </div>
                          <div className="text-zinc-400 text-xs">{c.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section className="grid md:grid-cols-2 gap-6">
                  <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/20">
                    <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2 mb-4">
                      <CheckCircle2 size={18} /> Always Do
                    </h3>
                    <ul className="space-y-3">
                      {project.guardrails?.always.map((item: string, i: number) => (
                        <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/20">
                    <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-4">
                      <ShieldAlert size={18} /> Never Do
                    </h3>
                    <ul className="space-y-3">
                      {project.guardrails?.never.map((item: string, i: number) => (
                        <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </>
            ) : (
              <EmptyState message="Extract Intelligence to populate Brand & Guardrails." icon={Palette} />
            )}
          </div>
        )}

        {/* TAB 2: PRODUCT & PRD */}
        {activeTab === 'prd' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {project.prd ? (
              <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
                <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
                  <h3 className="font-semibold">Generated Product Requirements Document</h3>
                  <button 
                    onClick={() => navigator.clipboard.writeText(project.prd.sections.map((s: any) => `## ${s.title}\n${s.content}`).join('\n\n'))}
                    className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm bg-zinc-800 px-3 py-1.5 rounded-md"
                  >
                    <Copy size={14} /> Copy MD
                  </button>
                </div>
                <div className="p-6 space-y-8 prose prose-invert max-w-none">
                  {project.prd.sections.map((s: any, i: number) => (
                    <div key={i}>
                      <h4 className="text-lg font-bold text-white mb-2 pb-2 border-b border-zinc-800/50">{s.title}</h4>
                      <div className="text-zinc-300 text-sm whitespace-pre-wrap">{s.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="Generate PRD to view the full product requirements." icon={FileText} />
            )}
          </div>
        )}

        {/* TAB 3: TECH ARCHITECTURE */}
        {activeTab === 'tech' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {project.technicalPlan ? (
              <div className="grid gap-6">
                {Object.entries(project.technicalPlan).filter(([k]) => k !== 'integrations').map(([key, val]: any) => (
                  <div key={key} className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/30 flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4">
                      <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">{key}</div>
                      <div className="font-bold text-white text-lg">{val.recommendation}</div>
                    </div>
                    <div className="md:w-3/4 border-l-2 border-zinc-800 pl-6 text-sm text-zinc-300">
                      {val.rationale}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Generate Tech Architecture to view stack recommendations." icon={Terminal} />
            )}
          </div>
        )}

        {/* TAB 4: DEV EXECUTION BOARD */}
        {activeTab === 'tasks' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {project.tasks?.length > 0 ? (
              <div className="space-y-6">
                {/* Group tasks by Epic */}
                {Array.from(new Set(project.tasks.map((t: any) => t.epic))).map((epic: any) => {
                  const epicTasks = project.tasks.filter((t: any) => t.epic === epic);
                  return (
                    <div key={epic} className="border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="bg-zinc-900 px-6 py-3 font-semibold text-white border-b border-zinc-800">
                        Epic: {epic}
                      </div>
                      <div className="divide-y divide-zinc-800/50 bg-zinc-900/20">
                        {epicTasks.map((task: any) => (
                          <div 
                            key={task.id} 
                            onClick={() => toggleTaskStatus(task.id, task.status)}
                            className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`
                                ${task.status === 'Done' ? 'text-emerald-500' : task.status === 'In Progress' ? 'text-blue-500' : 'text-zinc-500'}
                              `}>
                                {task.status === 'Done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                              </div>
                              <div>
                                <div className={`font-medium text-sm mb-1 ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                  {task.id}: {task.title}
                                </div>
                                <div className="text-xs text-zinc-500 flex gap-3">
                                  <span>{task.ownerRole}</span>
                                  <span>•</span>
                                  <span>{task.estimateDays} days</span>
                                </div>
                              </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded font-medium border ${
                              task.status === 'Done' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                              task.status === 'In Progress' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                              'border-zinc-700 text-zinc-400 bg-zinc-800'
                            }`}>
                              {task.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState message="Generate Tasks to populate the Dev Execution Board." icon={ListTodo} />
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #27272a;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }
        .btn-action:hover:not(:disabled) {
          background-color: #3f3f46;
        }
        .btn-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string, icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 border-dashed rounded-xl text-center h-64 bg-zinc-900/10">
      <div className="text-zinc-600 mb-4">
        <Icon size={40} />
      </div>
      <p className="text-zinc-400 font-medium">{message}</p>
    </div>
  );
}
