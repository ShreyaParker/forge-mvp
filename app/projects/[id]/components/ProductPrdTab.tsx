'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Copy, ExternalLink, Plus, Trash2, Dna, 
  Target, Users, Route, Zap, TrendingUp, Check, Loader2 
} from 'lucide-react';
import { IProjectReference } from '../../../../models/Project';

interface ProductPrdTabProps {
  project: any;
  onMutate: (payload: { type: string; data: any }) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProductPrdTab({ project, onMutate, isSubmitting = false }: ProductPrdTabProps) {
  const [competitors, setCompetitors] = useState<string[]>(project.dna?.competitors || []);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);

  const [references, setReferences] = useState<IProjectReference[]>(project.dna?.references || []);
  const [newRefName, setNewRefName] = useState('');
  const [newRefUrl, setNewRefUrl] = useState('');
  const [newRefNotes, setNewRefNotes] = useState('');
  const [showAddRef, setShowAddRef] = useState(false);
  const [isAddingRef, setIsAddingRef] = useState(false);

  const [instructions, setInstructions] = useState(project.dna?.persistentInstructions || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copied, setCopied] = useState(false);

  // Sync props if changed externally
  useEffect(() => {
    setCompetitors(project.dna?.competitors || []);
    setReferences(project.dna?.references || []);
    setInstructions(project.dna?.persistentInstructions || '');
  }, [project.dna]);

