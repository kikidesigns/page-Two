import { EventEmitter } from 'events';
import { DeckProfileManager } from '../../core/DeckProfileManager';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';

export interface ProfileFormData {
  name: string;
  creator: string;
  description?: string;
  tags?: string[];
}

export class ProfileCreationForm extends EventEmitter {
  private element: HTMLFormElement;
  private nameInput: Input;
  private creatorInput: Input;
  private descriptionInput: Input;
  private tagsInput: Input;
  private saveButton: Button;
  private cancelButton: Button;
  private profileManager: DeckProfileManager;

  constructor() {
    super();
    this.profileManager = DeckProfileManager.getInstance();
    this.element = document.createElement('form');
    this.element.className = 'profile-form';

    this.initializeComponents();
    this.setupEventListeners();
  }

  private initializeComponents(): void {
    // Create form inputs
    this.nameInput = new Input({
      label: 'Profile Name',
      required: true,
      placeholder: 'Enter profile name',
      onChange: () => this.validateForm()
    });

    this.creatorInput = new Input({
      label: 'Creator Name',
      required: true,
      placeholder: 'Enter creator name',
      onChange: () => this.validateForm()
    });

    this.descriptionInput = new Input({
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter deck description (optional)'
    });

    this.tagsInput = new Input({
      label: 'Tags',
      placeholder: 'Enter tags separated by commas (optional)'
    });

    // Create buttons
    this.saveButton = new Button({
      text: 'Save Profile',
      variant: 'primary',
      disabled: true,
      onClick: () => this.handleSubmit()
    });

    this.cancelButton = new Button({
      text: 'Cancel',
      variant: 'secondary',
      onClick: () => this.emit('cancel')
    });

    // Append components to form
    this.element.appendChild(this.nameInput.getElement());
    this.element.appendChild(this.creatorInput.getElement());
    this.element.appendChild(this.descriptionInput.getElement());
    this.element.appendChild(this.tagsInput.getElement());

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.appendChild(this.saveButton.getElement());
    buttonContainer.appendChild(this.cancelButton.getElement());
    this.element.appendChild(buttonContainer);
  }

  private setupEventListeners(): void {
    this.element.onsubmit = (e) => {
      e.preventDefault();
      this.handleSubmit();
    };
  }

  private validateForm(): void {
    const isValid = this.nameInput.getValue().trim() !== '' && 
                   this.creatorInput.getValue().trim() !== '';
    
    this.saveButton.update({
      ...this.saveButton,
      disabled: !isValid
    });
  }

  private async handleSubmit(): Promise<void> {
    try {
      this.saveButton.update({
        ...this.saveButton,
        loading: true,
        disabled: true
      });

      const formData: ProfileFormData = {
        name: this.nameInput.getValue().trim(),
        creator: this.creatorInput.getValue().trim(),
        description: this.descriptionInput.getValue().trim() || undefined,
        tags: this.tagsInput.getValue()
          ? this.tagsInput.getValue().split(',').map(tag => tag.trim())
          : undefined
      };

      // Create profile without textures (they'll be added later)
      const profileId = await this.profileManager.createProfile({
        name: formData.name,
        creator: formData.creator,
        description: formData.description,
        tags: formData.tags,
        cardTextures: {}
      });

      this.emit('success', { profileId, ...formData });
    } catch (error) {
      this.emit('error', error);
    } finally {
      this.saveButton.update({
        ...this.saveButton,
        loading: false,
        disabled: false
      });
    }
  }

  public getElement(): HTMLFormElement {
    return this.element;
  }

  public dispose(): void {
    this.element.onsubmit = null;
    this.nameInput.dispose();
    this.creatorInput.dispose();
    this.descriptionInput.dispose();
    this.tagsInput.dispose();
    this.saveButton.dispose();
    this.cancelButton.dispose();
    this.removeAllListeners();
  }
}