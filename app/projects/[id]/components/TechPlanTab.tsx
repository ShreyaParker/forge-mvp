'use client';

import { useState } from 'react';
import { 
  Terminal, CheckCircle2, AlertCircle, Edit3, X, Save, 
  Layers, Database, Shield, Server, Cpu, Plus, Trash2, Loader2, Check
} from 'lucide-react';
import { ITechPlanLayer, ITechIntegration } from '../../../../models/Project';

interface TechPlanTabProps {
  project: any;
  onMutate: (payload: { type: string; data: any }) => Promise<void>;
  isSubmitting?: boolean;
}

type LayerKey = 'frontend' | 'backend' | 'database' | 'auth' | 'infrastructure';

const LAYER_CONFIG: Record<LayerKey, { title: string; subtitle: string; icon: any }> = {
  frontend: {
    title: 'Frontend Architecture',
    subtitle: 'Client application, rendering strategy, and state management',
    icon: Layers,
  },
  backend: {
    title: 'Backend & APIs',
    subtitle: 'Server execution, business logic handlers, and routing',
    icon: Server,
  },
  database: {
    title: 'Database & Storage',
    subtitle: 'Persistence layer, schemas, indexing, and time-series',
    icon: Database,
  },
  auth: {
    title: 'Authentication & Security',
    subtitle: 'Identity management, session encryption, and role-based ACLs',
    icon: Shield,
  },
  infrastructure: {
    title: 'Cloud Infrastructure & CDN',
    subtitle: 'Hosting, containerization, edge routing, and caching strategy',
    icon: Cpu,
  },
};

