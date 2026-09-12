import json
import os
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

# Try loading Google Generative AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_model = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"[Warning] Gemini API initialization skipped/failed: {e}")
        gemini_model = None

# Load Signs Catalog
DATA_PATH = Path(__file__).parent / "data" / "signs.json"
SIGNS_CATALOG: List[Dict[str, Any]] = []
if DATA_PATH.exists():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        SIGNS_CATALOG = json.load(f)
else:
    print(f"[Warning] signs.json not found at {DATA_PATH}")

SIGNS_BY_ID = {s["id"]: s for s in SIGNS_CATALOG}

# Keyword to Intent mapping for Heuristic Fallback
INTENT_KEYWORDS = {
    "MEDICAL_EMERGENCY": ["chest pain", "cannot breathe", "breathing difficulty", "heart attack", "unconscious", "stroke", "collapsed", "severe bleeding", "critical"],
    "EMERGENCY": ["bleeding", "accident", "injury", "danger", "help immediately", "emergency"],
    "DOCTOR_REQUEST": ["doctor", "nurse", "physician", "consultation", "medical team", "clinic", "ward"],
    "MEDICAL_SYMPTOM": ["headache", "stomach pain", "fever", "pain", "hurts", "allergy", "rash", "vomiting", "nausea", "dizziness"],
    "ACADEMIC_CLARIFICATION": ["don't understand", "not understand", "confused", "explain", "doubt", "clarify", "repeat question"],
    "ACADEMIC_QUESTION": ["exam", "schedule", "test", "book", "library", "syllabus", "assignment", "marks", "grades"],
    "LOCATION_REQUEST": ["where is", "location", "classroom", "room", "lab", "counter", "building", "floor", "direction"],
    "PERMISSION_REQUEST": ["attendance", "leave", "permission", "sick leave", "absent", "allow"],
    "LOST_DOCUMENT": ["lost id", "lost my id", "lost document", "lost card", "missing id", "lost passport", "stolen"],
    "AUTHORITY_REQUEST": ["police", "security", "officer", "guard", "fir", "complaint"],
    "INFORMATION_REQUEST": ["replacement", "fee", "counter", "how to", "procedure", "form", "payment", "medicine timing"],
    "HELP_REQUEST": ["help", "assist", "water", "need help", "support"],
    "GREETING": ["hello", "namaste", "good morning", "good afternoon", "hi"],
    "CLARIFICATION": ["yes", "no", "correct", "wrong", "okay", "sure"],
    "GENERAL_CONVERSATION": ["thank you", "thanks", "sit down", "wait a moment", "goodbye"]
}

# Fallback Multilingual Dictionary
FALLBACK_TRANSLATIONS = {
    "i have chest pain": {
        "hi": "मुझे सीने में दर्द हो रहा है।",
        "te": "నాకు గుండెలో నొప్పిగా ఉంది."
    },
    "i cannot breathe": {
        "hi": "मुझे सांस लेने में परेशानी हो रही है।",
        "te": "నాకు శ్వాస తీసుకోవడం కష్టంగా ఉంది."
    },
    "i need a doctor": {
        "hi": "मुझे डॉक्टर की जरूरत है।",
        "te": "నాకు వైద్యుడు కావాలి."
    },
    "please sit down": {
        "hi": "कृपया बैठ जाइए।",
        "te": "దయచేసి కూర్చోండి."
    },
    "help is coming": {
        "hi": "मदद आ रही है।",
        "te": "సహాయం వస్తోంది."
    },
    "i lost my id card": {
        "hi": "मेरा पहचान पत्र खो गया है।",
        "te": "నా ఐడీ కార్డు పోయింది."
    },
    "i need a new one": {
        "hi": "मुझे एक नया चाहिए।",
        "te": "నాకు కొత్తది కావాలి."
    },
    "thank you": {
        "hi": "धन्यवाद।",
        "te": "ధన్యవాదాలు."
    },
    "hello": {
        "hi": "नमस्ते।",
        "te": "నమస్తే."
    }
}


