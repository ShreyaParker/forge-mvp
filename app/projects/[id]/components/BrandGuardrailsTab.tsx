'use client';

import { useState } from 'react';
import { CheckCircle2, ShieldAlert, Trash2, Plus, Palette, Loader2 } from 'lucide-react';
import { IGuardrailItem, ProvenanceSource } from '../../../../models/Project';
import { ProvenanceBadge } from './ProvenanceBadge';

interface BrandGuardrailsTabProps {
  project: any;
  onMutate: (payload: { type: string; data: any }) => Promise<void>;
  isSubmitting?: boolean;
}

export function BrandGuardrailsTab({ project, onMutate, isSubmitting = false }: BrandGuardrailsTabProps) {
  const [newAlwaysText, setNewAlwaysText] = useState('');
  const [newAlwaysSource, setNewAlwaysSource] = useState<ProvenanceSource>('human_edited');
  const [isAddingAlways, setIsAddingAlways] = useState(false);

  const [newNeverText, setNewNeverText] = useState('');
  const [newNeverSource, setNewNeverSource] = useState<ProvenanceSource>('human_edited');
  const [isAddingNever, setIsAddingNever] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddAlways = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlwaysText.trim()) return;
    setIsAddingAlways(true);
    try {
      await onMutate({
        type: 'GUARDRAIL_ADD',
        data: {
          category: 'always',
          text: newAlwaysText.trim(),
          source: newAlwaysSource,
        },
      });
      setNewAlwaysText('');
    } finally {
      setIsAddingAlways(false);
    }
  };

  const handleAddNever = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeverText.trim()) return;
    setIsAddingNever(true);
    try {
      await onMutate({
        type: 'GUARDRAIL_ADD',
        data: {
          category: 'never',
          text: newNeverText.trim(),
          source: newNeverSource,
        },
      });
      setNewNeverText('');
    } finally {
      setIsAddingNever(false);
    }
  };

  const handleDeleteGuardrail = async (category: 'always' | 'never', id: string) => {
    setDeletingId(id);
    try {
      await onMutate({
        type: 'GUARDRAIL_DELETE',
        data: { category, id },
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!project.brand) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 border-dashed rounded-xl text-center h-64 bg-zinc-900/10">
        <div className="text-zinc-600 mb-4">
          <Palette size={40} />
        </div>
        <p className="text-zinc-400 font-medium">Extract Intelligence to populate Brand & Guardrails.</p>
      </div>
    );
  }

  const alwaysItems: IGuardrailItem[] = project.guardrails?.always || [];
  const neverItems: IGuardrailItem[] = project.guardrails?.never || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Brand Identity Overview */}
      <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/30">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Brand Personality & Style</h3>
            <p className="text-xs text-zinc-400 mt-1">Core aesthetic foundations and voice guide</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.brand.personality?.map((p: string, i: number) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-full border border-zinc-700/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Visual Style</span>
            <span className="text-zinc-200">{project.brand.visualStyle || 'Not defined'}</span>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Tone of Voice</span>
            <span className="text-zinc-200">{project.brand.tone || 'Not defined'}</span>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block mb-1">Typography</span>
            <span className="text-zinc-200 font-mono text-xs">
              {project.brand.typography?.join(' • ') || 'System Default'}
            </span>
          </div>
        </div>
      </section>

      {/* Brand Colors */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Brand Palette</h3>
          <span className="text-xs text-zinc-500">Curated with provenance tags</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {project.brand.colors?.map((c: any, i: number) => (
            <div
              key={i}
              className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 hover:border-zinc-700 transition-colors shadow-sm"
            >
              <div
                className="h-24 w-full relative transition-transform hover:scale-105 duration-300"
                style={{ backgroundColor: c.hex }}
              />
              <div className="p-3.5 bg-zinc-900/90">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-sm font-semibold text-zinc-200">{c.hex}</span>
                  <ProvenanceBadge source={c.source} size="xs" />
                </div>
                <div className="text-zinc-400 text-xs font-medium">{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guardrails: Always & Never */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ALWAYS DO */}
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={18} /> Always Do (Operational Guardrails)
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                {alwaysItems.length} rule{alwaysItems.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* List */}
            <div className="space-y-2.5 mb-6">
              {alwaysItems.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">No "Always" guardrails defined yet.</p>
              ) : (
                alwaysItems.map(item => (
                  <div
                    key={item.id}
                    className="group flex items-start justify-between gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-zinc-200 text-sm leading-relaxed">{item.text}</p>
                        <div className="mt-1.5">
                          <ProvenanceBadge source={item.source} size="xs" />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGuardrail('always', item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Delete guardrail"
                      className="opacity-60 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 rounded transition-colors disabled:opacity-30"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={14} className="animate-spin text-zinc-400" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddAlways} className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Add "Always" Guardrail
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAlwaysText}
                onChange={e => setNewAlwaysText(e.target.value)}
                placeholder="e.g., Enforce strict WCAG 2.1 AA accessibility"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <select
                value={newAlwaysSource}
                onChange={e => setNewAlwaysSource(e.target.value as ProvenanceSource)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-md px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="human_edited">HUMAN</option>
                <option value="client">CLIENT</option>
                <option value="ai">AI</option>
              </select>
              <button
                type="submit"
                disabled={!newAlwaysText.trim() || isAddingAlways || isSubmitting}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingAlways ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add
              </button>
            </div>
          </form>
        </div>

        {/* NEVER DO */}
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
              <h3 className="text-base font-semibold text-red-400 flex items-center gap-2">
                <ShieldAlert size={18} /> Never Do (Anti-Patterns & Prohibitions)
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                {neverItems.length} rule{neverItems.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* List */}
            <div className="space-y-2.5 mb-6">
              {neverItems.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">No "Never" guardrails defined yet.</p>
              ) : (
                neverItems.map(item => (
                  <div
                    key={item.id}
                    className="group flex items-start justify-between gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-zinc-200 text-sm leading-relaxed">{item.text}</p>
                        <div className="mt-1.5">
                          <ProvenanceBadge source={item.source} size="xs" />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGuardrail('never', item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Delete guardrail"
                      className="opacity-60 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 rounded transition-colors disabled:opacity-30"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={14} className="animate-spin text-zinc-400" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddNever} className="pt-4 border-t border-zinc-800/80 space-y-3">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Add "Never" Guardrail
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNeverText}
                onChange={e => setNewNeverText(e.target.value)}
                placeholder="e.g., Never use full-screen popups on mobile"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <select
                value={newNeverSource}
                onChange={e => setNewNeverSource(e.target.value as ProvenanceSource)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-md px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="human_edited">HUMAN</option>
                <option value="client">CLIENT</option>
                <option value="ai">AI</option>
              </select>
              <button
                type="submit"
                disabled={!newNeverText.trim() || isAddingNever || isSubmitting}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingNever ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Add
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
