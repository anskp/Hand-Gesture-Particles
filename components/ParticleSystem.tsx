import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeTemplate, HandMetrics, PARTICLE_COUNT } from '../types';
import { generateParticles } from '../utils/geometry';

interface ParticleSystemProps {
  template: ShapeTemplate;
  color: string;
  handMetrics: React.MutableRefObject<HandMetrics>;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ template, color, handMetrics }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Store target positions for morphing
  const targetPositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Initialize positions
  const initialPositions = useMemo(() => generateParticles(template), []);

  useEffect(() => {
    // When template changes, update target positions
    const newPositions = generateParticles(template);
    targetPositionsRef.current.set(newPositions);
  }, [template]);

  useFrame((state) => {
    if (!pointsRef.current || !geometryRef.current) return;

    const { isPresent, tension, centerX, centerY } = handMetrics.current;
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const target = targetPositionsRef.current;
    const time = state.clock.getElapsedTime();

    // Lerp factor - speed of morphing
    const lerpSpeed = 0.05;
    
    // Interaction factors
    // If hands are present, expand based on tension. If not, breathe automatically.
    const expansionFactor = isPresent ? 1 + tension * 2.0 : 1 + Math.sin(time * 0.5) * 0.2;
    
    // Rotation based on time + hand X influence
    pointsRef.current.rotation.y += 0.002 + (centerX * 0.05);
    pointsRef.current.rotation.x = centerY * 0.5;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Get base target coordinates
      const tx = target[i3];
      const ty = target[i3 + 1];
      const tz = target[i3 + 2];

      // Current coordinates
      let cx = positions[i3];
      let cy = positions[i3 + 1];
      let cz = positions[i3 + 2];

      // 1. Morphing: Move current towards target (base shape)
      cx += (tx - cx) * lerpSpeed;
      cy += (ty - cy) * lerpSpeed;
      cz += (tz - cz) * lerpSpeed;

      // 2. Interactive Expansion/Noise applied to the VIEW, not the base state
      // We calculate the render position, but we store the 'morphing' position state
      // Actually, to make it stable, we should apply expansion during the draw or update relative to center
      // Let's modify the positions array directly for the effect
      
      // To allow "return to shape", we always lerp towards the *unexpanded* target, 
      // then apply expansion conceptually. 
      // However, modifying the buffer directly is easier for CPU side simple effects.
      
      // Let's implement a simple "Explode/Expand" effect by scaling the distance from center
      // But we need to keep the shape.
      
      // Calculate intended display position
      const displayX = cx * expansionFactor;
      const displayY = cy * expansionFactor;
      const displayZ = cz * expansionFactor;
      
      // Add some noise/turbulence if tension is high
      const noise = isPresent && tension > 0.8 ? (Math.random() - 0.5) * 0.2 : 0;
      
      // We write back to the buffer the "base" morph state? No, that would lose the expansion
      // Strategy: 
      // `positions` array holds the VISIBLE state. 
      // `target` array holds the IDEAL SHAPE state.
      // Every frame: move `positions` towards `target * expansionFactor`
      
      const destX = tx * expansionFactor + noise;
      const destY = ty * expansionFactor + noise;
      const destZ = tz * expansionFactor + noise;
      
      positions[i3] += (destX - positions[i3]) * 0.1; // Smooth catchup
      positions[i3 + 1] += (destY - positions[i3 + 1]) * 0.1;
      positions[i3 + 2] += (destZ - positions[i3 + 2]) * 0.1;
    }

    geometryRef.current.attributes.position.needsUpdate = true;
    
    // Color update (simple prop update)
    if (pointsRef.current.material instanceof THREE.PointsMaterial) {
      pointsRef.current.material.color.set(color);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleSystem;