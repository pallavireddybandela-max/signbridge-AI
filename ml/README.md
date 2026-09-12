# SignBridge AI — Indian Sign Language (ISL) ML Subsystem

This directory contains the machine learning training, feature extraction, evaluation, and inference pipeline for **Indian Sign Language (ISL)** recognition.

---

## 1. Directory Structure

```
ml/
├── dataset/
│   ├── train/           # Training split (subfolders per class: A/, B/, C/ ...)
│   ├── validation/      # Validation split (subfolders per class)
│   └── test/            # Test split (subfolders per class)
├── model/               # Model checkpoints (.joblib and browser-ready .json)
├── models/              # Active runtime models
├── preprocessing/       # 83-D Invariant Feature Extraction
├── training/            # Training pipeline scripts
├── evaluation/          # Standalone evaluation & confusion matrix generator
├── inference/           # Python inference engine with consensus voting
├── labels.json          # Master 146-class ISL schema
├── train.py             # CLI: Train ISL model
├── evaluate.py          # CLI: Evaluate model performance
├── predict.py           # CLI: Run sample prediction
├── preprocess.py        # CLI: Feature normalization & extraction
└── requirements.txt     # Python dependencies
```

---

## 2. Invariant Feature Pipeline

From 21 MediaPipe hand landmarks (63 raw coords), the extractor computes an **83-dimensional invariant feature vector**:
1. **63 Normalized Coordinates**: Centered at wrist (0, 0, 0) and scaled by palm span (wrist to middle MCP).
2. **10 Fingertip Distances**: Euclidean distances from 5 fingertips to wrist and to palm center.
3. **5 Inter-Tip Pairwise Distances**: Spans between adjacent fingertips (Thumb-Index, Index-Middle, Middle-Ring, Ring-Pinky, Thumb-Pinky).
4. **5 Joint Flexion Angles**: 3D cosine angles measuring finger curling/bending.

---

## 3. Training & Evaluation Commands

### Train the Model:
```powershell
python ml/train.py
```
This trains the MLPClassifier on the ISL dataset, exports `landmark_classifier.joblib` for Python backend, and exports `landmark_classifier.json` for client-side JavaScript execution.

### Evaluate Model & Generate Confusion Report:
```powershell
python ml/evaluate.py
```

### Run Inference Test:
```powershell
python ml/predict.py
```
