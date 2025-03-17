import { SceneManager } from './core/SceneManager';
import { CardManager } from './core/CardManager';
import { DeckManager } from './core/DeckManager';
import { DrawingManager } from './core/DrawingManager';
import { UIManager } from './ui/UIManager';
import { StateManager } from './state/StateManager';

class TarotApp {
  private sceneManager: SceneManager;
  private cardManager: CardManager;
  private deckManager: DeckManager;
  private drawingManager: DrawingManager;
  private uiManager: UIManager;
  private stateManager: StateManager;

  constructor() {
    // Create app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }

    // Initialize managers
    this.sceneManager = SceneManager.getInstance();
    this.cardManager = new CardManager();
    this.deckManager = DeckManager.getInstance();
    this.drawingManager = DrawingManager.getInstance();
    this.uiManager = new UIManager();
    this.stateManager = new StateManager();

    this.initialize();
  }

  private initialize(): void {
    // Initialize core systems
    this.sceneManager.initialize();
    this.cardManager.initialize();
    this.deckManager.initialize();
    this.uiManager.initialize();
    this.stateManager.initialize();

    // Set initial spread
    this.stateManager.setSpread(this.stateManager.getDefaultSpread());

    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }

    // Update debug info
    const debug = document.getElementById('debug');
    if (debug) {
      debug.textContent = 'FPS: 60 | Objects: 1';
    }

    // Start render loop
    this.animate();

    console.log('TarotApp initialized');
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.sceneManager.update();
    this.cardManager.update();
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new TarotApp();
});