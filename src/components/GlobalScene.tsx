import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MathUtils, Group } from 'three';

function AnimatedAbstractObject() {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollAmount = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const progress = Math.max(0, Math.min(1, scrollAmount));

    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let targetScale = 1;

    if (progress < 0.2) {
      // Hero
      targetX = 3.5;
      targetY = -1.5;
      targetZ = -1;
      targetScale = 0.75;
    } else if (progress < 0.4) {
      // Marquee
      targetX = 4.5;
      targetY = 2;
      targetZ = -1;
      targetScale = 0.45;
    } else if (progress < 0.7) {
      // About
      targetX = -4.5;
      targetY = 1.5;
      targetZ = -1;
      targetScale = 0.45;
    } else if (progress < 0.85) {
      // Projects
      targetX = 4;
      targetY = 1.5;
      targetZ = -1;
      targetScale = 0.5;
    } else {
      // Contact
      targetX = -3.5;
      targetY = -1;
      targetZ = -1;
      targetScale = 0.6;
    }

    groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, targetX, 0.04);
    groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, targetY, 0.04);
    groupRef.current.position.z = MathUtils.lerp(groupRef.current.position.z, targetZ, 0.04);

    const currentScale = groupRef.current.scale.x;
    const newScale = MathUtils.lerp(currentScale, targetScale, 0.04);
    groupRef.current.scale.setScalar(newScale);

    groupRef.current.rotation.x += delta * 0.3;
    groupRef.current.rotation.y += delta * 0.5;
    groupRef.current.rotation.z += delta * 0.1;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <torusKnotGeometry args={[1, 0.22, 160, 32, 3, 2]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.1}
          metalness={0.95}
          envMapIntensity={1}
        />
      </mesh>
      {/* Accent ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.04, 16, 80]} />
        <meshStandardMaterial color="#ff2d55" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

export default function GlobalScene() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={4} color="#ffffff" />
        <directionalLight position={[-6, -4, -4]} intensity={2} color="#ff2d55" />
        <pointLight position={[0, 4, 2]} intensity={2} color="#00d4ff" />
        <AnimatedAbstractObject />
      </Canvas>
    </div>
  );
}
