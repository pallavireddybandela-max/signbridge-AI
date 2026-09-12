from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SignItem(BaseModel):
    id: str
    concept: str
    category: str
    modes: Optional[List[str]] = ["hospital", "college", "public_service"]
    intent: str
    priority: str
    supported: bool = True
    description: str
    avatarAnimation: str
    suggestedReplies: List[str]
    translations: Dict[str, str]
    landmarksSignature: Optional[Dict[str, Any]] = None
    recognition: Optional[Dict[str, Any]] = None

class SignRecognitionRequest(BaseModel):
    signId: Optional[str] = None
    landmarkFeatures: Optional[Dict[str, Any]] = None
    mode: Optional[str] = "hospital"
    confidenceThreshold: Optional[float] = 0.7

class SignRecognitionResponse(BaseModel):
    id: str
    concept: str
    category: str
    intent: str
    priority: str
    confidence: float
    description: str
    avatarAnimation: str
    suggestedReplies: List[str]
    translations: Dict[str, str]

class ContextInterpretationRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Dict[str, Any]]] = []
    currentMode: Optional[str] = "hospital"
    resolvedContext: Optional[Dict[str, Any]] = None

class ContextInterpretationResponse(BaseModel):
    originalMessage: str
    interpretedMessage: str
    resolvedReferences: Dict[str, str] = {}
    intent: str
    priority: str
    confidence: float
    contextMode: str
    suggestedAction: str

class IntentDetectionRequest(BaseModel):
    text: str
    mode: Optional[str] = "hospital"

class IntentDetectionResponse(BaseModel):
    intent: str
    confidence: float
    priority: str
    category: str
    suggestedAction: str

class TranslationRequest(BaseModel):
    text: str
    source_language: Optional[str] = None
    sourceLang: Optional[str] = "en"
    target_language: Optional[str] = None
    targetLang: Optional[str] = "hi"
    context: Optional[str] = "hospital"

    def get_source_lang(self) -> str:
        return self.source_language or self.sourceLang or "en"

    def get_target_lang(self) -> str:
        return self.target_language or self.targetLang or "hi"

class TranslationResponse(BaseModel):
    originalText: str
    translatedText: str
    translated_text: Optional[str] = None
    sourceLang: str
    source_language: Optional[str] = None
    targetLang: str
    target_language: Optional[str] = None
    languageName: str
    confidence: Optional[float] = 0.95

class EmergencyAnalysisRequest(BaseModel):
    text: str
    intent: Optional[str] = None
    signsDetected: Optional[List[str]] = []

class EmergencyAnalysisResponse(BaseModel):
    isEmergency: bool
    priority: str  # "critical", "urgent", "important", "routine"
    alertTitle: str
    alertMessage: str
    audioAlarmRecommended: bool
    recommendedActions: List[str]

class ResponseSuggestionRequest(BaseModel):
    message: str
    intent: Optional[str] = None
    mode: Optional[str] = "hospital"
    speaker: Optional[str] = "user_sign"

class ResponseSuggestionResponse(BaseModel):
    suggestedResponses: List[str]
    avatarAnimationKey: Optional[str] = None

class ConversationMessage(BaseModel):
    id: str
    timestamp: str
    role: str  # "user_sign", "signbridge", "doctor", "nurse", "teacher", "staff"
    text: str
    intent: Optional[str] = None
    priority: Optional[str] = None
    mode: Optional[str] = None
    translation: Optional[Dict[str, str]] = None

class SpeechProcessRequest(BaseModel):
    transcript: str
    targetLang: Optional[str] = "hi"
    mode: Optional[str] = "hospital"
    history: Optional[List[Dict[str, Any]]] = []

class SpeechProcessResponse(BaseModel):
    transcript: str
    translatedText: str
    intent: str
    priority: str
    suggestedAction: str
    suggestedResponses: List[str]
    avatarAnimationKey: Optional[str] = None

class GestureClassItem(BaseModel):
    id: str
    name: str
    category: str
    type: str  # "static" or "dynamic"
    description: Optional[str] = ""

class GestureCatalogResponse(BaseModel):
    total_classes: int
    categories: List[str]
    classes: List[GestureClassItem]

class PredictRequest(BaseModel):
    landmarks: Optional[List[Dict[str, float]]] = None
    image_base64: Optional[str] = None
    confidence_threshold: Optional[float] = 0.70
    apply_smoothing: Optional[bool] = True

class PredictResponse(BaseModel):
    gesture: Optional[str] = None
    raw_gesture: Optional[str] = None
    confidence: float
    confidence_percent: float
    hand_detected: bool
    is_confident: bool
    category: Optional[str] = None
    type: Optional[str] = "static"
    description: Optional[str] = None
    model_status: str
    message: Optional[str] = None

class ISLPredictRequest(BaseModel):
    landmarks: Optional[List[Dict[str, float]]] = None
    sequence: Optional[List[List[Dict[str, float]]]] = None
    confidence_threshold: Optional[float] = 0.80
    apply_temporal_smoothing: Optional[bool] = True

class ISLPredictResponse(BaseModel):
    sign: str
    confidence: float
    category: str = "general"
    is_dynamic: bool = False
    accepted: bool
    status: str = "Recognized"
    message: Optional[str] = None
