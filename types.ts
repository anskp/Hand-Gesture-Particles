export enum ShapeTemplate {
  HEART = 'HEART',
  FLOWER = 'FLOWER',
  SATURN = 'SATURN',
  FIREWORKS = 'FIREWORKS'
}

export interface HandMetrics {
  isPresent: boolean;
  /** Normalized distance between hands (0 to 1) or pinch strength */
  tension: number; 
  /** Center X of interaction (-1 to 1) */
  centerX: number;
  /** Center Y of interaction (-1 to 1) */
  centerY: number;
}

export interface ParticleTheme {
  name: string;
  color: string;
  secondaryColor: string;
}

export const PARTICLE_COUNT = 8000;