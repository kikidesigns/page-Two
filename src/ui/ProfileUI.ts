import { DeckProfileManager } from '../core/DeckProfileManager';
import { ProfileCreationForm } from '../components/profile/ProfileCreationForm';
import { ProfileSelector } from '../components/profile/ProfileSelector';
import { ImageUploadZone } from '../components/profile/ImageUploadZone';
import { CardGridManager } from '../components/profile/CardGridManager';

export class ProfileUI {
  private container: HTMLElement;
  private modal: HTMLElement;
  private profileManager: DeckProfileManager;
  private profileForm: ProfileCreationForm | null = null;
  private profileSelector: ProfileSelector | null = null;
  private imageUpload: ImageUploadZone | null = null;
  private cardGrid: CardGridManager | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.profileManager = DeckProfileManager.getInstance();
    this.modal = this.createModal();
    this.container.appendChild(this.modal);
    this.setupEventListeners();
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="modal-body"></div>
      </div>
    `;
    return modal;
  }

  private setupEventListeners(): void {
    // New Profile button
    const newProfileBtn = document.getElementById('new-profile');
    if (newProfileBtn) {
      newProfileBtn.onclick = () => this.showProfileCreation();
    }

    // Edit Profile button
    const editProfileBtn = document.getElementById('edit-profile');
    if (editProfileBtn) {
      editProfileBtn.onclick = () => this.showProfileSelector();
    }

    // Close modal button
    const closeBtn = this.modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => this.hideModal();
    }

    // Close on overlay click
    const overlay = this.modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.onclick = () => this.hideModal();
    }

    // Update profile selector
    const profileSelect = document.getElementById('deck-profile-select') as HTMLSelectElement;
    if (profileSelect) {
      this.updateProfileSelect(profileSelect);
      profileSelect.onchange = (e) => {
        const target = e.target as HTMLSelectElement;
        if (target.value) {
          this.profileManager.setActiveProfile(target.value);
        } else {
          this.profileManager.setActiveProfile(null);
        }
      };
    }

    // Listen for profile changes
    this.profileManager.on('profileCreated', () => this.updateProfileSelect(profileSelect));
    this.profileManager.on('profileDeleted', () => this.updateProfileSelect(profileSelect));
    this.profileManager.on('profileUpdated', () => this.updateProfileSelect(profileSelect));
  }

  private updateProfileSelect(select: HTMLSelectElement): void {
    if (!select) return;

    const profiles = this.profileManager.getAllProfiles();
    const activeProfile = this.profileManager.getActiveProfile();

    // Clear existing options except default
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Add profile options
    profiles.forEach(profile => {
      const option = document.createElement('option');
      option.value = profile.id;
      option.text = profile.name;
      option.selected = profile.id === activeProfile?.id;
      select.add(option);
    });
  }

  private showProfileCreation(): void {
    const modalBody = this.modal.querySelector('.modal-body');
    if (!modalBody) return;

    // Clear existing content
    modalBody.innerHTML = '';
    this.cleanup();

    // Create new form
    this.profileForm = new ProfileCreationForm();
    
    this.profileForm.on('success', (data) => {
      this.hideModal();
      this.showImageUpload(data.profileId);
    });

    this.profileForm.on('cancel', () => {
      this.hideModal();
    });

    this.profileForm.on('error', (error) => {
      alert(`Error creating profile: ${error.message}`);
    });

    modalBody.appendChild(this.profileForm.getElement());
    this.showModal();
  }

  private showProfileSelector(): void {
    const modalBody = this.modal.querySelector('.modal-body');
    if (!modalBody) return;

    // Clear existing content
    modalBody.innerHTML = '';
    this.cleanup();

    // Create profile selector
    this.profileSelector = new ProfileSelector();

    this.profileSelector.on('create', () => {
      this.showProfileCreation();
    });

    this.profileSelector.on('edit', (profile) => {
      this.showCardGrid(profile.id);
    });

    this.profileSelector.on('error', (error) => {
      alert(`Error: ${error.message}`);
    });

    modalBody.appendChild(this.profileSelector.getElement());
    this.showModal();
  }

  private showImageUpload(profileId: string): void {
    const modalBody = this.modal.querySelector('.modal-body');
    if (!modalBody) return;

    // Clear existing content
    modalBody.innerHTML = '';
    this.cleanup();

    // Create image upload zone
    this.imageUpload = new ImageUploadZone();
    this.cardGrid = new CardGridManager();

    this.imageUpload.on('success', () => {
      this.cardGrid?.loadProfile(profileId);
    });

    this.imageUpload.on('error', (error) => {
      alert(`Error uploading image: ${error.message}`);
    });

    modalBody.appendChild(this.imageUpload.getElement());
    modalBody.appendChild(this.cardGrid.getElement());
    this.showModal();
  }

  private showCardGrid(profileId: string): void {
    const modalBody = this.modal.querySelector('.modal-body');
    if (!modalBody) return;

    // Clear existing content
    modalBody.innerHTML = '';
    this.cleanup();

    // Create card grid
    this.cardGrid = new CardGridManager();
    this.cardGrid.loadProfile(profileId);

    modalBody.appendChild(this.cardGrid.getElement());
    this.showModal();
  }

  private showModal(): void {
    this.modal.style.display = 'block';
  }

  private hideModal(): void {
    this.modal.style.display = 'none';
    this.cleanup();
  }

  private cleanup(): void {
    this.profileForm?.dispose();
    this.profileForm = null;

    this.profileSelector?.dispose();
    this.profileSelector = null;

    this.imageUpload?.dispose();
    this.imageUpload = null;

    this.cardGrid?.dispose();
    this.cardGrid = null;
  }

  public dispose(): void {
    this.cleanup();
    this.modal.remove();
  }
}