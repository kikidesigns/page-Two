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
  private defaultTexture: THREE.Texture | null = null;

  private constructor() {
    super();
    this.sceneManager = SceneManager.getInstance();
    this.deckManager = DeckManager.getInstance();
    this.initializeDefaultTexture();
  }

  private async initializeDefaultTexture() {
    // Create a default texture with a simple pattern
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 896; // Maintain 1:1.75 ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Card back pattern
      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#3b3b3b';
      ctx.lineWidth = 2;
      
      // Create a decorative pattern
      for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
          ctx.strokeRect(i, j, 40, 40);
          ctx.beginPath();
          ctx.arc(i + 20, j + 20, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Add border
      ctx.strokeStyle = '#4b4b4b';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    }
    
    this.defaultTexture = new THREE.CanvasTexture(canvas);
    this.defaultTexture.needsUpdate = true;
    console.log('Default texture created');
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

    console.log('Drawing card at position:', position);

    try {
      // Create new card from deck
      const cardGeometry = new THREE.PlaneGeometry(1, 1.75); // Standard card ratio
      
      if (!this.defaultTexture) {
        console.error('Default texture not initialized');
        return null;
      }

      const card = new Card({
        geometry: cardGeometry,
        position: this.deckManager.getDeckPosition(),
        frontTexture: this.defaultTexture,
        backTexture: this.defaultTexture
      });

      const cardMesh = card.getMesh();
      console.log('Card mesh created:', cardMesh);

      // Add to scene
      this.sceneManager.getScene().add(cardMesh);
      this.drawnCards.push(card);
      console.log('Card added to scene, total drawn cards:', this.drawnCards.length);

      // Animate drawing
      await this.animateCardDraw(card, position, rotation);
      
      this.isAnimating = false;
      this.emit('cardDrawn', card);
      return card;
    } catch (error) {
      console.error('Error drawing card:', error);
      this.isAnimating = false;
      return null;
    }
  }

  private async animateCardDraw(card: Card, targetPos: THREE.Vector3, targetRot: THREE.Euler): Promise<void> {
    const mesh = card.getMesh();
    const startPos = mesh.position.clone();
    const midPoint = new THREE.Vector3(
      (startPos.x + targetPos.x) / 2,
      startPos.y + 2, // Arc height
      (startPos.z + targetPos.z) / 2
    );

    console.log('Starting card draw animation from:', startPos, 'to:', targetPos);

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
        onComplete: () => {
          console.log('Card draw animation completed');
          resolve();
        }
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

    console.log('Returning card to deck');

    const deckPosition = this.deckManager.getDeckPosition();
    const deckRotation = new THREE.Euler(-Math.PI / 6, -Math.PI / 4, 0);

    await this.animateCardReturn(card, deckPosition, deckRotation);
    
    // Remove card from scene and drawn cards array
    const mesh = card.getMesh();
    this.sceneManager.getScene().remove(mesh);
    this.drawnCards = this.drawnCards.filter(c => c !== card);
    
    this.isAnimating = false;
    this.emit('cardReturned', card);
    console.log('Card returned to deck, remaining drawn cards:', this.drawnCards.length);
  }

  private async animateCardReturn(card: Card, targetPos: THREE.Vector3, targetRot: THREE.Euler): Promise<void> {
    const mesh = card.getMesh();
    const startPos = mesh.position.clone();
    const midPoint = new THREE.Vector3(
      (startPos.x + targetPos.x) / 2,
      startPos.y + 2,
      (startPos.z + targetPos.z) / 2
    );

    console.log('Starting card return animation');

    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: () => {
          console.log('Card return animation completed');
          resolve();
        }
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

  public getDrawnCards(): Card[] {
    return [...this.drawnCards];
  }
}