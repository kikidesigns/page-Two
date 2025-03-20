import { EventEmitter } from 'events';
import { DeckProfileManager } from '../../core/DeckProfileManager';
import { TextureManager } from '../../core/TextureManager';
import { ProcessedImage } from '../../utils/ImageProcessor';
import { DropZone } from '../shared/DropZone';
import { Button } from '../shared/Button';
import { ImageUploadZone } from './ImageUploadZone';

export interface CardSlot {
  id: string;
  name: string;
  texture?: ProcessedImage;
}

export class CardGridManager extends EventEmitter {
  private element: HTMLDivElement;
  private gridContainer: HTMLDivElement;
  private statusContainer: HTMLDivElement;
  private imageUpload: ImageUploadZone;
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

    // Create status container
    this.statusContainer = document.createElement('div');
    this.statusContainer.className = 'grid-status';

    this.gridContainer = document.createElement('div');
    this.gridContainer.className = 'card-grid';

    const header = document.createElement('div');
    header.className = 'card-grid-header';
    header.appendChild(document.createElement('h2')).textContent = 'Card Images';

    // Create image upload zone
    this.imageUpload = new ImageUploadZone();
    this.imageUpload.on('save', (uploads) => this.handleUploads(uploads));

    this.element.appendChild(header);
    this.element.appendChild(this.statusContainer);
    this.element.appendChild(this.imageUpload.getElement());
    this.element.appendChild(this.gridContainer);

    this.initializeSlots();
    this.updateStatus('Select cards to upload images');
  }

  private updateStatus(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
    this.statusContainer.className = `grid-status status-${type}`;
    this.statusContainer.textContent = message;
  }

  private initializeSlots(): void {
    // Initialize a smaller test deck
    const testDeck = [
      { id: 'major-0', name: 'The Fool' },
      { id: 'major-1', name: 'The Magician' },
      { id: 'major-2', name: 'The High Priestess' },
      { id: 'wands-1', name: 'Ace of Wands' },
      { id: 'wands-2', name: 'Two of Wands' },
      { id: 'cups-1', name: 'Ace of Cups' },
      { id: 'cups-2', name: 'Two of Cups' },
      { id: 'swords-1', name: 'Ace of Swords' },
      { id: 'pentacles-1', name: 'Ace of Pentacles' }
    ];

    testDeck.forEach(card => {
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
      preview.classList.add('has-image');
    } else {
      preview.classList.add('empty');
      preview.textContent = '➕';
    }

    // Create card name
    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = slot.name;

    // Create drop zone for this slot
    const dropZone = new DropZone({
      onFilesAccepted: (files) => this.handleSlotUpload(slot.id, files[0]),
      maxFiles: 1,
      label: `Upload image for ${slot.name}`
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

    element.appendChild(name);
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

        this.updateStatus(`Image uploaded for ${slot.name}`, 'success');
        this.emit('textureUpdated', { slotId, texture: result });
      }
    } catch (error) {
      this.updateStatus(`Failed to upload image: ${error.message}`, 'error');
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

        this.updateStatus(`Image removed from ${slot.name}`, 'info');
        this.emit('textureRemoved', slotId);
      }
    } catch (error) {
      this.updateStatus(`Failed to remove image: ${error.message}`, 'error');
      this.emit('error', error);
    }
  }

  private async handleUploads(uploads: Array<{ file: File, result: ProcessedImage }>): Promise<void> {
    try {
      const activeProfile = this.profileManager.getActiveProfile();
      if (!activeProfile) {
        throw new Error('No active profile');
      }

      const updates: Record<string, string> = {};
      let updatedCount = 0;

      // Find matching slots for each upload
      for (const upload of uploads) {
        // Try to match by filename first
        const filename = upload.file.name.toLowerCase();
        const matchingSlot = Array.from(this.slots.values()).find(slot => 
          filename.includes(slot.name.toLowerCase()) ||
          slot.name.toLowerCase().includes(filename.replace(/\.[^/.]+$/, ''))
        );

        if (matchingSlot) {
          updates[matchingSlot.id] = upload.result.dataUrl;
          matchingSlot.texture = upload.result;
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        // Update profile
        await this.profileManager.updateProfile(activeProfile.id, {
          cardTextures: {
            ...activeProfile.cardTextures,
            ...updates
          }
        });

        this.render();
        this.updateStatus(`Updated ${updatedCount} card images`, 'success');
      } else {
        this.updateStatus('No matching cards found for uploads', 'error');
      }
    } catch (error) {
      this.updateStatus(`Failed to process uploads: ${error.message}`, 'error');
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
      this.updateStatus('Profile loaded. Upload or modify card images.');
    }
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public dispose(): void {
    this.imageUpload.dispose();
    this.slots.clear();
    this.removeAllListeners();
  }
}