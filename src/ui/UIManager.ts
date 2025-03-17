import { SPREADS } from '../types/SpreadLayout';
import { StateManager } from '../state/StateManager';
import { DeckManager } from '../core/DeckManager';
import { DeckProfileManager } from '../core/DeckProfileManager';

export class UIManager {
  private container: HTMLElement;
  private stateManager: StateManager;
  private deckManager: DeckManager;
  private deckProfileManager: DeckProfileManager;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'ui-container';
    this.stateManager = new StateManager();
    this.deckManager = DeckManager.getInstance();
    this.deckProfileManager = DeckProfileManager.getInstance();
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
            <input type="text" id="profile-name" placeholder="Profile Name" required>
            <input type="text" id="profile-creator" placeholder="Creator Name" required>
            <textarea id="profile-description" placeholder="Description"></textarea>
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
    `;

    document.head.appendChild(styles);
    document.body.appendChild(this.container);
    this.updateProfileSelect();
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

    // Profile management buttons
    const newProfileBtn = document.getElementById('new-profile');
    const editProfileBtn = document.getElementById('edit-profile');
    const cancelProfileBtn = document.getElementById('cancel-profile');
    const profileForm = document.getElementById('profile-form');
    const profileModal = document.getElementById('profile-modal');

    newProfileBtn?.addEventListener('click', () => {
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
        cardTextures: {} // To be implemented with texture upload system
      };

      if (activeProfile) {
        this.deckProfileManager.updateProfile(activeProfile.id, profileData);
      } else {
        this.deckProfileManager.createProfile(profileData);
      }

      if (profileModal) profileModal.style.display = 'none';
      this.updateProfileSelect();
    });

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

    // Listen for profile changes
    this.deckProfileManager.on('profileCreated', () => this.updateProfileSelect());
    this.deckProfileManager.on('profileUpdated', () => this.updateProfileSelect());
    this.deckProfileManager.on('profileDeleted', () => this.updateProfileSelect());
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