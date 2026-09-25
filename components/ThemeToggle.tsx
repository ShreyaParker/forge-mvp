'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg h-8 w-24 opacity-60" />
    );
  }

  return (
    <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400">
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light Mode"
        className={`p-1.5 rounded-md transition-all ${
          theme === 'light'
            ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/80 font-medium'
            : 'hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
      >
        <Sun size={14} />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark Mode"
        className={`p-1.5 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80 font-medium'
            : 'hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
      >
        <Moon size={14} />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System Preference"
        className={`p-1.5 rounded-md transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700/80 font-medium'
            : 'hover:text-zinc-900 dark:hover:text-zinc-200'
        }`}
      >
        <Laptop size={14} />
      </button>
    </div>
  );
}
