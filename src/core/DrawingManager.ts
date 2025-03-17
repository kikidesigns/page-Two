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
    console.log('DrawingManager: Initializing...');
    if (!this.isInitialized) {
      await this.initializeDefaultTexture();
      this.isInitialized = true;
      console.log('DrawingManager: Initialization complete');
    }
  }

  private async initializeDefaultTexture() {
    console.log('DrawingManager: Creating default texture...');
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 896;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context');
      return;
    }

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    this.defaultTexture = new THREE.CanvasTexture(canvas);
    this.defaultTexture.needsUpdate = true;
    console.log('DrawingManager: Default texture created');
  }

  public async drawCard(position: THREE.Vector3, rotation: THREE.Euler): Promise<Card | null> {
    console.log('DrawingManager: Drawing card...');
    console.log('Position:', position);
    console.log('Rotation:', rotation);

    if (!this.isInitialized) {
      console.log('DrawingManager: Not initialized, initializing now...');
      await this.initialize();
    }

    if (this.isAnimating) {
      console.warn('DrawingManager: Animation in progress, skipping draw');
      return null;
    }

    if (!this.defaultTexture) {
      console.error('DrawingManager: No texture available');
      return null;
    }

    this.isAnimating = true;

    try {
      console.log('DrawingManager: Creating card geometry...');
      const cardGeometry = new THREE.PlaneGeometry(1, 1.75);
      
      // Create card at deck position first
      const deckPosition = this.deckManager.getDeckPosition();
      console.log('DrawingManager: Deck position:', deckPosition);

      console.log('DrawingManager: Creating card instance...');
      const card = new Card({
        geometry: cardGeometry,
        position: deckPosition,
        frontTexture: this.defaultTexture,
        backTexture: this.defaultTexture
      });

      const cardMesh = card.getMesh();
      console.log('DrawingManager: Card mesh created:', {
        position: cardMesh.position.toArray(),
        rotation: cardMesh.rotation.toArray(),
        scale: cardMesh.scale.toArray()
      });

      // Add to scene
      console.log('DrawingManager: Adding card to scene...');
      const scene = this.sceneManager.getScene();
      scene.add(cardMesh);
      
      // Move to target position
      cardMesh.position.copy(position);
      cardMesh.rotation.copy(rotation);

      this.drawnCards.push(card);
      console.log('DrawingManager: Card added to scene, total cards:', this.drawnCards.length);

      this.isAnimating = false;
      this.emit('cardDrawn', card);
      return card;
    } catch (error) {
      console.error('DrawingManager: Error creating card:', error);
      this.isAnimating = false;
      return null;
    }
  }

  public async returnCardToDeck(card: Card): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;

    console.log('DrawingManager: Returning card to deck');
    const mesh = card.getMesh();
    this.sceneManager.getScene().remove(mesh);
    this.drawnCards = this.drawnCards.filter(c => c !== card);
    
    this.isAnimating = false;
    this.emit('cardReturned', card);
    console.log('DrawingManager: Card returned, remaining cards:', this.drawnCards.length);
  }

  public getDrawnCards(): Card[] {
    return [...this.drawnCards];
  }
}