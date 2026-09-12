"""
SignBridge AI — Model Export Pipeline.
Exports trained scikit-learn models into browser-ready pure JavaScript neural weight JSON files.
"""

import sys
import json
from pathlib import Path
from sklearn.neural_network import MLPClassifier
import joblib

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from ml.dataset.dataset_loader import get_class_names

def export_models():
    model_path = PROJECT_ROOT / "models" / "isl_static_classifier.joblib"
    labels_path = PROJECT_ROOT / "models" / "labels.json"

    if not model_path.exists():
        model_path = PROJECT_ROOT / "ml" / "models" / "landmark_classifier.joblib"

    if not model_path.exists():
        print(f"(!) Model checkpoint not found at {model_path}. Run training/train_static_model.py first.")
        return

    model = joblib.load(model_path)
    classes = get_class_names(labels_path)

    if isinstance(model, MLPClassifier):
        layers_data = []
        for i, (w, b) in enumerate(zip(model.coefs_, model.intercepts_)):
            layers_data.append({
                "layer_index": i,
                "input_dim": int(w.shape[0]),
                "output_dim": int(w.shape[1]),
                "weights": [[float(val) for val in row] for row in w],
                "biases": [float(val) for val in b]
            })
        payload = {
            "architecture": "MLPClassifier",
            "input_features": 83,
            "num_classes": len(classes),
            "classes": classes,
            "layers": layers_data
        }

        # Export to models/ and ml/models/
        out1 = PROJECT_ROOT / "models" / "isl_static_classifier.json"
        out2 = PROJECT_ROOT / "ml" / "models" / "landmark_classifier.json"

        with open(out1, "w", encoding="utf-8") as f:
            json.dump(payload, f)
        with open(out2, "w", encoding="utf-8") as f:
            json.dump(payload, f)

        print(f"[OK] Exported browser neural weights to:\n  - {out1}\n  - {out2}", flush=True)
    else:
        print(f"[*] Model {model.__class__.__name__} is saved as binary joblib checkpoint.", flush=True)

if __name__ == "__main__":
    export_models()
