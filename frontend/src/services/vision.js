/**
 * Production-grade Computer Vision & Landmark Processing Service with MediaPipe Hands.
 * Robust camera initialization, multi-device enumeration, graceful error handling,
 * and 60 FPS client-side ISL feature extraction.
 */

import { mlClassifierService } from './mlClassifier';

class VisionService {
  constructor() {
    this.hands = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.offscreenCanvas = null;
    this.offscreenCtx = null;

    this.isRunning = false;
    this.isPaused = false;
    this.isMediaPipeReady = false;
    this.isMediaPipeLoading = false;
    this.onPredictionCallback = null;
    this.onLandmarksCallback = null;
    this.onStatusChangeCallback = null;

    this.stream = null;
    this.animFrameId = null;
    this.lastInferenceTime = 0;
    this.inferenceIntervalMs = 70; // ~14 FPS throttled inference to keep UI 60 FPS

    this.initPromise = null;
    this.activeDeviceId = null;
    this.videoWidth = 0;
    this.videoHeight = 0;
    this.fpsCounter = 0;
    this.fpsLastCheck = Date.now();
    this.currentFps = 0;
  }

  /**
   * Enumerate available video input devices
   */
  async getCameraDevices() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      return videoDevices.map((d, index) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${index + 1} (${d.deviceId ? d.deviceId.slice(0, 6) : 'Default'})`
      }));
    } catch (e) {
      console.warn('[VisionService] Failed to enumerate camera devices:', e);
      return [];
    }
  }

  /**
   * Initializes MediaPipe Hands model from CDN with caching
   */
  async initializeVision() {
    if (this.isMediaPipeReady) return true;
    if (this.initPromise) return this.initPromise;

    this.isMediaPipeLoading = true;
    this.initPromise = new Promise((resolve) => {
      if (typeof window === 'undefined') {
        this.isMediaPipeLoading = false;
        resolve(false);
        return;
      }

      const checkMediaPipe = () => {
        if (window.Hands) {
          try {
            this.hands = new window.Hands({
              locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            this.hands.setOptions({
              maxNumHands: 2,
              modelComplexity: 1,
              minDetectionConfidence: 0.55,
              minTrackingConfidence: 0.55
            });

            this.hands.onResults((results) => this.handleResults(results));
            this.isMediaPipeReady = true;
            this.isMediaPipeLoading = false;
            console.log('[VisionService] MediaPipe Hands model successfully initialized and cached.');
            resolve(true);
          } catch (e) {
            console.warn('[VisionService] MediaPipe init error:', e);
            this.isMediaPipeLoading = false;
            resolve(false);
          }
        } else {
          // Retry briefly while CDN script finishes loading
          let attempts = 0;
          const poll = setInterval(() => {
            attempts++;
            if (window.Hands) {
              clearInterval(poll);
              this.initializeVision().then(resolve);
            } else if (attempts > 20) {
              clearInterval(poll);
              this.isMediaPipeLoading = false;
              console.warn('[VisionService] MediaPipe CDN not yet ready. Video playback continues.');
              resolve(false);
            }
          }, 150);
        }
      };

      checkMediaPipe();
    });

    return this.initPromise;
  }

  /**
   * Robust Camera Initialization with Device Selection, Fallbacks, and Specific Error Handling
   */
  async startCamera(videoElement, canvasElement, onPrediction, onLandmarks, preferredDeviceId = null) {
    // 1. Check browser compatibility
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        success: false,
        errorType: 'NotSupportedError',
        errorMessage: 'Your browser does not support camera access. Please use a modern version of Chrome, Edge, or Firefox.'
      };
    }

    // Stop any existing stream
    this.stopCamera();

    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.onPredictionCallback = onPrediction;
    this.onLandmarksCallback = onLandmarks;
    this.activeDeviceId = preferredDeviceId;

    // Create offscreen canvas for downscaled model processing
    if (!this.offscreenCanvas && typeof document !== 'undefined') {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = 320;
      this.offscreenCanvas.height = 240;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    // 2. Build constraint list with fallbacks
    const constraintOptions = [];

    if (preferredDeviceId) {
      constraintOptions.push({
        video: {
          deviceId: { exact: preferredDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      constraintOptions.push({
        video: { deviceId: { exact: preferredDeviceId } },
        audio: false
      });
    }

    constraintOptions.push({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    constraintOptions.push({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });

    constraintOptions.push({
      video: true,
      audio: false
    });

    // 3. Attempt getUserMedia through constraint cascade
    let stream = null;
    let lastError = null;

    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
        // Continue to next fallback constraint
      }
    }

    if (!stream) {
      return this.formatCameraError(lastError);
    }

    this.stream = stream;

    // 4. Attach stream to video element and start playback
    try {
      if (this.video) {
        this.video.srcObject = this.stream;
        this.video.setAttribute('playsinline', 'true');
        this.video.setAttribute('autoplay', 'true');
        this.video.muted = true;

        // Wait for video metadata to load
        await new Promise((resolve) => {
          if (this.video.readyState >= 2) {
            resolve();
          } else {
            this.video.onloadedmetadata = () => resolve();
          }
        });

        await this.video.play();
        this.videoWidth = this.video.videoWidth || 640;
        this.videoHeight = this.video.videoHeight || 480;

        if (this.canvas) {
          this.canvas.width = this.videoWidth;
          this.canvas.height = this.videoHeight;
        }
      }

      this.isRunning = true;
      this.isPaused = false;
      this.resetRecognition();

      // 5. Initialize MediaPipe (non-blocking)
      this.initializeVision().then((hasMediaPipe) => {
        if (!hasMediaPipe) {
          console.log('[VisionService] MediaPipe initialization deferred. Video feed is active.');
        }
      });

      // 6. Start animation processing loop
      this.startProcessingLoop();

      return {
        success: true,
        videoWidth: this.videoWidth,
        videoHeight: this.videoHeight,
        hasMediaPipe: this.isMediaPipeReady
      };
    } catch (err) {
      console.warn('[VisionService] Video playback error:', err);
      return this.formatCameraError(err);
    }
  }

  /**
   * Translates DOMExceptions into user-friendly diagnostic messages
   */
  formatCameraError(err) {
    if (!err) {
      return {
        success: false,
        errorType: 'UnknownError',
        errorMessage: 'Unable to access camera. Please check your webcam connection and try again.'
      };
    }

    const name = err.name || '';
    let errorType = 'CameraError';
    let errorMessage = 'Unable to access camera.';

    switch (name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        errorType = 'NotAllowedError';
        errorMessage = 'Camera permission was denied. Please allow camera access in your browser site settings and click Try Again.';
        break;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        errorType = 'NotFoundError';
        errorMessage = 'No camera was detected on this device. Please connect a webcam and click Try Again.';
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        errorType = 'NotReadableError';
        errorMessage = 'The camera may be in use by another application (Zoom, Teams, or another browser tab). Close other apps and click Try Again.';
        break;
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        errorType = 'OverconstrainedError';
        errorMessage = 'Requested camera resolution is not supported by your hardware. Retrying with basic constraints...';
        break;
      case 'SecurityError':
        errorType = 'SecurityError';
        errorMessage = 'Camera access is blocked due to security restrictions. If accessing over a local network, please use localhost or HTTPS.';
        break;
      case 'AbortError':
        errorType = 'AbortError';
        errorMessage = 'Camera initialization was interrupted. Please click Try Again.';
        break;
      default:
        errorMessage = err.message || 'Unable to access camera. Please check device permissions and try again.';
    }

    return {
      success: false,
      errorType,
      errorMessage,
      rawError: err
    };
  }

  startProcessingLoop() {
    const process = async (now) => {
      if (!this.isRunning) return;

      // Update live FPS calculation
      this.fpsCounter++;
      if (now - this.fpsLastCheck >= 1000) {
        this.currentFps = this.fpsCounter;
        this.fpsCounter = 0;
        this.fpsLastCheck = now;
      }

      if (!this.isPaused && this.video && this.video.readyState >= 2) {
        // Throttled frame inference for ML
        if (now - this.lastInferenceTime >= this.inferenceIntervalMs) {
          this.lastInferenceTime = now;

          if (this.offscreenCtx && this.hands && this.isMediaPipeReady) {
            this.offscreenCtx.drawImage(this.video, 0, 0, 320, 240);
            try {
              await this.hands.send({ image: this.offscreenCanvas });
            } catch (err) {
              // Ignore single frame dropped errors
            }
          } else if (this.canvas && this.ctx) {
            // Draw targeting frame while waiting for hand
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawTargetBox(this.canvas.width, this.canvas.height);
          }
        }
      }

      this.animFrameId = requestAnimationFrame(process);
    };

    this.animFrameId = requestAnimationFrame(process);
  }

  handleResults(results) {
    if (!this.canvas || !this.ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.save();
    this.ctx.clearRect(0, 0, w, h);

    // Draw guidance bounding box
    this.drawTargetBox(w, h);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const handCount = results.multiHandLandmarks.length;

      // Draw all hand skeletons
      results.multiHandLandmarks.forEach((landmarks, idx) => {
        const handedness = results.multiHandedness && results.multiHandedness[idx]
          ? results.multiHandedness[idx].label
          : (idx === 0 ? 'Right' : 'Left');
        this.drawHandMesh(landmarks, handedness);
      });

      // Calculate camera guidance for primary hand
      const primaryHand = results.multiHandLandmarks[0];
      const wrist = primaryHand[0];
      const mcp9 = primaryHand[9];
      const palmSpan = Math.hypot(mcp9.x - wrist.x, mcp9.y - wrist.y);

      let guidance = 'Hand detected ✓';
      let guidanceStatus = 'ok';

      if (handCount > 1) {
        guidance = 'Please show one hand clearly';
        guidanceStatus = 'warning';
      } else if (palmSpan < 0.10) {
        guidance = 'Move your hand closer';
        guidanceStatus = 'warning';
      } else if (wrist.x < 0.10 || wrist.x > 0.90 || wrist.y < 0.10 || wrist.y > 0.90) {
        guidance = 'Place your hand inside the box';
        guidanceStatus = 'warning';
      }

      // ML Neural Landmark classification on primary hand
      const mlPrediction = mlClassifierService.predict(primaryHand);

      if (mlPrediction && this.onPredictionCallback) {
        this.onPredictionCallback({
          signId: mlPrediction.gesture,
          rawGesture: mlPrediction.rawGesture,
          concept: mlPrediction.concept || mlPrediction.description,
          confidence: mlPrediction.confidencePercent || 0,
          isConfident: mlPrediction.isConfident,
          handDetected: true,
          handCount,
          guidance,
          guidanceStatus,
          category: mlPrediction.category,
          type: mlPrediction.type,
          stabilityPercent: mlPrediction.stabilityPercent || 100,
          modelStatus: mlPrediction.modelStatus || 'ISL Classifier ✓',
          fps: this.currentFps
        });
      }

      if (this.onLandmarksCallback) {
        this.onLandmarksCallback(results.multiHandLandmarks);
      }
    } else {
      // No hands in view
      if (this.onPredictionCallback) {
        this.onPredictionCallback({
          signId: null,
          concept: 'No hand detected. Please position your hand inside the camera frame.',
          confidence: 0,
          isConfident: false,
          handDetected: false,
          handCount: 0,
          guidance: 'No hand detected',
          guidanceStatus: 'info',
          modelStatus: this.isMediaPipeReady ? 'ISL Classifier ✓' : 'Vision Initializing...',
          fps: this.currentFps
        });
      }
    }

    this.ctx.restore();
  }

  drawTargetBox(w, h) {
    const boxX = w * 0.15;
    const boxY = h * 0.12;
    const boxW = w * 0.70;
    const boxH = h * 0.76;
    const corner = 24;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([6, 6]);
    this.ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Corner brackets
    this.ctx.setLineDash([]);
    this.ctx.strokeStyle = '#6366f1';
    this.ctx.lineWidth = 3;

    // Top-Left
    this.ctx.beginPath();
    this.ctx.moveTo(boxX, boxY + corner);
    this.ctx.lineTo(boxX, boxY);
    this.ctx.lineTo(boxX + corner, boxY);
    this.ctx.stroke();

    // Top-Right
    this.ctx.beginPath();
    this.ctx.moveTo(boxX + boxW - corner, boxY);
    this.ctx.lineTo(boxX + boxW, boxY);
    this.ctx.lineTo(boxX + boxW, boxY + corner);
    this.ctx.stroke();

    // Bottom-Left
    this.ctx.beginPath();
    this.ctx.moveTo(boxX, boxY + boxH - corner);
    this.ctx.lineTo(boxX, boxY + boxH);
    this.ctx.lineTo(boxX + corner, boxY + boxH);
    this.ctx.stroke();

    // Bottom-Right
    this.ctx.beginPath();
    this.ctx.moveTo(boxX + boxW - corner, boxY + boxH);
    this.ctx.lineTo(boxX + boxW, boxY + boxH);
    this.ctx.lineTo(boxX + boxW, boxY + boxH - corner);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawHandMesh(landmarks, handedness) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17]
    ];

    this.ctx.lineWidth = 2.5;
    this.ctx.strokeStyle = handedness === 'Left' ? 'rgba(6, 182, 212, 0.75)' : 'rgba(99, 102, 241, 0.75)';

    for (const [s, e] of CONNECTIONS) {
      const p1 = landmarks[s];
      const p2 = landmarks[e];
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x * w, p1.y * h);
      this.ctx.lineTo(p2.x * w, p2.y * h);
      this.ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      const x = pt.x * w;
      const y = pt.y * h;

      this.ctx.beginPath();
      const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
      this.ctx.arc(x, y, isTip ? 5 : 3.5, 0, Math.PI * 2);
      this.ctx.fillStyle = isTip ? '#f43f5e' : '#10b981';
      this.ctx.shadowColor = '#06b6d4';
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
    }

    const wrist = landmarks[0];
    this.ctx.font = '11px monospace';
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillText(handedness, wrist.x * w - 10, wrist.y * h + 15);
  }

  pauseCamera() {
    this.isPaused = true;
  }

  resumeCamera() {
    this.isPaused = false;
  }

  stopCamera() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  resetRecognition() {
    mlClassifierService.reset();
  }
}

export const visionService = new VisionService();
export default visionService;
