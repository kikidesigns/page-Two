import * as THREE from 'three';
import { SceneManager } from './SceneManager';

export class DeckManager {
  private static instance: DeckManager;
  private deckMesh: THREE.Mesh;
  private isAnimating: boolean = false;

  private constructor() {
    // Create deck mesh (3:5 ratio, thin depth)
    const geometry = new THREE.BoxGeometry(3, 5, 0.8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2b2b2b,
      metalness: 0.2,
      roughness: 0.8,
    });
    this.deckMesh = new THREE.Mesh(geometry, material);
    
    // Position the deck
    this.deckMesh.position.y = 0.4; // Slight elevation
    this.deckMesh.rotation.x = -Math.PI / 6; // Slight tilt
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