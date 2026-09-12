import React from 'react';
import { Trash2, Volume2, ShieldAlert, Sparkles, User, Brain, Stethoscope, GraduationCap, Building2 } from 'lucide-react';
import { speechService } from '../services/speech';

export default function ConversationTimeline({
  messages = [],
  onClearConversation,
  currentMode = 'hospital',
  currentLang = 'en'
}) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'user_sign':
      case 'Person A':
        return {
          label: '🤟 Person A (ISL Signer)',
          style: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          avatarBg: 'bg-indigo-600'
        };
      case 'doctor':
      case 'Person B':
        return {
          label: currentMode === 'hospital' ? '👨‍⚕️ Doctor' : (currentMode === 'college' ? '👨‍🏫 Professor' : '👤 Officer'),
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          avatarBg: 'bg-emerald-600'
        };
      case 'nurse':
      case 'Person C':
        return {
          label: '👩‍⚕️ Nurse / Staff',
          style: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          avatarBg: 'bg-teal-600'
        };
      case 'signbridge':
        return {
          label: '🧠 SignBridge AI',
          style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          avatarBg: 'bg-cyan-600'
        };
      default:
        return {
          label: '👤 Participant',
          style: 'bg-slate-800 text-slate-300 border-slate-700',
          avatarBg: 'bg-slate-700'
        };
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col h-full min-h-[380px]">
      {/* Timeline Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="font-display font-semibold text-sm text-slate-100 uppercase tracking-wider">
            CONVERSATION TIMELINE
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            ({messages.length} exchanges)
          </span>
        </div>

        <button
          onClick={onClearConversation}
          className="glass-button text-xs py-1 px-2.5 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 flex items-center gap-1.5 transition-all"
          title="Clear Session Conversation (Privacy-first)"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Clear Session</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
            <Sparkles className="w-6 h-6 text-slate-600 mb-2" />
            <p>Session transcript is clear.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Signs recognized and spoken doctor responses will appear here in chronological order.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const roleMeta = getRoleBadge(msg.role);
            const isUser = msg.role === 'user_sign' || msg.role === 'Person A';
            const isAI = msg.role === 'signbridge';
            const isDoctor = msg.role === 'doctor' || msg.role === 'Person B';

            return (
              <div
                key={msg.id || idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isAI
                    ? 'bg-slate-900/40 border-cyan-500/20 text-slate-300'
                    : isUser
                    ? 'bg-indigo-950/20 border-indigo-500/30'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${roleMeta.style}`}>
                      {roleMeta.label}
                    </span>
                    {msg.intent && (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        Intent: <strong className="text-cyan-400">{msg.intent}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                    <span>{msg.timestamp || 'Just now'}</span>
                    <button
                      onClick={() => speechService.speak(msg.text, currentLang)}
                      className="text-slate-400 hover:text-white p-0.5 rounded"
                      title="Speak Message"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-sm font-display text-slate-100 font-medium leading-relaxed">
                  "{msg.text}"
                </p>

                {/* Optional Multilingual Translation Subtitle */}
                {msg.translation && msg.translation[currentLang] && currentLang !== 'en' && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/40 text-xs font-display text-cyan-300/90 italic flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase not-italic">
                      {currentLang}:
                    </span>
                    <span>{msg.translation[currentLang]}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
