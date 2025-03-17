import { EventEmitter } from 'events';
import { DeckProfile, DeckProfileState } from '../types/DeckProfile';

export class DeckProfileManager extends EventEmitter {
  private static instance: DeckProfileManager;
  private state: DeckProfileState = {
    activeProfileId: null,
    profiles: {}
  };

  private constructor() {
    super();
    this.loadFromLocalStorage();
  }

  public static getInstance(): DeckProfileManager {
    if (!DeckProfileManager.instance) {
      DeckProfileManager.instance = new DeckProfileManager();
    }
    return DeckProfileManager.instance;
  }

  private loadFromLocalStorage(): void {
    const savedState = localStorage.getItem('deckProfiles');
    if (savedState) {
      try {
        this.state = JSON.parse(savedState);
      } catch (error) {
        console.error('Failed to load deck profiles:', error);
      }
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('deckProfiles', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save deck profiles:', error);
    }
  }

  public createProfile(profile: Omit<DeckProfile, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    const newProfile: DeckProfile = {
      ...profile,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.state.profiles[id] = newProfile;
    this.saveToLocalStorage();
    this.emit('profileCreated', newProfile);
    return id;
  }

  public updateProfile(id: string, updates: Partial<Omit<DeckProfile, 'id' | 'createdAt'>>): boolean {
    if (!this.state.profiles[id]) return false;

    this.state.profiles[id] = {
      ...this.state.profiles[id],
      ...updates,
      updatedAt: Date.now()
    };

    this.saveToLocalStorage();
    this.emit('profileUpdated', this.state.profiles[id]);
    return true;
  }

  public deleteProfile(id: string): boolean {
    if (!this.state.profiles[id]) return false;

    delete this.state.profiles[id];
    if (this.state.activeProfileId === id) {
      this.state.activeProfileId = null;
    }

    this.saveToLocalStorage();
    this.emit('profileDeleted', id);
    return true;
  }

  public setActiveProfile(id: string | null): boolean {
    if (id !== null && !this.state.profiles[id]) return false;

    this.state.activeProfileId = id;
    this.saveToLocalStorage();
    this.emit('activeProfileChanged', id);
    return true;
  }

  public getActiveProfile(): DeckProfile | null {
    return this.state.activeProfileId ? this.state.profiles[this.state.activeProfileId] : null;
  }

  public getAllProfiles(): DeckProfile[] {
    return Object.values(this.state.profiles);
  }

  public getProfile(id: string): DeckProfile | null {
    return this.state.profiles[id] || null;
  }
}