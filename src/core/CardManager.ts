import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { Card } from '../entities/Card';
import { SpreadLayout } from '../types/SpreadLayout';

export class CardManager {
  private cards: Card[] = [];
  private scene: THREE.Scene;
  private textureLoader: THREE.TextureLoader;
  private currentSpread: SpreadLayout | null = null;

  constructor() {
    this.scene = SceneManager.getInstance().getScene();
    this.textureLoader = new THREE.TextureLoader();
  }

  public initialize(): void {
    console.log('CardManager: Initializing...');
    // We don't create a deck here anymore since DeckManager handles that
  }

  public update(): void {
    // GSAP handles animations, no need for updates
  }

  public setSpread(spread: SpreadLayout): void {
    console.log('CardManager: Setting spread:', spread.name);
    this.currentSpread = spread;
  }

  public getSpreadPosition(index: number): THREE.Vector3 | null {
    if (!this.currentSpread || index >= this.currentSpread.positions.length) {
      return null;
    }
    const position = this.currentSpread.positions[index].position;
    return new THREE.Vector3(position.x, position.y, position.z);
  }

  public getSpreadRotation(index: number): THREE.Euler | null {
    if (!this.currentSpread || index >= this.currentSpread.positions.length) {
      return null;
    }
    const rotation = this.currentSpread.positions[index].rotation;
    return new THREE.Euler(rotation.x, rotation.y, rotation.z);
  }

  public getCurrentSpread(): SpreadLayout | null {
    return this.currentSpread;
  }

  public dispose(): void {
    // Clean up resources
    this.cards.forEach(card => {
      card.dispose();
      this.scene.remove(card.getMesh());
    });
    this.cards = [];
  }
}