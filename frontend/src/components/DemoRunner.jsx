import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, CheckCircle2, ChevronRight, Zap, Sparkles, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speechService } from '../services/speech';
import { soundFX } from '../services/soundFx';

export default function DemoRunner({
  isOpen,
  onClose,
  onStepExecute,
  currentLang = 'en'
}) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const DEMO_STEPS = [
    {
      step: 1,
      title: 'Camera & Vision Init',
      desc: 'Optical video feed activates and acquires hand landmark skeleton mesh.',
      action: 'INIT_CAMERA'
    },
    {
      step: 2,
      title: 'Deaf User Signs: "Chest Pain"',
      desc: 'Patient presses clenched fist over chest with pulsing distressed movement.',
      action: 'SIGN_CHEST_PAIN'
    },
    {
      step: 3,
      title: 'Vision Agent Classification',
      desc: 'Continuous landmark signature matched to ISL catalog item CHEST_PAIN at 96% confidence.',
      action: 'VISION_MATCH'
    },
    {
      step: 4,
      title: 'Context & Intent Detection',
      desc: 'Intent engine identifies MEDICAL_EMERGENCY with CRITICAL triage priority.',
      action: 'INTENT_CRITICAL'
    },
    {
      step: 5,
      title: 'Emergency Triage Alert',
      desc: 'High-visibility pulsing red alert modal activates with cardiology protocol.',
      action: 'SHOW_EMERGENCY'
    },
    {
      step: 6,
      title: 'Text-to-Speech Voice Broadcast',
      desc: 'SignBridge AI automatically vocalizes clinical alert to attending physician.',
      action: 'SPEAK_ALERT'
    },
    {
      step: 7,
      title: 'Doctor Verbal Response',
      desc: 'Attending physician speaks: "Please sit down. Help is coming."',
      action: 'DOCTOR_SPEECH'
    },
    {
      step: 8,
      title: 'Speech-to-Text Live Transcription',
      desc: 'Microphone STT transcribes doctor voice into live subtitles on the patient screen.',
      action: 'STT_TRANSCRIPTION'
    },
    {
      step: 9,
      title: '3D Sign Avatar Animation',
      desc: '3D Humanoid avatar smoothly executes the ISL "Please sit down" gesture response.',
      action: 'AVATAR_SIT_DOWN'
    }
  ];

  // Auto progression if playing
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < DEMO_STEPS.length - 1) {
      timer = setTimeout(() => {
        advanceStep(currentStep + 1);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const advanceStep = (nextIdx) => {
    soundFX.playStep();
    setCurrentStep(nextIdx);
    const stepObj = DEMO_STEPS[nextIdx];
    if (onStepExecute) {
      onStepExecute(stepObj.action, stepObj);
    }

    if (stepObj.action === 'SPEAK_ALERT') {
      soundFX.playAlarm();
      speechService.speak('The patient reports chest pain and needs immediate medical assistance.', currentLang);
    } else if (stepObj.action === 'DOCTOR_SPEECH') {
      speechService.speak('Please sit down. Help is coming.', currentLang);
    } else if (stepObj.action === 'AVATAR_SIT_DOWN') {
      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const restartDemo = () => {
    soundFX.playClick();
    setCurrentStep(0);
    setIsPlaying(true);
    if (onStepExecute) {
      onStepExecute(DEMO_STEPS[0].action, DEMO_STEPS[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-amber-500/70 shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse shadow-md">
              <Zap className="w-5 h-5 fill-amber-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base text-white">
                  DETERMINISTIC HACKATHON DEMO
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  HOSPITAL EMERGENCY SCENARIO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Automated 9-Step Full-Duplex Pipeline Walkthrough for Judges
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Step Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border border-indigo-500/50 shadow-neon mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
            <span>STEP {currentStep + 1} OF {DEMO_STEPS.length}</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 animate-spin" /> EXECUTING REALTIME
            </span>
          </div>

          <h4 className="font-display font-black text-lg text-white mb-1">
            {DEMO_STEPS[currentStep].title}
          </h4>
          <p className="font-display text-sm text-slate-300 leading-relaxed">
            {DEMO_STEPS[currentStep].desc}
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 mb-5">
          {DEMO_STEPS.map((s, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;

            return (
              <div
                key={s.step}
                onClick={() => advanceStep(idx)}
                className={`p-3 rounded-xl border text-xs font-display flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-indigo-600/40 to-cyan-600/30 border-cyan-400 text-white font-bold shadow-md scale-[1.01]'
                    : isCompleted
                    ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                    : 'bg-slate-950/30 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs ${
                    isCurrent
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                  </span>
                  <span>{s.title}</span>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="glass-button text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
              <span>{isPlaying ? 'Pause Demo' : 'Auto Play'}</span>
            </button>

            <button
              onClick={restartDemo}
              className="glass-button text-xs py-2 px-3.5 flex items-center gap-1.5 text-slate-300"
              title="Restart from Step 1"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>Restart</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStep >= DEMO_STEPS.length - 1}
              onClick={() => advanceStep(currentStep + 1)}
              className="glass-button text-xs py-2 px-5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 font-bold flex items-center gap-1.5 disabled:opacity-40 shadow-neon text-white"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              className="glass-button text-xs py-2 px-3 text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
