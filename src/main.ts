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
    // Create app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new Error('App container not found');
    }

    // Initialize managers
    this.sceneManager = SceneManager.getInstance();
    this.cardManager = new CardManager();
    this.uiManager = new UIManager();
    this.stateManager = new StateManager();

    this.initialize();
  }

  private initialize(): void {
    // Wait for DOM to be ready
    window.addEventListener('DOMContentLoaded', () => {
      // Initialize core systems
      this.sceneManager.initialize();
      this.cardManager.initialize();
      this.uiManager.initialize();
      this.stateManager.initialize();

      // Start render loop
      this.animate();
    });
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