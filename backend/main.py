import os
import sys
import json
from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

# Add backend directory and project root to path
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from ml.inference.predict import isl_predictor
except ImportError:
    isl_predictor = None

from models import (
    SignRecognitionRequest, SignRecognitionResponse,
    ContextInterpretationRequest, ContextInterpretationResponse,
    IntentDetectionRequest, IntentDetectionResponse,
    TranslationRequest, TranslationResponse,
    EmergencyAnalysisRequest, EmergencyAnalysisResponse,
    ResponseSuggestionRequest, ResponseSuggestionResponse,
    ConversationMessage, SignItem,
    SpeechProcessRequest, SpeechProcessResponse,
    PredictRequest, PredictResponse, GestureCatalogResponse, GestureClassItem,
    ISLPredictRequest, ISLPredictResponse
)
from orchestrator import (
    orchestrator,
    SIGNS_CATALOG,
    VisionAgent,
    ContextAgent,
    IntentAgent,
    EmergencyAgent,
    TranslationAgent,
    ResponseAgent
)

app = FastAPI(
    title="SignBridge AI - Agentic Communication Bridge",
    description="Backend API for two-way Indian Sign Language communication platform with ML Landmark Classification",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session message store (privacy compliant, can be cleared)
CONVERSATION_STORE: List[Dict[str, Any]] = []

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "SignBridge AI Core",
        "version": "2.0.0",
        "docs": "/docs",
        "gemini_active": bool(os.getenv("GEMINI_API_KEY")),
        "ml_model_ready": bool(isl_predictor and isl_predictor.is_ready),
        "vocabulary_size": len(SIGNS_CATALOG),
        "total_ml_classes": len(isl_predictor.classes) if isl_predictor else 70,
        "supported_modes": ["hospital", "college", "public_service"]
    }

@app.post("/api/predict", response_model=PredictResponse)
def predict_gesture(request: PredictRequest):
    """
    ML Landmark Classifier Endpoint:
    Accepts 21 normalized MediaPipe hand landmarks or image features,
    returns predicted ISL sign, confidence score, hand detection status, and category.
    """
    if isl_predictor is None:
        return {
            "gesture": "HELLO",
            "raw_gesture": "HELLO",
            "confidence": 0.85,
            "confidence_percent": 85.0,
            "hand_detected": True,
            "is_confident": True,
            "category": "common_signs",
            "type": "static",
            "description": "Greeting sign",
            "model_status": "Fallback Mode (ML module uninitialized)"
        }

    if request.confidence_threshold is not None:
        isl_predictor.confidence_threshold = request.confidence_threshold

    result = isl_predictor.predict_landmarks(
        landmarks=request.landmarks,
        apply_temporal_smoothing=bool(request.apply_smoothing)
    )
    return result

@app.post("/api/isl/predict", response_model=ISLPredictResponse)
def predict_isl_sign(req: ISLPredictRequest):
    """
    Standardized FastAPI Endpoint for ISL Machine Learning Recognition.
    Predicts static and dynamic ISL classes from MediaPipe landmark arrays.
    """
    if isl_predictor is None:
        return {
            "sign": "UNKNOWN",
            "confidence": 0.0,
            "category": "unknown",
            "is_dynamic": False,
            "accepted": False,
            "status": "Sign not recognized",
            "message": "Predictor module uninitialized"
        }

    threshold = req.confidence_threshold if req.confidence_threshold is not None else 0.80
    isl_predictor.confidence_threshold = threshold

    pred = isl_predictor.predict_landmarks(
        landmarks=req.landmarks,
        apply_temporal_smoothing=bool(req.apply_temporal_smoothing)
    )

    conf = pred.get("confidence", 0.0)
    raw_gesture = pred.get("raw_gesture", "UNKNOWN")
    category = pred.get("category", "general")
    is_dynamic = pred.get("type") == "dynamic"

    if conf >= threshold and raw_gesture != "UNKNOWN":
        status = "Recognized"
        accepted = True
        display_sign = raw_gesture
    elif conf >= 0.60:
        status = "Checking sign..."
        accepted = False
        display_sign = "UNKNOWN"
    else:
        status = "Sign not recognized"
        accepted = False
        display_sign = "UNKNOWN"

    return {
        "sign": display_sign,
        "confidence": round(conf, 4),
        "category": category or "general",
        "is_dynamic": is_dynamic,
        "accepted": accepted,
        "status": status,
        "message": f"Status: {status} ({round(conf * 100, 1)}% confidence)"
    }

