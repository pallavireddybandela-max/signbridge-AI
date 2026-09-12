import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Eye, Sparkles, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getAvatarAnimation, AVATAR_ANIMATIONS } from '../../data/avatarAnimations';
import { soundFX } from '../../services/soundFx';

export default function SignAvatarCanvas({
  activeSignConcept = 'CHEST_PAIN',
  selectedMode = 'hospital',
  isPlaying = true,
  onTriggerSign = null
}) {
  const mountRef = useRef(null);
  const [speed, setSpeed] = useState(1.0);
  const [paused, setPaused] = useState(!isPlaying);
  const [cameraView, setCameraView] = useState('front');

  // Lookup animation metadata
  const animMeta = getAvatarAnimation(activeSignConcept);
  const isSupported = Boolean(animMeta && animMeta.supported);
  const currentLabel = animMeta ? animMeta.label : (activeSignConcept || 'Idle');

  // Three.js instances ref
  const engineRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    parts: {},
    auraLight: null,
    animTime: 0,
    currentSign: activeSignConcept || 'CHEST_PAIN',
    speed: 1.0,
    paused: false,
    reqId: null,
    targetCamPos: new THREE.Vector3(0, 1.4, 3.2),
    targetLookAt: new THREE.Vector3(0, 1.1, 0)
  });

  useEffect(() => {
    engineRef.current.speed = speed;
  }, [speed]);

  useEffect(() => {
    engineRef.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    const signKey = activeSignConcept || 'CHEST_PAIN';
    engineRef.current.currentSign = signKey;
    engineRef.current.animTime = 0;
    setPaused(false);

    // Dynamic aura lighting based on mode & concept
    if (engineRef.current.auraLight) {
      if (signKey.includes('CHEST') || signKey.includes('BLEED') || signKey.includes('BREATH')) {
        engineRef.current.auraLight.color.setHex(0xf43f5e); // Rose red
      } else if (selectedMode === 'hospital') {
        engineRef.current.auraLight.color.setHex(0x06b6d4); // Cyan
      } else if (selectedMode === 'college') {
        engineRef.current.auraLight.color.setHex(0x818cf8); // Indigo
      } else {
        engineRef.current.auraLight.color.setHex(0xf59e0b); // Amber
      }
    }
  }, [activeSignConcept, selectedMode]);

  const switchCameraView = (view) => {
    soundFX.playClick();
    setCameraView(view);
    if (view === 'hands') {
      engineRef.current.targetCamPos.set(0, 1.05, 1.7);
      engineRef.current.targetLookAt.set(0, 0.95, 0);
    } else if (view === 'side') {
      engineRef.current.targetCamPos.set(2.3, 1.3, 2.2);
      engineRef.current.targetLookAt.set(0, 1.05, 0);
    } else {
      engineRef.current.targetCamPos.set(0, 1.4, 3.2);
      engineRef.current.targetLookAt.set(0, 1.1, 0);
    }
  };

  const handleManualPose = (signKey) => {
    soundFX.playRecognize();
    engineRef.current.currentSign = signKey;
    engineRef.current.animTime = 0;
    setPaused(false);
    if (onTriggerSign) {
      onTriggerSign(signKey);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 400;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x6366f1, 2.8);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 2.4);
    rimLight.position.set(-2.5, 2, -2);
    scene.add(rimLight);

    const auraLight = new THREE.PointLight(0x06b6d4, 3.5, 6);
    auraLight.position.set(0, 1.2, -0.8);
    scene.add(auraLight);
    engineRef.current.auraLight = auraLight;

    // Grid Floor
    const grid = new THREE.GridHelper(10, 24, 0x6366f1, 0x1e293b);
    grid.position.y = -0.5;
    scene.add(grid);

    // 3. Build Stylized 3D Humanoid Sign Avatar
    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = 0.2;
    scene.add(avatarGroup);

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xa5b4fc,
      roughness: 0.3,
      metalness: 0.2
    });

    const cyberSuitMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.3
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    const parts = {};

    // Torso & Chest
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.72, 18);
    const torso = new THREE.Mesh(torsoGeo, cyberSuitMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    avatarGroup.add(torso);
    parts.torso = torso;

    // Chest Core Indicator
    const coreGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const chestCore = new THREE.Mesh(coreGeo, glowMat);
    chestCore.position.set(0, 0.8, 0.22);
    avatarGroup.add(chestCore);
    parts.chestCore = chestCore;

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.14, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.05;
    avatarGroup.add(neck);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.24, 0);
    avatarGroup.add(headGroup);
    parts.head = headGroup;

    const headGeo = new THREE.SphereGeometry(0.19, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.scale.set(1, 1.15, 1.05);
    headGroup.add(headMesh);

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.18);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.95
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.04, 0.12);
    headGroup.add(visor);

    // Right Arm Hierarchy
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.38, 0.92, 0);
    avatarGroup.add(rightShoulder);
    parts.rightShoulder = rightShoulder;

    const rightUpperArmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.32, 12);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, cyberSuitMat);
    rightUpperArm.position.y = -0.16;
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.32, 0);
    rightShoulder.add(rightElbow);
    parts.rightElbow = rightElbow;

    const rightForearmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.3, 12);
    const rightForearm = new THREE.Mesh(rightForearmGeo, skinMat);
    rightForearm.position.y = -0.15;
    rightElbow.add(rightForearm);

    const rightHand = new THREE.Group();
    rightHand.position.set(0, -0.3, 0);
    rightElbow.add(rightHand);
    parts.rightHand = rightHand;

    const handGeo = new THREE.BoxGeometry(0.09, 0.13, 0.04);
    const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
    rightHandMesh.position.y = -0.065;
    rightHand.add(rightHandMesh);

    // Left Arm Hierarchy
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.38, 0.92, 0);
    avatarGroup.add(leftShoulder);
    parts.leftShoulder = leftShoulder;

    const leftUpperArmGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.32, 12);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, cyberSuitMat);
    leftUpperArm.position.y = -0.16;
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.32, 0);
    leftShoulder.add(leftElbow);
    parts.leftElbow = leftElbow;

    const leftForearmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.3, 12);
    const leftForearm = new THREE.Mesh(leftForearmGeo, skinMat);
    leftForearm.position.y = -0.15;
    leftElbow.add(leftForearm);

    const leftHand = new THREE.Group();
    leftHand.position.set(0, -0.3, 0);
    leftElbow.add(leftHand);
    parts.leftHand = leftHand;

    const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
    leftHandMesh.position.y = -0.065;
    leftHand.add(leftHandMesh);

    engineRef.current.scene = scene;
    engineRef.current.camera = camera;
    engineRef.current.renderer = renderer;
    engineRef.current.parts = parts;

    // Mouse drag rotation
    let isDragging = false;
    let prevMouseX = 0;
    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const delta = e.clientX - prevMouseX;
      avatarGroup.rotation.y += delta * 0.01;
      prevMouseX = e.clientX;
    };
    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 4. Animation Loop with Camera Interpolation
    let lastTimestamp = performance.now();

    const animate = (now) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (!engineRef.current.paused) {
        engineRef.current.animTime += dt * engineRef.current.speed;
      }

      const t = engineRef.current.animTime;
      const sign = (engineRef.current.currentSign || '').toUpperCase();
      const p = engineRef.current.parts;

      camera.position.lerp(engineRef.current.targetCamPos, 0.06);
      camera.lookAt(engineRef.current.targetLookAt);

      if (p.torso) {
        const breath = Math.sin(t * 2) * 0.02;
        p.torso.position.y = 0.65 + breath;
        if (p.head) {
          p.head.position.y = 1.24 + breath;
          p.head.rotation.y = Math.sin(t * 0.5) * 0.05;
        }

        if (p.chestCore) {
          const pulse = (Math.sin(t * 4) + 1) / 2;
          p.chestCore.scale.setScalar(1 + pulse * 0.3);
        }

        // PROCEDURAL ANIMATIONS FOR ALL ISL GESTURES
        if (sign.includes('CHEST')) {
          p.rightShoulder.rotation.x = -1.2 + Math.sin(t * 5) * 0.06;
          p.rightShoulder.rotation.z = -0.55;
          p.rightElbow.rotation.x = -1.45;
          p.rightElbow.rotation.y = -0.4;
          p.rightHand.rotation.z = 0.5;

          p.leftShoulder.rotation.x = -0.3;
          p.leftShoulder.rotation.z = 0.3;
          p.leftElbow.rotation.x = -0.6;
          p.head.rotation.x = 0.2 + Math.sin(t * 4) * 0.05;
        } else if (sign.includes('SIT')) {
          const wave = (Math.sin(t * 2.5) + 1) / 2;
          p.rightShoulder.rotation.x = -0.7 - wave * 0.35;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -0.4 - wave * 0.5;

          p.leftShoulder.rotation.x = -0.7 - wave * 0.35;
          p.leftShoulder.rotation.z = 0.2;
          p.leftElbow.rotation.x = -0.4 - wave * 0.5;
          p.head.rotation.x = 0.15;
        } else if (sign.includes('HELP')) {
          const lift = Math.sin(t * 3) * 0.15;
          p.leftShoulder.rotation.x = -0.85;
          p.leftShoulder.rotation.z = 0.35;
          p.leftElbow.rotation.x = -1.1;

          p.rightShoulder.rotation.x = -0.85;
          p.rightShoulder.rotation.z = -0.35;
          p.rightElbow.rotation.x = -1.15;

          p.leftShoulder.position.y = 0.92 + lift;
          p.rightShoulder.position.y = 0.92 + lift;
        } else if (sign.includes('THANK')) {
          const cycle = (Math.sin(t * 3) + 1) / 2;
          p.rightShoulder.rotation.x = -1.35 + cycle * 0.7;
          p.rightShoulder.rotation.z = -0.25;
          p.rightElbow.rotation.x = -1.6 + cycle * 0.9;

          p.leftShoulder.rotation.x = -0.1;
          p.leftShoulder.rotation.z = 0.2;
          p.leftElbow.rotation.x = -0.2;
        } else if (sign.includes('HELLO') || sign.includes('GREET')) {
          const nod = Math.sin(t * 3) * 0.08;
          p.head.rotation.x = 0.1 + nod;

          // Namaste joined hands pose
          p.rightShoulder.rotation.x = -1.1;
          p.rightShoulder.rotation.z = -0.45;
          p.rightElbow.rotation.x = -1.5;
          p.rightElbow.rotation.y = -0.35;

          p.leftShoulder.rotation.x = -1.1;
          p.leftShoulder.rotation.z = 0.45;
          p.leftElbow.rotation.x = -1.5;
          p.leftElbow.rotation.y = 0.35;
        } else if (sign.includes('WATER') || sign.includes('DRINK')) {
          const sip = (Math.sin(t * 4) + 1) / 2;
          p.rightShoulder.rotation.x = -1.4 + sip * 0.2;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.7 + sip * 0.3;
          p.head.rotation.x = -0.15 + sip * 0.1;
        } else if (sign.includes('EAT') || sign.includes('FOOD')) {
          const chew = Math.sin(t * 6) * 0.15;
          p.rightShoulder.rotation.x = -1.45 + chew;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.8;
          p.leftShoulder.rotation.x = -0.2;
          p.leftShoulder.rotation.z = 0.2;
        } else if (sign.includes('YES') || sign.includes('AGREE')) {
          const nod = Math.sin(t * 5) * 0.2;
          p.head.rotation.x = nod;
          p.rightShoulder.rotation.x = -0.8 + nod * 0.5;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.2;
        } else if (sign.includes('NO') || sign.includes('DISAGREE')) {
          const shake = Math.sin(t * 6) * 0.25;
          p.head.rotation.y = shake;
          p.rightShoulder.rotation.x = -1.0;
          p.rightShoulder.rotation.z = -0.3 + shake * 0.3;
          p.rightElbow.rotation.x = -1.2;
        } else if (sign.includes('GOOD') || sign.includes('LIKE') || sign.includes('FINE')) {
          p.head.rotation.x = Math.sin(t * 3) * 0.1;
          p.rightShoulder.rotation.x = -0.9;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -0.6;
          p.leftShoulder.rotation.x = -0.2;
        } else if (sign.includes('BAD')) {
          p.head.rotation.y = Math.sin(t * 4) * 0.15;
          p.rightShoulder.rotation.x = -0.6;
          p.rightShoulder.rotation.z = -0.3;
          p.rightElbow.rotation.x = -0.3;
          p.rightHand.rotation.z = 3.14; // Thumbs down
        } else if (sign.includes('SLEEP') || sign.includes('TIRED')) {
          p.head.rotation.z = 0.3;
          p.head.rotation.x = 0.15;
          p.rightShoulder.rotation.x = -1.4;
          p.rightShoulder.rotation.z = -0.3;
          p.rightElbow.rotation.x = -1.9;
        } else if (sign.includes('HEADACHE')) {
          const pulse = Math.sin(t * 5) * 0.08;
          p.rightShoulder.rotation.x = -1.5 + pulse;
          p.rightShoulder.rotation.z = -0.3;
          p.rightElbow.rotation.x = -1.8;

          p.leftShoulder.rotation.x = -1.5 + pulse;
          p.leftShoulder.rotation.z = 0.3;
          p.leftElbow.rotation.x = -1.8;
          p.head.rotation.x = 0.2;
        } else if (sign.includes('MEDICINE') || sign.includes('TABLET')) {
          const pill = (Math.sin(t * 3.5) + 1) / 2;
          p.leftShoulder.rotation.x = -0.7;
          p.leftShoulder.rotation.z = 0.3;
          p.leftElbow.rotation.x = -1.1;

          p.rightShoulder.rotation.x = -0.8 - pill * 0.6;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.2 - pill * 0.5;
        } else if (sign.includes('WASHROOM') || sign.includes('TOILET')) {
          const wag = Math.sin(t * 6) * 0.2;
          p.rightShoulder.rotation.x = -1.2;
          p.rightShoulder.rotation.z = -0.2 + wag;
          p.rightElbow.rotation.x = -1.3;
        } else if (sign.includes('PLEASE')) {
          const rub = Math.sin(t * 4) * 0.15;
          const rubY = Math.cos(t * 4) * 0.1;
          p.rightShoulder.rotation.x = -1.1 + rub;
          p.rightShoulder.rotation.z = -0.4 + rubY;
          p.rightElbow.rotation.x = -1.5;
          p.head.rotation.x = 0.15;
        } else if (sign.includes('FEVER')) {
          p.rightShoulder.rotation.x = -1.55;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.95;
          p.rightHand.rotation.x = 0.8;
        } else if (sign.includes('BREATH')) {
          const gasp = Math.sin(t * 4) * 0.08;
          p.rightShoulder.rotation.x = -1.3 + gasp;
          p.rightShoulder.rotation.z = -0.3;
          p.rightElbow.rotation.x = -1.7;

          p.leftShoulder.rotation.x = -1.3 + gasp;
          p.leftShoulder.rotation.z = 0.3;
          p.leftElbow.rotation.x = -1.7;
          p.head.rotation.x = -0.2;
        } else if (sign.includes('CALL') || sign.includes('PHONE')) {
          p.rightShoulder.rotation.x = -1.5;
          p.rightShoulder.rotation.z = -0.25;
          p.rightElbow.rotation.x = -1.9;
          p.head.rotation.z = -0.15;
        } else if (sign.includes('WRITE')) {
          const scribble = Math.sin(t * 8) * 0.08;
          p.leftShoulder.rotation.x = -0.7;
          p.leftShoulder.rotation.z = 0.3;
          p.leftElbow.rotation.x = -1.1;

          p.rightShoulder.rotation.x = -0.75 + scribble;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.2 + scribble;
        } else if (sign.includes('BOOK')) {
          const open = (Math.sin(t * 3) + 1) / 2;
          p.leftShoulder.rotation.x = -0.9;
          p.leftShoulder.rotation.z = 0.2 + open * 0.3;
          p.leftElbow.rotation.x = -1.3;

          p.rightShoulder.rotation.x = -0.9;
          p.rightShoulder.rotation.z = -0.2 - open * 0.3;
          p.rightElbow.rotation.x = -1.3;
        } else if (sign.includes('DOCTOR')) {
          p.leftShoulder.rotation.x = -0.8;
          p.leftShoulder.rotation.z = 0.4;
          p.leftElbow.rotation.x = -1.2;

          const tap = Math.sin(t * 6) * 0.1;
          p.rightShoulder.rotation.x = -0.8 + tap;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.3;
        } else if (sign.includes('QUESTION')) {
          p.rightShoulder.rotation.x = -1.4;
          p.rightShoulder.rotation.z = -0.2;
          p.rightElbow.rotation.x = -1.6;
          p.leftShoulder.rotation.x = -0.5;
          p.leftShoulder.rotation.z = 0.3;
          p.leftElbow.rotation.x = -0.6;
          p.head.rotation.y = Math.sin(t * 2) * 0.1;
        } else if (sign.includes('STOP')) {
          p.rightShoulder.rotation.x = -1.2;
          p.rightShoulder.rotation.z = -0.15;
          p.rightElbow.rotation.x = -0.5;
        } else if (sign.length === 1 || sign.match(/^[A-Z0-9]$/)) {
          // Dynamic Alphabet / Number Fingerspelling Presentation Pose
          const bob = Math.sin(t * 2) * 0.03;
          p.rightShoulder.rotation.x = -1.1 + bob;
          p.rightShoulder.rotation.z = -0.25;
          p.rightElbow.rotation.x = -1.3;
          p.rightElbow.rotation.y = -0.15;
          p.rightHand.rotation.z = 0.2;

          p.leftShoulder.rotation.x = -0.2;
          p.leftShoulder.rotation.z = 0.2;
          p.leftElbow.rotation.x = -0.3;
          p.head.rotation.x = 0.05;
        } else {
          // Neutral expressive sign presentation pose
          p.rightShoulder.rotation.x = -0.8 + Math.sin(t * 2) * 0.1;
          p.rightShoulder.rotation.z = -0.25;
          p.rightElbow.rotation.x = -1.0 + Math.sin(t * 2) * 0.1;

          p.leftShoulder.rotation.x = -0.3 + Math.cos(t * 2) * 0.05;
          p.leftShoulder.rotation.z = 0.2;
          p.leftElbow.rotation.x = -0.5;
        }
      }

      renderer.render(scene, camera);
      engineRef.current.reqId = requestAnimationFrame(animate);
    };

    engineRef.current.reqId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(engineRef.current.reqId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative flex flex-col h-full w-full select-none">
      {/* Top 3D Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </span>
          <div>
            <h3 className="font-display font-bold text-xs text-slate-100 flex items-center gap-1.5 uppercase">
              3D SIGN AVATAR
              {isSupported ? (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Demo animation
                </span>
              ) : (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Neutral Fallback
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Concept: <strong className="text-cyan-400">{currentLabel}</strong>
            </p>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {[0.5, 1.0, 1.5].map((spd) => (
            <button
              key={spd}
              onClick={() => {
                soundFX.playClick();
                setSpeed(spd);
              }}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded-lg transition-all ${
                speed === spd
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="relative flex-1 w-full min-h-[320px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl"
      >
        {/* Camera View Switcher */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-950/85 backdrop-blur px-2 py-1 rounded-xl border border-slate-800">
          {[
            { id: 'front', label: 'Front' },
            { id: 'hands', label: 'Hands Zoom' },
            { id: 'side', label: 'Side' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => switchCameraView(v.id)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-all ${
                cameraView === v.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Orbit drag cue */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-lg backdrop-blur border border-slate-800/60">
          <Eye className="w-3 h-3 text-cyan-400" /> Orbit 3D Avatar
        </div>

        {/* Unsupported Concept Graceful Notice */}
        {!isSupported && (
          <div className="absolute inset-x-4 top-12 z-20 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-200 backdrop-blur flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Avatar animation unavailable for this specific concept. Demonstrating neutral idle baseline.</span>
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/85 p-1.5 px-3 rounded-xl backdrop-blur border border-slate-800/80">
          <span>Kinetic ISL Upper Torso & Hand Rig</span>
          <span className="text-cyan-400">Mode: {selectedMode}</span>
        </div>
      </div>

      {/* Mode-Specific Supported Animations Selector */}
      <div className="mt-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-slate-400">
          <span>Supported {selectedMode} Animations:</span>
          <span className="text-[10px] text-slate-500">Controlled ISL MVP</span>
        </div>

        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
          {Object.values(AVATAR_ANIMATIONS)
            .filter((a) => a.modes.includes(selectedMode))
            .slice(0, 8)
            .map((anim) => (
              <button
                key={anim.id}
                onClick={() => handleManualPose(anim.id)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-display font-semibold transition-all ${
                  activeSignConcept === anim.id
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {anim.label}
              </button>
            ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.playClick();
              setPaused(!paused);
            }}
            className="glass-button text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
          >
            {paused ? <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            <span>{paused ? 'Play' : 'Pause'}</span>
          </button>

          <button
            onClick={() => {
              soundFX.playRecognize();
              engineRef.current.animTime = 0;
              setPaused(false);
            }}
            className="glass-button text-xs py-1.5 px-3 flex items-center gap-1 text-slate-300"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>Replay</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          Procedural ISL Demo
        </div>
      </div>
    </div>
  );
}
