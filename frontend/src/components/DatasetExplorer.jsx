import React, { useState } from 'react';
import { BookOpen, Search, Sparkles, Box, Volume2, ShieldAlert, Check } from 'lucide-react';
import signsCatalog from '../data/signs.json';
import { speechService } from '../services/speech';

export default function DatasetExplorer({ onSelectSign, currentLang = 'en' }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredSigns = signsCatalog.filter((s) => {
    const matchesCategory = filter === 'all' || s.category === filter;
    const matchesSearch =
      s.concept.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100 flex items-center gap-2">
              SUPPORTED ISL DATASET CATALOG
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {signsCatalog.length} Curated Concepts
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Legitimate Indian Sign Language Gesture & Vocabulary Taxonomy
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ISL vocabulary..."
            className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-display w-full sm:w-48"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-display text-xs">
        {[
          { id: 'all', label: 'All Signs' },
          { id: 'medical', label: '🏥 Medical / Hospital' },
          { id: 'college', label: '🎓 College / Academic' },
          { id: 'public_service', label: '🏛️ Public Service' },
          { id: 'universal', label: '🌐 Universal' }
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              filter === c.id
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredSigns.map((sign) => {
          const isCritical = sign.priority === 'critical';
          return (
            <div
              key={sign.id}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-100">
                      "{sign.concept}"
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      {sign.intent}
                    </span>
                  </div>

                  <span className={`telemetry-badge text-[9px] ${
                    isCritical
                      ? 'badge-critical'
                      : sign.priority === 'urgent'
                      ? 'badge-urgent'
                      : 'badge-important'
                  }`}>
                    {sign.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-display leading-relaxed mb-3">
                  <strong className="text-slate-300 font-mono text-[11px]">ISL Gesture: </strong>
                  {sign.description}
                </p>

                {/* Multilingual Preview */}
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/60 text-xs font-display space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[10px] font-mono text-slate-500 w-6">HI:</span>
                    <span>{sign.translations.hi}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-[10px] font-mono text-slate-500 w-6">TE:</span>
                    <span>{sign.translations.te}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
                <button
                  onClick={() => speechService.speak(sign.concept, currentLang)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1"
                  title="Speak concept in voice"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">Speak</span>
                </button>

                <button
                  onClick={() => onSelectSign && onSelectSign(sign)}
                  className="glass-button text-xs py-1.5 px-3 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-semibold flex items-center gap-1.5"
                >
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test in 3D Avatar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
