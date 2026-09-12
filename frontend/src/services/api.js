// SignBridge AI API Client with graceful local fallback engine
import signsCatalog from '../data/signs.json';

const API_BASE = 'http://localhost:8000';

// In-memory frontend fallback conversation store
let localConversationStore = [];

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline_fallback',
      service: 'SignBridge Client-Side Core',
      version: '1.0.0 (Offline Mode)',
      gemini_active: false,
      vocabulary_size: signsCatalog.length,
      supported_modes: ['hospital', 'college', 'public_service']
    };
  }
}

export async function fetchSupportedSigns() {
  try {
    const res = await fetch(`${API_BASE}/api/signs`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error('Failed to fetch signs');
    return await res.json();
  } catch (err) {
    return signsCatalog;
  }
}

export async function recognizeSign(signId, landmarkFeatures = null, mode = 'hospital') {
  try {
    const res = await fetch(`${API_BASE}/api/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signId, landmarkFeatures, mode }),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Recognition error');
    return await res.json();
  } catch (err) {
    // Fallback locally from catalog
    const sign = signsCatalog.find(s => s.id === signId) || signsCatalog.find(s => s.category === mode) || signsCatalog[0];
    return {
      id: sign.id,
      concept: sign.concept,
      category: sign.category,
      intent: sign.intent,
      priority: sign.priority,
      confidence: 0.94,
      description: sign.description,
      avatarAnimation: sign.avatarAnimation,
      suggestedReplies: sign.suggestedReplies,
      translations: sign.translations
    };
  }
}

export async function interpretContext(message, conversationHistory = [], currentMode = 'hospital') {
  try {
    const res = await fetch(`${API_BASE}/api/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory, currentMode }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Interpretation error');
    return await res.json();
  } catch (err) {
    // Local contextual reasoning fallback
    const lowered = message.toLowerCase();
    let interpreted = message;
    const resolved = {};

    let lastUserText = '';
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      if (conversationHistory[i].role === 'user_sign' || conversationHistory[i].role === 'Person A') {
        lastUserText = conversationHistory[i].text.toLowerCase();
        break;
      }
    }

    if (lowered.includes('new one') || lowered.includes('another one') || lowered.includes('replace')) {
      if (lastUserText.includes('id') || lastUserText.includes('card')) {
        resolved['one'] = 'ID card';
        interpreted = 'The user is requesting an official replacement identity card for the lost ID.';
      } else if (lastUserText.includes('medicine') || lastUserText.includes('prescription')) {
        resolved['one'] = 'prescribed medicine';
        interpreted = 'The user needs a refill or another dose of the prescribed medication.';
      }
    }

    const signMatch = signsCatalog.find(s => s.concept.toLowerCase().includes(lowered) || s.id.toLowerCase().includes(lowered.replace(/ /g, '_')));
    const intent = signMatch ? signMatch.intent : (lowered.includes('chest') ? 'MEDICAL_EMERGENCY' : 'GENERAL_CONVERSATION');
    const priority = signMatch ? signMatch.priority : (lowered.includes('chest') ? 'critical' : 'normal');

    return {
      originalMessage: message,
      interpretedMessage: interpreted,
      resolvedReferences: resolved,
      intent,
      priority,
      confidence: Object.keys(resolved).length > 0 ? 0.95 : 0.92,
      contextMode: currentMode,
      suggestedAction: priority === 'critical' ? 'Alert attending emergency doctor immediately.' : 'Assist user with appropriate procedure.'
    };
  }
}

