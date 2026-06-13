import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BackgroundParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 260;

    const group = new THREE.Group();
    scene.add(group);

    const count = 110;
    const pts = [];
    const positions = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 620;
      const y = (Math.random() - 0.5) * 620;
      const z = (Math.random() - 0.5) * 420;
      pts.push(new THREE.Vector3(x, y, z));
      positions.push(x, y, z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x4ade80, size: 2.6, transparent: true, opacity: 0.85 });
    const pointsMesh = new THREE.Points(geo, mat);
    group.add(pointsMesh);

    const linePositions = [];
    const maxDist = 130;
    for (let a = 0; a < pts.length; a++) {
      for (let b = a + 1; b < pts.length; b++) {
        if (pts[a].distanceTo(pts[b]) < maxDist) {
          linePositions.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.25 });
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lineMesh);

    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      group.rotation.y += 0.0007;
      group.rotation.x += 0.00025;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      // Cleanup
      geo.dispose();
      mat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-20 pointer-events-none" 
      style={{ filter: 'blur(0.4px)' }} 
    />
  );
}
