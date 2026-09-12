import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import ParticipantRoom from './components/ParticipantRoom';
import DatasetExplorer from './components/DatasetExplorer';
import GestureLibrary from './components/GestureLibrary';
import SettingsModal from './components/SettingsModal';
import DemoRunner from './components/DemoRunner';
import EmergencyAlert from './components/EmergencyAlert';
import SignAvatarCanvas from './components/3d/SignAvatarCanvas';
import InteractiveBackground from './components/InteractiveBackground';
import signsCatalog from './data/signs.json';
import {
  interpretContext,
  analyzeEmergency,
  translateText,
  generateResponses,
  clearConversationMessages
} from './services/api';
import { speechService } from './services/speech';
import { soundFX } from './services/soundFx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMode, setCurrentMode] = useState('hospital');
  const [currentLang, setCurrentLang] = useState('en');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);

  // Accessibility
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Active Sign & AI Intelligence State
  const initialSign = signsCatalog[0]; // CHEST_PAIN
  const [activeSign, setActiveSign] = useState(initialSign);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [understanding, setUnderstanding] = useState({
    originalMessage: initialSign.concept,
    interpretedMessage: initialSign.translations.en,
    resolvedReferences: {},
    intent: initialSign.intent,
    priority: initialSign.priority,
    confidence: 0.96,
    contextMode: 'hospital',
    suggestedAction: 'Alert attending emergency cardiologist immediately.',
    suggestedResponses: initialSign.suggestedReplies
  });

  // Conversation Timeline Store
  const [conversation, setConversation] = useState([
    {
      id: 'msg-1',
      role: 'user_sign',
      text: initialSign.concept,
      timestamp: '10:42 AM',
      intent: initialSign.intent,
      priority: initialSign.priority,
      translation: initialSign.translations
    },
    {
      id: 'msg-2',
      role: 'signbridge',
      text: 'AI Context: Acute chest pain flagged with Critical Triage status.',
      timestamp: '10:42 AM',
      intent: initialSign.intent
    }
  ]);

  // Apply Accessibility Classes
  useEffect(() => {
    document.body.classList.toggle('high-contrast', isHighContrast);
  }, [isHighContrast]);

  useEffect(() => {
    document.body.classList.toggle('large-text', isLargeText);
  }, [isLargeText]);

  useEffect(() => {
    document.body.classList.toggle('reduced-motion', isReducedMotion);
  }, [isReducedMotion]);

  const handleTabChange = (tabId) => {
    soundFX.playClick();
    setActiveTab(tabId);
  };

  // Execute sign processing pipeline (Sign -> Vision -> Context -> Intent -> Translation -> Response)
  const processSign = async (sign) => {
    soundFX.playRecognize();
    setActiveSign(sign);
    setIsProcessing(true);
    setPipelineStep(1); // Vision

    setTimeout(async () => {
      setPipelineStep(2); // Context

      const contextRes = await interpretContext(sign.concept, conversation, currentMode);
      setPipelineStep(3); // Intent

      const emergencyRes = await analyzeEmergency(contextRes.interpretedMessage, contextRes.intent);
      setPipelineStep(4); // Translation

      const translationRes = await translateText(contextRes.interpretedMessage, currentLang);
      setPipelineStep(5); // Response

      const responseRes = await generateResponses(contextRes.interpretedMessage, contextRes.intent, currentMode);

      setUnderstanding({
        ...contextRes,
        suggestedResponses: responseRes.suggestedResponses
      });

      // Record in conversation
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConversation((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'user_sign',
          text: sign.concept,
          timestamp: timeStr,
          intent: contextRes.intent,
          priority: contextRes.priority,
          translation: sign.translations
        }
      ]);

      // If Emergency Critical, trigger modal & alarm
      if (emergencyRes.isEmergency && emergencyRes.priority === 'critical') {
        soundFX.playAlarm();
        setEmergencyData(emergencyRes);
      }

      setIsProcessing(false);
    }, 350);
  };

  // Doctor response handler
  const handleDoctorResponse = (text) => {
    soundFX.playClick();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversation((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'doctor',
        text,
        timestamp: timeStr
      }
    ]);
  };

  const handleClearConversation = async () => {
    soundFX.playClick();
    await clearConversationMessages();
    setConversation([]);
  };

  // Step executor for Demo Mode Runner
  const handleDemoStep = (action, stepObj) => {
    if (action === 'SIGN_CHEST_PAIN') {
      const chestSign = signsCatalog.find((s) => s.id === 'CHEST_PAIN') || signsCatalog[0];
      processSign(chestSign);
    } else if (action === 'SHOW_EMERGENCY') {
      soundFX.playAlarm();
      setEmergencyData({
        isEmergency: true,
        priority: 'critical',
        alertTitle: 'CRITICAL: Cardiac Event Flagged',
        alertMessage: 'The patient reports severe chest pain. Immediate ECG and cardiology triage required.',
        recommendedActions: [
          'Seat patient immediately in an upright resting position.',
          'Summon on-duty emergency cardiologist.',
          'Prepare ECG monitor and oxygen support immediately.'
        ]
      });
    } else if (action === 'DOCTOR_SPEECH') {
      handleDoctorResponse('Please sit down. Help is coming.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-body relative overflow-hidden">
      {/* Interactive Cyber Background Canvas */}
      {!isReducedMotion && <InteractiveBackground />}

      {/* Top Universal Navbar */}
      <Navbar
        currentMode={currentMode}
        setMode={setCurrentMode}
        currentLang={currentLang}
        setLang={setCurrentLang}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartDemo={() => setIsDemoOpen(true)}
        activeEmergency={emergencyData && emergencyData.isEmergency}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Dynamic Center Viewport */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              currentMode={currentMode}
              currentLang={currentLang}
              understanding={understanding}
              activeSign={activeSign}
              conversation={conversation}
              onSignRecognized={processSign}
              onDoctorResponse={handleDoctorResponse}
              onClearConversation={handleClearConversation}
              pipelineStep={pipelineStep}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'conversation' && (
            <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">
              <ParticipantRoom
                onSendMessage={(msg) =>
                  setConversation((prev) => [
                    ...prev,
                    { ...msg, id: `msg-${Date.now()}` }
                  ])
                }
                currentMode={currentMode}
                currentLang={currentLang}
              />
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 min-h-[580px] shadow-2xl">
                <SignAvatarCanvas
                  activeSignConcept={activeSign?.avatarAnimation || 'CHEST_PAIN'}
                  isPlaying={true}
                  onTriggerSign={(signKey) => {
                    const found = signsCatalog.find((s) => s.id === signKey || s.avatarAnimation === signKey);
                    if (found) processSign(found);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
              <div className="glass-panel p-6 rounded-3xl border-2 border-rose-500/50 bg-rose-950/20 shadow-alert">
                <h3 className="font-display font-black text-xl text-rose-200 mb-2">
                  Emergency Safety Hub
                </h3>
                <p className="text-xs text-slate-300 font-display mb-5 leading-relaxed">
                  SignBridge AI provides real-time triage detection for critical life threats without calling 911 directly.
                </p>
                <button
                  onClick={() => {
                    const chestSign = signsCatalog.find((s) => s.id === 'CHEST_PAIN');
                    processSign(chestSign);
                  }}
                  className="glass-button glass-button-danger text-xs py-2.5 px-5 font-bold shadow-lg"
                >
                  Trigger Emergency Cardiac Triage
                </button>
              </div>
            </div>
          )}

          {activeTab === 'gestures' && (
            <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
              <GestureLibrary
                onSelectGesture={(gestureItem) => {
                  const matchingSign = signsCatalog.find((s) => s.id === gestureItem.id) || {
                    id: gestureItem.id,
                    concept: gestureItem.name,
                    translations: { en: gestureItem.name, hi: '', te: '' },
                    intent: 'INFORMATION_REQUEST',
                    priority: 'routine'
                  };
                  processSign(matchingSign);
                  setActiveTab('dashboard');
                }}
              />
            </div>
          )}

          {activeTab === 'vocabulary' && (
            <div className="p-4 lg:p-6 max-w-6xl mx-auto">
              <DatasetExplorer
                onSelectSign={(sign) => {
                  processSign(sign);
                  setActiveTab('dashboard');
                }}
                currentLang={currentLang}
              />
            </div>
          )}

          {activeTab === 'landing' && (
            <LandingPage
              onStartLive={() => setActiveTab('dashboard')}
              onExploreDemo={() => setIsDemoOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLang={currentLang}
        setLang={setCurrentLang}
        isHighContrast={isHighContrast}
        setIsHighContrast={setIsHighContrast}
        isLargeText={isLargeText}
        setIsLargeText={setIsLargeText}
        isReducedMotion={isReducedMotion}
        setIsReducedMotion={setIsReducedMotion}
        onClearConversation={handleClearConversation}
      />

      <DemoRunner
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onStepExecute={handleDemoStep}
        currentLang={currentLang}
      />

      <EmergencyAlert
        emergencyData={emergencyData}
        onDismiss={() => setEmergencyData(null)}
        currentLang={currentLang}
      />
    </div>
  );
}