export function TechPlanTab({ project, onMutate, isSubmitting = false }: TechPlanTabProps) {
  const [editingLayer, setEditingLayer] = useState<LayerKey | null>(null);
  const [editRecommendation, setEditRecommendation] = useState('');
  const [editRationale, setEditRationale] = useState('');
  const [loadingLayer, setLoadingLayer] = useState<string | null>(null);

  // Integrations state
  const [newIntegName, setNewIntegName] = useState('');
  const [newIntegRationale, setNewIntegRationale] = useState('');
  const [showAddInteg, setShowAddInteg] = useState(false);

  if (!project.technicalPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 border-dashed rounded-xl text-center h-64 bg-zinc-900/10">
        <div className="text-zinc-600 mb-4">
          <Terminal size={40} />
        </div>
        <p className="text-zinc-400 font-medium">Generate Tech Architecture to review stack recommendations.</p>
      </div>
    );
  }

  const layers: LayerKey[] = ['frontend', 'backend', 'database', 'auth', 'infrastructure'];
  const techPlan = project.technicalPlan;

  // Calculate approval metrics
  const approvedCount = layers.filter(k => techPlan[k]?.isApproved).length;
  const approvalPercent = Math.round((approvedCount / layers.length) * 100);

  const handleToggleApproval = async (layer: LayerKey) => {
    setLoadingLayer(layer);
    const current = Boolean(techPlan[layer]?.isApproved);
    try {
      await onMutate({
        type: 'TECH_DECISION_TOGGLE',
        data: {
          layer,
          isApproved: !current,
        },
      });
    } finally {
      setLoadingLayer(null);
    }
  };

  const handleStartEdit = (layer: LayerKey) => {
    setEditingLayer(layer);
    setEditRecommendation(techPlan[layer]?.recommendation || '');
    setEditRationale(techPlan[layer]?.rationale || '');
  };

  const handleSaveEdit = async (layer: LayerKey) => {
    setLoadingLayer(layer);
    try {
      await onMutate({
        type: 'TECH_DECISION_TOGGLE',
        data: {
          layer,
          recommendation: editRecommendation.trim(),
          rationale: editRationale.trim(),
          // Human override automatically signs off or keeps current
          isApproved: true,
        },
      });
      setEditingLayer(null);
    } finally {
      setLoadingLayer(null);
    }
  };

  const handleToggleIntegrationApproval = async (index: number) => {
    const currentList: ITechIntegration[] = techPlan.integrations || [];
    const updated = currentList.map((item, i) =>
      i === index ? { ...item, isApproved: !item.isApproved } : item
    );
    await onMutate({
      type: 'TECH_INTEGRATION_UPDATE',
      data: { integrations: updated },
    });
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntegName.trim()) return;
    const currentList: ITechIntegration[] = techPlan.integrations || [];
    const updated = [
      ...currentList,
      {
        name: newIntegName.trim(),
        rationale: newIntegRationale.trim(),
        isApproved: true,
      },
    ];
    await onMutate({
      type: 'TECH_INTEGRATION_UPDATE',
      data: { integrations: updated },
    });
    setNewIntegName('');
    setNewIntegRationale('');
    setShowAddInteg(false);
  };

  const handleDeleteIntegration = async (index: number) => {
    const currentList: ITechIntegration[] = techPlan.integrations || [];
    const updated = currentList.filter((_, i) => i !== index);
    await onMutate({
      type: 'TECH_INTEGRATION_UPDATE',
      data: { integrations: updated },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Sign-off Overview & Status Banner */}
      <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Terminal size={18} className="text-zinc-400" />
            <h3 className="text-lg font-semibold text-white">Architecture Review & Human Sign-Off</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Lock architecture decisions before developer sprint allocation. Overwrite AI proposals as needed.
          </p>
        </div>

        <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end bg-zinc-950/80 px-5 py-3 rounded-lg border border-zinc-800/80">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold mb-0.5">
              Sign-Off Progress
            </div>
            <div className="text-sm font-semibold text-white">
              {approvedCount} of {layers.length} Layers Approved
            </div>
          </div>
          <div className="w-28 bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700/60">
            <div
              className={`h-full transition-all duration-500 ${
                approvalPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${approvalPercent}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-300 min-w-[36px]">
            {approvalPercent}%
          </span>
        </div>
      </section>

      {/* 5 Core Decision Cards */}
      <section className="space-y-4">
        {layers.map(layer => {
          const cfg = LAYER_CONFIG[layer];
          const val: ITechPlanLayer = techPlan[layer] || {
            recommendation: 'Not defined',
            rationale: 'Pending specification',
            isApproved: false,
          };
          const isApproved = Boolean(val.isApproved);
          const isEditing = editingLayer === layer;
          const isLoading = loadingLayer === layer;
          const Icon = cfg.icon;

          return (
            <div
              key={layer}
              className={`border rounded-xl transition-all ${
                isApproved
                  ? 'border-emerald-500/30 bg-zinc-900/30 hover:border-emerald-500/50'
                  : 'border-amber-500/30 bg-zinc-900/20 hover:border-amber-500/50'
              }`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg border ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white text-base">{cfg.title}</h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 size={11} /> APPROVED
                            </>
                          ) : (
                            <>
                              <AlertCircle size={11} /> PENDING SIGN-OFF
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{cfg.subtitle}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(layer)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700/60"
                      >
                        <Edit3 size={13} />
                        Edit Decision
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleApproval(layer)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all border ${
                        isApproved
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-black font-semibold border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : isApproved ? (
                        <>Revoke Sign-Off</>
                      ) : (
                        <>
                          <Check size={13} /> Approve Decision
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Content: View vs Edit */}
                {isEditing ? (
                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3 bg-zinc-950/60 p-4 rounded-lg">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                        Architecture Recommendation
                      </label>
                      <input
                        type="text"
                        value={editRecommendation}
                        onChange={e => setEditRecommendation(e.target.value)}
                        placeholder="e.g. Next.js 15 App Router"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                        Technical Rationale & Architecture Decision Record (ADR)
                      </label>
                      <textarea
                        rows={3}
                        value={editRationale}
                        onChange={e => setEditRationale(e.target.value)}
                        placeholder="Detail the technical justification, trade-offs, and scaling considerations..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 leading-relaxed"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingLayer(null)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(layer)}
                        disabled={isLoading || !editRecommendation.trim()}
                        className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save & Approve
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-3 border-t border-zinc-800/60">
                    <div className="md:col-span-1">
                      <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono font-semibold block mb-1">
                        Recommendation
                      </span>
                      <div className="font-bold text-white text-base leading-snug">
                        {val.recommendation || 'None'}
                      </div>
                    </div>
                    <div className="md:col-span-3 border-l-0 md:border-l border-zinc-800 md:pl-6">
                      <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono font-semibold block mb-1">
                        Rationale & Trade-Offs
                      </span>
                      <p className="text-zinc-300 text-sm leading-relaxed">{val.rationale || 'None'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Third-Party Integrations Section */}
      <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/30">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-white">Third-Party Services & Integrations</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Approved SaaS APIs, webhooks, and third-party dependencies</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddInteg(!showAddInteg)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700/60"
          >
            <Plus size={13} /> {showAddInteg ? 'Cancel' : 'Add Integration'}
          </button>
        </div>

        {/* Add Integration Form */}
        {showAddInteg && (
          <form onSubmit={handleAddIntegration} className="mb-6 p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Integration Name *</label>
                <input
                  type="text"
                  required
                  value={newIntegName}
                  onChange={e => setNewIntegName(e.target.value)}
                  placeholder="e.g. Stripe Billing or Klaviyo"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Purpose / Rationale</label>
                <input
                  type="text"
                  value={newIntegRationale}
                  onChange={e => setNewIntegRationale(e.target.value)}
                  placeholder="e.g. Subscription management and invoicing"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddInteg(false)}
                className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newIntegName.trim()}
                className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 rounded text-xs font-semibold"
              >
                Save Integration
              </button>
            </div>
          </form>
        )}

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(techPlan.integrations || []).length === 0 ? (
            <p className="text-xs text-zinc-500 italic col-span-2">No integrations configured.</p>
          ) : (
            techPlan.integrations.map((item: ITechIntegration, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleIntegrationApproval(idx)}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold transition-colors ${
                        item.isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.isApproved ? 'Approved' : 'Pending'}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.rationale || 'No rationale provided'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteIntegration(idx)}
                  className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors"
                  aria-label={`Delete integration ${item.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
