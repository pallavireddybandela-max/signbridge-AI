import React, { useState } from 'react';
import { Activity, Languages, Zap, Settings, ShieldAlert, Sparkles, Volume2, VolumeX, Radio } from 'lucide-react';
import { soundFX } from '../services/soundFx';

export default function Navbar({
  currentMode,
  setMode,
  currentLang,
  setLang,
  onOpenSettings,
  onStartDemo,
  activeEmergency = false
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const modes = [
    { id: 'hospital', label: '🏥 Hospital', desc: 'Patient ↔ Doctor / Nurse' },
    { id: 'college', label: '🎓 College', desc: 'Student ↔ Professor / Staff' },
    { id: 'public_service', label: '🏛️ Public Service', desc: 'Citizen ↔ Govt Staff' }
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' }
  ];

  const handleModeChange = (id) => {
    soundFX.playClick();
    setMode(id);
  };

  const handleSoundToggle = () => {
    const newState = soundFX.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundFX.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 lg:px-8 py-3 transition-all shadow-lg">
      <div className="flex items-center justify-between gap-4 max-w-[1700px] mx-auto">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => soundFX.playRecognize()}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 shadow-[0_0_25px_rgba(99,102,241,0.6)] group-hover:scale-105 transition-transform">
            <span className="text-2xl">🤟</span>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-xl lg:text-2xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
                SIGNBRIDGE <span className="text-cyan-400">AI</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                LIVE 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden md:block">
              Two-Way Indian Sign Language Neural Communication Bridge
            </p>
          </div>
        </div>

        {/* Interactive Mode Selector Tabs */}
        <div className="hidden lg:flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          {modes.map((m) => {
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-[0_0_18px_rgba(99,102,241,0.5)] scale-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title={m.desc}
              >
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Alert Indicator if active */}
          {activeEmergency && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/25 border border-rose-500 text-rose-300 text-xs font-mono font-bold animate-pulse shadow-alert">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
              <span>CRITICAL ALERT</span>
            </div>
          )}

          {/* Sound FX Toggle Button */}
          <button
            onClick={handleSoundToggle}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Sci-Fi Sound FX Enabled' : 'Sound FX Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl px-2.5 py-1.5 transition-colors">
            <Languages className="w-4 h-4 text-cyan-400 mr-2" />
            <select
              value={currentLang}
              onChange={(e) => {
                soundFX.playClick();
                setLang(e.target.value);
              }}
              className="bg-transparent text-xs text-slate-200 font-mono font-bold focus:outline-none cursor-pointer pr-1"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Demo Mode Launcher */}
          <button
            onClick={() => {
              soundFX.playRecognize();
              onStartDemo();
            }}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-display bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-500/25 hover:from-amber-500/40 hover:to-orange-500/40 text-amber-300 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all scale-100 hover:scale-[1.02] active:scale-95"
            title="Launch Deterministic Hospital Emergency Demo for Judges"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Launch Demo</span>
          </button>

          {/* Settings / Accessibility Modal Trigger */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all hover:border-slate-700"
            title="Settings & Accessibility"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Mode Switcher Row */}
      <div className="flex lg:hidden items-center justify-center gap-2 pt-2.5 mt-2 border-t border-slate-800/80">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display transition-all ${
              currentMode === m.id
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}
