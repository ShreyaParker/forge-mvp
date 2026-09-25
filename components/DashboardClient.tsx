'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Folder, ArrowRight, Activity, Building2, User, 
  Search, UploadCloud, FileText, X, Loader2, Sparkles, 
  SlidersHorizontal, CheckCircle2, Clock
} from 'lucide-react';

interface ProjectItem {
  _id: string;
  basicInfo: {
    name: string;
    clientName: string;
    description: string;
    website?: string;
    targetPlatforms?: string[];
  };
  status: string;
  readinessScore: number;
  deliveryEstimate?: {
    totalDays: number;
    allocatedTeamSize: number;
    estimatedWeeks: number;
    riskNotes: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardClientProps {
  initialProjects: ProjectItem[];
  session: any;
}

type StatusFilter = 'All' | 'Draft' | 'Analyzed' | 'Ready for Dev';
type SortOption = 'readiness-desc' | 'readiness-asc' | 'date-desc' | 'name-asc';

export default function DashboardClient({ initialProjects, session }: DashboardClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Modal State
  const [modalClientName, setModalClientName] = useState('');
  const [modalProjectName, setModalProjectName] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalWebsite, setModalWebsite] = useState('');
  const [modalPlatforms, setModalPlatforms] = useState<string[]>(['Web']);
  const [isParsingBrief, setIsParsingBrief] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter & Sort Logic
  const filteredProjects = useMemo(() => {
    let list = [...initialProjects];

    // Status filter
    if (statusFilter !== 'All') {
      list = list.filter(p => p.status === statusFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        (p.basicInfo?.name || '').toLowerCase().includes(q) ||
        (p.basicInfo?.clientName || '').toLowerCase().includes(q) ||
        (p.basicInfo?.description || '').toLowerCase().includes(q) ||
        (p.basicInfo?.targetPlatforms || []).some(plat => plat.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'readiness-desc') {
        return (b.readinessScore || 0) - (a.readinessScore || 0);
      }
      if (sortBy === 'readiness-asc') {
        return (a.readinessScore || 0) - (b.readinessScore || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.basicInfo?.name || '').localeCompare(b.basicInfo?.name || '');
      }
      // date-desc default
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return list;
  }, [initialProjects, statusFilter, searchQuery, sortBy]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      All: initialProjects.length,
      Draft: initialProjects.filter(p => p.status === 'Draft').length,
      Analyzed: initialProjects.filter(p => p.status === 'Analyzed').length,
      'Ready for Dev': initialProjects.filter(p => p.status === 'Ready for Dev').length,
    };
  }, [initialProjects]);

  // Handle Drag & Drop File Intake
  const processUploadedFile = async (file: File) => {
    setIsParsingBrief(true);
    setModalError('');
    try {
      const textContent = await file.text();
      
      // Call AI brief intake endpoint
      const res = await fetch('/api/projects/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: textContent,
          filename: file.name,
        }),
      });

      if (!res.ok) {
        throw new Error('Brief extraction failed');
      }

      const parsed = await res.json();

