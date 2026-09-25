'use client';

import { useState } from 'react';
import { 
  Loader2, Sparkles, Terminal, Palette, ListTodo, FileText, ArrowLeft 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandGuardrailsTab } from './components/BrandGuardrailsTab';
import { ProductPrdTab } from './components/ProductPrdTab';
import { TechPlanTab } from './components/TechPlanTab';
import { TasksTab } from './components/TasksTab';

function ReadinessRing({ score }: { score: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-12 h-12" aria-hidden="true">
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
      <span className="absolute text-xs font-bold text-white font-mono">{score}%</span>
    </div>
  );
}

export default function ClientWorkspace({ initialProject }: { initialProject: any }) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState<'brand' | 'prd' | 'tech' | 'tasks'>('brand');
  const [loading, setLoading] = useState('');

  const triggerAction = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/projects/${project._id}/${action}`, { method: 'POST' });
      if (!res.ok) throw new Error(`${action} failed`);
      const updated = await res.json();
      setProject(updated);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading('');
    }
  };

  const handleMutate = async (payload: { type: string; data: any }) => {
    try {
      const res = await fetch(`/api/projects/${project._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Mutation failed');
      }
      const updated = await res.json();
      setProject(updated);
      router.refresh();
    } catch (err) {
      console.error('Workspace mutation error:', err);
      throw err;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Navigation Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-xs text-zinc-400 hover:text-white transition-colors gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Agency Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-zinc-800 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-md uppercase tracking-wider">
              {project.basicInfo?.clientName}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                project.status === 'Ready for Dev'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : project.status === 'Analyzed'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              }`}
            >
              {project.status}
            </span>
            {project.basicInfo?.website && (
              <a
                href={project.basicInfo.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline-offset-2 hover:underline"
              >
                {project.basicInfo.website}
              </a>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{project.basicInfo?.name}</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{project.basicInfo?.description}</p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 shadow-sm">
          <div>
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">
              Project Readiness
            </div>
            <div className="text-sm text-zinc-300">Readiness score for sprint handoff</div>
          </div>
          <ReadinessRing score={project.readinessScore || 0} />
        </div>
      </div>

      {/* AI Pipeline Action Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => triggerAction('analyze')}
          disabled={loading !== ''}
          className="btn-action"
        >
          {loading === 'analyze' ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          Extract Intelligence
        </button>
        <button
          onClick={() => triggerAction('prd')}
          disabled={!project.brand || loading !== ''}
          className="btn-action"
        >
          {loading === 'prd' ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
          Generate PRD
        </button>
        <button
          onClick={() => triggerAction('technical-plan')}
          disabled={!project.prd || loading !== ''}
          className="btn-action"
        >
          {loading === 'technical-plan' ? <Loader2 size={15} className="animate-spin" /> : <Terminal size={15} />}
          Tech Architecture
        </button>
        <button
          onClick={() => triggerAction('tasks')}
          disabled={!project.technicalPlan || loading !== ''}
          className="btn-action"
        >
          {loading === 'tasks' ? <Loader2 size={15} className="animate-spin" /> : <ListTodo size={15} />}
          Breakdown Tasks
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto scrollbar-none">
        {[
          { id: 'brand' as const, icon: Palette, label: 'Brand & Guardrails' },
          { id: 'prd' as const, icon: FileText, label: 'Product & PRD' },
          { id: 'tech' as const, icon: Terminal, label: 'Tech Architecture' },
          { id: 'tasks' as const, icon: ListTodo, label: 'Execution Board' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 font-medium text-sm transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                isActive
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[480px]">
        {activeTab === 'brand' && (
          <BrandGuardrailsTab project={project} onMutate={handleMutate} />
        )}
        {activeTab === 'prd' && (
          <ProductPrdTab project={project} onMutate={handleMutate} />
        )}
        {activeTab === 'tech' && (
          <TechPlanTab project={project} onMutate={handleMutate} />
        )}
        {activeTab === 'tasks' && (
          <TasksTab project={project} onMutate={handleMutate} />
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
          border: 1px solid #3f3f46;
          transition: all 0.2s;
          cursor: pointer;
        }
        .btn-action:hover:not(:disabled) {
          background-color: #3f3f46;
          border-color: #52525b;
        }
        .btn-action:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
