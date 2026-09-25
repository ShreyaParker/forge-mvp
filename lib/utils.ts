import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadiness(project: any): number {
  if (!project) return 0;
  const attributes = [
    Boolean(project.basicInfo?.name?.trim?.()),
    Boolean(project.basicInfo?.clientName?.trim?.()),
    Boolean(project.basicInfo?.description?.trim?.()),
    Boolean(project.brand?.personality && project.brand.personality.length > 0),
    Boolean(project.brand?.colors && project.brand.colors.length > 0),
    Boolean(project.product?.objective?.trim?.()),
    Boolean(project.guardrails?.always && project.guardrails.always.length > 0),
    Boolean(project.aiAnalysis?.summary?.trim?.()),
    Boolean(project.prd?.sections && project.prd.sections.length > 0),
    Boolean(project.technicalPlan?.frontend?.recommendation?.trim?.()),
    Boolean(project.tasks && project.tasks.length > 0),
  ];

  const total = attributes.length;
  const filled = attributes.filter(Boolean).length;

  return Math.round((filled / total) * 100);
}
