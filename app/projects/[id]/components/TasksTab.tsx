'use client';

import React, { useState } from 'react';
import { 
  ListTodo, CheckCircle2, Circle, Clock, Plus, Trash2, 
  Edit3, Save, X, Calendar, User, ChevronRight, Loader2, 
  Sparkles, CheckSquare, Square, Layers, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { IProjectFeature, IFeatureTask } from '../../../../models/Project';

interface OrgMember {
  userId: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

interface TasksTabProps {
  project: any;
  orgMembers?: OrgMember[];
  onMutate: (payload: { type: string; data: any }) => Promise<void>;
  isSubmitting?: boolean;
}

const LAYER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Requirements: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  Design: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
  Frontend: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
  Backend: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  AI: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20' },
  Testing: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  Deployment: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
};

const FEATURE_STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Planned: { bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-400', border: 'border-zinc-500/20' },
  'In Development': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  Testing: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  Completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
};

export function TasksTab({ project, orgMembers = [], onMutate, isSubmitting = false }: TasksTabProps) {
  const [activeFeatureIdForNewTask, setActiveFeatureIdForNewTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskLayer, setNewTaskLayer] = useState<'Requirements' | 'Design' | 'Frontend' | 'Backend' | 'AI' | 'Testing' | 'Deployment'>('Frontend');
  const [newTaskRole, setNewTaskRole] = useState('Frontend Engineer');
  const [newTaskEstimate, setNewTaskEstimate] = useState(2);
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [mutatingTaskId, setMutatingTaskId] = useState<string | null>(null);

  const features: IProjectFeature[] = project.features || [];
  const deliveryEstimate = project.deliveryEstimate || {
    totalDays: 0,
    allocatedTeamSize: 3,
    estimatedWeeks: 0,
    riskNotes: [],
  };

  // Flattened tasks metric calculations
  const allTasks: IFeatureTask[] = features.flatMap(f => f.tasks || []);
  const completedTasks = allTasks.filter(t => t.status === 'Done');
  const inProgressTasks = allTasks.filter(t => t.status === 'In Progress');
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  const handleToggleTask = async (featureId: string, taskId: string) => {
    setMutatingTaskId(taskId);
    try {
      await onMutate({
        type: 'FEATURE_TASK_TOGGLE',
        data: { featureId, taskId },
      });
    } finally {
      setMutatingTaskId(null);
    }
  };

  const handleAssignTask = async (featureId: string, taskId: string, assignedUserId: string) => {
    setMutatingTaskId(taskId);
    try {
      const selectedMember = orgMembers.find(m => m.userId === assignedUserId);
      await onMutate({
        type: 'FEATURE_TASK_ASSIGN',
        data: {
          featureId,
          taskId,
          assignedUserId: assignedUserId || undefined,
          assignedRole: selectedMember?.role || 'Engineer',
        },
      });
    } finally {
      setMutatingTaskId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent, featureId: string) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      await onMutate({
        type: 'FEATURE_TASK_CREATE',
        data: {
          featureId,
          title: newTaskTitle.trim(),
          layer: newTaskLayer,
          assignedRole: newTaskRole,
          estimateDays: Number(newTaskEstimate) || 1,
          priority: newTaskPriority,
        },
      });
      setNewTaskTitle('');
      setActiveFeatureIdForNewTask(null);
    } finally {
      setIsAddingTask(false);
    }
  };

  if (features.length === 0 && (!project.tasks || project.tasks.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl text-center h-64 bg-zinc-50 dark:bg-zinc-900/10">
        <div className="text-zinc-400 dark:text-zinc-600 mb-4">
          <ListTodo size={40} />
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-4">
          No feature work breakdown found. Click "Breakdown Tasks" above to generate feature tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* SECTION 1: DELIVERY ESTIMATE & SPRINT HORIZON METRICS */}
      <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900/40 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-500" />
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Delivery Horizon & Velocity Metrics
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live capacity model: <code>totalDays / (teamSize × 0.75 focus × 5 days)</code>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Dev Days */}
            <div className="bg-zinc-50 dark:bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">
                Total Effort
              </span>
              <div className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono">
                {deliveryEstimate.totalDays} <span className="text-xs text-zinc-400 font-normal">days</span>
              </div>
            </div>

            {/* Team Capacity */}
            <div className="bg-zinc-50 dark:bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">
                Team Size
              </span>
              <div className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono">
                {deliveryEstimate.allocatedTeamSize} <span className="text-xs text-zinc-400 font-normal">devs</span>
              </div>
            </div>

            {/* Delivery Horizon */}
            <div className="bg-zinc-50 dark:bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">
                Delivery Est.
              </span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {deliveryEstimate.estimatedWeeks} <span className="text-xs text-zinc-400 font-normal">wks</span>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-zinc-50 dark:bg-zinc-950/80 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block mb-0.5">
                Completion
              </span>
              <div className="text-xl font-extrabold text-zinc-950 dark:text-white font-mono">
                {progressPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Risk Notes Pill */}
        {deliveryEstimate.riskNotes && deliveryEstimate.riskNotes.length > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-800 dark:text-zinc-200">
              <span className="font-semibold text-amber-600 dark:text-amber-400 mr-2">Delivery Risk Factors:</span>
              {deliveryEstimate.riskNotes.join(' • ')}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: FEATURE-FIRST EXECUTION BOARD */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Feature-First Execution Board ({features.length} Features, {allTasks.length} Tasks)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Features decompose into multi-layered tasks assigned to agency specialists.
            </p>
          </div>
        </div>

        {features.map((feature, fIndex) => {
          const featureStatusStyle = FEATURE_STATUS_STYLES[feature.status] || FEATURE_STATUS_STYLES.Planned;
          const featureTasks = feature.tasks || [];
          const featureCompleted = featureTasks.filter(t => t.status === 'Done').length;
          const featurePercent = featureTasks.length > 0 ? Math.round((featureCompleted / featureTasks.length) * 100) : 0;
          const isAddingToThis = activeFeatureIdForNewTask === feature.id;

          return (
            <div
              key={feature.id || fIndex}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm"
            >
              {/* Feature Header */}
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 dark:bg-zinc-950/40">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h4 className="font-bold text-zinc-950 dark:text-white text-base">
                      {feature.name}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${featureStatusStyle.bg} ${featureStatusStyle.text} ${featureStatusStyle.border}`}
                    >
                      {feature.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">
                    {feature.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  {/* Progress Pill */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500">
                      {featureCompleted}/{featureTasks.length} Done ({featurePercent}%)
                    </span>
                    <div className="w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${featurePercent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveFeatureIdForNewTask(isAddingToThis ? null : feature.id)}
                    className="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    {isAddingToThis ? 'Close' : 'Add Task'}
                  </button>
                </div>
              </div>

              {/* Add Task Form to this Feature */}
              {isAddingToThis && (
                <form
                  onSubmit={e => handleCreateTask(e, feature.id)}
                  className="p-4 bg-zinc-100/60 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Create New Layered Task in {feature.name}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Task title (e.g. Implement WebGL 3D model canvas)"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-1.5 text-xs text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      />
                    </div>
                    <div>
                      <select
                        value={newTaskLayer}
                        onChange={e => setNewTaskLayer(e.target.value as any)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none"
                      >
                        {['Requirements', 'Design', 'Frontend', 'Backend', 'AI', 'Testing', 'Deployment'].map(layer => (
                          <option key={layer} value={layer}>{layer}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={newTaskEstimate}
                        onChange={e => setNewTaskEstimate(Number(e.target.value))}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-1.5 text-xs text-zinc-950 dark:text-white focus:outline-none"
                        placeholder="Est. Days"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveFeatureIdForNewTask(null)}
                      className="px-3 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingTask || !newTaskTitle.trim()}
                      className="px-4 py-1 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-md text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      {isAddingTask ? <Loader2 size={12} className="animate-spin" /> : 'Save Task'}
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {featureTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-400 italic">
                    No tasks decomposed for this feature yet.
                  </div>
                ) : (
                  featureTasks.map(task => {
                    const layerStyle = LAYER_STYLES[task.layer] || LAYER_STYLES.Frontend;
                    const isDone = task.status === 'Done';
                    const isInProgress = task.status === 'In Progress';
                    const isMutating = mutatingTaskId === task.id;

                    // Resolve current assigned user
                    const assignedUserIdStr = task.assignedUserId
                      ? (typeof task.assignedUserId === 'object' ? (task.assignedUserId as any)._id?.toString() || (task.assignedUserId as any).id : task.assignedUserId.toString())
                      : '';

                    return (
                      <div
                        key={task.id}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                          isDone ? 'opacity-65' : ''
                        }`}
                      >
                        {/* Task Title & Checkbox */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(feature.id, task.id)}
                            disabled={isMutating}
                            className="mt-0.5 text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer flex-shrink-0"
                            aria-label={`Toggle status for ${task.title}`}
                          >
                            {isMutating ? (
                              <Loader2 size={18} className="animate-spin text-zinc-500" />
                            ) : isDone ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : isInProgress ? (
                              <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                            ) : (
                              <Circle size={18} />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span
                                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${layerStyle.bg} ${layerStyle.text} ${layerStyle.border}`}
                              >
                                {task.layer}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-semibold ${
                                  task.priority === 'High'
                                    ? 'text-red-500'
                                    : task.priority === 'Medium'
                                    ? 'text-amber-500'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {task.priority} Priority
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {task.estimateDays}d est.
                              </span>
                            </div>

                            <p
                              className={`text-sm font-medium ${
                                isDone
                                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                                  : 'text-zinc-900 dark:text-zinc-100'
                              }`}
                            >
                              {task.title}
                            </p>
                          </div>
                        </div>

                        {/* Assignee Dropdown & Role */}
                        <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <User size={13} className="text-zinc-400" />
                            <select
                              value={assignedUserIdStr}
                              onChange={e => handleAssignTask(feature.id, task.id, e.target.value)}
                              disabled={isMutating}
                              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                            >
                              <option value="">Unassigned</option>
                              {orgMembers.map(m => (
                                <option key={m.userId} value={m.userId}>
                                  {m.name} ({m.role || 'Dev'})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                              isDone
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : isInProgress
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {task.status}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
