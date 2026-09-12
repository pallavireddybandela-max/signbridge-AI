"""
SignBridge AI — Indian Sign Language Feature Preprocessing & Normalization.
Extracts 83-dimensional translation- and scale-invariant geometric feature vectors from 21 MediaPipe hand landmarks.
"""

import math
import numpy as np
from pathlib import Path
from typing import List, Dict, Union, Optional

LANDMARK_NAMES = [
    "WRIST",
    "THUMB_CMC", "THUMB_MCP", "THUMB_IP", "THUMB_TIP",
    "INDEX_FINGER_MCP", "INDEX_FINGER_PIP", "INDEX_FINGER_DIP", "INDEX_FINGER_TIP",
    "MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP",
    "RING_FINGER_MCP", "RING_FINGER_PIP", "RING_FINGER_DIP", "RING_FINGER_TIP",
    "PINKY_MCP", "PINKY_PIP", "PINKY_DIP", "PINKY_TIP"
]

def calculate_angle_3d(p1: np.ndarray, p2: np.ndarray, p3: np.ndarray) -> float:
    """Calculate the 3D cosine angle between vectors p2->p1 and p2->p3."""
    v1 = p1 - p2
    v2 = p3 - p2
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 < 1e-6 or norm2 < 1e-6:
        return 0.0
    cosine = np.dot(v1, v2) / (norm1 * norm2)
    return float(np.clip(cosine, -1.0, 1.0))

def extract_features(landmarks: Union[List[Dict[str, float]], np.ndarray, List[List[float]]]) -> np.ndarray:
    """
    Extract translation-invariant and scale-invariant 83-dimensional feature vector from 21 MediaPipe hand landmarks.
    
    Output vector components:
    1. 63 Normalized Coordinates (wrist-centered, scaled by distance from wrist to middle MCP)
    2. 10 Fingertip Distances (5 relative to wrist, 5 relative to palm center)
    3. 5 Inter-tip pairwise distances (adjacent fingers and thumb-pinky span)
    4. 5 Finger joint flexion cosine angles
    """
    if isinstance(landmarks, list) and len(landmarks) > 0 and isinstance(landmarks[0], dict):
        pts = np.array([[pt.get("x", 0.0), pt.get("y", 0.0), pt.get("z", 0.0)] for pt in landmarks], dtype=np.float32)
    else:
        pts = np.array(landmarks, dtype=np.float32)

    if pts.shape != (21, 3):
        if pts.shape == (63,):
            pts = pts.reshape(21, 3)
        else:
            raise ValueError(f"Expected landmarks array of shape (21, 3), got {pts.shape}")

    # 1. Translation Invariance: center on wrist (landmark 0)
    wrist = pts[0].copy()
    centered = pts - wrist

    # 2. Scale Invariance: scale by palm reference size (distance between wrist [0] and middle MCP [9])
    palm_scale = np.linalg.norm(centered[9])
    if palm_scale < 1e-6:
        palm_scale = np.max(np.linalg.norm(centered, axis=1))
    if palm_scale < 1e-6:
        palm_scale = 1.0

    normalized_coords = centered / palm_scale

    # 3. Fingertip distances
    tips = [4, 8, 12, 16, 20]
    tip_wrist_dists = [float(np.linalg.norm(normalized_coords[tip])) for tip in tips]
    tip_palm_dists = [float(np.linalg.norm(normalized_coords[tip] - normalized_coords[9])) for tip in tips]

    # 4. Inter-fingertip pairwise distances
    inter_tip_dists = [
        float(np.linalg.norm(normalized_coords[4] - normalized_coords[8])),   # Thumb to Index
        float(np.linalg.norm(normalized_coords[8] - normalized_coords[12])),  # Index to Middle
        float(np.linalg.norm(normalized_coords[12] - normalized_coords[16])), # Middle to Ring
        float(np.linalg.norm(normalized_coords[16] - normalized_coords[20])), # Ring to Pinky
        float(np.linalg.norm(normalized_coords[4] - normalized_coords[20]))   # Thumb to Pinky span
    ]

    # 5. Joint flex angles
    angles = [
        calculate_angle_3d(normalized_coords[1], normalized_coords[2], normalized_coords[4]),   # Thumb
        calculate_angle_3d(normalized_coords[5], normalized_coords[6], normalized_coords[8]),   # Index
        calculate_angle_3d(normalized_coords[9], normalized_coords[10], normalized_coords[12]), # Middle
        calculate_angle_3d(normalized_coords[13], normalized_coords[14], normalized_coords[16]),# Ring
        calculate_angle_3d(normalized_coords[17], normalized_coords[18], normalized_coords[20]) # Pinky
    ]

    # Concatenate: 63 + 10 + 5 + 5 = 83 features
    feature_vector = np.concatenate([
        normalized_coords.flatten(),
        np.array(tip_wrist_dists, dtype=np.float32),
        np.array(tip_palm_dists, dtype=np.float32),
        np.array(inter_tip_dists, dtype=np.float32),
        np.array(angles, dtype=np.float32)
    ])

    return feature_vector

if __name__ == "__main__":
    dummy_hand = np.random.uniform(-0.5, 0.5, (21, 3))
    feats = extract_features(dummy_hand)
    print(f"[OK] Preprocessed sample hand -> Feature vector shape: {feats.shape}")
