"""
SignBridge AI — Static ISL Sign Model Training Pipeline.
Trains Multilayer Perceptron (MLP) and Random Forest classifiers on 83-dimensional invariant landmark features.
Saves checkpoints to models/isl_static_classifier.joblib and exports browser-ready neural weights.
"""

import sys
import json
import time
import argparse
import numpy as np
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from training.extract_landmarks import extract_dataset_features

def export_mlp_to_json(model: MLPClassifier, classes: list, output_path: Path):
    """Export neural weights to pure JSON for zero-latency client-side inference."""
    layers_data = []
    for i, (w, b) in enumerate(zip(model.coefs_, model.intercepts_)):
        layers_data.append({
            "layer_index": i,
            "input_dim": int(w.shape[0]),
            "output_dim": int(w.shape[1]),
            "weights": [[float(val) for val in row] for row in w],
            "biases": [float(val) for val in b]
        })
    export_payload = {
        "architecture": "MLPClassifier",
        "input_features": 83,
        "num_classes": len(classes),
        "classes": classes,
        "layers": layers_data
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(export_payload, f)
    print(f"[OK] Exported browser-ready neural weights to: {output_path}", flush=True)

def train_static_model(model_type: str = "mlp", data_dir: Path = None):
    print("=========================================================", flush=True)
    print("   SIGNBRIDGE AI — STATIC ISL MODEL TRAINING PIPELINE    ", flush=True)
    print("=========================================================", flush=True)

    X, y, classes = extract_dataset_features()
    num_classes = len(classes)
    print(f"[*] Target Classes: {num_classes} ISL signs", flush=True)
    print(f"[*] Total Samples : {len(X)} feature vectors", flush=True)

    # 1. Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.15, random_state=42, stratify=y_train
    )
    print(f"[*] Split -> Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}", flush=True)

    # 2. Train Model
    print(f"[*] Training {model_type.upper()} Classifier...", flush=True)
    start_time = time.time()

    if model_type.lower() == "rf":
        model = RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
    else:
        model = MLPClassifier(
            hidden_layer_sizes=(128, 64),
            activation="relu",
            solver="adam",
            alpha=0.0005,
            batch_size=32,
            learning_rate_init=0.003,
            max_iter=300,
            early_stopping=True,
            n_iter_no_change=15,
            random_state=42
        )

    model.fit(X_train, y_train)
    duration = time.time() - start_time
    print(f"[OK] Training completed in {duration:.2f} seconds.", flush=True)

    # 3. Test Evaluation
    y_pred = model.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    print("---------------------------------------------------------", flush=True)
    print(f"  Test Accuracy : {acc * 100:.2f}%", flush=True)
    print(f"  Precision     : {prec * 100:.2f}%", flush=True)
    print(f"  Recall        : {rec * 100:.2f}%", flush=True)
    print(f"  F1-Score      : {f1 * 100:.2f}%", flush=True)
    print("---------------------------------------------------------", flush=True)

    # 4. Save Models
    models_dir = PROJECT_ROOT / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    joblib_path = models_dir / "isl_static_classifier.joblib"
    joblib.dump(model, joblib_path)
    print(f"[OK] Saved model checkpoint to: {joblib_path}", flush=True)

    # Also sync to ml/models/landmark_classifier.joblib for backward compatibility
    ml_models_dir = PROJECT_ROOT / "ml" / "models"
    ml_models_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, ml_models_dir / "landmark_classifier.joblib")

    if isinstance(model, MLPClassifier):
        json_path = models_dir / "isl_static_classifier.json"
        export_mlp_to_json(model, classes, json_path)
        export_mlp_to_json(model, classes, ml_models_dir / "landmark_classifier.json")

    metadata = {
        "model_type": model_type,
        "input_features": 83,
        "num_classes": num_classes,
        "classes": classes,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "training_time_sec": round(duration, 2)
        },
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(models_dir / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("=========================================================", flush=True)
    print("   [SUCCESS] STATIC ISL MODEL TRAINING COMPLETED!        ", flush=True)
    print("=========================================================", flush=True)
    return metadata

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Static ISL Sign Classifier")
    parser.add_argument("--model-type", type=str, default="mlp", choices=["mlp", "rf"])
    args = parser.parse_args()

    train_static_model(model_type=args.model_type)
