import React, { useState, useEffect, useRef } from 'react';
import {
  Type,
  Volume2,
  Copy,
  Trash2,
  CornerDownLeft,
  Space,
  Delete,
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  Timer,
  Plus
} from 'lucide-react';
import { speechService } from '../services/speech';
import { soundFX } from '../services/soundFx';

export default function SentenceBuilder({
  currentSign = null,
  confidence = 0,
  isConfident = false,
  onCommitSentence = null,
  currentLang = 'en'
}) {
  const [sentence, setSentence] = useState('');
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [autoAddHoldDuration, setAutoAddHoldDuration] = useState(900); // ms hold time
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [autoAddEnabled, setAutoAddEnabled] = useState(true);

  const holdTimerRef = useRef(null);
  const lastCommittedSignRef = useRef(null);
  const holdStartRef = useRef(0);
  const signLockedRef = useRef(false); // Prevents duplicate spam while holding same sign

  // Reset lock when hand is released or gesture changes
  useEffect(() => {
    if (!currentSign || !isConfident || currentSign === 'Uncertain sign' || currentSign === 'Uncertain Gesture') {
      signLockedRef.current = false;
      lastCommittedSignRef.current = null;
      setHoldProgress(0);
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      return;
    }

    // If already locked on this exact sign, do not restart hold countdown
    if (signLockedRef.current && lastCommittedSignRef.current === currentSign) {
      setHoldProgress(100);
      return;
    }

    // New sign detected - start holding countdown
    holdStartRef.current = Date.now();
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, Math.round((elapsed / autoAddHoldDuration) * 100));
      setHoldProgress(progress);

      if (elapsed >= autoAddHoldDuration) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        setHoldProgress(100);

        // Commit sign once and lock until hand change
        handleAddSign(currentSign);
        signLockedRef.current = true;
        lastCommittedSignRef.current = currentSign;
      }
    }, 50);

    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [currentSign, isConfident, autoAddEnabled, autoAddHoldDuration]);

  const handleAddSign = (signToAdd = currentSign) => {
    if (!signToAdd || signToAdd === 'Uncertain sign' || signToAdd === 'Uncertain Gesture') return;
    soundFX.playClick();

    setSentence((prev) => {
      setHistory((h) => [...h, prev]);
      if (signToAdd.length === 1) {
        return prev + signToAdd;
      } else {
        const cleaned = signToAdd.replace(/_/g, ' ');
        return prev.length === 0 || prev.endsWith(' ') ? prev + cleaned : prev + ' ' + cleaned;
      }
    });
  };

  const handleAddSpace = () => {
    soundFX.playClick();
    setSentence((prev) => {
      setHistory((h) => [...h, prev]);
      return prev.endsWith(' ') || prev.length === 0 ? prev : prev + ' ';
    });
  };

  const handleBackspace = () => {
    soundFX.playClick();
    setSentence((prev) => {
      setHistory((h) => [...h, prev]);
      return prev.slice(0, -1);
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    soundFX.playClick();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setSentence(prev);
  };

  const handleClear = () => {
    soundFX.playClick();
    setHistory((h) => [...h, sentence]);
    setSentence('');
    signLockedRef.current = false;
    lastCommittedSignRef.current = null;
    setHoldProgress(0);
  };

  const handleSpeak = () => {
    if (!sentence.trim()) return;
    soundFX.playClick();
    speechService.speak(sentence.trim(), currentLang);
  };

  const handleCopy = () => {
    if (!sentence.trim()) return;
    soundFX.playClick();
    navigator.clipboard.writeText(sentence.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToAI = () => {
    if (!sentence.trim()) return;
    soundFX.playRecognize();
    if (onCommitSentence) {
      onCommitSentence(sentence.trim());
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Type className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-bold text-xs text-slate-100 flex items-center gap-1.5">
              ISL SENTENCE BUILDER
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Fingerspelling & Vocabulary
              </span>
            </h3>
          </div>
        </div>

        {/* Hold duration setting & toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoAddEnabled(!autoAddEnabled)}
            className={`text-[10px] font-mono px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${
              autoAddEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
            title="Auto-add gesture when held steady"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Hold Meter: {autoAddHoldDuration}ms</span>
          </button>
        </div>
      </div>

      {/* Live Hold-to-Add Status Strip */}
      {isConfident && currentSign && currentSign !== 'Uncertain sign' && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90">
                <circle cx="14" cy="14" r="11" stroke="#334155" strokeWidth="2.5" fill="none" />
                <circle
                  cx="14"
                  cy="14"
                  r="11"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={69.1}
                  strokeDashoffset={69.1 - (69.1 * holdProgress) / 100}
                  className="transition-all duration-75 ease-linear"
                />
              </svg>
              <span className="absolute text-[9px] font-mono font-bold text-cyan-300">
                {holdProgress}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Holding Steady Sign:</span>
              <span className="font-display font-bold text-white text-sm">
                {currentSign} <span className="text-emerald-400 text-xs">({confidence}%)</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAddSign(currentSign)}
            className="glass-button text-xs py-1 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Now</span>
          </button>
        </div>
      )}

      {/* Main Sentence Output Box */}
      <div className="relative">
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Hold an ISL alphabet sign or word steady to spell, or click Add Sign..."
          rows={3}
          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none shadow-inner"
        />

        {sentence && (
          <div className="absolute right-2 bottom-3 flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
              {sentence.length} chars
            </span>
          </div>
        )}
      </div>

      {/* Sentence Builder Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Editing Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddSpace}
            className="glass-button text-xs py-1.5 px-2.5 text-slate-300 hover:text-white flex items-center gap-1 font-mono font-semibold"
            title="Add Space"
          >
            <Space className="w-3.5 h-3.5 text-indigo-400" />
            <span>SPACE</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="glass-button text-xs py-1.5 px-2.5 text-slate-300 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40 font-mono font-semibold"
            title="Undo Last Action"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>UNDO</span>
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            disabled={!sentence}
            className="glass-button text-xs py-1.5 px-2.5 text-slate-300 hover:text-rose-300 flex items-center gap-1 disabled:opacity-40 font-mono font-semibold"
            title="Backspace"
          >
            <Delete className="w-3.5 h-3.5 text-amber-400" />
            <span>BACKSPACE</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!sentence}
            className="glass-button text-xs py-1.5 px-2.5 text-slate-300 hover:text-rose-400 flex items-center gap-1 disabled:opacity-40 font-mono font-semibold"
            title="Clear All Text"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>CLEAR</span>
          </button>
        </div>

        {/* Action / Output Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!sentence}
            className="glass-button text-xs py-1.5 px-2.5 text-slate-300 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-40 font-semibold"
            title="Copy Sentence"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>

          <button
            type="button"
            onClick={handleSpeak}
            disabled={!sentence}
            className="glass-button text-xs py-1.5 px-2.5 text-slate-300 hover:text-emerald-300 flex items-center gap-1 disabled:opacity-40 font-semibold"
            title="Speak Sentence (TTS)"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SPEAK</span>
          </button>

          <button
            type="button"
            onClick={handleSendToAI}
            disabled={!sentence}
            className="glass-button text-xs py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold shadow-md flex items-center gap-1.5 disabled:opacity-40"
            title="Send accumulated sentence to AI Reasoning Agents"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>DISPATCH TO AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
