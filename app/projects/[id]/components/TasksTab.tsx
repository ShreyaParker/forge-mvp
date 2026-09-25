'use client';

import { useState } from 'react';
import { 
  ListTodo, CheckCircle2, Circle, Clock, Plus, Trash2, 
  Edit3, Save, X, Calendar, User, ChevronRight, Loader2, Sparkles
} from 'lucide-react';
import { IProjectTask } from '../../../../models/Project';

interface TasksTabProps {
  project: any;
  onMutate: (payload: { type: string; data: any }) => Promise<void>;
  isSubmitting?: boolean;
}

export function TasksTab({ project, onMutate, isSubmitting = false }: TasksTabProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOwnerRole, setEditOwnerRole] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editEstimateDays, setEditEstimateDays] = useState(1);
  const [editEpic, setEditEpic] = useState('');

  // Add task state
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetEpic, setTargetEpic] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newOwnerRole, setNewOwnerRole] = useState('Frontend Eng');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newEstimateDays, setNewEstimateDays] = useState(2);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tasks: IProjectTask[] = project.tasks || [];

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 border-dashed rounded-xl text-center h-64 bg-zinc-900/10">
        <div className="text-zinc-600 mb-4">
          <ListTodo size={40} />
        </div>
        <p className="text-zinc-400 font-medium mb-4">No tasks found. Generate tasks or add custom tasks manually.</p>
        <button
          type="button"
          onClick={() => {
            setTargetEpic('General');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md text-xs font-semibold hover:bg-zinc-200 transition-colors"
        >
          <Plus size={14} /> Add First Custom Task
        </button>
      </div>
    );
  }

  // Group tasks by Epic
  const epics = Array.from(new Set(tasks.map(t => t.epic || 'General')));
  const completedTasks = tasks.filter(t => t.status === 'Done');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const totalDays = tasks.reduce((sum, t) => sum + (Number(t.estimateDays) || 0), 0);
  const progressPercent = Math.round((completedTasks.length / tasks.length) * 100);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, 'Todo' | 'In Progress' | 'Done'> = {
      Todo: 'In Progress',
      'In Progress': 'Done',
      Done: 'Todo',
    };
    const nextStatus = nextStatusMap[currentStatus] || 'Todo';
    await onMutate({
      type: 'TASK_UPDATE',
      data: { taskId, status: nextStatus },
    });
  };

  const startEditTask = (task: IProjectTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditOwnerRole(task.ownerRole);
    setEditPriority(task.priority);
    setEditEstimateDays(task.estimateDays);
    setEditEpic(task.epic);
  };

  const saveEditTask = async (taskId: string) => {
    await onMutate({
      type: 'TASK_UPDATE',
      data: {
        taskId,
        title: editTitle.trim(),
        ownerRole: editOwnerRole,
        priority: editPriority,
        estimateDays: Number(editEstimateDays),
        epic: editEpic.trim(),
      },
    });
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      await onMutate({
        type: 'TASK_DELETE',
        data: { taskId },
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsAdding(true);
    try {
      await onMutate({
        type: 'TASK_CREATE',
        data: {
          epic: targetEpic.trim() || 'General',
          title: newTitle.trim(),
          ownerRole: newOwnerRole,
          priority: newPriority,
          estimateDays: Number(newEstimateDays) || 1,
          status: 'Todo',
        },
      });
      setNewTitle('');
      setShowAddModal(false);
    } finally {
      setIsAdding(false);
    }
  };

  const openAddTaskForEpic = (epicName: string) => {
    setTargetEpic(epicName);
    setNewTitle('');
    setShowAddModal(true);
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Dev Board Header & Stats */}
      <section className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ListTodo size={20} className="text-zinc-400" />
              <h3 className="text-lg font-semibold text-white">Engineering Execution Backlog</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Interactive sprint board with role allocation, effort estimates, and real-time status tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openAddTaskForEpic(epics[0] || 'General')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus size={14} /> Add Custom Task
            </button>
          </div>
        </div>

        {/* Sprint Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
          <div className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              Total Backlog
            </span>
            <span className="text-xl font-bold text-white font-mono">{tasks.length}</span>
            <span className="text-xs text-zinc-500 ml-1.5">tasks</span>
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              Completed
            </span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{completedTasks.length}</span>
            <span className="text-xs text-zinc-500 ml-1.5">({progressPercent}%)</span>
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              In Progress
            </span>
            <span className="text-xl font-bold text-blue-400 font-mono">{inProgressTasks.length}</span>
            <span className="text-xs text-zinc-500 ml-1.5">active</span>
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
              Total Effort
            </span>
            <span className="text-xl font-bold text-white font-mono">{totalDays}</span>
            <span className="text-xs text-zinc-500 ml-1.5">engineer days</span>
          </div>
        </div>
      </section>

      {/* Epics Columns / Groups */}
      <section className="space-y-6">
        {epics.map(epic => {
          const epicTasks = tasks.filter(t => t.epic === epic);
          const epicDone = epicTasks.filter(t => t.status === 'Done').length;
          const epicTotalDays = epicTasks.reduce((s, t) => s + (Number(t.estimateDays) || 0), 0);

          return (
            <div key={epic} className="border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              {/* Epic Column Header with Add Task Button */}
              <div className="bg-zinc-900 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded bg-zinc-400" />
                  <h4 className="font-semibold text-white text-sm tracking-wide">
                    Epic: <span className="text-zinc-200">{epic}</span>
                  </h4>
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {epicDone}/{epicTasks.length} Done • {epicTotalDays}d
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openAddTaskForEpic(epic)}
                  className="text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors border border-zinc-700/60"
                >
                  <Plus size={13} /> Add Task
                </button>
              </div>

              {/* Task Items in Epic */}
              <div className="divide-y divide-zinc-800/60 bg-zinc-900/20">
                {epicTasks.map(task => {
                  const isEditing = editingTaskId === task.id;
                  const isDone = task.status === 'Done';
                  const isInProgress = task.status === 'In Progress';
                  const isDeleting = deletingId === task.id;

                  if (isEditing) {
                    return (
                      <div key={task.id} className="p-4 bg-zinc-950/90 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-zinc-400">Editing {task.id}</span>
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="text-zinc-500 hover:text-white p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">
                              Task Title
                            </label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">
                              Owner Role
                            </label>
                            <select
                              value={editOwnerRole}
                              onChange={e => setEditOwnerRole(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            >
                              <option value="Frontend Eng">Frontend Eng</option>
                              <option value="Backend Eng">Backend Eng</option>
                              <option value="Full Stack">Full Stack</option>
                              <option value="DevOps">DevOps</option>
                              <option value="QA Eng">QA Eng</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">
                              Priority
                            </label>
                            <select
                              value={editPriority}
                              onChange={e => setEditPriority(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">
                              Epic
                            </label>
                            <input
                              type="text"
                              value={editEpic}
                              onChange={e => setEditEpic(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1">
                              Estimate (Days)
                            </label>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={editEstimateDays}
                              onChange={e => setEditEstimateDays(parseFloat(e.target.value) || 1)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditTask(task.id)}
                            className="px-4 py-1 bg-white text-black hover:bg-zinc-200 rounded text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Save size={12} /> Save Task
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={task.id}
                      className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Left: Checkbox & Title */}
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          aria-label={`Toggle status for ${task.id}`}
                          className={`mt-0.5 sm:mt-0 transition-colors cursor-pointer ${
                            isDone ? 'text-emerald-500' : isInProgress ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={19} />
                          ) : (
                            <Circle size={19} className={isInProgress ? 'fill-blue-500/20' : ''} />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs text-zinc-500 font-semibold">{task.id}</span>
                            <span
                              className={`text-sm font-medium transition-colors ${
                                isDone ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs text-zinc-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User size={12} /> {task.ownerRole}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {task.estimateDays} day{task.estimateDays === 1 ? '' : 's'}
                            </span>
                            <span>•</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border font-mono ${getPriorityBadgeClass(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill & Action Triggers */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          className={`text-xs px-2.5 py-1 rounded font-medium border transition-colors cursor-pointer ${
                            isDone
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                              : isInProgress
                              ? 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                              : 'border-zinc-700 text-zinc-400 bg-zinc-800 hover:bg-zinc-750'
                          }`}
                        >
                          {task.status}
                        </button>

                        <button
                          type="button"
                          onClick={() => startEditTask(task)}
                          className="text-zinc-500 hover:text-white p-1 rounded transition-colors opacity-60 group-hover:opacity-100"
                          aria-label={`Edit ${task.id}`}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={isDeleting}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors opacity-60 group-hover:opacity-100 disabled:opacity-30"
                          aria-label={`Delete ${task.id}`}
                        >
                          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Add Task Modal / Drawer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Plus size={16} /> Add Engineering Task
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Epic / Feature Area *
                </label>
                <input
                  type="text"
                  required
                  value={targetEpic}
                  onChange={e => setTargetEpic(e.target.value)}
                  placeholder="e.g. Storefront, Checkout, Architecture"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement headless catalog search query"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Owner Role
                  </label>
                  <select
                    value={newOwnerRole}
                    onChange={e => setNewOwnerRole(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="Frontend Eng">Frontend Eng</option>
                    <option value="Backend Eng">Backend Eng</option>
                    <option value="Full Stack">Full Stack</option>
                    <option value="DevOps">DevOps</option>
                    <option value="QA Eng">QA Eng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Estimated Effort (Days)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={newEstimateDays}
                  onChange={e => setNewEstimateDays(parseFloat(e.target.value) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newTitle.trim()}
                  className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isAdding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