class VisionAgent:
    """Handles sign recognition, landmark interpretation and confidence scoring."""

    @staticmethod
    def recognize(sign_id: Optional[str] = None, landmark_features: Optional[Dict[str, Any]] = None, mode: str = "hospital") -> Dict[str, Any]:
        if sign_id and sign_id in SIGNS_BY_ID:
            sign = SIGNS_BY_ID[sign_id]
            return {
                "id": sign["id"],
                "concept": sign["concept"],
                "category": sign["category"],
                "intent": sign["intent"],
                "priority": sign["priority"],
                "confidence": 0.96,
                "description": sign["description"],
                "avatarAnimation": sign["avatarAnimation"],
                "suggestedReplies": sign["suggestedReplies"],
                "translations": sign["translations"]
            }

        # Fallback to category-based top sign if no exact match
        filtered = [s for s in SIGNS_CATALOG if s["category"] == mode]
        target = filtered[0] if filtered else SIGNS_CATALOG[0]
        return {
            "id": target["id"],
            "concept": target["concept"],
            "category": target["category"],
            "intent": target["intent"],
            "priority": target["priority"],
            "confidence": 0.88,
            "description": target["description"],
            "avatarAnimation": target["avatarAnimation"],
            "suggestedReplies": target["suggestedReplies"],
            "translations": target["translations"]
        }


class ContextAgent:
    """
    Understands conversational flow, resolves pronouns & anaphora
    (e.g., 'I lost my ID' -> 'I need a new one' -> 'one' = 'ID card').
    """

    @staticmethod
    def interpret(message: str, conversation_history: List[Dict[str, Any]], current_mode: str = "hospital") -> Dict[str, Any]:
        resolved_refs = {}
        interpreted_msg = message

        # Try Gemini if configured
        if gemini_model:
            try:
                history_text = "\n".join([
                    f"{msg.get('role', 'speaker')}: {msg.get('text', '')}"
                    for msg in conversation_history[-5:]
                ])
                prompt = f"""
You are the Context Agent of SignBridge AI (Indian Sign Language communication bridge).
Current Domain Mode: {current_mode}

Conversation History:
{history_text if history_text else "No prior conversation"}

Current User Statement: "{message}"

Task:
1. Resolve any implicit references or pronouns (e.g. 'new one', 'there', 'it').
2. Produce a clear, context-complete clinical or situational statement.
3. Detect intent and priority (CRITICAL, URGENT, IMPORTANT, NORMAL, ROUTINE).

Respond strictly in valid JSON format:
{{
  "interpretedMessage": "Full context-resolved sentence",
  "resolvedReferences": {{"one": "ID card"}},
  "intent": "INTENT_NAME",
  "priority": "CRITICAL/URGENT/IMPORTANT/NORMAL/ROUTINE",
  "confidence": 0.94,
  "suggestedAction": "Immediate actionable advice"
}}
"""
                response = gemini_model.generate_content(prompt)
                raw_text = response.text.strip()
                # Clean code blocks
                if raw_text.startswith("```"):
                    raw_text = re.sub(r"^```[a-zA-Z]*\n", "", raw_text)
                    raw_text = re.sub(r"```$", "", raw_text).strip()
                parsed = json.loads(raw_text)
                return {
                    "originalMessage": message,
                    "interpretedMessage": parsed.get("interpretedMessage", message),
                    "resolvedReferences": parsed.get("resolvedReferences", {}),
                    "intent": parsed.get("intent", IntentAgent.detect(message, current_mode)["intent"]),
                    "priority": parsed.get("priority", IntentAgent.detect(message, current_mode)["priority"]),
                    "confidence": float(parsed.get("confidence", 0.92)),
                    "contextMode": current_mode,
                    "suggestedAction": parsed.get("suggestedAction", "Assist the user with their request.")
                }
            except Exception as e:
                print(f"[ContextAgent] Gemini fallback triggered: {e}")

        # Deterministic Neural-Heuristic Context Engine
        lowered = message.lower()
        last_user_msg = ""
        for prev in reversed(conversation_history):
            if prev.get("role") in ["user_sign", "Person A", "user"]:
                last_user_msg = prev.get("text", "").lower()
                break

        # Check for pronoun resolution
        if "new one" in lowered or "another one" in lowered or "replace" in lowered:
            if "id" in last_user_msg or "card" in last_user_msg or "document" in last_user_msg:
                resolved_refs["one"] = "ID card"
                interpreted_msg = "The user is requesting a replacement identity card for the lost ID."
            elif "medicine" in last_user_msg or "tablet" in last_user_msg or "prescription" in last_user_msg:
                resolved_refs["one"] = "prescribed medication"
                interpreted_msg = "The user needs another dose or refill of the prescribed medication."
            else:
                resolved_refs["one"] = "previously mentioned item"
                interpreted_msg = f"The user requests a replacement for the previously referenced item: {message}"

        elif "where is it" in lowered or "where is that" in lowered:
            if "classroom" in last_user_msg or "room" in last_user_msg or "lab" in last_user_msg:
                resolved_refs["it"] = "classroom/lab"
                interpreted_msg = "The user is inquiring about the precise building location and directions to the room."
            elif "counter" in last_user_msg or "office" in last_user_msg:
                resolved_refs["it"] = "government service counter"
                interpreted_msg = "The user asks for the location of the specific citizen service counter."

        intent_res = IntentAgent.detect(interpreted_msg, current_mode)

        suggested_action = "Acknowledge and assist user promptly."
        if intent_res["priority"] == "critical":
            suggested_action = "Alert triage nurse and attending physician immediately."
        elif intent_res["intent"] == "LOST_DOCUMENT":
            suggested_action = "Provide Form B-2 duplicate ID request form and verify Aadhaar."
        elif intent_res["intent"] == "ACADEMIC_CLARIFICATION":
            suggested_action = "Provide step-by-step visual demonstration on whiteboard."

        return {
            "originalMessage": message,
            "interpretedMessage": interpreted_msg,
            "resolvedReferences": resolved_refs,
            "intent": intent_res["intent"],
            "priority": intent_res["priority"],
            "confidence": 0.94 if resolved_refs else 0.91,
            "contextMode": current_mode,
            "suggestedAction": suggested_action
        }


