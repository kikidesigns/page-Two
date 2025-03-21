import { SceneManager } from './core/SceneManager';
import { CardManager } from './core/CardManager';
import { DeckManager } from './core/DeckManager';
import { DrawingManager } from './core/DrawingManager';
import { UIManager } from './ui/UIManager';
import { StateManager } from './state/StateManager';
import { SPREADS } from './types/SpreadLayout';

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

  private async initialize(): Promise<void> {
    console.log('TarotApp: Initializing...');
    
    // Initialize core systems
    this.sceneManager.initialize();
    this.cardManager.initialize();
    this.deckManager.initialize();
    await this.drawingManager.initialize(); // Wait for texture initialization
    this.uiManager.initialize();
    this.stateManager.initialize();

    // Set initial spread to Three Card Spread
    this.stateManager.setSpread(SPREADS.THREE_CARD);

    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }

    // Start render loop
    this.animate();

    console.log('TarotApp: Initialization complete');
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.sceneManager.update();
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new TarotApp();
});