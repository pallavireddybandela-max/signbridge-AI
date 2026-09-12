import React, { useEffect, useState } from 'react';
import { Eye, Brain, Compass, Languages, MessageSquare, Activity, CheckCircle2 } from 'lucide-react';

export default function CommunicationCore3D({ activeStep = 0, isProcessing = false }) {
  // 5 Nodes: Vision -> Context -> Intent -> Translation -> Response
  const [currentStep, setCurrentStep] = useState(activeStep);

  useEffect(() => {
    setCurrentStep(activeStep);
  }, [activeStep]);

  const nodes = [
    {
      id: 'vision',
      step: 1,
      label: 'Vision Agent',
      subtext: 'Landmarks & Sign Matching',
      icon: Eye,
      color: 'from-cyan-500 to-blue-600',
      activeColor: 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] text-cyan-300'
    },
    {
      id: 'context',
      step: 2,
      label: 'Context Agent',
      subtext: 'Anaphora & History Memory',
      icon: Brain,
      color: 'from-indigo-500 to-purple-600',
      activeColor: 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.6)] text-indigo-300'
    },
    {
      id: 'intent',
      step: 3,
      label: 'Intent Agent',
      subtext: 'Triage & Priority Classifier',
      icon: Compass,
      color: 'from-rose-500 to-pink-600',
      activeColor: 'border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] text-rose-300'
    },
    {
      id: 'translation',
      step: 4,
      label: 'Translation Agent',
      subtext: 'ISL ↔ EN ↔ HI ↔ TE',
      icon: Languages,
      color: 'from-amber-500 to-orange-600',
      activeColor: 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] text-amber-300'
    },
    {
      id: 'response',
      step: 5,
      label: 'Response Agent',
      subtext: 'Voice • 3D Avatar • Quick Actions',
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      activeColor: 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] text-emerald-300'
    }
  ];

  return (
    <div className="glass-panel p-4 rounded-xl relative overflow-hidden border border-slate-800/80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            SIGNBRIDGE CORE — AGENT PIPELINE
          </h4>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ORCHESTRATOR: ACTIVE</span>
        </div>
      </div>

      {/* Connected Nodes Row */}
      <div className="relative flex items-center justify-between gap-2 py-2">
        {/* Connecting Background Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />

        {/* Animated Progress Line */}
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 z-0 transition-all duration-500"
          style={{
            width: currentStep > 0 ? `${((currentStep - 1) / (nodes.length - 1)) * 90}%` : '0%'
          }}
        />

        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const isActive = currentStep === node.step || (isProcessing && currentStep >= node.step);
          const isCompleted = currentStep > node.step;

          return (
            <div key={node.id} className="relative z-10 flex flex-col items-center group cursor-pointer">
              {/* Node Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 bg-slate-950 ${
                  isActive
                    ? node.activeColor
                    : isCompleted
                    ? 'border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'border-slate-800 text-slate-500 hover:border-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                )}
              </div>

              {/* Node Labels */}
              <span className={`text-[11px] font-mono mt-2 font-semibold transition-colors ${
                isActive ? 'text-slate-100' : 'text-slate-400'
              }`}>
                {node.label}
              </span>
              <span className="text-[9px] text-slate-400 font-mono hidden md:block">
                {node.subtext}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