@app.get("/api/gestures", response_model=GestureCatalogResponse)
def get_all_gesture_classes():
    """Returns the extensible list of all supported ISL alphabet, number, and common signs."""
    labels_path = PROJECT_ROOT / "ml" / "models" / "labels.json"
    if labels_path.exists():
        with open(labels_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {
                "total_classes": data.get("total_classes", len(data.get("classes", []))),
                "categories": data.get("categories", ["alphabet", "numbers", "common_signs", "emergency"]),
                "classes": data.get("classes", [])
            }
    return {
        "total_classes": 0,
        "categories": [],
        "classes": []
    }

@app.get("/api/signs", response_model=List[Dict[str, Any]])
def get_supported_signs():
    return SIGNS_CATALOG

@app.post("/api/recognize", response_model=SignRecognitionResponse)
def recognize_sign(req: SignRecognitionRequest):
    res = VisionAgent.recognize(sign_id=req.signId, landmark_features=req.landmarkFeatures, mode=req.mode or "hospital")
    return res

@app.post("/api/interpret", response_model=ContextInterpretationResponse)
def interpret_context(req: ContextInterpretationRequest):
    res = ContextAgent.interpret(
        message=req.message,
        conversation_history=req.conversationHistory or CONVERSATION_STORE,
        current_mode=req.currentMode or "hospital"
    )
    return res

@app.post("/api/intent", response_model=IntentDetectionResponse)
def detect_intent(req: IntentDetectionRequest):
    res = IntentAgent.detect(text=req.text, mode=req.mode or "hospital")
    return res

@app.post("/api/translate", response_model=TranslationResponse)
def translate_text(req: TranslationRequest):
    s_lang = req.get_source_lang()
    t_lang = req.get_target_lang()
    res = TranslationAgent.translate(
        text=req.text,
        target_lang=t_lang,
        source_lang=s_lang
    )
    return {
        "originalText": res.get("originalText", req.text),
        "translatedText": res.get("translatedText", req.text),
        "translated_text": res.get("translatedText", req.text),
        "sourceLang": s_lang,
        "source_language": s_lang,
        "targetLang": t_lang,
        "target_language": t_lang,
        "languageName": res.get("languageName", t_lang),
        "confidence": 0.98
    }

@app.post("/api/emergency/analyze", response_model=EmergencyAnalysisResponse)
def analyze_emergency(req: EmergencyAnalysisRequest):
    res = EmergencyAgent.analyze(
        text=req.text,
        intent=req.intent,
        signs_detected=req.signsDetected
    )
    return res

@app.post("/api/response", response_model=ResponseSuggestionResponse)
def generate_response(req: ResponseSuggestionRequest):
    res = ResponseAgent.generate_suggestions(
        message=req.message,
        intent=req.intent,
        mode=req.mode or "hospital"
    )
    return res

@app.post("/api/speech", response_model=SpeechProcessResponse)
def process_speech(req: SpeechProcessRequest):
    # Context & Intent interpretation on doctor's/teacher's speech
    ctx = ContextAgent.interpret(
        message=req.transcript,
        conversation_history=req.history or CONVERSATION_STORE,
        current_mode=req.mode or "hospital"
    )
    # Translate
    trans = TranslationAgent.translate(
        text=req.transcript,
        target_lang=req.targetLang or "hi",
        source_lang="en"
    )
    # Suggest replies
    resp = ResponseAgent.generate_suggestions(
        message=req.transcript,
        intent=ctx.get("intent"),
        mode=req.mode or "hospital"
    )

    # Determine avatar animation for doctor speech (e.g. "please sit down" -> SIT_DOWN)
    lower = req.transcript.lower()
    anim_key = None
    if "sit" in lower:
        anim_key = "SIT_DOWN"
    elif "help" in lower:
        anim_key = "HELP"
    elif "wait" in lower:
        anim_key = "WAIT_MOMENT"
    elif "thank" in lower:
        anim_key = "THANK_YOU"
    elif "water" in lower:
        anim_key = "WATER"
    else:
        anim_key = resp.get("avatarAnimationKey")

    return {
        "transcript": req.transcript,
        "translatedText": trans.get("translatedText", req.transcript),
        "intent": ctx.get("intent", "GENERAL_CONVERSATION"),
        "priority": ctx.get("priority", "routine"),
        "suggestedAction": ctx.get("suggestedAction", "Acknowledge speaker"),
        "suggestedResponses": resp.get("suggestedResponses", []),
        "avatarAnimationKey": anim_key
    }

@app.post("/api/pipeline")
def run_full_pipeline(payload: Dict[str, Any]):
    sign_id = payload.get("signId", "CHEST_PAIN")
    mode = payload.get("mode", "hospital")
    target_lang = payload.get("targetLang", "hi")
    history = payload.get("history", CONVERSATION_STORE)
    
    result = orchestrator.process_full_pipeline(
        sign_id=sign_id,
        history=history,
        mode=mode,
        target_lang=target_lang
    )
    return result

@app.post("/api/conversation")
def record_message(msg: ConversationMessage):
    CONVERSATION_STORE.append(msg.model_dump())
    return {"status": "recorded", "total": len(CONVERSATION_STORE)}

@app.delete("/api/conversation")
def clear_conversation():
    CONVERSATION_STORE.clear()
    return {"status": "cleared", "total": 0}

@app.get("/api/conversation")
def get_conversation():
    return {"messages": CONVERSATION_STORE}

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
