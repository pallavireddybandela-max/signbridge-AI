import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, Square, Send, Sparkles, MessageCircle } from 'lucide-react';
import { speechService } from '../services/speech';

export default function SpeechPanel({
  onDoctorResponse,
  onSpeechTranscribed,
  currentLang = 'en'
}) {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [customText, setCustomText] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');

  useEffect(() => {
    const vList = speechService.getAvailableVoices();
    setVoices(vList || []);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setLiveTranscript('');
      setInterimText('');
      const started = speechService.startListening(
        (data) => {
          if (data.interim) setInterimText(data.interim);
          if (data.final) {
            setLiveTranscript((prev) => (prev ? prev + ' ' + data.final : data.final));
            setInterimText('');
            if (onSpeechTranscribed) onSpeechTranscribed(data.final);
          }
        },
        (err) => {
          console.warn('[SpeechPanel] Speech recognition notice:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      if (started) setIsListening(true);
    }
  };

  const handleSendCustomText = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    if (onDoctorResponse) {
      onDoctorResponse(customText.trim());
    }
    // Speak automatically in target voice
    speechService.speak(customText.trim(), currentLang);
    setCustomText('');
  };

  const handleSpeakLive = () => {
    const textToSpeak = liveTranscript.trim() || interimText.trim() || 'Please sit down. Help is coming.';
    speechService.speak(textToSpeak, currentLang);
    if (onDoctorResponse) {
      onDoctorResponse(textToSpeak);
    }
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/70 mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Mic className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100 flex items-center gap-2">
              SPEECH & VOICE INTERFACE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Non-Signing Speaker
              </span>
            </h3>
          </div>
        </div>

        {/* Speed rate controls */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-slate-400 mr-1">TTS:</span>
          {[0.8, 1.0, 1.2].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                setSpeechRate(rate);
                speechService.setRate(rate);
              }}
              className={`px-1.5 py-0.5 text-xs font-mono rounded transition-all ${
                speechRate === rate
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Live Speech Recognition Box */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 my-1 relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            {isListening && (
              <span className="waveform-container">
                <span className="waveform-bar" />
                <span className="waveform-bar" />
                <span className="waveform-bar" />
              </span>
            )}
            Live Microphone Transcription:
          </span>

          <span className="text-[10px] font-mono text-slate-500">
            Web Speech API (Realtime)
          </span>
        </div>

        <div className="min-h-[48px] text-xs font-display text-slate-200 flex items-center">
          {liveTranscript || interimText ? (
            <p>
              <span className="text-white font-medium">{liveTranscript}</span>{' '}
              <span className="text-cyan-400 italic">{interimText}</span>
            </p>
          ) : (
            <p className="text-slate-500 italic">
              {isListening
                ? 'Listening... speak clearly into the microphone.'
                : 'Press "Start Listening" to speak as a doctor, teacher, or staff.'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/50">
          <button
            onClick={toggleListening}
            className={`glass-button text-xs py-1.5 px-3 flex items-center gap-1.5 ${
              isListening ? 'glass-button-danger animate-pulse' : 'glass-button-emerald'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-300" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-300" />
                <span>Start Listening</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSpeakLive}
              className="glass-button text-xs py-1.5 px-2.5 flex items-center gap-1 text-slate-300"
              title="Speak transcribed response"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Speak</span>
            </button>
            <button
              onClick={() => speechService.replay()}
              className="glass-button text-xs py-1.5 px-2 text-slate-400 hover:text-white"
              title="Replay last speech"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={() => speechService.stop()}
              className="glass-button text-xs py-1.5 px-2 text-slate-400 hover:text-rose-400"
              title="Stop audio playback"
            >
              <Square className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Type-to-Sign Response Form */}
      <form onSubmit={handleSendCustomText} className="mt-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type doctor/staff response (e.g. 'Please sit down.')..."
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-display"
          />
          <button
            type="submit"
            disabled={!customText.trim()}
            className="glass-button text-xs py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
