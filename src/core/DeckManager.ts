import * as THREE from 'three';
import { SceneManager } from './SceneManager';
import { EventEmitter } from 'events';

export class DeckManager extends EventEmitter {
  private static instance: DeckManager;
  private deckMesh: THREE.Mesh;
  private isAnimating: boolean = false;
  private remainingCards: number = 78; // Standard tarot deck size

  private constructor() {
    super();
    // Create deck mesh with standard tarot card ratio (1:1.75)
    const cardWidth = 1;
    const cardHeight = 1.75;
    const deckDepth = 0.8; // Maintain existing depth for visual weight
    
    const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, deckDepth);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2b2b2b,
      metalness: 0.2,
      roughness: 0.8,
    });
    this.deckMesh = new THREE.Mesh(geometry, material);
    
    // Position the deck just outside the grid (grid is 10x10)
    this.deckMesh.position.set(5.5, 0.4, 5.5); // Right corner outside grid
    this.deckMesh.rotation.x = -Math.PI / 6; // Maintain slight tilt
    this.deckMesh.rotation.y = -Math.PI / 4; // Angle towards center
  }

  public static getInstance(): DeckManager {
    if (!DeckManager.instance) {
      DeckManager.instance = new DeckManager();
    }
    return DeckManager.instance;
  }

  public initialize(): void {
    const scene = SceneManager.getInstance().getScene();
    scene.add(this.deckMesh);
  }

  public async shuffle(): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const duration = 1000; // 1 second
    const startRotation = this.deckMesh.rotation.y;
    const endRotation = startRotation + Math.PI * 2;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      
      this.deckMesh.rotation.y = startRotation + (endRotation - startRotation) * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.deckMesh.rotation.y = startRotation;
        this.isAnimating = false;
        this.emit('shuffleComplete');
      }
    };

    animate();
  }

  public getDeckPosition(): THREE.Vector3 {
    return this.deckMesh.position.clone();
  }

  public getDeckRotation(): THREE.Euler {
    return this.deckMesh.rotation.clone();
  }

  public drawCard(): void {
    if (this.remainingCards > 0) {
      this.remainingCards--;
      // Adjust deck thickness based on remaining cards
      const scale = 0.3 + (this.remainingCards / 78) * 0.7;
      this.deckMesh.scale.z = scale;
      this.emit('cardDrawn', this.remainingCards);
    }
  }

  public returnCard(): void {
    if (this.remainingCards < 78) {
      this.remainingCards++;
      // Adjust deck thickness based on remaining cards
      const scale = 0.3 + (this.remainingCards / 78) * 0.7;
      this.deckMesh.scale.z = scale;
      this.emit('cardReturned', this.remainingCards);
    }
  }

  public getRemainingCards(): number {
    return this.remainingCards;
  }

  public reset(): void {
    this.remainingCards = 78;
    this.deckMesh.scale.z = 1;
    this.emit('deckReset');
  }
}