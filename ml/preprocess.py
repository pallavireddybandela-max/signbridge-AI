"""
SignBridge AI - Indian Sign Language Feature Extraction & Preprocessing.
Converts 21 raw MediaPipe landmarks into an 83-dimensional translation- and scale-invariant feature vector.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ml.preprocessing.features import extract_landmark_features, calculate_angle_3d, LANDMARK_NAMES

def preprocess_landmarks(landmarks):
    """
    Public entrypoint for preprocessing 21 hand landmarks.
    Returns 83-dimensional numpy float32 feature array.
    """
    return extract_landmark_features(landmarks)

if __name__ == "__main__":
    import numpy as np
    print("Testing Preprocessing on synthetic hand...")
    dummy_hand = np.random.uniform(-0.5, 0.5, (21, 3))
    feats = preprocess_landmarks(dummy_hand)
    print(f"[OK] Extracted feature vector of dimension: {feats.shape[0]}")
