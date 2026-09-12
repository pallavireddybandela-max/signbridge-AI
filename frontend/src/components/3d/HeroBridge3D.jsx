import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroBridge3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x6366f1, 3.5, 12);
    blueLight.position.set(-2, 2, 2);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3.5, 12);
    cyanLight.position.set(0, 2, 2);
    scene.add(cyanLight);

    const emeraldLight = new THREE.PointLight(0x10b981, 3.5, 12);
    emeraldLight.position.set(2, 2, 2);
    scene.add(emeraldLight);

    // 3 Primary Bridge Nodes
    // Node 1 (Left: Deaf ISL User)
    const leftNodeGroup = new THREE.Group();
    leftNodeGroup.position.set(-2.2, 0.2, 0);
    scene.add(leftNodeGroup);

    const leftSphereGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const leftMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true
    });
    const leftSphere = new THREE.Mesh(leftSphereGeo, leftMat);
    leftNodeGroup.add(leftSphere);

    const leftCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x818cf8 })
    );
    leftNodeGroup.add(leftCore);

    // Node 2 (Center: SignBridge AI Core)
    const centerNodeGroup = new THREE.Group();
    centerNodeGroup.position.set(0, 0.4, 0);
    scene.add(centerNodeGroup);

    const centerGeo = new THREE.IcosahedronGeometry(0.6, 2);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerNodeGroup.add(centerMesh);

    const centerInnerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x0891b2,
        emissiveIntensity: 0.9,
        roughness: 0.2
      })
    );
    centerNodeGroup.add(centerInnerCore);

    // Node 3 (Right: Speaking Doctor / Staff)
    const rightNodeGroup = new THREE.Group();
    rightNodeGroup.position.set(2.2, 0.2, 0);
    scene.add(rightNodeGroup);

    const rightSphereGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const rightMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true
    });
    const rightSphere = new THREE.Mesh(rightSphereGeo, rightMat);
    rightNodeGroup.add(rightSphere);

    const rightCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    rightNodeGroup.add(rightCore);

    // Connecting Energy Bridges (Curved Splines)
    const curveLeft = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.2, 0.2, 0),
      new THREE.Vector3(-1.1, 1.1, 0.5),
      new THREE.Vector3(0, 0.4, 0)
    );

    const curveRight = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.4, 0),
      new THREE.Vector3(1.1, 1.1, 0.5),
      new THREE.Vector3(2.2, 0.2, 0)
    );

    const tubeGeoLeft = new THREE.TubeGeometry(curveLeft, 32, 0.025, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      transparent: true,
      opacity: 0.4
    });
    const tubeLeft = new THREE.Mesh(tubeGeoLeft, tubeMat);
    scene.add(tubeLeft);

    const tubeGeoRight = new THREE.TubeGeometry(curveRight, 32, 0.025, 8, false);
    const tubeRight = new THREE.Mesh(tubeGeoRight, tubeMat);
    scene.add(tubeRight);

    // Flowing Particles (Photons transferring data)
    const particleCount = 45;
    const particleGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const particleMatLeft = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const particleMatRight = new THREE.MeshBasicMaterial({ color: 0x34d399 });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const isRight = i % 2 === 0;
      const mesh = new THREE.Mesh(particleGeo, isRight ? particleMatRight : particleMatLeft);
      scene.add(mesh);
      particles.push({
        mesh,
        curve: isRight ? curveRight : curveLeft,
        progress: (i / particleCount),
        speed: 0.25 + Math.random() * 0.15,
        direction: Math.random() > 0.4 ? 1 : -1
      });
    }

    // Animation Loop
    let reqId;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate nodes
      leftNodeGroup.rotation.y += delta * 0.6;
      leftNodeGroup.rotation.x = Math.sin(time * 0.8) * 0.15;
      leftNodeGroup.position.y = 0.2 + Math.sin(time * 1.5) * 0.08;

      centerNodeGroup.rotation.y += delta * 0.9;
      centerNodeGroup.rotation.z += delta * 0.4;
      centerNodeGroup.position.y = 0.4 + Math.sin(time * 2) * 0.06;

      rightNodeGroup.rotation.y -= delta * 0.6;
      rightNodeGroup.rotation.x = Math.cos(time * 0.8) * 0.15;
      rightNodeGroup.position.y = 0.2 + Math.cos(time * 1.5) * 0.08;

      // Pulse center inner core
      const pulse = (Math.sin(time * 4) + 1) / 2;
      centerInnerCore.scale.setScalar(1 + pulse * 0.2);

      // Animate flowing particles along curves
      particles.forEach((p) => {
        p.progress += delta * p.speed * p.direction;
        if (p.progress > 1) p.progress = 0;
        if (p.progress < 0) p.progress = 1;
        const point = p.curve.getPoint(p.progress);
        p.mesh.position.copy(point);
      });

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    reqId = requestAnimationFrame(animate);

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
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating HTML telemetry badges over the 3D bridge nodes */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-6 pointer-events-none text-xs font-mono">
        <div className="flex flex-col items-center bg-slate-950/80 px-3 py-1.5 rounded-lg border border-indigo-500/30 backdrop-blur shadow-lg">
          <span className="text-indigo-400 font-semibold flex items-center gap-1">🤟 DEAF ISL USER</span>
          <span className="text-[10px] text-slate-400">Continuous Sign Stream</span>
        </div>

        <div className="flex flex-col items-center bg-slate-950/90 px-4 py-2 rounded-xl border border-cyan-500/40 backdrop-blur shadow-neon -translate-y-2">
          <span className="text-cyan-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            SIGNBRIDGE CORE
          </span>
          <span className="text-[10px] text-slate-300">Context • Intent • Translation</span>
        </div>

        <div className="flex flex-col items-center bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30 backdrop-blur shadow-lg">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">👤 HEARING SPEAKER</span>
          <span className="text-[10px] text-slate-400">Voice Speech & Visual UI</span>
        </div>
      </div>
    </div>
  );
}
