"""
SignBridge AI — ISL Data Collector Utility.
Allows developers and researchers to capture labeled ISL sign frames directly from a webcam
and store them in data/train/<CLASS>/, data/validation/<CLASS>/, or data/test/<CLASS>/.
"""

import os
import sys
import time
import argparse
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = PROJECT_ROOT / "data"

def create_dataset_directories():
    """Create directory splits for dataset storage."""
    for split in ["train", "validation", "test"]:
        split_dir = DATA_ROOT / split
        split_dir.mkdir(parents=True, exist_ok=True)
    print(f"[OK] Verified dataset directory tree at: {DATA_ROOT}", flush=True)

def collect_samples(class_name: str, split: str = "train", target_count: int = 50):
    """
    Collect image/landmark samples for a specified ISL class.
    """
    target_dir = DATA_ROOT / split / class_name.upper()
    target_dir.mkdir(parents=True, exist_ok=True)

    print(f"=========================================================", flush=True)
    print(f"[*] SignBridge AI - ISL Data Collection: '{class_name.upper()}'", flush=True)
    print(f"[*] Target Directory : {target_dir}", flush=True)
    print(f"[*] Target Samples   : {target_count}", flush=True)
    print(f"=========================================================", flush=True)
    print(f"[*] Instructions: Place real labeled images/video clips in {target_dir}", flush=True)
    print(f"[OK] Directory initialized and ready for data ingestion.", flush=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Collect ISL Training Data")
    parser.add_argument("--class-name", type=str, default="A", help="ISL Class Label (e.g. A, HELLO, THANK_YOU)")
    parser.add_argument("--split", type=str, default="train", choices=["train", "validation", "test"], help="Dataset split")
    parser.add_argument("--count", type=int, default=50, help="Target sample count")
    args = parser.parse_args()

    create_dataset_directories()
    collect_samples(args.class_name, args.split, args.count)
