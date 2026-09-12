import React, { useEffect } from 'react';
import { AlertTriangle, Volume2, ShieldAlert, X, Activity, Check, Siren } from 'lucide-react';
import { speechService } from '../services/speech';
import { soundFX } from '../services/soundFx';

export default function EmergencyAlert({
  emergencyData,
  onDismiss,
  currentLang = 'en'
}) {
  if (!emergencyData || !emergencyData.isEmergency) return null;

  const { alertTitle, alertMessage, priority, recommendedActions } = emergencyData;

  useEffect(() => {
    soundFX.playAlarm();
  }, []);

  const handleSpeakAlert = () => {
    soundFX.playClick();
    const speechText = `Emergency Alert: ${alertMessage}`;
    speechService.speak(speechText, currentLang);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-lg w-[calc(100vw-2.5rem)] animate-slideUp pointer-events-auto">
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-rose-500 shadow-alert p-4 sm:p-5 text-slate-100 overflow-hidden">
        {/* Animated ambient red alert glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-rose-500/25 blur-2xl pointer-events-none animate-pulse" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/25 border border-rose-500 text-rose-400 animate-pulse shadow-md">
              <Siren className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="telemetry-badge badge-critical text-[9px] mb-0.5">
                PRIORITY: CRITICAL TRIAGE
              </span>
              <h3 className="font-display font-black text-base text-rose-200">
                {alertTitle || 'POSSIBLE MEDICAL EMERGENCY'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onDismiss();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Box */}
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 mb-3 shadow-inner">
          <p className="font-display font-bold text-xs text-rose-100 leading-relaxed">
            "{alertMessage}"
          </p>
        </div>

        {/* Recommended Actions */}
        {recommendedActions && recommendedActions.length > 0 && (
          <div className="mb-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Immediate Clinical Protocol:
            </h4>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {recommendedActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] font-mono text-slate-200 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onDismiss();
            }}
            className="glass-button text-xs py-1.5 px-3 text-slate-300 hover:text-white"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={handleSpeakAlert}
            className="glass-button glass-button-danger text-xs py-1.5 px-4 font-bold flex items-center gap-1.5 shadow-alert"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