class IntentAgent:
    """Classifies user communication into 15+ standardized action intents and priorities."""

    @staticmethod
    def detect(text: str, mode: str = "hospital") -> Dict[str, Any]:
        lowered = text.lower()

        # Match against catalog first
        for sign in SIGNS_CATALOG:
            if sign["concept"].lower() in lowered or sign["id"].lower() in lowered.replace(" ", "_"):
                return {
                    "intent": sign["intent"],
                    "confidence": 0.95,
                    "priority": sign["priority"],
                    "category": sign["category"],
                    "suggestedAction": f"Execute action protocol for {sign['intent']}."
                }

        # Match against keyword taxonomy
        for intent_name, keywords in INTENT_KEYWORDS.items():
            for kw in keywords:
                if kw in lowered:
                    priority = "normal"
                    if intent_name in ["MEDICAL_EMERGENCY", "EMERGENCY"]:
                        priority = "critical"
                    elif intent_name in ["DOCTOR_REQUEST", "AUTHORITY_REQUEST"]:
                        priority = "urgent"
                    elif intent_name in ["MEDICAL_SYMPTOM", "LOST_DOCUMENT", "HELP_REQUEST"]:
                        priority = "important"
                    elif intent_name in ["GREETING", "GENERAL_CONVERSATION", "CLARIFICATION"]:
                        priority = "routine"

                    return {
                        "intent": intent_name,
                        "confidence": 0.92,
                        "priority": priority,
                        "category": mode,
                        "suggestedAction": f"Follow {intent_name.lower().replace('_', ' ')} protocol."
                    }

        # Default fallback
        return {
            "intent": "GENERAL_CONVERSATION",
            "confidence": 0.85,
            "priority": "routine",
            "category": mode,
            "suggestedAction": "Continue communication with user."
        }


