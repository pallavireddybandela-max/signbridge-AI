import React from 'react';
import { Brain, Sparkles, Volume2, ShieldAlert, CheckCircle2, ArrowRight, Activity, CornerDownRight } from 'lucide-react';
import { speechService } from '../services/speech';

export default function UnderstandingCard({
  understanding,
  onSpeakMessage,
  currentLang = 'en'
}) {
  if (!understanding) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center min-h-[260px] text-center">
        <Brain className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
        <h4 className="font-display font-semibold text-slate-300 text-sm">AI Understanding Core</h4>
        <p className="text-xs text-slate-500 font-mono mt-1 max-w-xs">
          Perform a sign in front of the camera or select a gesture to generate context-aware intelligence.
        </p>
      </div>
    );
  }

  const {
    interpretedMessage,
    intent,
    priority,
    confidence,
    contextMode,
    suggestedAction,
    resolvedReferences
  } = understanding;

  const isCritical = priority?.toLowerCase() === 'critical';
  const isUrgent = priority?.toLowerCase() === 'urgent';

  const handleSpeak = () => {
    if (onSpeakMessage) {
      onSpeakMessage(interpretedMessage);
    } else {
      speechService.speak(interpretedMessage, currentLang);
    }
  };

  return (
    <div className={`glass-panel p-5 rounded-2xl border transition-all relative overflow-hidden ${
      isCritical
        ? 'border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
        : 'border-slate-800/80'
    }`}>
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Brain className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100 flex items-center gap-2">
              AI UNDERSTANDING
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize">
                Context: {contextMode || 'Hospital'}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <span className={`telemetry-badge ${
            isCritical
              ? 'badge-critical'
              : isUrgent
              ? 'badge-urgent'
              : 'badge-important'
          }`}>
            {isCritical && <ShieldAlert className="w-3 h-3 text-rose-400 animate-spin" />}
            {priority?.toUpperCase() || 'NORMAL'}
          </span>

          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-500/30">
            {confidence ? `${Math.round(confidence * 100)}%` : '95%'}
          </span>
        </div>
      </div>

      {/* Interpreted Message Area */}
      <div className="mb-3">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
          Synthesized Meaning (Sign → Context):
        </span>
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm font-display font-semibold text-white leading-relaxed flex items-start justify-between gap-3">
          <span>"{interpretedMessage}"</span>
          <button
            onClick={handleSpeak}
            className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all shrink-0"
            title="Speak Message to Doctor / Staff"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Anaphora / Resolved References Display (e.g. 'one' -> 'ID Card') */}
      {resolvedReferences && Object.keys(resolvedReferences).length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Context Engine Anaphora Resolution:</span>
          </div>
          {Object.entries(resolvedReferences).map(([refKey, refVal]) => (
            <div key={refKey} className="flex items-center gap-2 text-slate-300 pl-2">
              <CornerDownRight className="w-3 h-3 text-cyan-400" />
              <span>Resolved implicit pronoun <span className="text-amber-300 font-bold">"{refKey}"</span> → <span className="text-emerald-300 font-bold">{refVal}</span> based on conversation history.</span>
            </div>
          ))}
        </div>
      )}

      {/* Intent & Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 font-mono text-xs">
        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block mb-0.5">DETECTED INTENT:</span>
          <span className={`font-bold uppercase ${isCritical ? 'text-rose-400' : 'text-cyan-300'}`}>
            {intent ? intent.replace(/_/g, ' ') : 'MEDICAL EMERGENCY'}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block mb-0.5">RECOMMENDED PROTOCOL:</span>
          <span className="font-semibold text-slate-200 truncate block">
            {suggestedAction || 'Provide immediate clinical evaluation.'}
          </span>
        </div>
      </div>
    </div>
  );
}
