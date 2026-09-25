'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Check,
  Building2,
  User,
  Plus,
  Layers,
  Cpu,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  workspaceType: 'Agency' | 'Individual';
  description?: string;
  role: string;
  projectCount: number;
  isCurrent: boolean;
}

interface SessionData {
  userId: string;
  organizationId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    workspaceType: 'Agency' | 'Individual';
  };
  membership: {
    role: string;
  };
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<'Agency' | 'Individual'>('Agency');
  const [creating, setCreating] = useState(false);
  const [switching, setSwitching] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch session data
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setWorkspaces(data.availableWorkspaces || []);
      }
    } catch (err) {
      console.error('Failed to load session in Navbar', err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Switch workspace
  const handleSwitchWorkspace = async (orgId: string) => {
    if (session?.organizationId === orgId) {
      setDropdownOpen(false);
      return;
    }

    setSwitching(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (res.ok) {
        setDropdownOpen(false);
        // Refresh page so server components update with new cookie context
        window.location.href = pathname.startsWith('/projects/') ? '/' : pathname;
      }
    } catch (err) {
      console.error('Failed to switch workspace', err);
    } finally {
      setSwitching(false);
    }
  };

  // Create new workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName.trim(),
          workspaceType: newOrgType,
        }),
      });

      if (res.ok) {
        const newOrg = await res.json();
        setCreateModalOpen(false);
        setNewOrgName('');
        // Switch to the newly created organization
        await handleSwitchWorkspace(newOrg._id);
      }
    } catch (err) {
      console.error('Failed to create organization', err);
    } finally {
      setCreating(false);
    }
  };

  const isProjectsActive = pathname === '/' || pathname.startsWith('/projects');
  const isOrgActive = pathname === '/organization' && typeof window !== 'undefined' && !window.location.search.includes('tab=tech');
  const isStackActive = pathname === '/organization' && typeof window !== 'undefined' && window.location.search.includes('tab=tech');

  return (
    <>
      <header className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Brand + Workspace Switcher */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-zinc-100 to-zinc-300 text-black flex items-center justify-center font-bold text-lg shadow-[0_0_12px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform">
                F
              </div>
              <span className="font-semibold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                Forge
              </span>
            </Link>

            <div className="h-5 w-[1px] bg-zinc-800" />

            {/* Workspace Switcher */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/60 hover:border-zinc-700 text-sm font-medium transition-all text-zinc-200 shadow-sm"
              >
                <div className="w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-zinc-400">
                  {session?.organization?.workspaceType === 'Individual' ? (
                    <User size={12} className="text-sky-400" />
                  ) : (
                    <Building2 size={12} className="text-zinc-300" />
                  )}
                </div>

                <span className="max-w-[140px] truncate text-white">
                  {session?.organization?.name || 'Loading...'}
                </span>

                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                    session?.organization?.workspaceType === 'Individual'
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                  }`}
                >
                  {session?.organization?.workspaceType || 'Agency'}
                </span>

                <ChevronDown
                  size={14}
                  className={`text-zinc-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/80">
                    Workspaces
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSwitchWorkspace(ws.id)}
                        disabled={switching}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-zinc-800/70 transition-colors ${
                          ws.isCurrent ? 'bg-zinc-800/40 text-white' : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
                            {ws.workspaceType === 'Individual' ? (
                              <User size={13} className="text-sky-400" />
                            ) : (
                              <Building2 size={13} className="text-zinc-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate text-white">{ws.name}</div>
                            <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                              <span>{ws.workspaceType}</span>
                              <span>•</span>
                              <span>{ws.projectCount} {ws.projectCount === 1 ? 'project' : 'projects'}</span>
                            </div>
                          </div>
                        </div>

                        {ws.isCurrent && (
                          <Check size={16} className="text-white shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setCreateModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
                    >
                      <Plus size={14} />
                      Create New Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isProjectsActive
                    ? 'text-white bg-zinc-800/70'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}
              >
                Projects
              </Link>
              <Link
                href="/organization"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/organization'
                    ? 'text-white bg-zinc-800/70'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}
              >
                Organization
              </Link>
              <Link
                href="/organization?tab=tech"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/organization' && typeof window !== 'undefined' && window.location.search.includes('tab=tech')
                    ? 'text-white bg-zinc-800/70'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}
              >
                Agency Stack
              </Link>
            </nav>
          </div>

          {/* Right: User Profile & Role */}
          <div className="flex items-center gap-3">
            {session?.user && (
              <div className="flex items-center gap-2.5 pl-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800/80 pr-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-white leading-tight">
                    {session.user.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {session.membership?.role || 'Member'}
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-zinc-600 flex items-center justify-center text-xs font-semibold text-white overflow-hidden shadow-sm">
                  {session.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.avatarUrl}
                      alt={session.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    session.user.name.slice(0, 2).toUpperCase()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Create Workspace Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Create Workspace</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Establish a new Agency or Individual workspace with isolated project access.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Digital or Personal Lab"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Workspace Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewOrgType('Agency')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      newOrgType === 'Agency'
                        ? 'border-white bg-zinc-800/80 text-white'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Building2 size={18} className="mb-1.5 text-zinc-300" />
                    <div className="text-sm font-semibold">Agency</div>
                    <div className="text-xs text-zinc-500">Multi-member team with role hierarchy</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewOrgType('Individual')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      newOrgType === 'Individual'
                        ? 'border-sky-400 bg-sky-950/30 text-white'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <User size={18} className="mb-1.5 text-sky-400" />
                    <div className="text-sm font-semibold">Individual</div>
                    <div className="text-xs text-zinc-500">Single-operator streamlined workspace</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newOrgName.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {creating && <Loader2 size={16} className="animate-spin" />}
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
