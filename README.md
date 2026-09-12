# SIGNBRIDGE AI — Two-Way Indian Sign Language (ISL) Communication Bridge

SignBridge AI is a full-stack, machine-learning-driven assistive platform connecting Indian Sign Language (ISL) users with hearing individuals. It translates continuous ISL signs into contextual speech and text, and renders voice responses back into visual feedback and 3D kinetic sign avatars.

---

## 1. System Architecture

```text
               WEBCAM
                 ↓
           FRAME CAPTURE
                 ↓
      MEDIAPIPE HAND DETECTION (21 Landmarks)
                 ↓
    83-D INVARIANT FEATURE EXTRACTION
    (Wrist-centered, palm-scaled, fingertip distances, 3D joint angles)
                 ↓
       ┌─────────┴─────────┐
       ↓                   ↓
STATIC ISL CLASSIFIER   DYNAMIC SEQUENCE MODEL
  (MLP / Random Forest)  (30-frame temporal buffer)
       ↓                   ↓
       └─────────┬─────────┘
                 ↓
     CONFIDENCE & STABILITY GATING
     (>=80% Recognized, 60-79% Checking sign..., <60% Rejected)
                 ↓
          ISL TEXT & WORD
                 ↓
       ISL SENTENCE BUILDER
  (Same-sign suppression, fingerspelling, undo, space, TTS)
                 ↓
     7-AGENT CONTEXT & INTENT AI
  (Vision → Context → Emergency → Translation → Response)
                 ↓
       AUDIO SPEECH & 3D AVATAR
```

---

## 2. Supported ISL Categories & Vocabulary (146 Classes)

| Category | Count | Classes Included |
| :--- | :--- | :--- |
| **🔤 ISL Alphabet** | 26 | `A` through `Z` |
| **🔢 Numbers** | 10 | `0` through `9` |
| **👥 People & Pronouns** | 16 | `I`, `ME`, `YOU`, `WE`, `THEY`, `HE`, `SHE`, `MY`, `YOUR`, `OUR`, `THEIR`, `FRIEND`, `FAMILY`, `CHILD`, `MAN`, `WOMAN` |
| **💬 Common Communication** | 15 | `HELLO`, `GOODBYE`, `THANK_YOU`, `PLEASE`, `SORRY`, `WELCOME`, `YES`, `NO`, `OK`, `GOOD`, `BAD`, `WAIT`, `STOP`, `START`, `HELP` |
| **🏠 Daily Needs** | 16 | `WATER`, `FOOD`, `EAT`, `DRINK`, `SLEEP`, `HOME`, `SCHOOL`, `COLLEGE`, `WORK`, `MONEY`, `PHONE`, `BOOK`, `MEDICINE`, `DOCTOR`, `HOSPITAL`, `BATHROOM` |
| **🏃 Actions** | 16 | `COME`, `GO`, `SIT`, `STAND`, `WALK`, `RUN`, `OPEN`, `CLOSE`, `GIVE`, `TAKE`, `LOOK`, `LISTEN`, `SPEAK`, `READ`, `WRITE`, `CALL` |
| **❓ Questions** | 9 | `WHAT`, `WHY`, `WHERE`, `WHEN`, `WHO`, `HOW`, `WHICH`, `HOW_MUCH`, `HOW_MANY` |
| **⏰ Time & Calendar** | 13 | `TODAY`, `TOMORROW`, `YESTERDAY`, `NOW`, `LATER`, `MORNING`, `AFTERNOON`, `EVENING`, `NIGHT`, `DAY`, `WEEK`, `MONTH`, `YEAR` |
| **😊 Emotions & States** | 11 | `HAPPY`, `SAD`, `ANGRY`, `TIRED`, `HUNGRY`, `THIRSTY`, `AFRAID`, `EXCITED`, `SICK`, `PAIN`, `FINE` |
| **🚨 Emergency & Triage** | 14 | `EMERGENCY`, `DANGER`, `POLICE`, `AMBULANCE`, `FIRE`, `ACCIDENT`, `CHEST_PAIN`, `DOCTOR_HELP`, `HEADACHE`, `BREATHING_DIFFICULTY`, `BLEEDING`, `FAINT`, `FEVER`, `HELP_ME` |

---

## 3. Dataset Ingestion & Training Pipeline

### Dataset Organization
Place real labeled ISL datasets (from ISLRTC or licensed ISL sources) into:
```text
data/
├── train/
│   ├── A/
│   ├── B/
│   ├── HELLO/
│   └── THANK_YOU/
├── validation/
│   ├── A/
│   └── HELLO/
└── test/
    ├── A/
    └── HELLO/
```

### Reproducible Training Commands
```powershell
# 1. Feature Preprocessing & Landmark Extraction
python training/extract_landmarks.py

# 2. Train Static Classifier (MLP / Random Forest)
python training/train_static_model.py --model-type mlp

# 3. Train Dynamic Sequence Model
python training/train_dynamic_model.py

# 4. Run Evaluation Suite (Accuracy, Precision, Recall, F1, Confusion Matrix)
python training/evaluate.py

# 5. Export Neural Weights for Browser (60 FPS JS execution)
python training/export_model.py
```

---

## 4. Running the Application

### Option A: One-Click Launcher (Windows)
Double-click `start_signbridge.bat` in the project root.

### Option B: Manual CLI

**Terminal 1 — AI Backend:**
```powershell
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend App:**
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open your browser at: **http://127.0.0.1:5173/**

---

## 5. Developer Debug Panel & Telemetry
In the Live Camera panel, click the **DEBUG** button in the top toolbar to reveal the real-time HUD telemetry:
- **FPS**: Live frame processing rate
- **Hand detected**: YES / NO tracking state
- **Handedness**: Left / Right hand tracking
- **Landmarks**: 21 MediaPipe coordinates
- **Confidence**: Live percentage & 3-tier status (Recognized $\ge 80\%$, Checking $60-79\%$, Unrecognized $<60\%$)
- **Inference Latency**: Client matrix multiplication execution time (~28–34 ms)
