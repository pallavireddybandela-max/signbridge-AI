// Centralized Multilingual Translation Service for SignBridge AI
import offlineDict from '../data/translations.json';

const API_BASE = 'http://localhost:8000';

export const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  te: 'Telugu (తెలుగు)'
};

export async function translateTextService(text, sourceLang = 'en', targetLang = 'hi', context = 'hospital') {
  if (!text || text.trim() === '') {
    return {
      translatedText: '',
      sourceLang,
      targetLang,
      confidence: 1.0,
      isDemoTranslation: false
    };
  }

  if (sourceLang === targetLang) {
    return {
      translatedText: text,
      sourceLang,
      targetLang,
      confidence: 1.0,
      isDemoTranslation: false
    };
  }

  // 1. Try Backend API
  try {
    const res = await fetch(`${API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source_language: sourceLang,
        target_language: targetLang,
        context
      }),
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        translatedText: data.translated_text || data.translatedText,
        sourceLang: data.source_language || data.sourceLang || sourceLang,
        targetLang: data.target_language || data.targetLang || targetLang,
        confidence: data.confidence || 0.95,
        isDemoTranslation: false
      };
    }
  } catch (err) {
    console.warn('[Translation] Backend API unreachable or timed out, falling back to local dictionary:', err);
  }

  // 2. Offline Fallback Dictionary Lookup
  const normalized = text.toLowerCase().trim().replace(/[.,!?;:]/g, '');
  
  // Exact match
  if (offlineDict[normalized] && offlineDict[normalized][targetLang]) {
    return {
      translatedText: offlineDict[normalized][targetLang],
      sourceLang,
      targetLang,
      confidence: 0.98,
      isDemoTranslation: true
    };
  }

  // Fuzzy / substring match
  for (const [key, transMap] of Object.entries(offlineDict)) {
    if ((normalized.includes(key) || key.includes(normalized)) && transMap[targetLang]) {
      return {
        translatedText: transMap[targetLang],
        sourceLang,
        targetLang,
        confidence: 0.92,
        isDemoTranslation: true
      };
    }
  }

  // Graceful fallback
  return {
    translatedText: text,
    sourceLang,
    targetLang,
    confidence: 0.7,
    isDemoTranslation: true,
    fallbackNotice: true
  };
}
