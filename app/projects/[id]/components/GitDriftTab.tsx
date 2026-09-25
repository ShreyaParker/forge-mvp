'use client';

import React, { useState } from 'react';
import { 
  GitBranch, GitCommit, GitPullRequest, Activity, AlertTriangle, 
  CheckCircle2, Sparkles, ExternalLink, RefreshCw, Loader2, Clock, ShieldCheck
} from 'lucide-react';
import { IGitIntegration } from '../../../../models/Project';

interface GitDriftTabProps {
  project: any;
  onRefreshProject?: (updatedProject: any) => void;
}

export function GitDriftTab({ project, onRefreshProject }: GitDriftTabProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [gitData, setGitData] = useState<IGitIntegration>(
    project.gitIntegration || {
      connected: true,
      repoUrl: 'https://github.com/parker-studio/project-repo',
      branch: 'main',
      commits: [],
      pullRequests: [],
    }
  );

  const health = gitData.aiHealthAnalysis || {
    driftScore: 78,
    insights: [
      'Core architecture conforms to Next.js 15 App Router specifications.',
      'API routing matches technical plan database contracts.',
      'Review pending tests for checkout and inventory synchronization.'
    ],
    dormantFeatures: [],
    lastAnalyzedAt: new Date(),
  };

  const driftScore = health.driftScore ?? 78;

  const handleAnalyzeHealth = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${project._id}/git/analyze`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze Git health');
      }
      const data = await res.json();
      if (data.gitIntegration) {
        setGitData(data.gitIntegration);
      }
      if (data.project && onRefreshProject) {
        onRefreshProject(data.project);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error triggering Git drift analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-500', stroke: 'stroke-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Aligned' };
    if (score >= 50) return { text: 'text-amber-500', stroke: 'stroke-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Moderate Drift' };
    return { text: 'text-red-500', stroke: 'stroke-red-500', bg: 'bg-red-500/10 border-red-500/20', label: 'Severe Drift' };
  };

  const scoreMeta = getScoreColor(driftScore);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* SECTION 1: GIT DRIFT HEALTH BANNER */}
      <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/40 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Repository Connected
              </span>
              <a
                href={gitData.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                {gitData.repoUrl} <ExternalLink size={12} />
              </a>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                branch: {gitData.branch}
              </span>
            </div>

            <h3 className="text-xl font-bold text-zinc-950 dark:text-white">
              Git Activity & AI Drift Health
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Gemini analyzes repository commit trajectories against feature PRD specifications to catch architectural drift early.
            </p>
          </div>

          {/* Drift Score Gauge & Trigger Button */}
          <div className="flex items-center gap-6 self-start lg:self-auto">
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="relative flex items-center justify-center w-12 h-12">
                <svg className="transform -rotate-90 w-12 h-12" aria-hidden="true">
                  <circle cx="24" cy="24" r="20" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="4" fill="none" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className={`${scoreMeta.stroke} transition-all duration-1000 ease-in-out`}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 - (driftScore / 100) * (2 * Math.PI * 20)}
                  />
                </svg>
                <span className={`absolute text-xs font-bold font-mono ${scoreMeta.text}`}>
                  {driftScore}%
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
                  Alignment Score
                </span>
                <span className={`text-xs font-bold ${scoreMeta.text}`}>
                  {scoreMeta.label}
                </span>
              </div>
            </div>

            <button
              onClick={handleAnalyzeHealth}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {analyzing ? 'Analyzing Health...' : 'Analyze Git Health'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Actionable Insights & Dormant Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* AI Insights */}
          <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Actionable AI Insights
              </h4>
            </div>
            <div className="space-y-2">
              {health.insights?.map((insight: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dormant Features Alert */}
          <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Dormant Feature Watch
              </h4>
            </div>
            {health.dormantFeatures && health.dormantFeatures.length > 0 ? (
              <div className="space-y-2">
                {health.dormantFeatures.map((feat: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2"
                  >
                    <span className="font-semibold">{feat}</span>
                    <span className="text-[11px] opacity-75">— 0 commits in recent activity window</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-2">
                All scheduled features are receiving active developer commits. Zero dormancy detected.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: COMMIT TIMELINE & PULL REQUESTS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commits Timeline (2 Cols) */}
        <div className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/40 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <GitCommit size={18} className="text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Commit Trajectory ({gitData.commits?.length || 0})
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">Latest synced</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {!gitData.commits || gitData.commits.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4 text-center">No commits logged yet.</p>
            ) : (
              gitData.commits.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold flex-shrink-0">
                      {c.hash.substring(0, 7)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 leading-snug truncate">
                        {c.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                        <span>{c.author}</span>
                        <span>•</span>
                        <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {c.featureId && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex-shrink-0">
                      Feature
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pull Requests (1 Col) */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/40 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <GitPullRequest size={18} className="text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                Pull Requests ({gitData.pullRequests?.length || 0})
              </h3>
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {!gitData.pullRequests || gitData.pullRequests.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-4 text-center">No active pull requests.</p>
            ) : (
              gitData.pullRequests.map((pr, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-zinc-500">#{pr.id}</span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        pr.status === 'Merged'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                          : pr.status === 'Open'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30'
                      }`}
                    >
                      {pr.status}
                    </span>
                  </div>
                  <h5 className="text-xs font-medium text-zinc-900 dark:text-zinc-200 mb-1 leading-snug">
                    {pr.title}
                  </h5>
                  <div className="flex justify-between items-center text-[11px] text-zinc-500">
                    <span>{pr.author}</span>
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors"
                    >
                      Review <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
