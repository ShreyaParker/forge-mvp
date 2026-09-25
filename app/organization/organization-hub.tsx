'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Cpu,
  Layers,
  Globe,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  GitBranch,
  Mail,
  Loader2,
  Tag,
} from 'lucide-react';
import { MembershipRole } from '../../models/Membership';
import { TechCategory, ApiStatus, ApiEnvironment } from '../../models/Organization';

interface Member {
  membershipId: string;
  userId: string;
  role: MembershipRole;
  availability: 'Available' | 'Partially Allocated' | 'Fully Booked';
  customPermissions: string[];
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    skills: { name: string; level: 'Beginner' | 'Working' | 'Proficient' | 'Expert' }[];
    gitIdentity?: { username: string; provider: string };
  };
}

interface OrganizationData {
  _id: string;
  name: string;
  slug: string;
  workspaceType: 'Agency' | 'Individual';
  description?: string;
  website?: string;
  industry?: string;
  teamSize?: number;
  services: string[];
  specializations: string[];
  techInventory: {
    name: string;
    category: TechCategory;
    approvedForProduction: boolean;
    notes?: string;
  }[];
  apiInventory: {
    provider: string;
    service: string;
    status: ApiStatus;
    environment: ApiEnvironment;
    notes?: string;
  }[];
}

interface Props {
  initialOrg: OrganizationData;
  initialMembers: Member[];
  userRole: string;
}

