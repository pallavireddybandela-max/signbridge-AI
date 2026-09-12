"""
Model Evaluation Suite for SignBridge AI ISL Classifier.
Computes accuracy, precision, recall, F1 score, and confusion matrix.
"""

import sys
import json
from pathlib import Path
import numpy as np
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))

from ml.dataset.dataset_loader import load_labels, get_class_names, generate_synthetic_benchmark_landmarks

def evaluate_model(model_path: Path = None, labels_path: Path = None):
    if model_path is None:
        model_path = PROJECT_ROOT / "ml" / "models" / "landmark_classifier.joblib"
    if labels_path is None:
        labels_path = PROJECT_ROOT / "ml" / "models" / "labels.json"

    if not model_path.exists():
        print(f"(!) Model file not found at {model_path}. Please run ml/training/train.py first.")
        return None

    model = joblib.load(model_path)
    classes = get_class_names(labels_path)
    print(f"[*] Loaded trained model: {model.__class__.__name__}")
    print(f"[*] Loaded {len(classes)} target classes.")

    # Generate test dataset
    X_test, y_test, _ = generate_synthetic_benchmark_landmarks(num_samples_per_class=20)
    y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    print("\n=========================================================")
    print("             MODEL EVALUATION REPORT                     ")
    print("=========================================================")
    print(f"  Overall Accuracy : {acc * 100:.2f}%")
    print(f"  Weighted Prec.   : {prec * 100:.2f}%")
    print(f"  Weighted Recall  : {rec * 100:.2f}%")
    print(f"  Weighted F1      : {f1 * 100:.2f}%")
    print("=========================================================")

    # Top predictions sample
    print("\n[*] Sample Predictions Check:")
    for idx in [0, 5, 10, 25, 30, 45, 60]:
        if idx < len(classes):
            print(f"  Target: {classes[y_test[idx * 20]]} | Predicted: {classes[y_pred[idx * 20]]}")

    eval_results = {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "evaluated_samples": int(len(X_test))
    }

    eval_out = PROJECT_ROOT / "ml" / "evaluation" / "eval_summary.json"
    with open(eval_out, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)
    print(f"\n[OK] Saved evaluation summary to: {eval_out}", flush=True)

    return eval_results

run_evaluation = evaluate_model

if __name__ == "__main__":
    evaluate_model()

