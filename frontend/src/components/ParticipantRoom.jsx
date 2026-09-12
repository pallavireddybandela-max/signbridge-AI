import React, { useState } from 'react';
import { Users, User, Stethoscope, HeartPulse, UserPlus, Mic, Camera, Volume2, CheckCircle2 } from 'lucide-react';
import { speechService } from '../services/speech';

export default function ParticipantRoom({
  onSendMessage,
  currentMode = 'hospital',
  currentLang = 'en'
}) {
  const [activeSpeaker, setActiveSpeaker] = useState('Person B');
  const [personBInput, setPersonBInput] = useState('');
  const [personCInput, setPersonCInput] = useState('');

  const participants = [
    {
      id: 'Person A',
      name: 'Person A (Aarav)',
      role: 'Sign Language User',
      inputMethod: 'ISL Camera Stream',
      icon: User,
      color: 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300',
      status: 'Active • Signing'
    },
    {
      id: 'Person B',
      name: currentMode === 'hospital' ? 'Person B (Dr. Sharma)' : (currentMode === 'college' ? 'Person B (Prof. Rao)' : 'Person B (Officer Patel)'),
      role: currentMode === 'hospital' ? 'Attending Physician' : (currentMode === 'college' ? 'Faculty Lead' : 'Desk Officer'),
      inputMethod: 'Speech / Audio',
      icon: Stethoscope,
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
      status: 'Ready to Speak'
    },
    {
      id: 'Person C',
      name: 'Person C (Nurse Sunita)',
      role: 'Triage / Assistant',
      inputMethod: 'Speech / Audio',
      icon: HeartPulse,
      color: 'border-teal-500/50 bg-teal-950/20 text-teal-300',
      status: 'Listening'
    }
  ];

  const handleSpeakerSubmit = (speakerId, text) => {
    if (!text.trim()) return;
    speechService.speak(text, currentLang);
    if (onSendMessage) {
      onSendMessage({
        role: speakerId,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    if (speakerId === 'Person B') setPersonBInput('');
    if (speakerId === 'Person C') setPersonCInput('');
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Users className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100 flex items-center gap-2">
              MULTI-PERSON CONVERSATION ROOM
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Live Session
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Synchronized 3-Party Medical / Academic Consultation
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Active Speaker: <strong className="text-cyan-400">{activeSpeaker}</strong>
        </div>
      </div>

      {/* Participant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {participants.map((p) => {
          const Icon = p.icon;
          const isCurrent = activeSpeaker === p.id;

          return (
            <div
              key={p.id}
              onClick={() => setActiveSpeaker(p.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isCurrent
                  ? `${p.color} shadow-lg ring-1 ring-cyan-400`
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-200">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-100">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{p.role}</p>
                  </div>
                </div>
                {isCurrent && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">{p.inputMethod}</span>
                <span className="text-emerald-400">{p.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Input Bar for Active Speaker */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
        <h4 className="text-xs font-mono font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-emerald-400" />
          Speak / Enter as <span className="text-cyan-400">{activeSpeaker}</span>:
        </h4>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={activeSpeaker === 'Person B' ? personBInput : personCInput}
            onChange={(e) => {
              if (activeSpeaker === 'Person B') setPersonBInput(e.target.value);
              else setPersonCInput(e.target.value);
            }}
            placeholder={
              activeSpeaker === 'Person B'
                ? 'Doctor says: "Please sit down, where is the pain?"'
                : 'Nurse says: "Checking patient vitals and BP..."'
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-display"
          />
          <button
            onClick={() =>
              handleSpeakerSubmit(
                activeSpeaker,
                activeSpeaker === 'Person B' ? personBInput : personCInput
              )
            }
            className="glass-button text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 font-semibold"
          >
            Speak & Send
          </button>
        </div>
      </div>
    </div>
  );
}
