import { AnimationCurve } from '../types/AnimationTypes';

export const AnimationCurves = {
  linear: (t: number): number => t,
  
  easeInOut: (t: number): number => 
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
  easeOut: (t: number): number => 
    1 - Math.pow(1 - t, 3),
    
  // Specialized curve for card drawing arc
  cardArc: (t: number): number => {
    // Creates a natural arc motion
    const x = t;
    const y = Math.sin(Math.PI * t);
    return y;
  }
};

export const getAnimationCurve = (type: 'linear' | 'ease'): AnimationCurve => {
  switch (type) {
    case 'linear':
      return AnimationCurves.linear;
    case 'ease':
      return AnimationCurves.easeOut;
    default:
      return AnimationCurves.easeOut;
  }
};