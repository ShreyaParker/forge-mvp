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
    Boolean(
      (project.tasks && project.tasks.length > 0) ||
      (project.features && project.features.length > 0)
    ),
  ];

  const total = attributes.length;
  const filled = attributes.filter(Boolean).length;

  return Math.round((filled / total) * 100);
}

export interface DeliveryEstimateResult {
  totalDays: number;
  allocatedTeamSize: number;
  estimatedWeeks: number;
  riskNotes: string[];
}

export function computeDeliveryEstimate(
  features: any[] | undefined,
  teamSize: number = 2
): DeliveryEstimateResult {
  const size = Math.max(1, teamSize || 1);
  if (!Array.isArray(features) || features.length === 0) {
    return {
      totalDays: 0,
      allocatedTeamSize: size,
      estimatedWeeks: 0,
      riskNotes: ['No features planned yet'],
    };
  }

  let totalDays = 0;
  let highPriorityDays = 0;
  let complexLayersCount = 0;

  for (const feature of features) {
    if (Array.isArray(feature.tasks)) {
      for (const task of feature.tasks) {
        const days = Number(task.estimateDays) || 1;
        totalDays += days;
        if (task.priority === 'High') {
          highPriorityDays += days;
        }
        if (task.layer === 'AI' || task.layer === 'Backend' || task.layer === 'Deployment') {
          complexLayersCount++;
        }
      }
    }
  }

  // Formula: estimatedWeeks = totalDays / (teamSize * 0.75 * 5 days/wk)
  const productiveCapacityPerWeek = size * 0.75 * 5;
  const rawWeeks = totalDays / (productiveCapacityPerWeek || 1);
  const estimatedWeeks = Number(rawWeeks.toFixed(1));

  const riskNotes: string[] = [];
  if (highPriorityDays / (totalDays || 1) > 0.5) {
    riskNotes.push('Over 50% high-priority workload requires tight milestone gating.');
  }
  if (complexLayersCount > 5) {
    riskNotes.push('Heavy backend and AI layer dependencies may impact integration timelines.');
  }
  if (size < 2 && totalDays > 20) {
    riskNotes.push('Single operator allocation for large scope increases delivery variance.');
  }
  if (riskNotes.length === 0) {
    riskNotes.push('Schedule velocity healthy with distributed feature breakdown.');
  }

  return {
    totalDays,
    allocatedTeamSize: size,
    estimatedWeeks,
    riskNotes,
  };
}
