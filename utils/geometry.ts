import { ShapeTemplate, PARTICLE_COUNT } from '../types';
import * as THREE from 'three';

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const generateParticles = (template: ShapeTemplate): Float32Array => {
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    let x = 0, y = 0, z = 0;

    switch (template) {
      case ShapeTemplate.HEART: {
        // Parametric heart equation
        const t = random(0, Math.PI * 2);
        const r = Math.sqrt(Math.random()); // Spread fill
        // Base shape
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        // Randomize inside volume
        const scale = 0.3 * r; 
        x = hx * scale;
        y = hy * scale;
        z = random(-2, 2) * r;
        break;
      }
      case ShapeTemplate.FLOWER: {
        // Phyllotaxis
        const spread = 0.2;
        const angle = i * 137.5 * (Math.PI / 180);
        const radius = spread * Math.sqrt(i) * 0.15;
        
        // Add some depth variation based on radius to make it bowl-like
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        z = Math.sin(radius * 0.5) * 2 + random(-0.5, 0.5);
        break;
      }
      case ShapeTemplate.SATURN: {
        const isRing = Math.random() > 0.6;
        if (isRing) {
          // Ring
          const theta = random(0, Math.PI * 2);
          const r = random(6, 10);
          x = r * Math.cos(theta);
          z = r * Math.sin(theta);
          y = random(-0.2, 0.2); // Thin ring
        } else {
          // Planet body
          const r = random(0, 3.5);
          const theta = random(0, Math.PI * 2);
          const phi = random(0, Math.PI);
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }
        
        // Tilt Saturn
        const tempX = x;
        const tilt = 0.4;
        x = tempX * Math.cos(tilt) - y * Math.sin(tilt);
        y = tempX * Math.sin(tilt) + y * Math.cos(tilt);
        break;
      }
      case ShapeTemplate.FIREWORKS: {
        // Sphere explosion with trails
        const theta = random(0, Math.PI * 2);
        const phi = random(0, Math.PI);
        const r = Math.pow(Math.random(), 0.3) * 8; // Concentrate outer
        
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  return positions;
};