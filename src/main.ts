import { SceneManager } from './core/SceneManager';
import { CardManager } from './core/CardManager';
import { UIManager } from './ui/UIManager';
import { StateManager } from './state/StateManager';

class TarotApp {
  private sceneManager: SceneManager;
  private cardManager: CardManager;
  private uiManager: UIManager;
  private stateManager: StateManager;

  constructor() {
    this.sceneManager = SceneManager.getInstance();
    this.cardManager = new CardManager();
    this.uiManager = new UIManager();
    this.stateManager = new StateManager();

    this.initialize();
  }

  private initialize(): void {
    // Initialize core systems
    this.sceneManager.initialize();
    this.cardManager.initialize();
    this.uiManager.initialize();
    this.stateManager.initialize();

    // Start render loop
    this.animate();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.sceneManager.update();
    this.cardManager.update();
  }
}

// Start application
new TarotApp();