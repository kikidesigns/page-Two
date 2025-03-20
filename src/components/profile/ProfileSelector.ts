import { EventEmitter } from 'events';
import { DeckProfileManager } from '../../core/DeckProfileManager';
import { DeckProfile } from '../../types/DeckProfile';
import { Button } from '../shared/Button';

export class ProfileSelector extends EventEmitter {
  private element: HTMLDivElement;
  private profileManager: DeckProfileManager;
  private profileList: HTMLDivElement;
  private createButton: Button;

  constructor() {
    super();
    this.profileManager = DeckProfileManager.getInstance();
    
    this.element = document.createElement('div');
    this.element.className = 'profile-selector';

    this.profileList = document.createElement('div');
    this.profileList.className = 'profile-list';

    this.createButton = new Button({
      text: 'Create New Profile',
      variant: 'primary',
      onClick: () => this.emit('create')
    });

    const header = document.createElement('div');
    header.className = 'profile-selector-header';
    header.appendChild(document.createElement('h2')).textContent = 'Deck Profiles';
    header.appendChild(this.createButton.getElement());

    this.element.appendChild(header);
    this.element.appendChild(this.profileList);

    this.render();
  }

  private render(): void {
    const profiles = this.profileManager.getAllProfiles();
    const activeProfile = this.profileManager.getActiveProfile();

    this.profileList.innerHTML = '';

    profiles.forEach(profile => {
      const profileElement = this.createProfileElement(profile, profile.id === activeProfile?.id);
      this.profileList.appendChild(profileElement);
    });
  }

  private createProfileElement(profile: DeckProfile, isActive: boolean): HTMLDivElement {
    const element = document.createElement('div');
    element.className = `profile-item ${isActive ? 'active' : ''}`;

    // Profile info
    const info = document.createElement('div');
    info.className = 'profile-info';
    
    const name = document.createElement('h3');
    name.textContent = profile.name;
    
    const creator = document.createElement('p');
    creator.textContent = `Created by ${profile.creator}`;
    
    const date = document.createElement('small');
    date.textContent = new Date(profile.createdAt).toLocaleDateString();

    info.appendChild(name);
    info.appendChild(creator);
    info.appendChild(date);

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'profile-actions';

    const activateButton = new Button({
      text: isActive ? 'Active' : 'Activate',
      variant: isActive ? 'success' : 'primary',
      disabled: isActive,
      onClick: async () => {
        try {
          await this.profileManager.setActiveProfile(profile.id);
          this.render();
          this.emit('activated', profile);
        } catch (error) {
          this.emit('error', error);
        }
      }
    });

    const editButton = new Button({
      text: 'Edit',
      variant: 'secondary',
      onClick: () => this.emit('edit', profile)
    });

    const deleteButton = new Button({
      text: 'Delete',
      variant: 'danger',
      onClick: () => this.confirmDelete(profile)
    });

    actions.appendChild(activateButton.getElement());
    actions.appendChild(editButton.getElement());
    actions.appendChild(deleteButton.getElement());

    element.appendChild(info);
    element.appendChild(actions);

    return element;
  }

  private async confirmDelete(profile: DeckProfile): Promise<void> {
    if (confirm(`Are you sure you want to delete the profile "${profile.name}"? This action cannot be undone.`)) {
      try {
        await this.profileManager.deleteProfile(profile.id);
        this.render();
        this.emit('deleted', profile);
      } catch (error) {
        this.emit('error', error);
      }
    }
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public refresh(): void {
    this.render();
  }

  public dispose(): void {
    this.createButton.dispose();
    this.removeAllListeners();
  }
}