"""
Dataset Loader & Validator for Indian Sign Language (ISL) Gestures.
Supports loading image datasets, extracting MediaPipe landmarks, and validating class distributions.
"""

import os
import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any

# Local feature extractor
try:
    from ml.preprocessing.features import extract_landmark_features
except ImportError:
    import sys
    sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
    from ml.preprocessing.features import extract_landmark_features

DATASET_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = DATASET_ROOT.parent.parent

def load_labels(labels_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Load class labels from labels.json."""
    if labels_path is None:
        labels_path = DATASET_ROOT.parent / "models" / "labels.json"
        if not labels_path.exists():
            labels_path = DATASET_ROOT.parent / "labels.json"
    if not labels_path.exists():
        raise FileNotFoundError(f"Labels file not found at {labels_path}")
    with open(labels_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("classes", [])

def get_class_names(labels_path: Optional[Path] = None) -> List[str]:
    """Get list of class IDs."""
    classes = load_labels(labels_path)
    return [c["id"] for c in classes]

def validate_dataset_structure(dataset_dir: Path) -> Dict[str, Any]:
    """
    Validate dataset structure and check for missing classes or corrupted files.
    Expected layout:
      dataset_dir/
        train/
          <class_name>/
        validation/
          <class_name>/
        test/
          <class_name>/
    """
    expected_classes = get_class_names()
    report = {
        "is_valid": True,
        "splits_found": [],
        "class_counts": {},
        "missing_classes": [],
        "corrupted_files": [],
        "total_samples": 0
    }

    splits = ["train", "validation", "test"]
    for split in splits:
        split_path = dataset_dir / split
        if split_path.exists() and split_path.is_dir():
            report["splits_found"].append(split)
            for c in expected_classes:
                c_path = split_path / c
                if c_path.exists() and c_path.is_dir():
                    files = list(c_path.glob("*.*"))
                    report["class_counts"][f"{split}/{c}"] = len(files)
                    report["total_samples"] += len(files)
                else:
                    report["missing_classes"].append(f"{split}/{c}")

    if not report["splits_found"] or report["total_samples"] == 0:
        report["is_valid"] = False
        report["message"] = "No train/validation/test splits with samples found in dataset directory."

    return report

def generate_anatomical_landmarks(class_id: str, noise_level: float = 0.015) -> np.ndarray:
    """
    Synthesize an anatomically accurate 21-landmark hand configuration
    based on standard Indian Sign Language (ISL) morphology.
    """
    # Base open hand skeleton
    landmarks = np.zeros((21, 3), dtype=np.float32)
    landmarks[0] = [0.0, 0.0, 0.0] # Wrist

    # Base MCP (knuckle) anchors
    landmarks[1] = [-0.15, 0.15, 0.0] # Thumb CMC
    landmarks[2] = [-0.25, 0.28, 0.0] # Thumb MCP
    landmarks[3] = [-0.32, 0.40, 0.0] # Thumb IP
    landmarks[4] = [-0.38, 0.50, 0.0] # Thumb Tip

    landmarks[5] = [-0.12, 0.50, 0.0] # Index MCP
    landmarks[6] = [-0.14, 0.68, 0.0] # Index PIP
    landmarks[7] = [-0.15, 0.82, 0.0] # Index DIP
    landmarks[8] = [-0.16, 0.95, 0.0] # Index Tip

    landmarks[9] = [0.0, 0.52, 0.0]   # Middle MCP
    landmarks[10] = [0.0, 0.72, 0.0]  # Middle PIP
    landmarks[11] = [0.0, 0.88, 0.0]  # Middle DIP
    landmarks[12] = [0.0, 1.02, 0.0]  # Middle Tip

    landmarks[13] = [0.12, 0.48, 0.0] # Ring MCP
    landmarks[14] = [0.14, 0.66, 0.0] # Ring PIP
    landmarks[15] = [0.15, 0.80, 0.0] # Ring DIP
    landmarks[16] = [0.16, 0.92, 0.0] # Ring Tip

    landmarks[17] = [0.22, 0.42, 0.0] # Pinky MCP
    landmarks[18] = [0.26, 0.55, 0.0] # Pinky PIP
    landmarks[19] = [0.28, 0.67, 0.0] # Pinky DIP
    landmarks[20] = [0.30, 0.78, 0.0] # Pinky Tip

    # Helper closures for finger flexing
    def curl_finger(mcp_i, pip_i, dip_i, tip_i, target_y=0.45, fold_x=None):
        landmarks[pip_i] = [landmarks[mcp_i][0] * 1.05, landmarks[mcp_i][1] + 0.12, 0.08]
        landmarks[dip_i] = [landmarks[mcp_i][0] * 0.95, target_y + 0.05, 0.12]
        landmarks[tip_i] = [fold_x if fold_x is not None else landmarks[mcp_i][0], target_y, 0.10]

    def extend_finger(mcp_i, pip_i, dip_i, tip_i, length=0.45, dx=0.0):
        landmarks[pip_i] = [landmarks[mcp_i][0] + dx * 0.3, landmarks[mcp_i][1] + length * 0.35, 0.0]
        landmarks[dip_i] = [landmarks[mcp_i][0] + dx * 0.7, landmarks[mcp_i][1] + length * 0.70, 0.0]
        landmarks[tip_i] = [landmarks[mcp_i][0] + dx, landmarks[mcp_i][1] + length, 0.0]

    def tuck_thumb(over_fingers=False):
        if over_fingers:
            landmarks[2] = [-0.10, 0.28, 0.12]
            landmarks[3] = [0.0, 0.40, 0.15]
            landmarks[4] = [0.08, 0.48, 0.14]
        else:
            landmarks[2] = [-0.10, 0.25, 0.05]
            landmarks[3] = [-0.05, 0.35, 0.05]
            landmarks[4] = [0.0, 0.42, 0.05]

    def extend_thumb_up():
        landmarks[2] = [-0.18, 0.30, 0.0]
        landmarks[3] = [-0.20, 0.48, 0.0]
        landmarks[4] = [-0.22, 0.65, 0.0]

    def extend_thumb_side():
        landmarks[2] = [-0.25, 0.22, 0.0]
        landmarks[3] = [-0.38, 0.30, 0.0]
        landmarks[4] = [-0.50, 0.38, 0.0]

    # Apply morphological transformations according to ISL class definition
    cid = class_id.upper()

    # Alphabet
    if cid == "A":
        # Closed fist with thumb standing upright
        extend_thumb_up()
        curl_finger(5, 6, 7, 8, target_y=0.44)
        curl_finger(9, 10, 11, 12, target_y=0.44)
        curl_finger(13, 14, 15, 16, target_y=0.44)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "B":
        # 4 fingers straight up, thumb folded across palm
        tuck_thumb(over_fingers=False)
        extend_finger(5, 6, 7, 8, length=0.45, dx=0.0)
        extend_finger(9, 10, 11, 12, length=0.50, dx=0.0)
        extend_finger(13, 14, 15, 16, length=0.45, dx=0.0)
        extend_finger(17, 18, 19, 20, length=0.38, dx=0.0)

    elif cid == "C":
        # C shape curve
        landmarks[4] = [-0.25, 0.60, 0.0]
        for (m, p, d, t) in [(5,6,7,8), (9,10,11,12), (13,14,15,16), (17,18,19,20)]:
            landmarks[p] = [landmarks[m][0], landmarks[m][1] + 0.15, 0.0]
            landmarks[d] = [landmarks[m][0] * 0.8, landmarks[m][1] + 0.25, 0.0]
            landmarks[t] = [landmarks[m][0] * 0.5, landmarks[m][1] + 0.30, 0.0]

    elif cid == "D":
        # Index straight up, others touch thumb forming circle
        extend_finger(5, 6, 7, 8, length=0.45, dx=0.0)
        curl_finger(9, 10, 11, 12, target_y=0.45)
        curl_finger(13, 14, 15, 16, target_y=0.45)
        curl_finger(17, 18, 19, 20, target_y=0.45)
        landmarks[4] = [0.0, 0.45, 0.05]

    elif cid == "E":
        # All fingers tightly curled with thumb tucked across bottom
        curl_finger(5, 6, 7, 8, target_y=0.40)
        curl_finger(9, 10, 11, 12, target_y=0.40)
        curl_finger(13, 14, 15, 16, target_y=0.40)
        curl_finger(17, 18, 19, 20, target_y=0.40)
        landmarks[4] = [-0.05, 0.35, 0.1]

    elif cid == "F":
        # Index and thumb touching tips (circle), other 3 fingers up
        landmarks[4] = [-0.08, 0.65, 0.0]
        landmarks[8] = [-0.08, 0.65, 0.0]
        extend_finger(9, 10, 11, 12, length=0.50, dx=0.0)
        extend_finger(13, 14, 15, 16, length=0.45, dx=0.0)
        extend_finger(17, 18, 19, 20, length=0.38, dx=0.0)

    elif cid == "G":
        # Index and thumb pointing horizontally parallel
        extend_thumb_side()
        landmarks[6] = [0.05, 0.50, 0.0]
        landmarks[7] = [0.20, 0.50, 0.0]
        landmarks[8] = [0.35, 0.50, 0.0]
        curl_finger(9, 10, 11, 12, target_y=0.45)
        curl_finger(13, 14, 15, 16, target_y=0.45)
        curl_finger(17, 18, 19, 20, target_y=0.45)

    elif cid == "H":
        # Index and middle horizontal together
        tuck_thumb()
        landmarks[8] = [0.35, 0.52, 0.0]
        landmarks[12] = [0.35, 0.48, 0.0]
        curl_finger(13, 14, 15, 16, target_y=0.45)
        curl_finger(17, 18, 19, 20, target_y=0.45)

    elif cid == "I":
        # Pinky upright, others in fist
        tuck_thumb(over_fingers=True)
        curl_finger(5, 6, 7, 8, target_y=0.44)
        curl_finger(9, 10, 11, 12, target_y=0.44)
        curl_finger(13, 14, 15, 16, target_y=0.44)
        extend_finger(17, 18, 19, 20, length=0.38, dx=0.0)

    elif cid == "K":
        # Index up, middle forward-up, thumb between them
        extend_finger(5, 6, 7, 8, length=0.45, dx=-0.05)
        extend_finger(9, 10, 11, 12, length=0.45, dx=0.05)
        landmarks[4] = [-0.05, 0.65, 0.05]
        curl_finger(13, 14, 15, 16, target_y=0.44)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "L":
        # L-shape: thumb horizontal, index vertical
        extend_thumb_side()
        extend_finger(5, 6, 7, 8, length=0.45, dx=0.0)
        curl_finger(9, 10, 11, 12, target_y=0.44)
        curl_finger(13, 14, 15, 16, target_y=0.44)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "O" or cid == "0":
        # O-shape: all tips touching
        landmarks[4] = [0.0, 0.65, 0.0]
        landmarks[8] = [0.0, 0.65, 0.0]
        landmarks[12] = [0.0, 0.65, 0.0]
        landmarks[16] = [0.0, 0.65, 0.0]
        landmarks[20] = [0.0, 0.65, 0.0]

    elif cid == "R":
        # Crossed index and middle fingers
        tuck_thumb(over_fingers=True)
        landmarks[8] = [0.02, 0.95, 0.02]
        landmarks[12] = [-0.14, 0.95, -0.02]
        curl_finger(13, 14, 15, 16, target_y=0.44)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "S":
        # Fist with thumb wrapped across front
        tuck_thumb(over_fingers=True)
        curl_finger(5, 6, 7, 8, target_y=0.42)
        curl_finger(9, 10, 11, 12, target_y=0.42)
        curl_finger(13, 14, 15, 16, target_y=0.42)
        curl_finger(17, 18, 19, 20, target_y=0.42)

    elif cid == "U":
        # Index and middle straight up together
        tuck_thumb(over_fingers=True)
        extend_finger(5, 6, 7, 8, length=0.45, dx=0.0)
        extend_finger(9, 10, 11, 12, length=0.45, dx=0.0)
        landmarks[8][0] = -0.05
        landmarks[12][0] = 0.02
        curl_finger(13, 14, 15, 16, target_y=0.44)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "V" or cid == "2":
        # V-shape: Index and middle spread apart
        tuck_thumb(over_fingers=True)
        extend_finger(5, 6, 7, 8, length=0.45, dx=-0.12)
        extend_finger(9, 10, 11, 12, length=0.45, dx=0.12)
        curl_finger(13, 14, 15, 16, target_y=0.44)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "W" or cid == "3" or cid == "WATER":
        # W-shape: Index, middle, ring spread
        tuck_thumb(over_fingers=True)
        extend_finger(5, 6, 7, 8, length=0.45, dx=-0.10)
        extend_finger(9, 10, 11, 12, length=0.48, dx=0.0)
        extend_finger(13, 14, 15, 16, length=0.45, dx=0.10)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "Y":
        # Shaka: Thumb and pinky extended wide, middle 3 curled
        extend_thumb_side()
        extend_finger(17, 18, 19, 20, length=0.40, dx=0.15)
        curl_finger(5, 6, 7, 8, target_y=0.44)
        curl_finger(9, 10, 11, 12, target_y=0.44)
        curl_finger(13, 14, 15, 16, target_y=0.44)

    elif cid == "1":
        # 1: Index only
        tuck_thumb(over_fingers=True)
        extend_finger(5, 6, 7, 8, length=0.48, dx=0.0)
        curl_finger(9, 10, 11, 12, target_y=0.44)
        curl_finger(13, 14, 15, 16, target_y=0.44)
        curl_finger(17, 18, 19, 20, target_y=0.44)

    elif cid == "4":
        # 4: 4 fingers extended, thumb curled
        tuck_thumb(over_fingers=False)
        extend_finger(5, 6, 7, 8, length=0.45, dx=0.0)
        extend_finger(9, 10, 11, 12, length=0.48, dx=0.0)
        extend_finger(13, 14, 15, 16, length=0.45, dx=0.0)
        extend_finger(17, 18, 19, 20, length=0.38, dx=0.0)

    elif cid == "5" or cid == "HELLO" or cid == "GOODBYE":
        # 5: All fingers spread wide
        extend_thumb_side()
        extend_finger(5, 6, 7, 8, length=0.45, dx=-0.08)
        extend_finger(9, 10, 11, 12, length=0.50, dx=0.0)
        extend_finger(13, 14, 15, 16, length=0.45, dx=0.08)
        extend_finger(17, 18, 19, 20, length=0.38, dx=0.15)

    elif cid == "HELP" or cid == "CHEST_PAIN":
        # Fist over palm / chest
        curl_finger(5, 6, 7, 8, target_y=0.45)
        curl_finger(9, 10, 11, 12, target_y=0.45)
        curl_finger(13, 14, 15, 16, target_y=0.45)
        curl_finger(17, 18, 19, 20, target_y=0.45)
        extend_thumb_up()

    else:
        # Default distinct configuration based on class identifier hash
        h = int(abs(hash(class_id)))
        is_fist = (h % 3 == 0)
        if is_fist:
            tuck_thumb(over_fingers=True)
            curl_finger(5, 6, 7, 8, target_y=0.43)
            curl_finger(9, 10, 11, 12, target_y=0.43)
            curl_finger(13, 14, 15, 16, target_y=0.43)
            curl_finger(17, 18, 19, 20, target_y=0.43)
        else:
            # Deterministic finger extensions
            f_flags = [(h >> i) & 1 for i in range(5)]
            if f_flags[0]:
                extend_thumb_side()
            else:
                tuck_thumb()
            for i, (m, p, d, t) in enumerate([(5,6,7,8), (9,10,11,12), (13,14,15,16), (17,18,19,20)]):
                if f_flags[i+1]:
                    extend_finger(m, p, d, t, length=0.45)
                else:
                    curl_finger(m, p, d, t, target_y=0.45)

    # Add Gaussian anatomical variation
    if noise_level > 0:
        noise = np.random.normal(0, noise_level, landmarks.shape).astype(np.float32)
        landmarks += noise

    return landmarks

def generate_synthetic_benchmark_landmarks(num_samples_per_class: int = 50) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Generate synthetic benchmark landmark dataset for pipeline initialization and verification.
    """
    classes = get_class_names()
    X_list = []
    y_list = []

    np.random.seed(42)

    for class_idx, class_id in enumerate(classes):
        for _ in range(num_samples_per_class):
            landmarks = generate_anatomical_landmarks(class_id, noise_level=0.015)
            feats = extract_landmark_features(landmarks)
            X_list.append(feats)
            y_list.append(class_idx)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)
    return X, y, classes
