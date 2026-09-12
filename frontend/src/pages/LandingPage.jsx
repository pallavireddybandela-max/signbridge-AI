import React from 'react';
import HeroBridge3D from '../components/3d/HeroBridge3D';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldAlert,
  GraduationCap,
  Building2,
  Stethoscope,
  Eye,
  Brain,
  Compass,
  Languages,
  MessageSquare,
  Lock,
  Cpu,
  Layers,
  ChevronRight,
  HeartPulse
} from 'lucide-react';

export default function LandingPage({ onStartLive, onExploreDemo }) {
  const modes = [
    {
      title: 'Hospital Mode',
      icon: Stethoscope,
      accent: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-300',
      tag: 'Critical Triage',
      desc: 'Patient ↔ Doctor / Nurse. Detects chest pain, shortness of breath, symptoms, and alerts attending medical staff with emergency priority.'
    },
    {
      title: 'College Mode',
      icon: GraduationCap,
      accent: 'border-purple-500/50 bg-purple-950/20 text-purple-300',
      tag: 'Academic Clarification',
      desc: 'Student ↔ Professor / Staff. Assists with classroom questions, exam timings, attendance requests, and library book issues.'
    },
    {
      title: 'Public Service Mode',
      icon: Building2,
      accent: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
      tag: 'Citizen Services',
      desc: 'Citizen ↔ Government / Police. Handles lost ID cards, replacement documents, certificate counters, and security assistance.'
    }
  ];

  const agentSteps = [
    { title: '1. Vision Agent', desc: 'Captures hand landmark coordinates with client-side throttled mesh extraction.', icon: Eye, color: 'text-cyan-400' },
    { title: '2. Context Agent', desc: 'Resolves pronouns & short-term dialogue continuity (e.g. "one" = lost ID card).', icon: Brain, color: 'text-indigo-400' },
    { title: '3. Intent Agent', desc: 'Classifies communication into 15+ standardized clinical and service intents.', icon: Compass, color: 'text-rose-400' },
    { title: '4. Translation Agent', desc: 'Preserves contextual meaning into English, Hindi (हिंदी), and Telugu (తెలుగు).', icon: Languages, color: 'text-amber-400' },
    { title: '5. Response & Avatar', desc: 'Vocalizes audio via Web Speech API and commands the kinetic 3D Sign Avatar.', icon: MessageSquare, color: 'text-emerald-400' }
  ];

  const roadmap = [
    { phase: 'Phase 1 (Current)', title: '26-Concept Hackathon MVP', desc: 'Controlled high-impact clinical, academic, and citizen vocabulary with 3D avatar.' },
    { phase: 'Phase 2', title: 'Expanded ISL Vocabulary', desc: 'Scale dataset to 300+ phrases with regional Indian sign dialects.' },
    { phase: 'Phase 3', title: 'Continuous Sign Parsing', desc: 'Multi-sign grammatical sequencing with non-manual facial markers.' },
    { phase: 'Phase 4', title: 'Deep ISL Spatial Grammar', desc: 'Full spatial reference indexing and directional verbs.' },
    { phase: 'Phase 5', title: 'Photorealistic 3D Humanoid', desc: 'WebGPU skeletal rigging with realistic facial micro-expressions.' },
    { phase: 'Phase 6', title: 'Native Mobile & Edge Apps', desc: 'On-device ONNX runtime running offline on Android & iOS.' }
  ];

  return (
    <div className="w-full min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background glow flares */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="text-center max-w-3xl mx-auto mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>AI-POWERED TWO-WAY INDIAN SIGN LANGUAGE PLATFORM</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-white mb-6 leading-[1.15]">
            Communication{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Without Barriers.
            </span>
          </h1>

          <p className="font-display text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
            SignBridge AI transforms Indian Sign Language into context-aware, bidirectional conversations.
            It bridges deaf patients, students, and citizens with hearing doctors, professors, and public officers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 font-display">
            <button
              onClick={onStartLive}
              className="glass-button bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-neon flex items-center gap-2 text-sm"
            >
              <span>Start Live Communication</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="glass-button bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 py-3 px-6 rounded-xl text-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Explore Demo Mode</span>
            </button>
          </div>
        </div>

        {/* 3D Communication Bridge Visual */}
        <div className="relative rounded-2xl glass-panel p-4 border border-indigo-500/30 shadow-2xl mt-4 max-w-5xl mx-auto overflow-hidden">
          <HeroBridge3D />
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className="py-14 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-3">
            The Communication Gap in India
          </h2>
          <p className="text-slate-400 text-sm font-display">
            Over 7 million deaf citizens communicate via Indian Sign Language, yet less than 0.01% of public staff, doctors, and educators know ISL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg mb-3">
              🏥
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Hospital Misdiagnosis</h3>
            <p className="text-xs text-slate-400 font-display leading-relaxed">
              Deaf patients experiencing acute cardiac chest pain or allergic reactions cannot convey urgency in emergency wards without an available certified interpreter.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-3">
              🎓
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Academic Isolation</h3>
            <p className="text-xs text-slate-400 font-display leading-relaxed">
              Deaf college students struggle to ask immediate clarification questions, clarify exam schedules, or request permissions in fast-paced lecture halls.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
              🏛️
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Public Service Barriers</h3>
            <p className="text-xs text-slate-400 font-display leading-relaxed">
              Navigating government bureaus to replace lost identity documents, file police reports, or find administrative counters becomes an exhausting ordeal.
            </p>
          </div>
        </div>
      </section>

      {/* 3. OUR SOLUTION SECTION */}
      <section className="py-14 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/40 relative overflow-hidden bg-gradient-to-br from-indigo-950/30 via-slate-950 to-slate-900">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              The SignBridge Difference
            </span>
            <h2 className="font-display font-black text-2xl md:text-3xl text-white mt-1 mb-3">
              Not Just "Sign → Text". Context & Intent.
            </h2>
            <p className="text-sm text-slate-300 font-display leading-relaxed">
              Most projects treat individual signs like isolated words in a vacuum. SignBridge AI maintains short-term conversational context, understands intent, determines clinical urgency, and generates natural spoken voice and kinetic 3D avatar responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <h4 className="font-mono text-xs font-bold text-indigo-400 uppercase mb-2">
                Pipeline A: Deaf Signer → Hearing Speaker
              </h4>
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-200">SIGN</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-cyan-600/30 text-cyan-200">VISION</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-purple-600/30 text-purple-200">CONTEXT</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-rose-600/30 text-rose-200">INTENT</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-200">SPOKEN VOICE</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase mb-2">
                Pipeline B: Hearing Speaker → Deaf Signer
              </h4>
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-200">SPEECH</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-amber-600/30 text-amber-200">STT TEXT</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-200">TRANSLATION</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-cyan-600/30 text-cyan-200">3D SIGN AVATAR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE MODES SECTION */}
      <section className="py-14 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-3">
            Three Specialized Context Modes
          </h2>
          <p className="text-slate-400 text-sm font-display">
            Tailored intent models and vocabulary tuned for critical everyday scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.title} className={`p-5 rounded-2xl border ${m.accent} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                      {m.tag}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-2">{m.title}</h3>
                  <p className="text-xs text-slate-400 font-display leading-relaxed">{m.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs font-mono text-cyan-400 flex items-center justify-between">
                  <span>Optimized Triage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MULTI-AGENT ARCHITECTURE */}
      <section className="py-14 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-3">
            Agent Orchestrator Engine
          </h2>
          <p className="text-slate-400 text-sm font-display">
            Intelligent routing ensures lightweight real-time execution without overloading the LLM.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {agentSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="p-4 rounded-xl glass-panel border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <Icon className={`w-5 h-5 ${s.color} mb-3`} />
                  <h4 className="font-display font-bold text-xs text-white mb-1.5">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 font-display leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. TECHNOLOGY SECTION */}
      <section className="py-14 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-2">
            Production-Grade Technologies Used
          </h2>
          <p className="text-slate-400 text-xs font-mono">
            Every library listed is actively integrated into the running application.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-indigo-400 font-bold block mb-1">React 18 & Vite</span>
            <span className="text-[10px] text-slate-500">Fast Modular Frontend</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Three.js</span>
            <span className="text-[10px] text-slate-500">3D Kinetic Avatar Rig</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">Python FastAPI</span>
            <span className="text-[10px] text-slate-500">Agent Orchestrator API</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">Web Speech API</span>
            <span className="text-[10px] text-slate-500">Realtime STT & TTS</span>
          </div>
        </div>
      </section>

      {/* 7. FUTURE SCOPE & ROADMAP */}
      <section className="py-14 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-3">
            Honest Scope & Future Roadmap
          </h2>
          <p className="text-slate-400 text-sm font-display">
            SignBridge AI is an honest hackathon MVP with 26 curated phrases. We do not claim universal ISL translation; we built an extensible framework ready to scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roadmap.map((item) => (
            <div key={item.phase} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                {item.phase}
              </span>
              <h4 className="font-display font-bold text-xs text-white mb-1">{item.title}</h4>
              <p className="text-[11px] text-slate-400 font-display leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM CALL TO ACTION */}
      <section className="pt-10 px-4 md:px-8 max-w-4xl mx-auto text-center">
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/30 to-slate-950">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white mb-3">
            Start Breaking Communication Barriers Today
          </h2>
          <p className="text-slate-300 text-sm font-display mb-6 max-w-xl mx-auto">
            Experience the full two-way communication loop with real-time camera tracking, context reasoning, and 3D kinetic ISL gestures.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onStartLive}
              className="glass-button bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-xl shadow-neon text-sm"
            >
              Enter Live Translate Workspace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
