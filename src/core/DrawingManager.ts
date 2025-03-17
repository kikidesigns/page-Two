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
  private isInitialized: boolean = false;

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

  public async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeDefaultTexture();
      this.isInitialized = true;
    }
  }

  private async initializeDefaultTexture() {
    // Create a default texture with a simple pattern
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 896; // Maintain 1:1.75 ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Card front pattern
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Add some decorative elements
      ctx.fillStyle = '#4a4a4a';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('♠', canvas.width/2, canvas.height/2);
      
      // Add corners
      const cornerSize = 60;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      // Top left
      ctx.strokeRect(20, 20, cornerSize, cornerSize);
      // Top right
      ctx.strokeRect(canvas.width - 20 - cornerSize, 20, cornerSize, cornerSize);
      // Bottom left
      ctx.strokeRect(20, canvas.height - 20 - cornerSize, cornerSize, cornerSize);
      // Bottom right
      ctx.strokeRect(canvas.width - 20 - cornerSize, canvas.height - 20 - cornerSize, cornerSize, cornerSize);
    }
    
    this.defaultTexture = new THREE.CanvasTexture(canvas);
    this.defaultTexture.needsUpdate = true;
    console.log('Default texture created');
  }

  public async drawCard(position: THREE.Vector3, rotation: THREE.Euler): Promise<Card | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isAnimating || !this.defaultTexture) {
      console.error('Cannot draw card: ' + 
        (this.isAnimating ? 'Animation in progress' : 'Texture not initialized'));
      return null;
    }

    this.isAnimating = true;
    console.log('Drawing card at position:', position);

    try {
      // Create new card from deck
      const cardGeometry = new THREE.PlaneGeometry(1, 1.75); // Standard card ratio
      
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

    return new Promise((resolve) => {
      // Card drawing animation
      gsap.timeline({
        onComplete: () => {
          console.log('Card draw animation completed');
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