# SignBridge AI — Indian Sign Language (ISL) Dataset Structure

This directory holds training, validation, and test datasets for ISL gesture classification.

## Directory Layout

```
ml/dataset/
├── README.md
├── train/
│   ├── A/
│   ├── B/
│   ├── C/
│   └── ... (all 70 classes)
├── validation/
│   ├── A/
│   ├── B/
│   └── ...
└── test/
    ├── A/
    ├── B/
    └── ...
```

## Supported Classes (70 total)
Configured in `ml/models/labels.json` and `frontend/src/data/gestureClasses.json`:
- **ISL Alphabet (26)**: `A` to `Z`
- **Numbers (10)**: `0` to `9`
- **Common Signs (30)**: `HELLO`, `GOODBYE`, `YES`, `NO`, `PLEASE`, `THANK_YOU`, `SORRY`, `HELP`, `STOP`, `WATER`, `FOOD`, `HOME`, `FRIEND`, `FAMILY`, `GOOD`, `BAD`, `LOVE`, `MORE`, `LESS`, `WAIT`, `COME`, `GO`, `TODAY`, `TOMORROW`, `YESTERDAY`, `NAME`, `WHERE`, `WHAT`, `WHY`, `HOW`, `I`, `YOU`, `WE`
- **Emergency Signs (4)**: `CHEST_PAIN`, `DOCTOR_HELP`, `HEADACHE`, `BREATHING_DIFFICULTY`

## Data Ingestion & Preprocessing
When images are placed inside the class subfolders:
1. `ml/training/train.py` validates images, removes corrupted files, and runs MediaPipe Hands to extract 21 (x, y, z) landmarks.
2. Coordinates are normalized to 83-dimensional scale and translation invariant feature vectors.
3. Classifiers are trained and exported directly into `ml/models/`.
