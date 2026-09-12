import React, { createContext, useContext, useState, useEffect } from 'react';
import { MODES_CONFIG, getModeConfig } from '../data/modes';
import signsCatalog from '../data/signs.json';
import { soundFX } from '../services/soundFx';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Global Mode State
  const [selectedMode, setSelectedModeState] = useState('hospital');
  const modeConfig = getModeConfig(selectedMode);

  // 2. Active Sign & AI Intelligence State
  const defaultSign = signsCatalog.find((s) => s.id === modeConfig.defaultSignId) || signsCatalog[0];
  const [activeSign, setActiveSign] = useState(defaultSign);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [understanding, setUnderstanding] = useState({
    originalMessage: defaultSign.concept,
    interpretedMessage: defaultSign.translations.en,
    resolvedReferences: {},
    intent: defaultSign.intent,
    priority: defaultSign.priority,
    confidence: 0.96,
    contextMode: 'hospital',
    suggestedAction: 'Alert attending emergency cardiologist immediately.',
    suggestedResponses: defaultSign.suggestedReplies
  });

  // 3. Conversation Timeline Store
  const [conversation, setConversation] = useState([
    {
      id: 'msg-init-1',
      role: 'user_sign',
      text: defaultSign.concept,
      timestamp: '10:42 AM',
      intent: defaultSign.intent,
      priority: defaultSign.priority,
      translation: defaultSign.translations
    },
    {
      id: 'msg-init-2',
      role: 'signbridge',
      text: 'AI Context: Acute chest pain flagged with Critical Triage status.',
      timestamp: '10:42 AM',
      intent: defaultSign.intent
    }
  ]);

  // 4. Global Language State
  const [targetLanguage, setTargetLanguage] = useState('en');

  // 5. Active Avatar Animation Key
  const [avatarAnimation, setAvatarAnimation] = useState(defaultSign.avatarAnimation || defaultSign.id);

  // 6. Emergency & Demo States
  const [emergencyData, setEmergencyData] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 7. Accessibility Preferences (Persisted in localStorage)
  const [accessibility, setAccessibility] = useState(() => {
    try {
      const saved = localStorage.getItem('signbridge_accessibility');
      return saved ? JSON.parse(saved) : { highContrast: false, largeText: false, reducedMotion: false };
    } catch {
      return { highContrast: false, largeText: false, reducedMotion: false };
    }
  });

  // Sync Accessibility with DOM & Storage
  useEffect(() => {
    document.body.classList.toggle('high-contrast', accessibility.highContrast);
    document.body.classList.toggle('large-text', accessibility.largeText);
    document.body.classList.toggle('reduced-motion', accessibility.reducedMotion);
    try {
      localStorage.setItem('signbridge_accessibility', JSON.stringify(accessibility));
    } catch {}
  }, [accessibility]);

  const toggleAccessibility = (key) => {
    soundFX.playClick();
    setAccessibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Centralized Mode Switcher: Dynamically reconfigures signs, terminology, avatar, and defaults
  const setMode = (modeId) => {
    if (modeId === selectedMode) return;
    soundFX.playClick();
    setSelectedModeState(modeId);

    const newConfig = getModeConfig(modeId);
    const newDefaultSign = signsCatalog.find((s) => s.id === newConfig.defaultSignId) || signsCatalog[0];

    setActiveSign(newDefaultSign);
    setAvatarAnimation(newDefaultSign.avatarAnimation || newDefaultSign.id);

    setUnderstanding({
      originalMessage: newDefaultSign.concept,
      interpretedMessage: newDefaultSign.translations.en,
      resolvedReferences: {},
      intent: newDefaultSign.intent,
      priority: newDefaultSign.priority,
      confidence: 0.95,
      contextMode: modeId,
      suggestedAction: `Follow standard protocol for ${newConfig.label}.`,
      suggestedResponses: newConfig.defaultSuggestedReplies
    });

    // Clear active emergency when leaving hospital mode
    if (modeId !== 'hospital') {
      setEmergencyData(null);
    }
  };

  const addMessage = (msg) => {
    setConversation((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...msg
      }
    ]);
  };

  const clearConversation = () => {
    soundFX.playClick();
    setConversation([]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedMode,
        modeConfig,
        setMode,
        activeSign,
        setActiveSign,
        understanding,
        setUnderstanding,
        conversation,
        addMessage,
        clearConversation,
        targetLanguage,
        setTargetLanguage,
        avatarAnimation,
        setAvatarAnimation,
        emergencyData,
        setEmergencyData,
        isDemoMode,
        setIsDemoMode,
        isSettingsOpen,
        setIsSettingsOpen,
        pipelineStep,
        setPipelineStep,
        isProcessing,
        setIsProcessing,
        accessibility,
        toggleAccessibility
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
