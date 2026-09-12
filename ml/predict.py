"""
SignBridge AI - ISL ML Inference Entrypoint.
Predicts ISL gesture classes from MediaPipe landmark inputs with temporal stabilization and confidence filtering.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ml.inference.predict import isl_predictor, predict_sign

if __name__ == "__main__":
    import numpy as np
    print("Testing ML Predictor on sample hand landmarks...")
    dummy_hand = np.random.uniform(-0.5, 0.5, (21, 3))
    res = predict_sign(dummy_hand)
    print(f"Prediction result: {res}")
