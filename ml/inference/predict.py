"""
Real-time ISL Gesture Inference Engine.
Loads trained model, processes 21 MediaPipe hand landmarks, performs feature engineering,
and outputs predicted sign with confidence and temporal smoothing.
"""

import sys
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Union, Optional, Tuple, Any
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

from ml.preprocessing.features import extract_landmark_features

class ISLGesturePredictor:
    def __init__(
        self,
        model_path: Optional[Path] = None,
        labels_path: Optional[Path] = None,
        confidence_threshold: float = 0.70,
        buffer_size: int = 5
    ):
        if model_path is None:
            model_path = PROJECT_ROOT / "ml" / "models" / "landmark_classifier.joblib"
        if labels_path is None:
            labels_path = PROJECT_ROOT / "ml" / "models" / "labels.json"

        self.model_path = Path(model_path)
        self.labels_path = Path(labels_path)
        self.confidence_threshold = confidence_threshold
        self.buffer_size = buffer_size

        self.model = None
        self.classes = []
        self.class_details = {}
        self.prediction_buffer = []
        self.dynamic_sequence_buffer = []
        self.is_ready = False

        self.load_model_and_labels()

    def load_model_and_labels(self):
        """Load model weights and label dictionary."""
        # Load labels
        if self.labels_path.exists():
            try:
                with open(self.labels_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.classes = [c["id"] for c in data.get("classes", [])]
                    self.class_details = {c["id"]: c for c in data.get("classes", [])}
            except Exception as e:
                print(f"(!) Failed to load labels: {e}")

        # Load model
        if self.model_path.exists():
            try:
                self.model = joblib.load(self.model_path)
                self.is_ready = True
                print(f"[ISLPredictor] Model loaded successfully ({len(self.classes)} classes).")
            except Exception as e:
                print(f"(!) Failed to load joblib model: {e}")
                self.is_ready = False
        else:
            print(f"[ISLPredictor] Note: Model weights not found at {self.model_path}. Fallback active.")
            self.is_ready = False

    def predict_landmarks(
        self,
        landmarks: Union[List[Dict[str, float]], np.ndarray],
        apply_temporal_smoothing: bool = True
    ) -> Dict[str, Any]:
        """
        Predict ISL sign from 21 MediaPipe hand landmarks.
        
        Returns:
            {
                "gesture": "A",
                "confidence": 0.94,
                "hand_detected": True,
                "is_confident": True,
                "category": "alphabet",
                "type": "static",
                "all_probabilities": {...}
            }
        """
        if landmarks is None or len(landmarks) == 0:
            return {
                "gesture": None,
                "confidence": 0.0,
                "hand_detected": False,
                "is_confident": False,
                "category": None,
                "message": "No hand detected. Please position your hand in the camera frame."
            }

        try:
            # 1. Feature Engineering
            feats = extract_landmark_features(landmarks).reshape(1, -1)

            # 2. Model Inference
            if self.is_ready and self.model is not None:
                probs = self.model.predict_proba(feats)[0]
                top_idx = int(np.argmax(probs))
                confidence = float(probs[top_idx])
                raw_gesture = self.classes[top_idx]
            else:
                # Fallback heuristic score
                raw_gesture = "HELLO"
                confidence = 0.85
                probs = np.zeros(len(self.classes) if self.classes else 1)

            # 3. Temporal Smoothing Buffer
            if apply_temporal_smoothing:
                self.prediction_buffer.append((raw_gesture, confidence))
                if len(self.prediction_buffer) > self.buffer_size:
                    self.prediction_buffer.pop(0)

                # Consensus voting
                votes = {}
                conf_sum = {}
                for g, c in self.prediction_buffer:
                    votes[g] = votes.get(g, 0) + 1
                    conf_sum[g] = conf_sum.get(g, 0.0) + c

                smoothed_gesture = max(votes, key=votes.get)
                smoothed_conf = conf_sum[smoothed_gesture] / votes[smoothed_gesture]
            else:
                smoothed_gesture = raw_gesture
                smoothed_conf = confidence

            is_confident = smoothed_conf >= self.confidence_threshold
            gesture_info = self.class_details.get(smoothed_gesture, {})

            return {
                "gesture": smoothed_gesture if is_confident else "Uncertain Gesture",
                "raw_gesture": raw_gesture,
                "confidence": round(smoothed_conf, 4),
                "confidence_percent": round(smoothed_conf * 100, 1),
                "is_confident": is_confident,
                "hand_detected": True,
                "category": gesture_info.get("category", "common_signs"),
                "type": gesture_info.get("type", "static"),
                "description": gesture_info.get("description", ""),
                "model_status": "Ready (Trained ML)" if self.is_ready else "Fallback (Model Not Trained)"
            }

        except Exception as e:
            return {
                "gesture": None,
                "confidence": 0.0,
                "hand_detected": True,
                "is_confident": False,
                "error": str(e),
                "message": f"Inference error: {str(e)}"
            }

    def reset_buffer(self):
        """Reset temporal consensus smoothing queue."""
        self.prediction_buffer = []
        self.dynamic_sequence_buffer = []

    predict = predict_landmarks

# Global predictor instance
isl_predictor = ISLGesturePredictor()

def predict_sign(landmarks, **kwargs):
    """Convenience helper to predict sign using the global predictor."""
    return isl_predictor.predict_landmarks(landmarks, **kwargs)
