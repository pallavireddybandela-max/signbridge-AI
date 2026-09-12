"""
SignBridge AI - ISL ML Training Pipeline Entrypoint.
Executes training for the 146-class Indian Sign Language Recognition model.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ml.training.train import train_pipeline

if __name__ == "__main__":
    train_pipeline()
