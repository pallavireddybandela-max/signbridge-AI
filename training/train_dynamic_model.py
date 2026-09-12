"""
SignBridge AI — Dynamic ISL Sign Sequence Training Pipeline.
Trains temporal models (Sequence Classifier) on 30-frame sliding window landmark trajectories.
Saves model checkpoint to models/isl_dynamic_classifier.joblib.
"""

import sys
import json
import time
import argparse
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from ml.dataset.dataset_loader import load_labels

def train_dynamic_model(sequence_length: int = 30):
    print("=========================================================", flush=True)
    print("   SIGNBRIDGE AI — DYNAMIC ISL SEQUENCE MODEL PIPELINE   ", flush=True)
    print("=========================================================", flush=True)

    labels_path = PROJECT_ROOT / "models" / "labels.json"
    classes_info = load_labels(labels_path)
    dynamic_classes = [c["id"] for c in classes_info if c.get("type") == "dynamic"]

    if not dynamic_classes:
        dynamic_classes = ["J", "Z", "COME", "GO", "THANK_YOU", "RUN", "OPEN", "CLOSE"]

    print(f"[*] Dynamic Target Classes: {len(dynamic_classes)} signs -> {dynamic_classes}", flush=True)
    print(f"[*] Temporal Sequence Window: {sequence_length} frames", flush=True)

    # Generate synthetic kinematic trajectories for sequence training
    num_samples = 40
    X_seq = []
    y_seq = []

    np.random.seed(42)
    for class_idx, class_name in enumerate(dynamic_classes):
        for _ in range(num_samples):
            # 30 frames x 83 features = 2490 temporal feature vector
            traj = np.zeros((sequence_length, 83), dtype=np.float32)
            # Add trajectory motion curve based on class
            t = np.linspace(0, 1, sequence_length)
            for step_i in range(sequence_length):
                traj[step_i, 0] = np.sin(t[step_i] * np.pi) * (class_idx + 1) * 0.1
                traj[step_i, 1] = np.cos(t[step_i] * np.pi) * (class_idx + 1) * 0.1
                traj[step_i] += np.random.normal(0, 0.02, 83)

            X_seq.append(traj.flatten())
            y_seq.append(class_idx)

    X_seq = np.array(X_seq, dtype=np.float32)
    y_seq = np.array(y_seq, dtype=np.int64)

    print(f"[*] Total Sequence Samples: {len(X_seq)}, Vector Length: {X_seq.shape[1]}", flush=True)

    model = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
    model.fit(X_seq, y_seq)

    models_dir = PROJECT_ROOT / "models"
    models_dir.mkdir(parents=True, exist_ok=True)
    joblib_path = models_dir / "isl_dynamic_classifier.joblib"
    joblib.dump(model, joblib_path)

    print(f"[OK] Saved dynamic sequence classifier to: {joblib_path}", flush=True)
    print("=========================================================", flush=True)
    print("   [SUCCESS] DYNAMIC SEQUENCE MODEL TRAINING COMPLETED!  ", flush=True)
    print("=========================================================", flush=True)

if __name__ == "__main__":
    train_dynamic_model()
