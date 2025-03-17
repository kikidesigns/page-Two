import { SPREADS } from '../types/SpreadLayout';
import { StateManager } from '../state/StateManager';
import { DeckManager } from '../core/DeckManager';
import { DeckProfileManager } from '../core/DeckProfileManager';
import { DrawingManager } from '../core/DrawingManager';
import * as THREE from 'three';

export class UIManager {
  private container: HTMLElement;
  private stateManager: StateManager;
  private deckManager: DeckManager;
  private deckProfileManager: DeckProfileManager;
  private drawingManager: DrawingManager;
  private currentSpreadIndex: number = 0;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'ui-container';
    this.stateManager = new StateManager();
    this.deckManager = DeckManager.getInstance();
    this.deckProfileManager = DeckProfileManager.getInstance();
    this.drawingManager = DrawingManager.getInstance();
  }

  public initialize(): void {
    this.setupUI();
    this.setupEventListeners();
  }

  private setupUI(): void {
    // [Previous UI setup code remains the same...]
    this.container.innerHTML = `
      <div class="controls">
        <select id="spread-select">
          <option value="THREE_CARD">Three Card Spread</option>
          <option value="CELTIC_CROSS">Celtic Cross</option>
        </select>
        <button id="shuffle">Shuffle</button>
        <button id="draw-card">Draw Card</button>
        <button id="return-card">Return Card</button>
        <button id="reset">Reset</button>
        <button id="multiplayer">Start Multiplayer</button>
        <select id="deck-profile-select">
          <option value="">Default Deck</option>
        </select>
        <button id="new-profile">New Profile</button>
        <button id="edit-profile">Edit Profile</button>
      </div>
      <div class="card-info" style="display: none;">
        <h3>Card Information</h3>
        <p id="card-name"></p>
        <p id="card-description"></p>
      </div>
    `;

    // [Previous styles remain the same...]
    document.body.appendChild(this.container);
    this.updateProfileSelect();
    this.updateDrawButton();
  }

  private setupEventListeners(): void {
    // Button handlers
    const shuffleBtn = document.getElementById('shuffle');
    const drawCardBtn = document.getElementById('draw-card');
    const returnCardBtn = document.getElementById('return-card');
    const resetBtn = document.getElementById('reset');
    const multiplayerBtn = document.getElementById('multiplayer');

    // Shuffle button
    shuffleBtn?.addEventListener('click', async () => {
      await this.deckManager.shuffle();
    });

    // Draw card button
    drawCardBtn?.addEventListener('click', async () => {
      const spread = this.stateManager.getCurrentSpread();
      if (!spread) {
        console.warn('No spread selected');
        return;
      }

      const currentPosition = spread.positions[this.currentSpreadIndex];
      if (!currentPosition) {
        console.warn('No more positions available in spread');
        return;
      }

      // Convert Vector3 to THREE.Vector3 and Vector3 to THREE.Euler
      const position = new THREE.Vector3(
        currentPosition.position.x,
        currentPosition.position.y,
        currentPosition.position.z
      );
      
      const rotation = new THREE.Euler(
        currentPosition.rotation.x,
        currentPosition.rotation.y,
        currentPosition.rotation.z
      );

      const card = await this.drawingManager.drawCard(position, rotation);
      if (card) {
        this.deckManager.drawCard();
        this.showCardInfo(currentPosition.name, currentPosition.description);
        this.currentSpreadIndex++;
      }
      this.updateDrawButton();
    });

    // Return card button
    returnCardBtn?.addEventListener('click', async () => {
      const drawnCards = this.drawingManager.getDrawnCards();
      if (drawnCards.length === 0) return;

      const lastCard = drawnCards[drawnCards.length - 1];
      await this.drawingManager.returnCardToDeck(lastCard);
      this.deckManager.returnCard();
      if (this.currentSpreadIndex > 0) {
        this.currentSpreadIndex--;
      }
      this.hideCardInfo();
      this.updateDrawButton();
    });

    // Reset button
    resetBtn?.addEventListener('click', () => {
      this.deckManager.reset();
      this.currentSpreadIndex = 0;
      this.hideCardInfo();
      this.updateDrawButton();
    });

    // Spread selection
    const spreadSelect = document.getElementById('spread-select');
    if (spreadSelect) {
      spreadSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const spread = SPREADS[target.value as keyof typeof SPREADS];
        this.stateManager.setSpread(spread);
        this.currentSpreadIndex = 0;
        this.updateDrawButton();
      });
    }

    // [Rest of the event listeners remain the same...]
  }

  private updateDrawButton(): void {
    const drawBtn = document.getElementById('draw-card') as HTMLButtonElement;
    const returnBtn = document.getElementById('return-card') as HTMLButtonElement;
    if (!drawBtn || !returnBtn) return;

    const remainingCards = this.deckManager.getRemainingCards();
    const drawnCards = this.drawingManager.getDrawnCards().length;
    const spread = this.stateManager.getCurrentSpread();

    drawBtn.disabled = remainingCards === 0 || 
                      !spread || 
                      this.currentSpreadIndex >= spread.positions.length;
    returnBtn.disabled = drawnCards === 0;

    drawBtn.title = remainingCards === 0 ? 'No cards left in deck' : 
                   !spread ? 'Select a spread first' :
                   this.currentSpreadIndex >= spread.positions.length ? 'Spread complete' :
                   `${remainingCards} cards remaining`;
    returnBtn.title = drawnCards === 0 ? 'No cards to return' : `${drawnCards} cards drawn`;
  }

  // [Rest of the methods remain the same...]
}