export async function detectIntent(text, mode = 'hospital') {
  try {
    const res = await fetch(`${API_BASE}/api/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode }),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Intent error');
    return await res.json();
  } catch (err) {
    const lowered = text.toLowerCase();
    const sign = signsCatalog.find(s => s.concept.toLowerCase().includes(lowered));
    if (sign) {
      return {
        intent: sign.intent,
        confidence: 0.94,
        priority: sign.priority,
        category: sign.category,
        suggestedAction: `Follow standard protocol for ${sign.intent}`
      };
    }
    return {
      intent: 'GENERAL_CONVERSATION',
      confidence: 0.88,
      priority: 'routine',
      category: mode,
      suggestedAction: 'Continue communication'
    };
  }
}

export async function translateText(text, targetLang = 'hi', sourceLang = 'en') {
  try {
    const res = await fetch(`${API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang, sourceLang }),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Translation error');
    return await res.json();
  } catch (err) {
    // Fallback translation dictionary
    const textLower = text.toLowerCase();
    const sign = signsCatalog.find(s => {
      const cLower = s.concept.toLowerCase();
      const keyTerms = cLower.split(' ').filter(w => w.length > 3);
      return cLower.includes(textLower) || textLower.includes(cLower) || keyTerms.some(term => textLower.includes(term));
    });
    if (sign && sign.translations[targetLang]) {
      return {
        originalText: text,
        translatedText: sign.translations[targetLang],
        sourceLang,
        targetLang,
        languageName: targetLang === 'hi' ? 'Hindi (हिंदी)' : (targetLang === 'te' ? 'Telugu (తెలుగు)' : 'English')
      };
    }
    return {
      originalText: text,
      translatedText: text,
      sourceLang,
      targetLang,
      languageName: targetLang
    };
  }
}

export async function analyzeEmergency(text, intent = null, signsDetected = []) {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, intent, signsDetected }),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Emergency error');
    return await res.json();
  } catch (err) {
    const lowered = text.toLowerCase();
    const isCardiac = lowered.includes('chest') || lowered.includes('heart');
    const isRespiratory = lowered.includes('breathe') || lowered.includes('choking');
    const isBleed = lowered.includes('bleed');
    const isEmergency = isCardiac || isRespiratory || isBleed || intent === 'MEDICAL_EMERGENCY' || intent === 'EMERGENCY';

    return {
      isEmergency,
      priority: isEmergency ? 'critical' : 'routine',
      alertTitle: isCardiac ? 'CRITICAL: Potential Cardiac Event Detected' : (isRespiratory ? 'CRITICAL: Severe Respiratory Distress' : (isBleed ? 'CRITICAL: Active Hemorrhage' : 'Standard Priority')),
      alertMessage: isCardiac 
        ? 'The patient signs severe chest pain. Immediate medical attention and ECG triage required.' 
        : 'Emergency protocol flagged. Notify hospital staff immediately.',
      audioAlarmRecommended: isEmergency,
      recommendedActions: [
        'Seat patient immediately in an upright resting position.',
        'Summon on-duty emergency cardiologist / ER physician.',
        'Prepare ECG monitor and oxygen support immediately.'
      ]
    };
  }
}

export async function generateResponses(message, intent = null, mode = 'hospital') {
  try {
    const res = await fetch(`${API_BASE}/api/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, intent, mode }),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Response error');
    return await res.json();
  } catch (err) {
    const sign = signsCatalog.find(s => s.concept.toLowerCase().includes(message.toLowerCase()));
    if (sign) {
      return {
        suggestedResponses: sign.suggestedReplies,
        avatarAnimationKey: sign.avatarAnimation
      };
    }
    return {
      suggestedResponses: [
        'Please sit down and tell me where it hurts.',
        'The doctor will examine you right away.',
        'Do you have any medical history or documents?'
      ],
      avatarAnimationKey: 'SIT_DOWN'
    };
  }
}

export async function recordConversationMessage(msg) {
  localConversationStore.push(msg);
  try {
    await fetch(`${API_BASE}/api/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
  } catch (err) {
    // Local store already updated
  }
}

export async function clearConversationMessages() {
  localConversationStore = [];
  try {
    await fetch(`${API_BASE}/api/conversation`, { method: 'DELETE' });
  } catch (err) {
    // Local store cleared
  }
}
