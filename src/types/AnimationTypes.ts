import { Vector3, Euler } from 'three';

export type AnimationCurve = (t: number) => number;

export interface DrawConfig {
  duration: number;
  curve: 'linear' | 'ease';
  height: number;
}

export interface CardAnimation {
  start: Vector3;
  end: Vector3;
  rotation: Euler;
  duration: number;
  curve: AnimationCurve;
}

export interface AnimationState {
  isAnimating: boolean;
  startTime: number;
  animation?: CardAnimation;
}