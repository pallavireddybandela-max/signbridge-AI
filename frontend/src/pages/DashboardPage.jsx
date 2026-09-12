import React, { useState, useEffect } from 'react';
import CameraPanel from '../components/CameraPanel';
import SpeechPanel from '../components/SpeechPanel';
import TextToSignPanel from '../components/TextToSignPanel';
import SentenceBuilder from '../components/SentenceBuilder';
import TranslationPanel from '../components/TranslationPanel';
import UnderstandingCard from '../components/UnderstandingCard';
import ConversationTimeline from '../components/ConversationTimeline';
import QuickResponseBar from '../components/QuickResponseBar';
import SignAvatarCanvas from '../components/3d/SignAvatarCanvas';
import CommunicationCore3D from '../components/3d/CommunicationCore3D';
import { ArrowDown, Sparkles, Layers, RefreshCw, Camera, Mic, Type, Globe } from 'lucide-react';
import signsCatalog from '../data/signs.json';

export default function DashboardPage({
  currentMode,
  currentLang,
  understanding,
  activeSign,
  conversation,
  onSignRecognized,
  onDoctorResponse,
  onClearConversation,
  pipelineStep = 0,
  isProcessing = false
}) {
  const [inputTab, setInputTab] = useState('camera'); // 'camera' | 'speech' | 'text'
  const [liveGesture, setLiveGesture] = useState({
    signId: activeSign ? activeSign.id : 'CHEST_PAIN',
    confidence: 94,
    isConfident: true
  });

  // Current 3D avatar animation key
  const [avatarSignKey, setAvatarSignKey] = useState(
    activeSign ? activeSign.avatarAnimation || activeSign.id : 'CHEST_PAIN'
  );

  // Synchronize avatar animation whenever activeSign prop updates
  useEffect(() => {
    if (activeSign) {
      const signKey = activeSign.avatarAnimation || activeSign.id || activeSign.concept || 'CHEST_PAIN';
      setAvatarSignKey(signKey);
    }
  }, [activeSign]);

  const handleSelectSign = (sign) => {
    const animKey = sign.avatarAnimation || sign.id || sign.concept || 'CHEST_PAIN';
    setAvatarSignKey(animKey);
    if (onSignRecognized) {
      onSignRecognized(sign);
    }
  };

  const handleLiveSignChange = (liveData) => {
    if (liveData) {
      setLiveGesture(liveData);
      // Immediately mirror live recognized gesture onto 3D Avatar without redirecting
      if (liveData.isConfident && liveData.signId && liveData.signId !== 'Uncertain sign') {
        const signItem = signsCatalog.find((s) => s.id === liveData.signId);
        const animKey = signItem ? (signItem.avatarAnimation || signItem.id) : liveData.signId;
        setAvatarSignKey(animKey);
      }
    }
  };

  const handleSentenceCommit = (sentenceText) => {
    if (!sentenceText) return;
    // Construct custom sign concept from committed sentence
    const customSign = {
      id: sentenceText.replace(/\s+/g, '_').toUpperCase().slice(0, 30),
      concept: sentenceText,
      translations: { en: sentenceText, hi: '', te: '' },
      intent: 'INFORMATION_REQUEST',
      priority: 'routine'
    };
    handleSelectSign(customSign);
  };

  const handleDoctorReply = (text) => {
    // Map text to possible sign for avatar
    const lowered = text.toLowerCase();
    if (lowered.includes('sit down') || lowered.includes('sit')) {
      setAvatarSignKey('SIT_DOWN');
    } else if (lowered.includes('help') || lowered.includes('doctor')) {
      setAvatarSignKey('HELP');
    } else if (lowered.includes('wait')) {
      setAvatarSignKey('WAIT_MOMENT');
    } else if (lowered.includes('thank')) {
      setAvatarSignKey('THANK_YOU');
    } else if (lowered.includes('water')) {
      setAvatarSignKey('WATER');
    } else if (lowered.includes('headache')) {
      setAvatarSignKey('HEADACHE');
    }

    if (onDoctorResponse) {
      onDoctorResponse(text);
    }
  };

  return (
    <div className="space-y-5 p-2 sm:p-4 lg:p-6 max-w-[1700px] mx-auto animate-fadeIn">
      {/* Visual Pipeline Stage Indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wide">3-STAGE LIVE TRANSLATION PIPELINE</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" /> STAGE 1: INPUT
          </span>
          <span className="text-slate-600">→</span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-sm" /> STAGE 2: UNDERSTANDING
          </span>
          <span className="text-slate-600">→</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" /> STAGE 3: RESPONSE
          </span>
        </div>
      </div>

      {/* Top 3D Agent Orchestration Ribbon */}
      <CommunicationCore3D activeStep={pipelineStep} isProcessing={isProcessing} />

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* STAGE 1: INPUT PANEL (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
              STAGE 1: INPUT CHANNELS
            </span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setInputTab('camera')}
                className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  inputTab === 'camera'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Camera Tracking"
              >
                <Camera className="w-3 h-3" />
                <span>Cam</span>
              </button>
              <button
                type="button"
                onClick={() => setInputTab('speech')}
                className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  inputTab === 'speech'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Speech Recognition"
              >
                <Mic className="w-3 h-3" />
                <span>Mic</span>
              </button>
              <button
                type="button"
                onClick={() => setInputTab('text')}
                className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  inputTab === 'text'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Text to ISL Converter"
              >
                <Type className="w-3 h-3" />
                <span>Text</span>
              </button>
            </div>
          </div>

          {inputTab === 'camera' && (
            <>
              <CameraPanel
                onSignRecognized={handleSelectSign}
                onLiveSignChange={handleLiveSignChange}
                currentMode={currentMode}
                activeSign={activeSign}
              />
              <SentenceBuilder
                currentSign={liveGesture.signId}
                confidence={liveGesture.confidence}
                isConfident={liveGesture.isConfident}
                onCommitSentence={handleSentenceCommit}
                currentLang={currentLang}
              />
            </>
          )}

          {inputTab === 'speech' && (
            <SpeechPanel
              onDoctorResponse={handleDoctorReply}
              onSpeechTranscribed={handleDoctorReply}
              currentLang={currentLang}
            />
          )}

          {inputTab === 'text' && (
            <TextToSignPanel
              onTriggerAvatar={(signKey) => {
                const sign = signsCatalog.find((s) => s.id === signKey || s.avatarAnimation === signKey);
                if (sign) handleSelectSign(sign);
              }}
              currentMode={currentMode}
            />
          )}
        </div>

        {/* STAGE 2: UNDERSTANDING PANEL (Center 4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
              STAGE 2: CONTEXT & INTENT
            </span>
            <span className="text-[10px] font-mono text-slate-500">7-Agent Neural Core</span>
          </div>

          <UnderstandingCard
            understanding={understanding}
            currentLang={currentLang}
          />

          <QuickResponseBar
            suggestions={
              understanding?.suggestedResponses ||
              (activeSign?.suggestedReplies) || [
                'Please sit down immediately. Medical team is coming.',
                'Are you having difficulty breathing?',
                'A doctor will examine you in room 4.'
              ]
            }
            onSelectSuggestion={handleDoctorReply}
            currentLang={currentLang}
          />

          <ConversationTimeline
            messages={conversation}
            onClearConversation={onClearConversation}
            currentMode={currentMode}
            currentLang={currentLang}
          />
        </div>

        {/* STAGE 3: RESPONSE PANEL (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              STAGE 3: 3D SIGN AVATAR
            </span>
            <span className="text-[10px] font-mono text-slate-500">Three.js Kinetic Feedback</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 min-h-[460px] flex flex-col justify-between">
            <SignAvatarCanvas
              activeSignConcept={avatarSignKey}
              isPlaying={true}
              onTriggerSign={(key) => {
                const found = signsCatalog.find((s) => s.id === key || s.avatarAnimation === key);
                if (found) handleSelectSign(found);
              }}
            />
          </div>

          {/* Active ISL Animation Status Box */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Active ISL Animation:</span>
              <span className="text-cyan-400 font-bold">{avatarSignKey}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-snug">
              Procedural skeletal kinematics with realistic joint rotations, camera angle switches (Front, Hands, Side), and playback speed controls.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM FULL-WIDTH UNIVERSAL TRANSLATION BRIDGE */}
      <div className="pt-2">
        <TranslationPanel
          incomingText={understanding?.interpretedMessage || activeSign?.concept || ''}
          onSendToAvatar={(signKey) => {
            const found = signsCatalog.find((s) => s.id === signKey || s.avatarAnimation === signKey);
            if (found) handleSelectSign(found);
          }}
          context={currentMode}
        />
      </div>
    </div>
  );
}

