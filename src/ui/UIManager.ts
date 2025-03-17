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
    // Create UI elements
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
      <div id="profile-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <h3>Deck Profile</h3>
          <form id="profile-form">
            <input type="text" id="profile-name" name="profile-name" placeholder="Profile Name" required>
            <input type="text" id="profile-creator" name="profile-creator" placeholder="Creator Name" required>
            <textarea id="profile-description" name="profile-description" placeholder="Description"></textarea>
            <div id="texture-mappings"></div>
            <button type="submit">Save Profile</button>
            <button type="button" id="cancel-profile">Cancel</button>
          </form>
        </div>
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

      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 2000;
      }

      .modal-content {
        background: #2a2a2a;
        padding: 20px;
        border-radius: 10px;
        max-width: 500px;
        margin: 50px auto;
        color: white;
      }

      #profile-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      input, textarea {
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #4a4a4a;
        background: #3a3a3a;
        color: white;
      }

      .modal-content button {
        margin-top: 10px;
      }

      button:disabled {
        background: #333333;
        cursor: not-allowed;
        opacity: 0.7;
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(this.container);
    this.updateProfileSelect();
    this.updateDrawButton();
  }

  private updateDrawButton(): void {
    const drawBtn = document.getElementById('draw-card') as HTMLButtonElement;
    const returnBtn = document.getElementById('return-card') as HTMLButtonElement;
    if (!drawBtn || !returnBtn) return;

    const remainingCards = this.deckManager.getRemainingCards();
    const drawnCards = this.drawingManager.getDrawnCards().length;

    drawBtn.disabled = remainingCards === 0;
    returnBtn.disabled = drawnCards === 0;

    drawBtn.title = remainingCards === 0 ? 'No cards left in deck' : `${remainingCards} cards remaining`;
    returnBtn.title = drawnCards === 0 ? 'No cards to return' : `${drawnCards} cards drawn`;
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
      if (!spread) return;

      const position = new THREE.Vector3(0, 1, 0); // Default position
      const rotation = new THREE.Euler(0, 0, 0); // Default rotation

      await this.drawingManager.drawCard(position, rotation);
      this.deckManager.drawCard();
      this.updateDrawButton();
    });

    // Return card button
    returnCardBtn?.addEventListener('click', async () => {
      const drawnCards = this.drawingManager.getDrawnCards();
      if (drawnCards.length === 0) return;

      const lastCard = drawnCards[drawnCards.length - 1];
      await this.drawingManager.returnCardToDeck(lastCard);
      this.deckManager.returnCard();
      this.updateDrawButton();
    });

    // Reset button
    resetBtn?.addEventListener('click', () => {
      this.deckManager.reset();
      this.updateDrawButton();
    });

    // Multiplayer button
    multiplayerBtn?.addEventListener('click', () => {
      // Implement multiplayer logic
    });

    // Listen for card events
    this.drawingManager.on('cardDrawn', () => {
      this.updateDrawButton();
    });

    this.drawingManager.on('cardReturned', () => {
      this.updateDrawButton();
    });

    this.deckManager.on('deckReset', () => {
      this.updateDrawButton();
    });

    // Spread selection
    const spreadSelect = document.getElementById('spread-select');
    if (spreadSelect) {
      spreadSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const spread = SPREADS[target.value as keyof typeof SPREADS];
        this.stateManager.setSpread(spread);
      });
    }

    // Profile selection
    const profileSelect = document.getElementById('deck-profile-select');
    if (profileSelect) {
      profileSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const profile = target.value ? 
          this.deckProfileManager.getProfile(target.value) : 
          null;
        this.deckProfileManager.setActiveProfile(target.value || null);
        this.stateManager.setActiveDeckProfile(profile);
      });
    }

    // Profile management
    const newProfileBtn = document.getElementById('new-profile');
    const editProfileBtn = document.getElementById('edit-profile');
    const cancelProfileBtn = document.getElementById('cancel-profile');
    const profileForm = document.getElementById('profile-form');
    const profileModal = document.getElementById('profile-modal');

    newProfileBtn?.addEventListener('click', () => {
      const nameInput = document.getElementById('profile-name') as HTMLInputElement;
      const creatorInput = document.getElementById('profile-creator') as HTMLInputElement;
      const descriptionInput = document.getElementById('profile-description') as HTMLTextAreaElement;

      if (nameInput) nameInput.value = '';
      if (creatorInput) creatorInput.value = '';
      if (descriptionInput) descriptionInput.value = '';

      if (profileModal) profileModal.style.display = 'block';
    });

    editProfileBtn?.addEventListener('click', () => {
      const activeProfile = this.deckProfileManager.getActiveProfile();
      if (!activeProfile) return;

      const nameInput = document.getElementById('profile-name') as HTMLInputElement;
      const creatorInput = document.getElementById('profile-creator') as HTMLInputElement;
      const descriptionInput = document.getElementById('profile-description') as HTMLTextAreaElement;

      if (nameInput) nameInput.value = activeProfile.name;
      if (creatorInput) creatorInput.value = activeProfile.creator;
      if (descriptionInput) descriptionInput.value = activeProfile.metadata?.description || '';

      if (profileModal) profileModal.style.display = 'block';
    });

    cancelProfileBtn?.addEventListener('click', () => {
      if (profileModal) profileModal.style.display = 'none';
    });

    profileForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const activeProfile = this.deckProfileManager.getActiveProfile();

      const profileData = {
        name: formData.get('profile-name') as string,
        creator: formData.get('profile-creator') as string,
        metadata: {
          description: formData.get('profile-description') as string
        },
        cardTextures: {}
      };

      if (activeProfile) {
        this.deckProfileManager.updateProfile(activeProfile.id, profileData);
      } else {
        this.deckProfileManager.createProfile(profileData);
      }

      if (profileModal) profileModal.style.display = 'none';
      this.updateProfileSelect();
    });
  }

  private updateProfileSelect(): void {
    const select = document.getElementById('deck-profile-select') as HTMLSelectElement;
    if (!select) return;

    // Clear existing options except default
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Add profiles
    const profiles = this.deckProfileManager.getAllProfiles();
    profiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.textContent = profile.name;
      select.appendChild(option);
    });

    // Set current selection
    const activeProfile = this.deckProfileManager.getActiveProfile();
    if (activeProfile) {
      select.value = activeProfile.id;
    } else {
      select.value = '';
    }
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