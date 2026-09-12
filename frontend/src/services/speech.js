// Centralized Web Speech API Service for Speech-to-Text (STT) and Text-to-Speech (TTS)
// Compliant with Section 13, 14, 15 specifications

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.voices = [];
    this.preferredVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.lastSpokenText = '';
    this.lastSpokenLang = 'en';

    if (typeof window !== 'undefined') {
      this.initVoices();
      if (this.synth && this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
      this.initRecognition();
    }
  }

  initVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices();
    const indianVoice = this.voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
    const defaultEng = this.voices.find((v) => v.lang.startsWith('en'));
    this.preferredVoice = indianVoice || defaultEng || this.voices[0] || null;
    return this.voices;
  }

  getAvailableVoices() {
    if (this.voices.length === 0) {
      this.initVoices();
    }
    return this.voices;
  }

  getVoices() {
    return this.getAvailableVoices();
  }

  setRate(val) {
    this.rate = Math.max(0.5, Math.min(2.0, val));
  }

  setPitch(val) {
    this.pitch = Math.max(0.5, Math.min(1.5, val));
  }

  speakText(text, lang = 'en', onEndCallback = null) {
    if (!this.synth || !text) return false;
    this.stopSpeech();
    this.lastSpokenText = text;
    this.lastSpokenLang = lang;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Match language tag & voice
    if (lang === 'hi') {
      const hiVoice = this.voices.find((v) => v.lang.includes('hi'));
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
    } else if (lang === 'te') {
      const teVoice = this.voices.find((v) => v.lang.includes('te'));
      if (teVoice) utterance.voice = teVoice;
      utterance.lang = 'te-IN';
    } else {
      if (this.preferredVoice) utterance.voice = this.preferredVoice;
      utterance.lang = 'en-US';
    }

    if (onEndCallback) {
      utterance.onend = onEndCallback;
      utterance.onerror = onEndCallback;
    }

    try {
      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.warn('[SpeechService] Speak execution error:', e);
      return false;
    }
  }

  // Backwards compatibility alias
  speak(text, lang = 'en', onEndCallback = null) {
    return this.speakText(text, lang, onEndCallback);
  }

  replay() {
    if (this.lastSpokenText) {
      this.speakText(this.lastSpokenText, this.lastSpokenLang);
    }
  }

  pauseSpeech() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resumeSpeech() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stopSpeech() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Speech-to-Text Recognition
  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  startListening(onResult, onError, onEnd) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    this.recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (onResult) onResult({ final, interim });
    };

    this.recognition.onerror = (event) => {
      console.warn('[SpeechService] Speech recognition notice:', event.error);
      if (onError && event.error !== 'no-speech') onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.warn('[SpeechService] Start listening notice:', e);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
