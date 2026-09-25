'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    website: '',
    description: '',
    targetPlatforms: ['Web'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create project');
      
      const project = await res.json();
      router.push(`/projects/${project._id}`);
    } catch (err) {
      setError('An error occurred while creating the project.');
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      targetPlatforms: prev.targetPlatforms.includes(platform)
        ? prev.targetPlatforms.filter(p => p !== platform)
        : [...prev.targetPlatforms, platform]
    }));
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">New Project Intelligence</h1>
        <p className="text-zinc-400">Input raw client brief data. Forge will analyze and structure it.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="clientName" className="block text-sm font-medium text-zinc-300">Client Name *</label>
              <input
                id="clientName"
                required
                type="text"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="e.g. Nova Fashion Studio"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300">Project Name *</label>
              <input
                id="name"
                required
                type="text"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                placeholder="e.g. Nova Flagship Experience"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="block text-sm font-medium text-zinc-300">Existing Website (Optional)</label>
            <input
              id="website"
              type="url"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="https://example.com"
              value={formData.website}
              onChange={e => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300">Target Platforms</label>
            <div className="flex flex-wrap gap-2">
              {['Web', 'iOS', 'Android', 'Desktop'].map(platform => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    formData.targetPlatforms.includes(platform)
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300">Raw Client Brief / Description *</label>
            <textarea
              id="description"
              required
              rows={8}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
              placeholder="Paste notes from client calls, emails, or RFP documents here..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-md font-medium hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