export default function OrganizationHub({ initialOrg, initialMembers, userRole }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'tech' | 'apis'>(
    tabParam === 'tech' ? 'tech' : tabParam === 'team' ? 'team' : tabParam === 'apis' ? 'apis' : 'profile'
  );

  const [org, setOrg] = useState<OrganizationData>(initialOrg);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // New member form
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Developer' as MembershipRole,
    availability: 'Available' as const,
    bio: '',
    skills: [
      { name: '', level: 'Proficient' as const },
    ],
  });

  // New tech item form
  const [newTech, setNewTech] = useState<{
    name: string;
    category: TechCategory;
    approvedForProduction: boolean;
    notes: string;
  }>({
    name: '',
    category: 'Frontend',
    approvedForProduction: true,
    notes: '',
  });

  // New API item form
  const [newApi, setNewApi] = useState<{
    provider: string;
    service: string;
    status: ApiStatus;
    environment: ApiEnvironment;
    notes: string;
  }>({
    provider: '',
    service: '',
    status: 'Connected',
    environment: 'Production',
    notes: '',
  });

  // Profile edit form
  const [profileForm, setProfileForm] = useState({
    name: org.name,
    description: org.description || '',
    website: org.website || '',
    industry: org.industry || '',
    teamSize: org.teamSize || 1,
    servicesStr: org.services?.join(', ') || '',
    specializationsStr: org.specializations?.join(', ') || '',
  });

  // Sync tab with URL
  const handleTabChange = (tab: 'profile' | 'team' | 'tech' | 'apis') => {
    setActiveTab(tab);
    router.replace(`/organization?tab=${tab}`, { scroll: false });
  };

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.email) return;

    setLoading(true);
    try {
      const validSkills = newMember.skills.filter(s => s.name.trim().length > 0);
      const res = await fetch(`/api/organizations/${org._id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMember,
          skills: validSkills,
        }),
      });

      if (res.ok) {
        const added = await res.json();
        setMembers(prev => [...prev, added]);
        setMemberModalOpen(false);
        setNewMember({
          name: '',
          email: '',
          role: 'Developer',
          availability: 'Available',
          bio: '',
          skills: [{ name: '', level: 'Proficient' }],
        });
      }
    } catch (err) {
      console.error('Failed to add member', err);
    } finally {
      setLoading(false);
    }
  };

  // Add Tech Item
  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.name.trim()) return;

    setLoading(true);
    try {
      const updatedInventory = [...org.techInventory, { ...newTech }];
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TECH_INVENTORY_UPDATE',
          techInventory: updatedInventory,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrg(updated);
        setTechModalOpen(false);
        setNewTech({
          name: '',
          category: 'Frontend',
          approvedForProduction: true,
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to add tech', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Tech Approval
  const handleToggleTechApproval = async (index: number) => {
    const updatedInventory = [...org.techInventory];
    updatedInventory[index].approvedForProduction = !updatedInventory[index].approvedForProduction;

    try {
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TECH_INVENTORY_UPDATE',
          techInventory: updatedInventory,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrg(updated);
      }
    } catch (err) {
      console.error('Failed to toggle tech approval', err);
    }
  };

  // Add API Item
  const handleAddApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApi.provider.trim() || !newApi.service.trim()) return;

    setLoading(true);
    try {
      const updatedInventory = [...org.apiInventory, { ...newApi }];
      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'API_INVENTORY_UPDATE',
          apiInventory: updatedInventory,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrg(updated);
        setApiModalOpen(false);
        setNewApi({
          provider: '',
          service: '',
          status: 'Connected',
          environment: 'Production',
          notes: '',
        });
      }
    } catch (err) {
      console.error('Failed to add API', err);
    } finally {
      setLoading(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const services = profileForm.servicesStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const specializations = profileForm.specializationsStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/organizations/${org._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PROFILE_UPDATE',
          data: {
            name: profileForm.name,
            description: profileForm.description,
            website: profileForm.website,
            industry: profileForm.industry,
            teamSize: Number(profileForm.teamSize),
            services,
            specializations,
          },
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrg(updated);
        setProfileModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setLoading(false);
    }
  };

  // Group tech by category
  const categories: TechCategory[] = [
    'Frontend',
    'Backend',
    'Database',
    'AI',
    'Cloud',
    'DevOps',
    'Design',
    'Other',
  ];

  const groupedTech = categories.reduce((acc, cat) => {
    acc[cat] = org.techInventory?.filter(t => t.category === cat) || [];
    return acc;
  }, {} as Record<TechCategory, typeof org.techInventory>);

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl">
      {/* Header with Organization Title & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-zinc-800 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                org.workspaceType === 'Individual'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              {org.workspaceType} Workspace
            </span>
            <span className="text-zinc-500 text-sm font-mono">@{org.slug}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {org.name}
          </h1>

          <p className="text-zinc-400 text-base max-w-2xl mt-2">
            {org.description || 'Enterprise Agency Operating System and Organization Intelligence Hub.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:text-white text-zinc-300 text-sm transition-colors"
            >
              <Globe size={16} />
              Visit Website
              <ExternalLink size={12} className="text-zinc-500" />
            </a>
          )}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-black font-semibold text-sm transition-colors shadow-sm"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Hub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 my-8 overflow-x-auto">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building2 size={16} />
          Profile & Overview
        </button>

        <button
          onClick={() => handleTabChange('team')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all shrink-0 ${
            activeTab === 'team'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users size={16} />
          Team Roster ({members.length})
        </button>

        <button
          onClick={() => handleTabChange('tech')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all shrink-0 ${
            activeTab === 'tech'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu size={16} />
          Technology Inventory ({org.techInventory?.length || 0})
        </button>

        <button
          onClick={() => handleTabChange('apis')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all shrink-0 ${
            activeTab === 'apis'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers size={16} />
          API & Subscriptions ({org.apiInventory?.length || 0})
        </button>
      </div>

      {/* TAB 1: PROFILE & OVERVIEW */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Workspace Type
              </div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {org.workspaceType}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Multi-tenant role isolation</p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Team Size
              </div>
              <div className="text-2xl font-bold text-white">{org.teamSize || members.length} Active</div>
              <p className="text-xs text-zinc-500 mt-1">Across strategy, dev, & AI</p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Approved Stack
              </div>
              <div className="text-2xl font-bold text-white">
                {org.techInventory?.filter(t => t.approvedForProduction).length || 0} Technologies
              </div>
              <p className="text-xs text-zinc-500 mt-1">Ready for production client builds</p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Active Integrations
              </div>
              <div className="text-2xl font-bold text-white">
                {org.apiInventory?.filter(a => a.status === 'Connected').length || 0} Connected
              </div>
              <p className="text-xs text-zinc-500 mt-1">LLM, Cloud, & Infrastructure APIs</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Details */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Building2 size={18} className="text-zinc-400" />
                Agency Intelligence Profile
              </h2>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider font-semibold">
                    Industry
                  </span>
                  <span className="text-zinc-200 font-medium">{org.industry || 'Not specified'}</span>
                </div>

                <div>
                  <span className="text-zinc-500 block text-xs uppercase tracking-wider font-semibold">
                    Website
                  </span>
                  {org.website ? (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {org.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-zinc-500">Not specified</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-xs uppercase tracking-wider font-semibold mb-2">
                  Core Services
                </span>
                <div className="flex flex-wrap gap-2">
                  {org.services && org.services.length > 0 ? (
                    org.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs font-medium"
                      >
                        {service}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 text-sm italic">No services listed</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-zinc-500 block text-xs uppercase tracking-wider font-semibold mb-2">
                  Agency Specializations
                </span>
                <div className="flex flex-wrap gap-2">
                  {org.specializations && org.specializations.length > 0 ? (
                    org.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono"
                      >
                        ⚡ {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 text-sm italic">No specializations listed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stack Highlights */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-zinc-400" />
                  Primary Production Stack
                </h2>
                <button
                  onClick={() => handleTabChange('tech')}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  View All ({org.techInventory?.length || 0}) →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {org.techInventory
                  ?.filter(t => t.approvedForProduction)
                  .slice(0, 6)
                  .map((tech, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{tech.name}</div>
                        <div className="text-xs text-zinc-500">{tech.category}</div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  ))}
              </div>

              <div className="pt-2 border-t border-zinc-800/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Active AI & Cloud Integrations
                </div>
                <div className="flex flex-wrap gap-2">
                  {org.apiInventory?.map((api, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs text-zinc-300"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          api.status === 'Connected'
                            ? 'bg-emerald-400'
                            : api.status === 'Available'
                            ? 'bg-sky-400'
                            : 'bg-zinc-500'
                        }`}
                      />
                      <span className="font-semibold text-white">{api.provider}</span>
                      <span className="text-zinc-500 font-mono text-[10px]">({api.service})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM ROSTER */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Agency Team Roster</h2>
              <p className="text-sm text-zinc-400">
                Team member capabilities, granular roles, skill proficiencies, and allocation availability.
              </p>
            </div>
            <button
              onClick={() => setMemberModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => {
              const availabilityColor =
                member.availability === 'Available'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : member.availability === 'Partially Allocated'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

              return (
                <div
                  key={member.membershipId}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all shadow-sm group"
                >
                  <div>
                    {/* Header: Avatar, Name, Role, Availability */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border border-zinc-600 flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-inner shrink-0">
                          {member.user.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.user.avatarUrl}
                              alt={member.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.user.name.slice(0, 2).toUpperCase()
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">
                            {member.user.name}
                          </h3>
                          <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Mail size={12} className="text-zinc-500" />
                            {member.user.email}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 ${availabilityColor}`}
                      >
                        {member.availability}
                      </span>
                    </div>

                    {/* Role Pill */}
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 font-semibold border border-zinc-700/60 font-mono">
                        {member.role}
                      </span>

                      {member.user.gitIdentity && (
                        <a
                          href={`https://github.com/${member.user.gitIdentity.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                        >
                          <GitBranch size={12} />
                          {member.user.gitIdentity.username}
                        </a>
                      )}
                    </div>

                    {/* Bio */}
                    {member.user.bio && (
                      <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                        {member.user.bio}
                      </p>
                    )}

                    {/* Skills with colored proficiency pills */}
                    <div className="space-y-1.5 pt-3 border-t border-zinc-800/80">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Skills & Proficiency
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {member.user.skills && member.user.skills.length > 0 ? (
                          member.user.skills.map((skill, idx) => {
                            const levelBadge =
                              skill.level === 'Expert'
                                ? 'bg-purple-950/40 text-purple-300 border-purple-800/50'
                                : skill.level === 'Proficient'
                                ? 'bg-sky-950/40 text-sky-300 border-sky-800/50'
                                : skill.level === 'Working'
                                ? 'bg-teal-950/40 text-teal-300 border-teal-800/50'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700';

                            return (
                              <div
                                key={idx}
                                className={`text-[11px] px-2 py-0.5 rounded border flex items-center gap-1.5 ${levelBadge}`}
                              >
                                <span className="font-medium text-white">{skill.name}</span>
                                <span className="text-[9px] uppercase tracking-wider font-mono opacity-80">
                                  {skill.level}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-zinc-500 italic">No skills added</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TECHNOLOGY INVENTORY */}
      {activeTab === 'tech' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Agency Technology Inventory</h2>
              <p className="text-sm text-zinc-400">
                Approved production stack, evaluated libraries, and agency infrastructure standards.
              </p>
            </div>
            <button
              onClick={() => setTechModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus size={16} />
              Add Technology
            </button>
          </div>

          {/* Grouped Grid by Category */}
          <div className="space-y-8">
            {categories.map((category) => {
              const items = groupedTech[category];
              if (!items || items.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                      {category}
                    </h3>
                    <div className="h-[1px] flex-1 bg-zinc-800/80" />
                    <span className="text-xs text-zinc-500 font-mono">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((tech, idx) => {
                      const originalIndex = org.techInventory.findIndex(t => t.name === tech.name);

                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-bold text-white text-base">{tech.name}</h4>
                              <button
                                onClick={() => handleToggleTechApproval(originalIndex)}
                                title="Click to toggle production approval status"
                                className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border flex items-center gap-1 transition-all ${
                                  tech.approvedForProduction
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                }`}
                              >
                                {tech.approvedForProduction ? (
                                  <>
                                    <CheckCircle2 size={10} />
                                    Approved
                                  </>
                                ) : (
                                  <>
                                    <Clock size={10} />
                                    Evaluation
                                  </>
                                )}
                              </button>
                            </div>

                            {tech.notes && (
                              <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                                {tech.notes}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 mt-3 border-t border-zinc-800/50 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>Category: {tech.category}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: API & SUBSCRIPTIONS */}
      {activeTab === 'apis' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">API & Service Subscriptions</h2>
              <p className="text-sm text-zinc-400">
                Connected AI models, cloud environments, authentication, and external services.
              </p>
            </div>
            <button
              onClick={() => setApiModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus size={16} />
              Add API / Subscription
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-xs uppercase font-semibold text-zinc-400">
                  <tr>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Environment</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {org.apiInventory && org.apiInventory.length > 0 ? (
                    org.apiInventory.map((item, idx) => {
                      const statusColor =
                        item.status === 'Connected'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.status === 'Available'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : item.status === 'Expiring'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700';

                      return (
                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.status === 'Connected'
                                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                                  : item.status === 'Available'
                                  ? 'bg-sky-400'
                                  : 'bg-zinc-500'
                              }`}
                            />
                            {item.provider}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300 font-mono text-xs">
                            {item.service}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono">
                              {item.environment}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-400 max-w-xs truncate">
                            {item.notes || '—'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                        No API or service inventories registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Member */}
      {memberModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Add Team Member</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Invite an engineer, strategist, or manager to {org.name}.
            </p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@agency.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as MembershipRole })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Strategist">Strategist</option>
                    <option value="Developer">Developer</option>
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="Designer">Designer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Availability
                  </label>
                  <select
                    value={newMember.availability}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        availability: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Partially Allocated">Partially Allocated</option>
                    <option value="Fully Booked">Fully Booked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Bio
                </label>
                <input
                  type="text"
                  placeholder="Lead engineer driving architecture and cloud systems."
                  value={newMember.bio}
                  onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Skills inputs */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Primary Skills
                </label>
                {newMember.skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. Next.js, Python, Figma"
                      value={skill.name}
                      onChange={(e) => {
                        const copy = [...newMember.skills];
                        copy[idx].name = e.target.value;
                        setNewMember({ ...newMember, skills: copy });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                    />
                    <select
                      value={skill.level}
                      onChange={(e) => {
                        const copy = [...newMember.skills];
                        copy[idx].level = e.target.value as any;
                        setNewMember({ ...newMember, skills: copy });
                      }}
                      className="px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Working">Working</option>
                      <option value="Proficient">Proficient</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setNewMember({
                      ...newMember,
                      skills: [...newMember.skills, { name: '', level: 'Proficient' }],
                    })
                  }
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  + Add another skill
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Technology */}
      {techModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Add Technology</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Register a tool or framework in the agency tech inventory.
            </p>

            <form onSubmit={handleAddTech} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Technology Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js, FastAPI, Docker"
                  value={newTech.name}
                  onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Category
                </label>
                <select
                  value={newTech.category}
                  onChange={(e) => setNewTech({ ...newTech, category: e.target.value as TechCategory })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTech.approvedForProduction}
                    onChange={(e) => setNewTech({ ...newTech, approvedForProduction: e.target.checked })}
                    className="rounded bg-zinc-950 border-zinc-800 text-white focus:ring-0 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-zinc-200">
                    Approved for Production Client Builds
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Notes / Guidelines
                </label>
                <textarea
                  rows={2}
                  placeholder="Primary frontend framework for all server-rendered applications."
                  value={newTech.notes}
                  onChange={(e) => setNewTech({ ...newTech, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTechModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Add Tech
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add API */}
      {apiModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Add API or Subscription</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Record a service integration or cloud resource.
            </p>

            <form onSubmit={handleAddApi} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Provider
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI, Stripe"
                    value={newApi.provider}
                    onChange={(e) => setNewApi({ ...newApi, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Service
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GPT-4o, Billing API"
                    value={newApi.service}
                    onChange={(e) => setNewApi({ ...newApi, service: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={newApi.status}
                    onChange={(e) => setNewApi({ ...newApi, status: e.target.value as ApiStatus })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Connected">Connected</option>
                    <option value="Available">Available</option>
                    <option value="Not Connected">Not Connected</option>
                    <option value="Expiring">Expiring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Environment
                  </label>
                  <select
                    value={newApi.environment}
                    onChange={(e) => setNewApi({ ...newApi, environment: e.target.value as ApiEnvironment })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Enterprise API key configured for production generative pipelines."
                  value={newApi.notes}
                  onChange={(e) => setNewApi({ ...newApi, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setApiModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Add API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Profile */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">Edit Organization Profile</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Update branding, industry classification, and core agency offerings.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={profileForm.industry}
                    onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Core Services (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Web Dev, AI Apps, E-commerce"
                  value={profileForm.servicesStr}
                  onChange={(e) => setProfileForm({ ...profileForm, servicesStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Specializations (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Generative AI Integration, High-Performance E-commerce"
                  value={profileForm.specializationsStr}
                  onChange={(e) => setProfileForm({ ...profileForm, specializationsStr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
