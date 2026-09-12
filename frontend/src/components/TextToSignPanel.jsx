import React, { useState } from 'react';
import { Type, Sparkles, Box, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import signsCatalog from '../data/signs.json';
import { soundFX } from '../services/soundFx';

export default function TextToSignPanel({ onTriggerAvatar, currentMode = 'hospital' }) {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleConvert = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    soundFX.playClick();
    const raw = inputText.trim();
    const lower = raw.toLowerCase().replace(/[.,!?;:]/g, '');
    const tokens = lower.split(/\s+/);

    const supportedSequence = [];
    const matchedTokens = new Set();

    // 1. Check for multi-word concept matches
    for (const sign of signsCatalog) {
      const cLower = sign.concept.toLowerCase().replace(/[.,!?;:]/g, '');
      const idLower = sign.id.toLowerCase().replace(/_/g, ' ');

      if (lower.includes(cLower) || lower.includes(idLower)) {
        supportedSequence.push(sign);
        cLower.split(/\s+/).forEach((t) => matchedTokens.add(t));
      }
    }

    // 2. Check for single token matches if not already matched
    if (supportedSequence.length === 0) {
      for (const token of tokens) {
        const matchedSign = signsCatalog.find((s) => {
          const cWords = s.concept.toLowerCase().split(/\s+/);
          const idWords = s.id.toLowerCase().split(/_/g);
          return cWords.includes(token) || idWords.includes(token);
        });

        if (matchedSign && !supportedSequence.some((s) => s.id === matchedSign.id)) {
          supportedSequence.push(matchedSign);
          matchedTokens.add(token);
        }
      }
    }

    // 3. Extract unsupported words
    const unsupportedTokens = tokens.filter((t) => !matchedTokens.has(t) && !['a', 'an', 'the', 'is', 'am', 'are', 'to', 'for', 'in', 'of', 'i', 'my'].includes(t));

    const result = {
      originalText: raw,
      supportedSigns: supportedSequence,
      unsupportedWords: unsupportedTokens
    };

    setAnalysisResult(result);

    // If a supported sign was found, trigger avatar animation automatically
    if (supportedSequence.length > 0 && onTriggerAvatar) {
      soundFX.playRecognize();
      onTriggerAvatar(supportedSequence[0]);
    }
  };

  const handlePlaySequenceItem = (sign) => {
    soundFX.playRecognize();
    if (onTriggerAvatar) {
      onTriggerAvatar(sign);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Type className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-bold text-xs text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              TEXT → SIGN CONVERTER
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Controlled ISL Vocabulary
              </span>
            </h3>
          </div>
        </div>
      </div>

      <form onSubmit={handleConvert} className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type sentence (e.g. 'I need help' or 'Please sit down')..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-display transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400">Quick Try:</span>
            {['I need help', 'Please sit down', 'Chest pain'].map((sample) => (
              <button
                type="button"
                key={sample}
                onClick={() => {
                  setInputText(sample);
                  setTimeout(() => handleConvert(), 50);
                }}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-800"
              >
                "{sample}"
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="glass-button text-xs py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold disabled:opacity-40"
          >
            <span>Convert to Sign</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Analysis Output Result */}
      {analysisResult && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 animate-fadeIn">
          {analysisResult.supportedSigns.length > 0 ? (
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SUPPORTED SIGN SEQUENCE:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.supportedSigns.map((sign) => (
                  <button
                    key={sign.id}
                    onClick={() => handlePlaySequenceItem(sign)}
                    className="group px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs font-display font-semibold hover:bg-emerald-900/50 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{sign.concept}</span>
                    <Box className="w-3 h-3 text-cyan-400 group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>No direct match in the 28-sign MVP vocabulary. Try concepts like help, chest pain, doctor, sit down, attendance, lost ID.</span>
            </div>
          )}

          {analysisResult.unsupportedWords.length > 0 && (
            <div className="pt-1 text-[10px] font-mono text-slate-400">
              <span className="text-slate-500">Unmatched / unsupported terms: </span>
              <span className="text-rose-300 italic">
                "{analysisResult.unsupportedWords.join(', ')}"
              </span>
              <span className="block text-[9px] text-slate-500 mt-0.5">
                Focused ISL MVP: Controlled vocabulary ensures zero hallucinated signs.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
