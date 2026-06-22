import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function BrutalShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Harsh, geometric shape like an Icosahedron, scaled down */}
      <icosahedronGeometry args={[1, 0]} />
      {/* Wireframe material for brutalist tech vibe */}
      <meshStandardMaterial 
        color="#ff0055" 
        wireframe={true} 
        wireframeLinewidth={3}
      />
      {/* Solid inner shape */}
      <mesh>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={2} color="#00e5ff" />
        <BrutalShape />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
