'use client';

import { ProvenanceSource } from '../../../../models/Project';

interface ProvenanceBadgeProps {
  source?: ProvenanceSource | string;
  size?: 'sm' | 'xs';
}

export function ProvenanceBadge({ source = 'ai', size = 'xs' }: ProvenanceBadgeProps) {
  const normalized = source.toLowerCase();

  const config = {
    client: {
      label: 'CLIENT',
      className: 'bg-zinc-800 text-zinc-300 border-zinc-700/80',
    },
    human_edited: {
      label: 'HUMAN EDITED',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    ai: {
      label: 'AI RECOMMENDATION',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
  }[normalized] || {
    label: (source as string).toUpperCase(),
    className: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  };

  const textClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full border tracking-wide uppercase ${textClass} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
