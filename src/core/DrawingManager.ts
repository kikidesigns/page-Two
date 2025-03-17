import * as THREE from 'three';
import { gsap } from 'gsap';
import { Card } from '../entities/Card';
import { SceneManager } from './SceneManager';
import { DeckManager } from './DeckManager';
import { EventEmitter } from 'events';

export class DrawingManager extends EventEmitter {
  private static instance: DrawingManager;
  private sceneManager: SceneManager;
  private deckManager: DeckManager;
  private drawnCards: Card[] = [];
  private isAnimating: boolean = false;

  private constructor() {
    super();
    this.sceneManager = SceneManager.getInstance();
    this.deckManager = DeckManager.getInstance();
  }

  public static getInstance(): DrawingManager {
    if (!DrawingManager.instance) {
      DrawingManager.instance = new DrawingManager();
    }
    return DrawingManager.instance;
  }

  public async drawCard(position: THREE.Vector3, rotation: THREE.Euler): Promise<Card | null> {
    if (this.isAnimating) return null;
    this.isAnimating = true;

    // Create new card from deck
    const cardGeometry = new THREE.PlaneGeometry(1, 1.75); // Standard card ratio
    const card = new Card({
      geometry: cardGeometry,
      position: this.deckManager.getDeckPosition(),
      frontTexture: await this.loadTexture('path/to/front-texture.jpg'),
      backTexture: await this.loadTexture('path/to/back-texture.jpg')
    });

    // Add to scene
    this.sceneManager.getScene().add(card.getMesh());
    this.drawnCards.push(card);

    // Animate drawing
    await this.animateCardDraw(card, position, rotation);
    
    this.isAnimating = false;
    this.emit('cardDrawn', card);
    return card;
  }

  private async animateCardDraw(card: Card, targetPos: THREE.Vector3, targetRot: THREE.Euler): Promise<void> {
    const mesh = card.getMesh();
    const startPos = mesh.position.clone();
    const midPoint = new THREE.Vector3(
      (startPos.x + targetPos.x) / 2,
      startPos.y + 2, // Arc height
      (startPos.z + targetPos.z) / 2
    );

    // Camera transition
    const camera = this.sceneManager.getCamera();
    const originalCameraPos = camera.position.clone();
    const cameraTarget = new THREE.Vector3(
      targetPos.x,
      targetPos.y + 1,
      targetPos.z + 3
    );

    return new Promise((resolve) => {
      // Card drawing animation
      gsap.timeline({
        onComplete: () => resolve()
      })
      .to(camera.position, {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
        duration: 1,
        ease: "power2.inOut"
      })
      .to(mesh.position, {
        x: midPoint.x,
        y: midPoint.y,
        z: midPoint.z,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(mesh.rotation, {
        x: Math.PI,
        duration: 0.5,
        ease: "power2.inOut"
      }, "<")
      .to(mesh.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 0.5,
        ease: "power2.in"
      })
      .to(mesh.rotation, {
        x: targetRot.x,
        y: targetRot.y,
        z: targetRot.z,
        duration: 0.3,
        ease: "power2.out"
      }, ">-0.2")
      .to(camera.position, {
        x: originalCameraPos.x,
        y: originalCameraPos.y,
        z: originalCameraPos.z,
        duration: 1,
        ease: "power2.inOut"
      });
    });
  }

  public async returnCardToDeck(card: Card): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const deckPosition = this.deckManager.getDeckPosition();
    const deckRotation = new THREE.Euler(-Math.PI / 6, -Math.PI / 4, 0);

    await this.animateCardReturn(card, deckPosition, deckRotation);
    
    // Remove card from scene and drawn cards array
    this.sceneManager.getScene().remove(card.getMesh());
    this.drawnCards = this.drawnCards.filter(c => c !== card);
    
    this.isAnimating = false;
    this.emit('cardReturned', card);
  }

  private async animateCardReturn(card: Card, targetPos: THREE.Vector3, targetRot: THREE.Euler): Promise<void> {
    const mesh = card.getMesh();
    const startPos = mesh.position.clone();
    const midPoint = new THREE.Vector3(
      (startPos.x + targetPos.x) / 2,
      startPos.y + 2,
      (startPos.z + targetPos.z) / 2
    );

    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: () => resolve()
      })
      .to(mesh.position, {
        x: midPoint.x,
        y: midPoint.y,
        z: midPoint.z,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(mesh.rotation, {
        x: Math.PI,
        duration: 0.5,
        ease: "power2.inOut"
      }, "<")
      .to(mesh.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 0.5,
        ease: "power2.in"
      })
      .to(mesh.rotation, {
        x: targetRot.x,
        y: targetRot.y,
        z: targetRot.z,
        duration: 0.3,
        ease: "power2.out"
      }, ">-0.2");
    });
  }

  private async loadTexture(path: string): Promise<THREE.Texture> {
    return new Promise((resolve) => {
      new THREE.TextureLoader().load(path, (texture) => {
        resolve(texture);
      });
    });
  }

  public getDrawnCards(): Card[] {
    return [...this.drawnCards];
  }
}