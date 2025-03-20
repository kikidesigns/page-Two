import { EventEmitter } from 'events';
import { DeckProfile, DeckProfileState } from '../types/DeckProfile';
import { TextureManager } from './TextureManager';
import * as THREE from 'three';

export class DeckProfileManager extends EventEmitter {
  private static instance: DeckProfileManager;
  private state: DeckProfileState = {
    activeProfileId: null,
    profiles: {}
  };
  private textureManager: TextureManager;

  private constructor() {
    super();
    this.textureManager = TextureManager.getInstance();
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

  public async createProfile(profile: Omit<DeckProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    const newProfile: DeckProfile = {
      ...profile,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Preload all textures
    try {
      await Promise.all(
        Object.values(newProfile.cardTextures).map(url => 
          this.textureManager.loadTexture(url)
        )
      );
    } catch (error) {
      throw new Error(`Failed to load textures: ${error.message}`);
    }

    this.state.profiles[id] = newProfile;
    this.saveToLocalStorage();
    this.emit('profileCreated', newProfile);
    return id;
  }

  public async updateProfile(id: string, updates: Partial<Omit<DeckProfile, 'id' | 'createdAt'>>): Promise<boolean> {
    if (!this.state.profiles[id]) return false;

    // If updating textures, preload them
    if (updates.cardTextures) {
      try {
        await Promise.all(
          Object.values(updates.cardTextures).map(url => 
            this.textureManager.loadTexture(url)
          )
        );
      } catch (error) {
        throw new Error(`Failed to load new textures: ${error.message}`);
      }
    }

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

    // Clean up textures
    Object.values(this.state.profiles[id].cardTextures).forEach(url => {
      this.textureManager.removeTexture(url);
    });

    delete this.state.profiles[id];
    if (this.state.activeProfileId === id) {
      this.state.activeProfileId = null;
    }

    this.saveToLocalStorage();
    this.emit('profileDeleted', id);
    return true;
  }

  public async setActiveProfile(id: string | null): Promise<boolean> {
    if (id !== null && !this.state.profiles[id]) return false;

    // Preload textures for the new active profile
    if (id !== null) {
      try {
        await Promise.all(
          Object.values(this.state.profiles[id].cardTextures).map(url => 
            this.textureManager.loadTexture(url)
          )
        );
      } catch (error) {
        throw new Error(`Failed to load profile textures: ${error.message}`);
      }
    }

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

  public async getCardTexture(cardId: string): Promise<THREE.Texture> {
    const activeProfile = this.getActiveProfile();
    if (!activeProfile) {
      return this.textureManager.getDefaultFrontTexture();
    }

    const textureUrl = activeProfile.cardTextures[cardId];
    if (!textureUrl) {
      return this.textureManager.getDefaultFrontTexture();
    }

    try {
      return await this.textureManager.loadTexture(textureUrl);
    } catch (error) {
      console.error(`Failed to load texture for card ${cardId}:`, error);
      return this.textureManager.getDefaultFrontTexture();
    }
  }

  public getBackTexture(): THREE.Texture {
    return this.textureManager.getDefaultBackTexture();
  }
}