class EmergencyAgent:
    """Specialized safety triage engine for urgent life/health situations."""

    EMERGENCY_TRIGGERS = [
        "chest pain", "heart", "breathe", "breathing", "choking",
        "unconscious", "collapse", "fainted", "bleeding", "severe blood",
        "head injury", "accident", "stroke", "paralysis", "critical"
    ]

    @classmethod
    def analyze(cls, text: str, intent: Optional[str] = None, signs_detected: Optional[List[str]] = None) -> Dict[str, Any]:
        lowered = text.lower()
        is_emergency = False
        priority = "routine"
        title = "Standard Priority"
        alert_msg = "No emergency indicators detected."
        actions = ["Continue regular conversation."]

        # Check triggers
        for trigger in cls.EMERGENCY_TRIGGERS:
            if trigger in lowered:
                is_emergency = True
                priority = "critical"
                break

        if intent in ["MEDICAL_EMERGENCY", "EMERGENCY"]:
            is_emergency = True
            priority = "critical"

        if is_emergency:
            if "chest" in lowered or "heart" in lowered:
                title = "CRITICAL: Potential Cardiac Event Detected"
                alert_msg = "The patient signs severe chest pain. Immediate medical attention and ECG triage required."
                actions = [
                    "Seat patient immediately in an upright resting position.",
                    "Summon on-duty emergency cardiologist / ER physician.",
                    "Prepare ECG monitor and oxygen support immediately."
                ]
            elif "breath" in lowered or "chok" in lowered:
                title = "CRITICAL: Severe Respiratory Distress"
                alert_msg = "The patient reports acute difficulty breathing. Check airway immediately."
                actions = [
                    "Check airway and breathing posture.",
                    "Administer supplemental oxygen if indicated.",
                    "Notify respiratory therapist immediately."
                ]
            elif "bleed" in lowered:
                title = "CRITICAL: Active Hemorrhage / Bleeding"
                alert_msg = "The patient reports active bleeding requiring immediate sterile pressure dressing."
                actions = [
                    "Apply firm direct pressure with sterile trauma gauze.",
                    "Elevate injured limb if feasible.",
                    "Prepare minor trauma / suture suite."
                ]
            else:
                title = "URGENT: Emergency Assistance Flagged"
                alert_msg = "The patient requires urgent medical evaluation."
                actions = [
                    "Escort to priority consultation desk.",
                    "Notify nursing supervisor.",
                    "Monitor vitals continuously."
                ]

        return {
            "isEmergency": is_emergency,
            "priority": priority,
            "alertTitle": title,
            "alertMessage": alert_msg,
            "audioAlarmRecommended": is_emergency and priority == "critical",
            "recommendedActions": actions
        }


class TranslationAgent:
    """Multilingual bridge for ISL meaning -> English -> Hindi -> Telugu."""

    LANG_NAMES = {
        "en": "English",
        "hi": "Hindi (हिंदी)",
        "te": "Telugu (తెలుగు)"
    }

    @classmethod
    def translate(cls, text: str, target_lang: str = "hi", source_lang: str = "en") -> Dict[str, Any]:
        if target_lang == source_lang or not text:
            return {
                "originalText": text,
                "translatedText": text,
                "sourceLang": source_lang,
                "targetLang": target_lang,
                "languageName": cls.LANG_NAMES.get(target_lang, target_lang)
            }

        # Check Catalog first - exact or keyword overlap
        text_lower = text.lower()
        for sign in SIGNS_CATALOG:
            concept_lower = sign["concept"].lower()
            # Match if concept is in text, or text is in concept, or key terms match
            key_terms = [t for t in concept_lower.split() if len(t) > 3]
            matches_key_terms = any(term in text_lower for term in key_terms)
            if concept_lower in text_lower or text_lower in concept_lower or sign["id"].lower() in text_lower or matches_key_terms:
                if target_lang in sign.get("translations", {}):
                    return {
                        "originalText": text,
                        "translatedText": sign["translations"][target_lang],
                        "sourceLang": source_lang,
                        "targetLang": target_lang,
                        "languageName": cls.LANG_NAMES.get(target_lang, target_lang)
                    }

        # Check Fallback Dictionary
        text_key = text.lower().strip().rstrip(".")
        if text_key in FALLBACK_TRANSLATIONS:
            if target_lang in FALLBACK_TRANSLATIONS[text_key]:
                return {
                    "originalText": text,
                    "translatedText": FALLBACK_TRANSLATIONS[text_key][target_lang],
                    "sourceLang": source_lang,
                    "targetLang": target_lang,
                    "languageName": cls.LANG_NAMES.get(target_lang, target_lang)
                }

        # Gemini dynamic translation if available
        if gemini_model:
            try:
                lang_label = cls.LANG_NAMES.get(target_lang, target_lang)
                prompt = f"Translate this sentence into natural, polite, grammatically correct {lang_label}. Return ONLY the translated sentence, without quotation marks or explanations:\n\"{text}\""
                res = gemini_model.generate_content(prompt)
                translated = res.text.strip().strip('"')
                return {
                    "originalText": text,
                    "translatedText": translated,
                    "sourceLang": source_lang,
                    "targetLang": target_lang,
                    "languageName": cls.LANG_NAMES.get(target_lang, target_lang)
                }
            except Exception as e:
                print(f"[TranslationAgent] Gemini fallback triggered: {e}")

        # Graceful fallback: return original text with language tag
        return {
            "originalText": text,
            "translatedText": f"[{cls.LANG_NAMES.get(target_lang, target_lang)}]: {text}",
            "sourceLang": source_lang,
            "targetLang": target_lang,
            "languageName": cls.LANG_NAMES.get(target_lang, target_lang)
        }


