export interface DeckProfile {
  id: string;
  name: string;
  creator: string;
  createdAt: number;
  updatedAt: number;
  cardTextures: {
    [cardId: string]: string; // Maps card IDs to texture URLs
  };
  metadata?: {
    description?: string;
    version?: string;
    tags?: string[];
  };
}

export interface DeckProfileState {
  activeProfileId: string | null;
  profiles: { [id: string]: DeckProfile };
}