  // Handle adding competitor
  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCompetitor.trim();
    if (!val || competitors.includes(val)) return;
    setIsAddingCompetitor(true);
    const updated = [...competitors, val];
    try {
      await onMutate({
        type: 'DNA_UPDATE',
        data: { competitors: updated },
      });
      setCompetitors(updated);
      setNewCompetitor('');
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  // Handle deleting competitor
  const handleDeleteCompetitor = async (name: string) => {
    const updated = competitors.filter(c => c !== name);
    await onMutate({
      type: 'DNA_UPDATE',
      data: { competitors: updated },
    });
    setCompetitors(updated);
  };

  // Handle adding reference
  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefName.trim() || !newRefUrl.trim()) return;
    setIsAddingRef(true);
    const item: IProjectReference = {
      name: newRefName.trim(),
      url: newRefUrl.trim().startsWith('http') ? newRefUrl.trim() : `https://${newRefUrl.trim()}`,
      notes: newRefNotes.trim() || undefined,
    };
    const updated = [...references, item];
    try {
      await onMutate({
        type: 'DNA_UPDATE',
        data: { references: updated },
      });
      setReferences(updated);
      setNewRefName('');
      setNewRefUrl('');
      setNewRefNotes('');
      setShowAddRef(false);
    } finally {
      setIsAddingRef(false);
    }
  };

  // Handle deleting reference
  const handleDeleteReference = async (index: number) => {
    const updated = references.filter((_, i) => i !== index);
    await onMutate({
      type: 'DNA_UPDATE',
      data: { references: updated },
    });
    setReferences(updated);
  };

  // Auto-save instructions on blur
  const handleSaveInstructions = async () => {
    if (instructions === (project.dna?.persistentInstructions || '')) return;
    setSaveStatus('saving');
    try {
      await onMutate({
        type: 'DNA_UPDATE',
        data: { persistentInstructions: instructions },
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('idle');
    }
  };

  const copyPrdToClipboard = () => {
    if (!project.prd?.sections) return;
    const text = project.prd.sections.map((s: any) => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractDomain = (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* SECTION 1: PROJECT DNA & CONTEXT */}
      <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/40">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
          <Dna className="text-zinc-400" size={20} />
          <div>
            <h3 className="text-lg font-semibold text-white">Project DNA & Context</h3>
            <p className="text-xs text-zinc-400">Market intelligence, architectural anchors, and persistent agency directives</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competitor Landscape */}
          <div className="bg-zinc-950/60 p-5 rounded-lg border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Market Competitors</span>
                <span className="text-xs text-zinc-500 font-mono">{competitors.length} listed</span>
              </div>
              <p className="text-xs text-zinc-500 mb-3">Key products benchmarked for feature and positioning comparison.</p>
              
              <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
                {competitors.length === 0 ? (
                  <span className="text-xs text-zinc-600 italic">No competitors tracked yet.</span>
                ) : (
                  competitors.map(c => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-zinc-300 text-xs font-medium rounded-full border border-zinc-700/80 group hover:border-zinc-500 transition-colors"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => handleDeleteCompetitor(c)}
                        className="text-zinc-500 hover:text-red-400 p-0.5 rounded transition-colors"
                        aria-label={`Remove competitor ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddCompetitor} className="flex gap-2 pt-2 border-t border-zinc-900">
              <input
                type="text"
                value={newCompetitor}
                onChange={e => setNewCompetitor(e.target.value)}
                placeholder="Add competitor (e.g. Stripe)"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              <button
                type="submit"
                disabled={!newCompetitor.trim() || isAddingCompetitor || isSubmitting}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isAddingCompetitor ? <Loader2 size={12} className="animate-spin" /> : 'Add'}
              </button>
            </form>
          </div>

          {/* Reference Links */}
          <div className="bg-zinc-950/60 p-5 rounded-lg border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Design & Architecture References</span>
                <button
                  type="button"
                  onClick={() => setShowAddRef(!showAddRef)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} /> {showAddRef ? 'Cancel' : 'Add Link'}
                </button>
              </div>

              {/* Add Reference Form */}
              {showAddRef && (
                <form onSubmit={handleAddReference} className="mb-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newRefName}
                      onChange={e => setNewRefName(e.target.value)}
                      placeholder="Reference Name (e.g. Linear)"
                      className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                    <input
                      type="text"
                      required
                      value={newRefUrl}
                      onChange={e => setNewRefUrl(e.target.value)}
                      placeholder="URL (e.g. linear.app)"
                      className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                  </div>
                  <input
                    type="text"
                    value={newRefNotes}
                    onChange={e => setNewRefNotes(e.target.value)}
                    placeholder="Key take-away or architectural benchmark (optional)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddRef(false)}
                      className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingRef || !newRefName.trim() || !newRefUrl.trim()}
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium"
                    >
                      {isAddingRef ? <Loader2 size={12} className="animate-spin" /> : 'Save Link'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reference Links List */}
              <div className="space-y-2 min-h-[36px]">
                {references.length === 0 ? (
                  <span className="text-xs text-zinc-600 italic">No reference links logged yet.</span>
                ) : (
                  references.map((r, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between p-2.5 rounded bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-xs text-zinc-200 hover:text-white flex items-center gap-1 underline-offset-2 hover:underline"
                        >
                          {r.name}
                          <ExternalLink size={11} className="text-zinc-500 group-hover:text-zinc-300" />
                        </a>
                        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                          {extractDomain(r.url)}
                        </span>
                        {r.notes && (
                          <span className="text-[11px] text-zinc-400 truncate max-w-[180px]" title={r.notes}>
                            • {r.notes}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteReference(i)}
                        className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors opacity-60 group-hover:opacity-100"
                        aria-label={`Remove reference ${r.name}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agency Directives / System Instructions Textarea */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Agency Directives & Persistent Instructions
              </span>
              <p className="text-xs text-zinc-500 mt-0.5">
                Global prompt directives automatically injected into downstream PRD, architecture, and task generation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                  <Check size={12} /> Saved
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveInstructions}
                disabled={saveStatus === 'saving' || instructions === (project.dna?.persistentInstructions || '')}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-40"
              >
                Save Directives
              </button>
            </div>
          </div>
          <textarea
            rows={3}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            onBlur={handleSaveInstructions}
            placeholder="e.g. Always maintain ultra-clean visual fidelity with zero layout shifts. Enforce air-gapped audit logging..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-mono leading-relaxed"
          />
        </div>
      </section>

      {/* SECTION 2: PRODUCT STRATEGY & SPECS */}
      {project.product && (
        <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/30">
          <h3 className="text-lg font-semibold text-white mb-6">Product Strategy & Specs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-1.5">
                  <Target size={14} className="text-zinc-400" /> Core Objective
                </span>
                <p className="text-sm text-zinc-200">{project.product.objective}</p>
              </div>

              <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-2">
                  <Users size={14} className="text-zinc-400" /> Target Users
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.product.targetUsers?.map((u: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-zinc-900 text-zinc-300 text-xs rounded border border-zinc-800">
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-2">
                  <TrendingUp size={14} className="text-emerald-400" /> Success Metrics
                </span>
                <ul className="space-y-1">
                  {project.product.successMetrics?.map((m: string, idx: number) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-500" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-2">
                  <Zap size={14} className="text-zinc-400" /> Core Features
                </span>
                <ul className="space-y-1.5">
                  {project.product.coreFeatures?.map((f: string, idx: number) => (
                    <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-2">
                  <Route size={14} className="text-zinc-400" /> Key User Journeys
                </span>
                <ul className="space-y-1.5">
                  {project.product.userJourneys?.map((j: string, idx: number) => (
                    <li key={idx} className="text-xs text-zinc-300 font-mono bg-zinc-900/80 p-2 rounded border border-zinc-800/60">
                      {j}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: GENERATED PRD SECTIONS */}
      {project.prd ? (
        <section className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden shadow-sm">
          <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-white">Generated Product Requirements Document</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{project.prd.sections?.length || 0} structured specification modules</p>
            </div>
            <button
              onClick={copyPrdToClipboard}
              className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md border border-zinc-700/80"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
          </div>
          <div className="p-6 space-y-8 prose prose-invert max-w-none">
            {project.prd.sections.map((s: any, i: number) => (
              <div key={i} className="pb-6 border-b border-zinc-900 last:border-b-0 last:pb-0">
                <h4 className="text-base font-bold text-white mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded bg-zinc-600" />
                  {s.title}
                </h4>
                <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed pl-4 border-l border-zinc-800">
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 border-dashed rounded-xl text-center h-48 bg-zinc-900/10">
          <div className="text-zinc-600 mb-3">
            <FileText size={36} />
          </div>
          <p className="text-zinc-400 font-medium text-sm">Generate PRD to view the full product requirements document.</p>
        </div>
      )}
    </div>
  );
}
