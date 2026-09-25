import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadiness(project: any) {
  const attributes = [
    project.basicInfo?.name,
    project.basicInfo?.clientName,
    project.basicInfo?.description,
    project.brand?.personality,
    project.brand?.colors,
    project.product?.objective,
    project.guardrails?.always,
    project.aiAnalysis?.summary,
    project.prd?.sections,
    project.technicalPlan?.frontend,
    project.tasks?.length > 0 ? true : undefined,
  ];

  const total = attributes.length;
  const filled = attributes.filter(Boolean).length;

  return Math.round((filled / total) * 100);
}
