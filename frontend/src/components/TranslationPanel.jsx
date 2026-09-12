import React, { useState, useEffect } from 'react';
import { Languages, ArrowRightLeft, Volume2, Copy, Box, Check, Sparkles, RefreshCw } from 'lucide-react';
import { translateTextService, LANGUAGE_NAMES } from '../services/translation';
import { speechService } from '../services/speech';
import { soundFX } from '../services/soundFx';

export default function TranslationPanel({
  incomingText = '',
  onSendToAvatar = null,
  context = 'hospital'
}) {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('te');
  const [inputText, setInputText] = useState(incomingText || 'I need help');
  const [translatedText, setTranslatedText] = useState('');
  const [status, setStatus] = useState('IDLE'); // 'IDLE' | 'TRANSLATING' | 'READY' | 'UNAVAILABLE'
  const [isDemoTranslation, setIsDemoTranslation] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync with incoming text from Sign recognition, Speech, or AI
  useEffect(() => {
    if (incomingText && incomingText !== inputText) {
      setInputText(incomingText);
      handleTranslate(incomingText, sourceLang, targetLang);
    }
  }, [incomingText]);

  // Initial translation on mount
  useEffect(() => {
    handleTranslate(inputText, sourceLang, targetLang);
  }, []);

  const handleTranslate = async (textToTranslate = inputText, sLang = sourceLang, tLang = targetLang) => {
    if (!textToTranslate || !textToTranslate.trim()) return;

    setStatus('TRANSLATING');
    soundFX.playClick();

    const res = await translateTextService(textToTranslate, sLang, tLang, context);
    setTranslatedText(res.translatedText);
    setIsDemoTranslation(Boolean(res.isDemoTranslation));
    setStatus('READY');
  };

  const handleSwap = () => {
    soundFX.playClick();
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setInputText(translatedText || inputText);
    handleTranslate(translatedText || inputText, targetLang, temp);
  };

  const handleSpeak = () => {
    soundFX.playClick();
    if (translatedText) {
      speechService.speak(translatedText, targetLang);
    }
  };

  const handleCopy = () => {
    soundFX.playClick();
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendToAvatar = () => {
    soundFX.playRecognize();
    if (onSendToAvatar) {
      onSendToAvatar(inputText);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Languages className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-bold text-xs text-slate-100 uppercase tracking-wider flex items-center gap-2">
              TRANSLATION BRIDGE
              {status === 'TRANSLATING' && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 animate-pulse">
                  Translating...
                </span>
              )}
              {status === 'READY' && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Translation Ready
                </span>
              )}
            </h3>
          </div>
        </div>

        {isDemoTranslation && (
          <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Offline Demo Translation
          </span>
        )}
      </div>

      {/* Language Selectors & Swap Bar */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800/90 text-xs font-mono">
        <div className="flex-1">
          <label className="text-[9px] text-slate-500 block uppercase">Source Language</label>
          <select
            value={sourceLang}
            onChange={(e) => {
              setSourceLang(e.target.value);
              handleTranslate(inputText, e.target.value, targetLang);
            }}
            className="w-full bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-900">English</option>
            <option value="hi" className="bg-slate-900">Hindi (हिंदी)</option>
            <option value="te" className="bg-slate-900">Telugu (తెలుగు)</option>
          </select>
        </div>

        <button
          onClick={handleSwap}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-all shadow-sm"
          title="Swap Source and Target Languages"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 text-right">
          <label className="text-[9px] text-slate-500 block uppercase">Target Language</label>
          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              handleTranslate(inputText, sourceLang, e.target.value);
            }}
            className="w-full bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer text-right"
          >
            <option value="te" className="bg-slate-900">Telugu (తెలుగు)</option>
            <option value="hi" className="bg-slate-900">Hindi (हिंदी)</option>
            <option value="en" className="bg-slate-900">English</option>
          </select>
        </div>
      </div>

      {/* Input & Output Translation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Source Text Input */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between min-h-[95px]">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">
              Input Text (Sign / Speech / Typed):
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
              className="w-full bg-transparent text-slate-200 text-xs font-display focus:outline-none"
              placeholder="Enter text to translate..."
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleTranslate()}
              className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold"
            >
              Update Translation
            </button>
          </div>
        </div>

        {/* Target Translated Result */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex flex-col justify-between min-h-[95px] relative">
          <div>
            <span className="text-[9px] font-mono text-cyan-400 uppercase block mb-1 font-bold">
              {LANGUAGE_NAMES[targetLang]} Output:
            </span>
            <p className="text-sm font-display font-bold text-white leading-relaxed">
              {translatedText || <span className="text-slate-500 italic">Translating...</span>}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800/60 mt-1">
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 font-mono text-[10px]"
              title="Speak translated text aloud"
            >
              <Volume2 className="w-3 h-3 text-cyan-400" />
              <span>Speak</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 font-mono text-[10px]"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {onSendToAvatar && (
              <button
                onClick={handleSendToAvatar}
                className="p-1.5 rounded-md bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white transition-all text-xs flex items-center gap-1 font-mono text-[10px]"
                title="Convert to Sign & trigger 3D Avatar"
              >
                <Box className="w-3 h-3 text-cyan-300" />
                <span>Send to Avatar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
