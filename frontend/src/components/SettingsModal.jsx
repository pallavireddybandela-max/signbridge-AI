import React from 'react';
import { X, Sliders, Eye, Volume2, Shield, Trash2, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { speechService } from '../services/speech';

export default function SettingsModal({
  isOpen,
  onClose,
  currentLang,
  setLang,
  isHighContrast,
  setIsHighContrast,
  isLargeText,
  setIsLargeText,
  isReducedMotion,
  setIsReducedMotion,
  onClearConversation
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                SETTINGS & ACCESSIBILITY
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                System Preferences, Audio, and Privacy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accessibility Section */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Accessibility & Visuals
          </h4>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="font-display font-semibold text-xs text-slate-200">
                High Contrast Mode
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Maximizes luminance boundaries for low-vision signers.
              </div>
            </div>
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                isHighContrast ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isHighContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Large Text Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="font-display font-semibold text-xs text-slate-200">
                Large Font Sizing
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Enlarges transcription text for comfortable clinic viewing.
              </div>
            </div>
            <button
              onClick={() => setIsLargeText(!isLargeText)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                isLargeText ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isLargeText ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="font-display font-semibold text-xs text-slate-200">
                Reduced Motion
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Silences decorative 3D background effects and pulses.
              </div>
            </div>
            <button
              onClick={() => setIsReducedMotion(!isReducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                isReducedMotion ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isReducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Audio & Voice Section */}
        <div className="space-y-3 mb-6 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            Voice Output & Language
          </h4>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <label className="block text-xs font-display font-semibold text-slate-300 mb-1.5">
              Primary Spoken Language
            </label>
            <select
              value={currentLang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="en">English (US/India)</option>
              <option value="hi">हिंदी — Hindi</option>
              <option value="te">తెలుగు — Telugu</option>
            </select>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="space-y-3 mb-6 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Privacy & Security Architecture
          </h4>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-display text-slate-400 space-y-2 leading-relaxed">
            <div className="flex items-start gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Persistent Cloud Storage:</strong> Camera feeds are processed on-device in the browser using client-side landmark tensors. Full video is never streamed to servers.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Session-Only Memory:</strong> Conversation logs exist solely in your current browser tab memory and can be flushed immediately.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onClearConversation();
              onClose();
            }}
            className="w-full glass-button glass-button-danger py-2 text-xs justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Flush & Clear Active Conversation</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="glass-button text-xs py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
