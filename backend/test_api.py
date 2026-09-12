import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

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

def test_all():
    print(f"Testing SIGNS_CATALOG loading: {len(SIGNS_CATALOG)} signs loaded.")
    assert len(SIGNS_CATALOG) >= 25, "Catalog should have at least 25 signs"
    assert any(s["id"] == "CHEST_PAIN" for s in SIGNS_CATALOG)
    print("✓ Signs Catalog verified.")

    print("\nTesting VisionAgent ...")
    rec = VisionAgent.recognize(sign_id="CHEST_PAIN", mode="hospital")
    print("Recognized concept:", rec["concept"], "| Confidence:", rec["confidence"])
    assert rec["intent"] == "MEDICAL_EMERGENCY"
    assert rec["priority"] == "critical"
    print("✓ VisionAgent verified.")

    print("\nTesting ContextAgent (Anaphora & Pronoun Resolution) ...")
    history = [
        {"role": "user_sign", "text": "I lost my ID card."},
        {"role": "staff", "text": "Do you have another document?"}
    ]
    ctx = ContextAgent.interpret(
        message="I need a new one.",
        conversation_history=history,
        current_mode="public_service"
    )
    print("Interpreted message:", ctx["interpretedMessage"])
    print("Resolved references:", ctx["resolvedReferences"])
    assert "one" in ctx["resolvedReferences"]
    assert ctx["resolvedReferences"]["one"] == "ID card"
    print("✓ ContextAgent verified.")

    print("\nTesting EmergencyAgent ...")
    em = EmergencyAgent.analyze(
        text="I have chest pain and cannot breathe.",
        intent="MEDICAL_EMERGENCY"
    )
    print("Emergency alert title:", em["alertTitle"], "| Priority:", em["priority"])
    assert em["isEmergency"] is True
    assert em["priority"] == "critical"
    assert len(em["recommendedActions"]) >= 2
    print("✓ EmergencyAgent verified.")

    print("\nTesting TranslationAgent ...")
    tr_hi = TranslationAgent.translate("I have severe chest pain and need help.", target_lang="hi")
    print("Hindi translation:", tr_hi["translatedText"])
    assert len(tr_hi["translatedText"]) > 0

    tr_te = TranslationAgent.translate("I have severe chest pain and need help.", target_lang="te")
    print("Telugu translation:", tr_te["translatedText"])
    assert len(tr_te["translatedText"]) > 0
    print("✓ TranslationAgent verified.")

    print("\nTesting ResponseAgent ...")
    resp = ResponseAgent.generate_suggestions("I have chest pain", intent="MEDICAL_EMERGENCY", mode="hospital")
    print("Suggested responses:", resp["suggestedResponses"])
    assert len(resp["suggestedResponses"]) == 3
    print("✓ ResponseAgent verified.")

    print("\nTesting ML Landmark Classifier & Gestures API ...")
    from ml.inference.predict import isl_predictor
    import numpy as np
    assert isl_predictor is not None
    test_hand = np.random.uniform(0.1, 0.8, (21, 3)).astype(np.float32)
    test_hand[0] = [0.0, 0.0, 0.0]
    pred_res = isl_predictor.predict_landmarks(test_hand)
    print("ML Prediction output:", pred_res["gesture"], "| Confidence:", pred_res["confidence_percent"], "%")
    assert pred_res["hand_detected"] is True
    assert "confidence" in pred_res
    assert len(isl_predictor.classes) >= 60
    print("✓ ML Landmark Classifier verified.")

    print("\nTesting Master Orchestrator Pipeline ...")
    pipe = orchestrator.process_full_pipeline(
        sign_id="CHEST_PAIN",
        history=history,
        mode="hospital",
        target_lang="hi"
    )
    print("Master orchestrator output keys:", list(pipe.keys()))
    assert "vision" in pipe and "context" in pipe and "emergency" in pipe and "translation" in pipe and "response" in pipe
    print("\nTesting /api/isl/predict endpoint ...")
    from backend.models import ISLPredictRequest
    from backend.main import predict_isl_sign
    isl_req = ISLPredictRequest(
        landmarks=[{"x": float(p[0]), "y": float(p[1]), "z": float(p[2])} for p in test_hand],
        confidence_threshold=0.80
    )
    isl_resp = predict_isl_sign(isl_req)
    print("ISL Predict API output:", isl_resp)
    assert "sign" in isl_resp and "confidence" in isl_resp and "status" in isl_resp
    print("✓ /api/isl/predict endpoint verified.")

    print("\n=======================================================")
    print("🎉 ALL BACKEND AI AGENTS & ML PREDICTION TESTS PASSED! 🎉")
    print("=======================================================")

if __name__ == "__main__":
    test_all()

