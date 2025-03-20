import { EventEmitter } from 'events';
import { DeckProfileManager } from '../../core/DeckProfileManager';
import { TextureManager } from '../../core/TextureManager';
import { ProcessedImage } from '../../utils/ImageProcessor';
import { DropZone } from '../shared/DropZone';
import { Button } from '../shared/Button';

export interface CardSlot {
  id: string;
  name: string;
  texture?: ProcessedImage;
}

export class CardGridManager extends EventEmitter {
  private element: HTMLDivElement;
  private gridContainer: HTMLDivElement;
  private profileManager: DeckProfileManager;
  private textureManager: TextureManager;
  private slots: Map<string, CardSlot>;

  constructor() {
    super();
    this.profileManager = DeckProfileManager.getInstance();
    this.textureManager = TextureManager.getInstance();
    this.slots = new Map();

    this.element = document.createElement('div');
    this.element.className = 'card-grid-manager';

    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'card-grid';

    const header = document.createElement('div');
    header.className = 'card-grid-header';
    header.appendChild(document.createElement('h2')).textContent = 'Card Images';

    this.element.appendChild(header);
    this.element.appendChild(this.gridContainer);

    this.initializeSlots();
  }

  private initializeSlots(): void {
    // Initialize standard tarot card slots
    const majorArcana = Array.from({ length: 22 }, (_, i) => ({
      id: `major-${i}`,
      name: `Major Arcana ${i}`
    }));

    const minorArcana = ['Wands', 'Cups', 'Swords', 'Pentacles'].flatMap(suit =>
      Array.from({ length: 14 }, (_, i) => ({
        id: `${suit.toLowerCase()}-${i}`,
        name: `${i} of ${suit}`
      }))
    );

    [...majorArcana, ...minorArcana].forEach(card => {
      this.slots.set(card.id, card);
    });

    this.render();
  }

  private render(): void {
    this.gridContainer.innerHTML = '';

    this.slots.forEach(slot => {
      const slotElement = this.createSlotElement(slot);
      this.gridContainer.appendChild(slotElement);
    });
  }

  private createSlotElement(slot: CardSlot): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'card-slot';
    element.dataset.slotId = slot.id;

    // Create preview area
    const preview = document.createElement('div');
    preview.className = 'card-preview';
    
    if (slot.texture) {
      preview.style.backgroundImage = `url(${slot.texture.dataUrl})`;
    } else {
      preview.classList.add('empty');
      preview.textContent = '➕';
    }

    // Create drop zone for this slot
    const dropZone = new DropZone({
      onFilesAccepted: (files) => this.handleSlotUpload(slot.id, files[0]),
      maxFiles: 1,
      label: slot.name
    });

    // Create actions
    const actions = document.createElement('div');
    actions.className = 'slot-actions';

    if (slot.texture) {
      const removeButton = new Button({
        text: 'Remove',
        variant: 'danger',
        onClick: () => this.handleRemoveTexture(slot.id)
      });
      actions.appendChild(removeButton.getElement());
    }

    element.appendChild(preview);
    element.appendChild(dropZone.getElement());
    element.appendChild(actions);

    return element;
  }

  private async handleSlotUpload(slotId: string, file: File): Promise<void> {
    try {
      const result = await this.textureManager.processAndLoadImage(file);
      
      // Update slot
      const slot = this.slots.get(slotId);
      if (slot) {
        slot.texture = result;
        
        // Update profile
        const activeProfile = this.profileManager.getActiveProfile();
        if (activeProfile) {
          await this.profileManager.updateProfile(activeProfile.id, {
            cardTextures: {
              ...activeProfile.cardTextures,
              [slotId]: result.dataUrl
            }
          });
        }

        // Re-render slot
        const slotElement = this.gridContainer.querySelector(`[data-slot-id="${slotId}"]`);
        if (slotElement) {
          const newSlotElement = this.createSlotElement(slot);
          slotElement.replaceWith(newSlotElement);
        }

        this.emit('textureUpdated', { slotId, texture: result });
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async handleRemoveTexture(slotId: string): Promise<void> {
    try {
      const slot = this.slots.get(slotId);
      if (slot?.texture) {
        // Remove texture from slot
        delete slot.texture;

        // Update profile
        const activeProfile = this.profileManager.getActiveProfile();
        if (activeProfile) {
          const { [slotId]: removed, ...remaining } = activeProfile.cardTextures;
          await this.profileManager.updateProfile(activeProfile.id, {
            cardTextures: remaining
          });
        }

        // Re-render slot
        const slotElement = this.gridContainer.querySelector(`[data-slot-id="${slotId}"]`);
        if (slotElement) {
          const newSlotElement = this.createSlotElement(slot);
          slotElement.replaceWith(newSlotElement);
        }

        this.emit('textureRemoved', slotId);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  public loadProfile(profileId: string): void {
    const profile = this.profileManager.getProfile(profileId);
    if (profile) {
      // Reset slots
      this.slots.forEach(slot => {
        delete slot.texture;
      });

      // Load textures from profile
      Object.entries(profile.cardTextures).forEach(([slotId, textureUrl]) => {
        const slot = this.slots.get(slotId);
        if (slot) {
          this.textureManager.loadTexture(textureUrl).then(texture => {
            slot.texture = {
              texture,
              dataUrl: textureUrl,
              width: texture.image.width,
              height: texture.image.height,
              aspectRatio: texture.image.width / texture.image.height
            };
            this.render();
          });
        }
      });

      this.render();
    }
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public dispose(): void {
    this.slots.clear();
    this.removeAllListeners();
  }
}