      if (parsed.clientName) setModalClientName(parsed.clientName);
      if (parsed.projectName) setModalProjectName(parsed.projectName);
      if (parsed.brief) setModalDescription(parsed.brief);
      if (parsed.targetPlatforms && Array.isArray(parsed.targetPlatforms) && parsed.targetPlatforms.length > 0) {
        setModalPlatforms(parsed.targetPlatforms);
      }
    } catch (err: any) {
      console.error('Error processing brief file:', err);
      setModalError('Could not automatically parse file. You can paste the content directly below.');
    } finally {
      setIsParsingBrief(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setModalPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalClientName.trim() || !modalProjectName.trim()) {
      setModalError('Client Name and Project Name are required.');
      return;
    }

    setIsCreating(true);
    setModalError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: modalClientName.trim(),
          name: modalProjectName.trim(),
          description: modalDescription.trim(),
          website: modalWebsite.trim() || undefined,
          targetPlatforms: modalPlatforms,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const created = await res.json();
      setIsModalOpen(false);
      router.push(`/projects/${created._id}`);
    } catch (err: any) {
      setModalError(err.message || 'An error occurred while creating project.');
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1.5 ${
                session?.organization?.workspaceType === 'Individual'
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {session?.organization?.workspaceType === 'Individual' ? (
                <User size={12} className="text-sky-500 dark:text-sky-400" />
              ) : (
                <Building2 size={12} className="text-zinc-700 dark:text-zinc-300" />
              )}
              {session?.organization?.name || 'Parker Studio'}
            </span>

            <span className="text-xs text-zinc-500 font-mono">
              {initialProjects.length} {initialProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white mb-2">
            Projects Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-xl">
            {session?.organization?.description || 'Manage your project intelligence, readiness pipeline, and AI sprint handoffs.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/organization"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            Organization Intelligence
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg font-semibold transition-all shadow-md text-sm cursor-pointer"
          >
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects by name, client, stack, or brief..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filters & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center bg-white dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {(['All', 'Draft', 'Analyzed', 'Ready for Dev'] as StatusFilter[]).map(status => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {counts[status]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg px-3 py-2 pr-8 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
            >
              <option value="date-desc">Recently Updated</option>
              <option value="readiness-desc">Highest Readiness</option>
              <option value="readiness-asc">Lowest Readiness</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
            <SlidersHorizontal size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-16 text-center bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center max-w-2xl mx-auto shadow-inner">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-2xl flex items-center justify-center mb-5 text-zinc-400 shadow-md">
            <Folder size={30} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {initialProjects.length === 0 ? 'No projects yet' : 'No matching projects found'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8 text-sm leading-relaxed">
            {initialProjects.length === 0
              ? 'Create your first project brief to analyze brand personality, generate architecture, and assign execution tasks.'
              : 'Try adjusting your search query or status filter to locate existing projects.'}
          </p>
          {initialProjects.length === 0 ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg font-semibold transition-colors shadow-sm text-sm cursor-pointer"
            >
              <Plus size={18} />
              Create First Project
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Link
              href={`/projects/${project._id}`}
              key={project._id}
              className="group flex flex-col border border-zinc-200 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all p-6 relative overflow-hidden shadow-sm hover:shadow-lg"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-500 dark:from-zinc-700 dark:via-zinc-500 dark:to-zinc-400 group-hover:from-zinc-900 dark:group-hover:from-white group-hover:to-zinc-600 transition-all"></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    {project.basicInfo?.clientName}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-100 transition-colors">
                    {project.basicInfo?.name}
                  </h3>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    project.status === 'Ready for Dev'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : project.status === 'Analyzed'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30'
                  }`}
                >
                  {project.status}
                </div>
              </div>

              <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-5 flex-1">
                {project.basicInfo?.description}
              </div>

              {/* Target Platforms */}
              {project.basicInfo?.targetPlatforms && project.basicInfo.targetPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.basicInfo.targetPlatforms.map((plat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-mono"
                    >
                      {plat}
                    </span>
                  ))}
                </div>
              )}

              {/* Delivery Estimation Pill (if calculated) */}
              {project.deliveryEstimate && (
                <div className="mb-4 py-1.5 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 flex items-center gap-1 font-mono">
                    <Clock size={12} /> Est. Delivery:
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {project.deliveryEstimate.estimatedWeeks} wks ({project.deliveryEstimate.totalDays}d)
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-zinc-500" />
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {project.readinessScore}% Ready
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal with Drag & Drop Intake */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-md"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 mb-1 block">
                {session?.organization?.name || 'Parker Studio'} • Intake Engine
              </span>
              <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                New Project Intelligence
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Drop your client brief file or paste raw notes. AI will extract and structure the spec automatically.
              </p>
            </div>

            {modalError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-lg mb-5 text-xs">
                {modalError}
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-6 ${
                dragOver
                  ? 'border-zinc-900 dark:border-white bg-zinc-100 dark:bg-zinc-800/80 scale-[0.99]'
                  : 'border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.md,.markdown,.json,.doc,.docx,.pdf"
                onChange={handleFileInputChange}
              />
              <div className="flex flex-col items-center">
                {isParsingBrief ? (
                  <>
                    <Loader2 size={32} className="animate-spin text-zinc-600 dark:text-zinc-300 mb-2" />
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Extracting brief intelligence with Gemini AI...
                    </span>
                    <span className="text-xs text-zinc-500 mt-1">Parsing client goals, target platforms, and scope</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-2 shadow-sm">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Drag & drop client brief here, or <span className="underline">browse files</span>
                    </span>
                    <span className="text-xs text-zinc-500 mt-1">
                      Supports Markdown, Text, PDF, DOCX, or JSON briefs
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nova Fashion Studio"
                    value={modalClientName}
                    onChange={e => setModalClientName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nova Flagship Experience"
                    value={modalProjectName}
                    onChange={e => setModalProjectName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Client Brief / Scope Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste raw requirements, brand guidelines, target audience, core features, or technical constraints..."
                  value={modalDescription}
                  onChange={e => setModalDescription(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Existing Website (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={modalWebsite}
                    onChange={e => setModalWebsite(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Target Platforms
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Web', 'iOS', 'Android', 'API', 'Desktop'].map(plat => {
                      const selected = modalPlatforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => handlePlatformToggle(plat)}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                            selected
                              ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white font-semibold'
                              : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                          }`}
                        >
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isParsingBrief}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
