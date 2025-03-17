import * as THREE from 'three';
import { SceneManager } from './SceneManager';

export class DeckManager {
  private static instance: DeckManager;
  private deckMesh: THREE.Mesh;
  private isAnimating: boolean = false;

  private constructor() {
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
      }
    };

    animate();
  }
}