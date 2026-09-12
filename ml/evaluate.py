"""
SignBridge AI - ISL ML Model Evaluation Entrypoint.
Calculates Accuracy, Precision, Recall, F1-Score, and generates Confusion Matrix report.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ml.evaluation.evaluate import run_evaluation

if __name__ == "__main__":
    run_evaluation()
