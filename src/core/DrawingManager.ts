import * as THREE from 'three';
import { gsap } from 'gsap';
import { Card } from '../entities/Card';
import { SceneManager } from './SceneManager';
import { DeckManager } from './DeckManager';
import { TextureManager } from './TextureManager';
import { EventEmitter } from 'events';

export class DrawingManager extends EventEmitter {
  private static instance: DrawingManager;
  private sceneManager: SceneManager;
  private deckManager: DeckManager;
  private textureManager: TextureManager;
  private drawnCards: Card[] = [];
  private isAnimating: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {
    super();
    this.sceneManager = SceneManager.getInstance();
    this.deckManager = DeckManager.getInstance();
    this.textureManager = TextureManager.getInstance();
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
      this.isInitialized = true;
      console.log('DrawingManager: Initialization complete');
    }
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

    this.isAnimating = true;

    try {
      console.log('DrawingManager: Creating card geometry...');
      const cardGeometry = new THREE.PlaneGeometry(1, 1.75);
      
      // Create card at deck position first
      const deckPosition = this.deckManager.getDeckPosition();
      console.log('DrawingManager: Deck position:', deckPosition);

      // Get front and back textures
      const frontTexture = this.textureManager.getDefaultFrontTexture();
      const backTexture = this.textureManager.getDefaultBackTexture();

      console.log('DrawingManager: Creating card instance...');
      const card = new Card({
        geometry: cardGeometry,
        position: deckPosition,
        frontTexture,
        backTexture,
        showDecorations: true,
        borderColor: 0x000000,
        decorColor: 0x880000
      });

      const cardMesh = card.getMesh();
      console.log('DrawingManager: Card mesh created:', {
        position: cardMesh.position.toArray(),
        rotation: cardMesh.rotation.toArray(),
        scale: cardMesh.scale.toArray(),
        frontTexture: {
          uuid: frontTexture.uuid,
          size: `${frontTexture.image?.width}x${frontTexture.image?.height}`,
        },
        backTexture: {
          uuid: backTexture.uuid,
          size: `${backTexture.image?.width}x${backTexture.image?.height}`,
        }
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