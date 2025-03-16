import { SPREADS } from '../types/SpreadLayout';
import { StateManager } from '../state/StateManager';
import { DeckManager } from '../core/DeckManager';

export class UIManager {
  private container: HTMLElement;
  private stateManager: StateManager;
  private deckManager: DeckManager;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'ui-container';
    this.stateManager = new StateManager();
    this.deckManager = DeckManager.getInstance();
  }

  public initialize(): void {
    this.setupUI();
    this.setupEventListeners();
  }

  private setupUI(): void {
    // Create UI elements
    this.container.innerHTML = `
      <div class="controls">
        <select id="spread-select">
          <option value="THREE_CARD">Three Card Spread</option>
          <option value="CELTIC_CROSS">Celtic Cross</option>
        </select>
        <button id="shuffle">Shuffle</button>
        <button id="reset">Reset</button>
        <button id="multiplayer">Start Multiplayer</button>
      </div>
      <div class="card-info" style="display: none;">
        <h3>Card Information</h3>
        <p id="card-name"></p>
        <p id="card-description"></p>
      </div>
    `;

    // Style the UI
    const styles = document.createElement('style');
    styles.textContent = `
      #ui-container {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 20px;
        border-radius: 10px;
      }
      
      .controls {
        display: flex;
        gap: 10px;
      }
      
      button {
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        background: #4a4a4a;
        color: white;
        cursor: pointer;
      }
      
      button:hover {
        background: #5a5a5a;
      }
      
      select {
        padding: 8px;
        border-radius: 5px;
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(this.container);
  }

  private setupEventListeners(): void {
    // Spread selection
    const spreadSelect = document.getElementById('spread-select');
    if (spreadSelect) {
      spreadSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const spread = SPREADS[target.value as keyof typeof SPREADS];
        this.stateManager.setSpread(spread);
      });
    }

    // Button handlers
    const shuffleBtn = document.getElementById('shuffle');
    const resetBtn = document.getElementById('reset');
    const multiplayerBtn = document.getElementById('multiplayer');

    shuffleBtn?.addEventListener('click', async () => {
      await this.deckManager.shuffle();
    });

    resetBtn?.addEventListener('click', () => {
      // Implement reset logic
    });

    multiplayerBtn?.addEventListener('click', () => {
      // Implement multiplayer logic
    });
  }

  public showCardInfo(name: string, description: string): void {
    const cardInfo = this.container.querySelector('.card-info');
    const cardName = document.getElementById('card-name');
    const cardDescription = document.getElementById('card-description');

    if (cardInfo && cardName && cardDescription) {
      cardInfo.style.display = 'block';
      cardName.textContent = name;
      cardDescription.textContent = description;
    }
  }

  public hideCardInfo(): void {
    const cardInfo = this.container.querySelector('.card-info');
    if (cardInfo) {
      cardInfo.style.display = 'none';
    }
  }
}