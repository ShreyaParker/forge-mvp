import React from 'react';
import dbConnect from '../../../../lib/dbConnect';
import Project, { normalizeProject } from '../../../../models/Project';
import Organization from '../../../../models/Organization';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PrintProjectSpecPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const projectDoc = await Project.findById(id).lean();
  if (!projectDoc) notFound();

  const project = normalizeProject(projectDoc);
  let org = null;
  if (project.organizationId) {
    org = await Organization.findById(project.organizationId).lean();
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 print:p-0 p-8 font-sans">
      {/* Non-printed Toolbar */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden flex items-center justify-between border-b pb-4">
        <Link
          href={`/projects/${project._id}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Workspace
        </Link>

        <button
          // @ts-ignore
          onClick="window.print()"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
      </div>

      {/* Printable Specification Document */}
      <article className="max-w-4xl mx-auto space-y-8 print:space-y-6">
        {/* Document Header */}
        <header className="border-b-2 border-zinc-900 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-zinc-500 font-bold mb-1">
                {org?.name || 'Parker Studio'} • Project Specification
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                {project.basicInfo?.name}
              </h1>
              <p className="text-sm text-zinc-600 mt-1">
                Client: <strong className="text-zinc-900">{project.basicInfo?.clientName}</strong> • Target: {project.basicInfo?.targetPlatforms?.join(', ') || 'Web'}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded bg-zinc-100 border border-zinc-300 font-mono text-xs font-bold uppercase">
                {project.status}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Readiness: <strong className="text-zinc-900">{project.readinessScore}%</strong>
              </div>
              {project.deliveryEstimate && (
                <div className="text-xs text-zinc-500">
                  Est: <strong className="text-zinc-900">{project.deliveryEstimate.estimatedWeeks} wks</strong> ({project.deliveryEstimate.totalDays}d)
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 1. Executive Summary */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-800 border-b pb-1">
            1. Executive Summary
          </h2>
          <p className="text-sm leading-relaxed text-zinc-700">
            {project.basicInfo?.description}
          </p>
          {project.product?.objective && (
            <p className="text-sm text-zinc-600 italic">
              <strong>Core Objective:</strong> {project.product.objective}
            </p>
          )}
        </section>

        {/* 2. Operational Guardrails */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-800 border-b pb-1">
            2. Production Guardrails
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-zinc-50 border rounded-lg">
              <h3 className="font-bold text-zinc-900 uppercase mb-2">ALWAYS Enforce</h3>
              <ul className="space-y-1 text-zinc-700">
                {project.guardrails?.always?.map((g: any, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600">✓</span> {g.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-zinc-50 border rounded-lg">
              <h3 className="font-bold text-zinc-900 uppercase mb-2">NEVER Allow</h3>
              <ul className="space-y-1 text-zinc-700">
                {project.guardrails?.never?.map((g: any, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600">✕</span> {g.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Technical Architecture */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-800 border-b pb-1">
            3. Grounded Technical Architecture
          </h2>
          <table className="w-full text-left text-xs border border-collapse">
            <thead className="bg-zinc-100 font-bold uppercase">
              <tr>
                <th className="p-2 border">Layer</th>
                <th className="p-2 border">Recommendation</th>
                <th className="p-2 border">Capability Grounding</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {['frontend', 'backend', 'database', 'auth', 'infrastructure'].map((layerKey) => {
                const layer = project.technicalPlan?.[layerKey];
                if (!layer) return null;
                return (
                  <tr key={layerKey} className="border-b">
                    <td className="p-2 border font-bold capitalize">{layerKey}</td>
                    <td className="p-2 border font-medium text-zinc-900">{layer.recommendation}</td>
                    <td className="p-2 border text-zinc-600">{layer.capabilityMatch || 'Aligned with agency standards'}</td>
                    <td className="p-2 border font-mono font-semibold">
                      {layer.isApproved ? 'Approved' : 'In Review'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* 4. Features & Task Breakdown */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-800 border-b pb-1">
            4. Features & Task Breakdown
          </h2>

          <div className="space-y-4">
            {project.features?.map((feature: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-3 bg-zinc-50/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm text-zinc-900">
                    Feature {idx + 1}: {feature.name}
                  </h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-200">
                    {feature.status}
                  </span>
                </div>
                {feature.description && (
                  <p className="text-xs text-zinc-600 mb-2">{feature.description}</p>
                )}

                <table className="w-full text-left text-[11px] border border-collapse bg-white">
                  <thead className="bg-zinc-100 uppercase">
                    <tr>
                      <th className="p-1.5 border">Task ID</th>
                      <th className="p-1.5 border">Layer</th>
                      <th className="p-1.5 border">Title</th>
                      <th className="p-1.5 border">Role</th>
                      <th className="p-1.5 border">Estimate</th>
                      <th className="p-1.5 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feature.tasks?.map((t: any) => (
                      <tr key={t.id} className="border-b">
                        <td className="p-1.5 border font-mono">{t.id}</td>
                        <td className="p-1.5 border font-semibold">{t.layer}</td>
                        <td className="p-1.5 border text-zinc-800">{t.title}</td>
                        <td className="p-1.5 border text-zinc-600">{t.assignedRole}</td>
                        <td className="p-1.5 border font-mono">{t.estimateDays}d</td>
                        <td className="p-1.5 border font-medium">
                          {t.status === 'Done' ? 'Done' : t.status === 'In Progress' ? 'In Progress' : 'Todo'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Git Activity & Drift Telemetry */}
        {project.gitIntegration?.aiHealthAnalysis && (
          <section className="space-y-2 border-t pt-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-800 border-b pb-1">
              5. Git Health & Velocity Analysis
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <div>
                Drift Alignment: <strong>{project.gitIntegration.aiHealthAnalysis.driftScore}%</strong>
              </div>
              <div>
                Total Commits: <strong>{project.gitIntegration.commits?.length || 0}</strong>
              </div>
            </div>
            <ul className="text-xs text-zinc-700 list-disc list-inside space-y-0.5">
              {project.gitIntegration.aiHealthAnalysis.insights?.map((ins: string, i: number) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Document Footer */}
        <footer className="border-t pt-4 text-center text-xs text-zinc-400 font-mono">
          Forge v1 Agency Operating System • Parker Studio • Confidential
        </footer>
      </article>
    </div>
  );
}
