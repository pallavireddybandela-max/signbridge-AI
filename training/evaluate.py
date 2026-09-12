"""
SignBridge AI — Model Evaluation & Verification Suite.
Calculates Accuracy, Precision, Recall, F1-Score, and generates Confusion Matrix report.
"""

import sys
import json
import numpy as np
from pathlib import Path
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from ml.dataset.dataset_loader import load_labels, get_class_names, generate_synthetic_benchmark_landmarks

def evaluate_models():
    model_path = PROJECT_ROOT / "models" / "isl_static_classifier.joblib"
    labels_path = PROJECT_ROOT / "models" / "labels.json"

    if not model_path.exists():
        model_path = PROJECT_ROOT / "ml" / "models" / "landmark_classifier.joblib"

    if not model_path.exists():
        print(f"(!) Model checkpoint not found at {model_path}. Run training/train_static_model.py first.")
        return

    model = joblib.load(model_path)
    classes = get_class_names(labels_path)

    print("=========================================================", flush=True)
    print("        SIGNBRIDGE AI — MODEL EVALUATION REPORT          ", flush=True)
    print("=========================================================", flush=True)
    print(f"[*] Evaluated Architecture: {model.__class__.__name__}", flush=True)
    print(f"[*] Total Target Classes  : {len(classes)}", flush=True)

    # Test benchmark data
    X_test, y_test, _ = generate_synthetic_benchmark_landmarks(num_samples_per_class=20)
    y_pred = model.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    print("---------------------------------------------------------", flush=True)
    print(f"  Overall Accuracy : {acc * 100:.2f}%", flush=True)
    print(f"  Weighted Prec.   : {prec * 100:.2f}%", flush=True)
    print(f"  Weighted Recall  : {rec * 100:.2f}%", flush=True)
    print(f"  Weighted F1      : {f1 * 100:.2f}%", flush=True)
    print("---------------------------------------------------------", flush=True)

    cm = confusion_matrix(y_test, y_pred)
    print(f"[*] Confusion Matrix Computed: {cm.shape[0]}x{cm.shape[1]} matrix", flush=True)

    eval_results = {
        "model": model.__class__.__name__,
        "total_classes": len(classes),
        "test_samples": len(X_test),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4)
        }
    }

    eval_out = PROJECT_ROOT / "models" / "evaluation_results.json"
    with open(eval_out, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)

    print(f"[OK] Saved evaluation results to: {eval_out}", flush=True)
    print("=========================================================", flush=True)
    return eval_results

if __name__ == "__main__":
    evaluate_models()
