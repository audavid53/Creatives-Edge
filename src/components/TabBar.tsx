import React from 'react';
import { Home, Map, Mic, User as UserIcon } from 'lucide-react';

export type AppTab = 'home' | 'journey' | 'practice' | 'profile';

export const TABS: { id: AppTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'Journey', icon: Map },
  { id: 'practice', label: 'Practice', icon: Mic },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

interface TabBarProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  variant: 'top' | 'bottom';
}

export const TabBar: React.FC<TabBarProps> = ({ active, onChange, variant }) => {
  if (variant === 'top') {
    return (
      <nav className="hidden sm:flex items-center gap-1 bg-white/70 border border-[#D6E4FA] rounded-full p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              active === id
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#2563EB] hover:bg-white'
            }`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    );
  }

  // Bottom nav (mobile)
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-t border-[#D6E4FA] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors cursor-pointer ${
              active === id ? 'text-[#2563EB]' : 'text-slate-400'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
