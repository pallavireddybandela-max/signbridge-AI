import React from 'react';
import { Sparkles, MessageSquare, Volume2, ArrowRight } from 'lucide-react';
import { speechService } from '../services/speech';

export default function QuickResponseBar({
  suggestions = [],
  onSelectSuggestion,
  currentLang = 'en'
}) {
  if (!suggestions || suggestions.length === 0) return null;

  const handleSelect = (text) => {
    speechService.speak(text, currentLang);
    if (onSelectSuggestion) {
      onSelectSuggestion(text);
    }
  };

  return (
    <div className="glass-panel p-3 rounded-2xl border border-slate-800/80 my-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-300 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>SMART RESPONSE SUGGESTIONS:</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          1-Click Speech + 3D Avatar Sync
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {suggestions.slice(0, 3).map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(reply)}
            className="group text-left p-2.5 rounded-xl bg-slate-900/70 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 text-xs font-display text-slate-200 hover:text-white transition-all flex items-center justify-between gap-2 shadow-sm"
          >
            <span className="line-clamp-2 leading-tight">{reply}</span>
            <span className="p-1 rounded-md bg-slate-800 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white shrink-0 transition-colors">
              <Volume2 className="w-3 h-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