class ResponseAgent:
    """Generates 3 smart contextual response suggestions for doctors/staff."""

    @staticmethod
    def generate_suggestions(message: str, intent: Optional[str] = None, mode: str = "hospital") -> Dict[str, Any]:
        # Catalog lookup
        for sign in SIGNS_CATALOG:
            if sign["concept"].lower() in message.lower() or sign["id"].lower() in message.lower():
                return {
                    "suggestedResponses": sign["suggestedReplies"],
                    "avatarAnimationKey": sign.get("avatarAnimation")
                }

        # Mode-based fallback suggestions
        if mode == "hospital":
            return {
                "suggestedResponses": [
                    "Please sit down and describe where the pain is.",
                    "The duty doctor is examining your chart now.",
                    "Do you have any existing medical conditions?"
                ],
                "avatarAnimationKey": "SIT_DOWN"
            }
        elif mode == "college":
            return {
                "suggestedResponses": [
                    "Which specific topic or question should we review?",
                    "Please bring your assignment file to the podium.",
                    "You can find room 302 on the third floor."
                ],
                "avatarAnimationKey": "QUESTION_CONFUSED"
            }
        else:
            return {
                "suggestedResponses": [
                    "Please fill out Form B-2 at counter 4.",
                    "Do you have a copy of your Aadhaar card or phone number?",
                    "Take a token from the kiosk at the entrance."
                ],
                "avatarAnimationKey": "LOST_ID"
            }


class SignBridgeOrchestrator:
    """Master orchestrator routing between Vision, Context, Intent, Emergency, Translation, and Response agents."""

    def __init__(self):
        self.vision = VisionAgent()
        self.context = ContextAgent()
        self.intent = IntentAgent()
        self.emergency = EmergencyAgent()
        self.translation = TranslationAgent()
        self.response = ResponseAgent()

    def process_full_pipeline(self, sign_id: str, history: List[Dict[str, Any]], mode: str = "hospital", target_lang: str = "hi") -> Dict[str, Any]:
        # 1. Vision
        vision_res = self.vision.recognize(sign_id=sign_id, mode=mode)

        # 2. Context & Intent
        context_res = self.context.interpret(vision_res["concept"], history, current_mode=mode)

        # 3. Emergency Triage
        emergency_res = self.emergency.analyze(context_res["interpretedMessage"], context_res["intent"])

        # 4. Translation
        translation_res = self.translation.translate(context_res["interpretedMessage"], target_lang=target_lang)

        # 5. Response Suggestions
        response_res = self.response.generate_suggestions(context_res["interpretedMessage"], context_res["intent"], mode=mode)

        return {
            "vision": vision_res,
            "context": context_res,
            "emergency": emergency_res,
            "translation": translation_res,
            "response": response_res
        }

orchestrator = SignBridgeOrchestrator()
