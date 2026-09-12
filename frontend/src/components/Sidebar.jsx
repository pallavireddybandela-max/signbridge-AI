import React from 'react';
import {
  LayoutDashboard,
  Users,
  Box,
  ShieldAlert,
  BookOpen,
  Home,
  Sliders,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, unreadCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Live Translate', icon: LayoutDashboard, badge: 'ML Core' },
    { id: 'gestures', label: 'ISL Library', icon: BookOpen, badge: '70 signs' },
    { id: 'conversation', label: 'Conversation Room', icon: Users, badge: unreadCount > 0 ? `${unreadCount}` : null },
    { id: 'avatar', label: '3D Sign Avatar', icon: Box, badge: 'ISL' },
    { id: 'emergency', label: 'Emergency Hub', icon: ShieldAlert, badge: 'Triage' },
    { id: 'landing', label: 'About & Hero', icon: Home, badge: null }
  ];

  return (
    <aside className="w-16 md:w-56 shrink-0 flex flex-col justify-between border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md p-2 md:p-4 transition-all">
      <div className="space-y-1">
        <div className="hidden md:block px-3 py-2 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
          WORKSPACE NAVIGATION
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-center md:justify-between px-3 py-2.5 rounded-xl text-xs font-semibold font-display transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded-md ${
                  isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Readiness Pill */}
      <div className="hidden md:block p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold text-[11px]">AI CORE: READY</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Client-side vision & neural-heuristic fallback active.
        </p>
      </div>
    </aside>
  );
}
